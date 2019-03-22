/**
 * =================================================
 *
 * 精简掉的功能：
 *
 *  1. 连接时的 rsa(1024) 加密
 *  2. 发送数据不支持自定义编码，protobuf编码，rsa(sha256)
 * =================================================
 *
 * 优点：
 *
 *  1. 支持多实例；
 *  2. 使用 ES6 语法编写；
 *  3. 逻辑模块化，思路更加清晰
 *
 * =================================================
 *
 * 修改日志：
 *
 *  1. 在on方法里判断触发socket是否与this.socket相同，不相同则不处理；【当客户端关闭A连接后，然后想建立一个新连接B时，A的断开会触发onclose，如果不加判断则上层会收到MRPomelo的onclose事件，从而触发重连逻辑！】
 *  2. 为 socket 增加 tag 属性，模拟内存地址，方便定位问题；
 *  3. 增加日志，方便查看request，response，server push 消息；
 *  4. 每次握手的时候都清理掉路由压缩表，防止上层维持一个单利的MRPomelo时，断开后再次连接时表没清空，导致后续流程不对，服务器不给响应问题；
 *  5. 增加 reconnect-over 事件；断开连接、心跳超时均重连；
 *  6. 统一处理onclose，onerr，heart beat timeout;
 */

/* global WebSocket: false */

// H5使用require不行！

import Protobuf from './protobuf.js';
import Protocol from './protocol.js';
import EventEmitter from '../event/events.js';
import Encrypt from './po-encrypt.js';
import GameLog from '../log/GameLog';

//creator
// const Protobuf = require('./protobuf');
// const Protocol = require('./protocol');
// const EventEmitter = require('../event/events');
// const Encrypt = require('po-encrypt');


const Package = Protocol.Package;
const Message = Protocol.Message;

const JS_WS_CLIENT_TYPE = 'js-websocket';
const JS_WS_CLIENT_VERSION = '0.0.1';

const RES_OK = 200;
const RES_OLD_CLIENT = 501;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_DELAY = 3000;
const GAP_THRESHOLD = 100;

const DISCONNECT_FLAG = {
    ON_ERR: 1,
    ON_CLOSE: 2,
    TIMEOUT: 3
};

const EVENT = {
    /**
     * socket打开
     */
    OPEN: 'open',
    /**
     * 重试次数用完后还是没连上
     */
    RECONNECT_OVER: 'reconnect-over',
    /**
     * 连接断开了
     */
    DISCONNECT: 'disconnect',
    /**
     * 被踢出
     */
    KICK: 'kick'
};

const ERRCODE = {
    DISCONNECT: -1000,
    RECONNECT_OVER: -1001,
    NONESOCKET: -1002,
};

class MRPomelo extends EventEmitter {

    ///=========================== Private Functions ===================================

    // The following is all private functions which you'd better not invoke.


    ///=========================== init begin ============================

    /**
     * 初始化消息包的handler
     * @private
     */
    _initHandlers() {
        this.handlers = {};
        /// 握手消息handler
        const initData = function (data) {
            if (!data || !data.sys) {
                return;
            }

            // this._log("_initHandlers" + JSON.stringify(data));

            this.data = this.data || {};
            const dict = data.sys.dict;
            const protos = data.sys.protos;
            // Init compress route dict
            if (dict) {
                this.data.dict = dict;
                this.data.abbrs = {};

                for (const route in dict) {
                    this.data.abbrs[dict[route]] = route;
                }
            }
            // Init protobuf protos
            if (protos) {
                this.data.protos = {
                    server: protos.server || {},
                    client: protos.client || {},
                };
                if (Protobuf) {
                    Protobuf.init({
                        encoderProtos: protos.client,
                        decoderProtos: protos.server,
                    });
                }
            }
        }.bind(this);
        //
        const handshakeInit = function (data) {
            if (data && data.sys && data.sys.heartbeat) {
                this.hearbeat.heartbeatInterval = data.sys.heartbeat * 1000;   // heartbeat interval
                this.hearbeat.heartbeatTimeout = this.hearbeat.heartbeatInterval * 2;        // max heartbeat timeout
            } else {
                this.hearbeat.heartbeatInterval = 0;
                this.hearbeat.heartbeatTimeout = 0;
            }
            initData(data);
            if (typeof this.handshakeCallback === 'function') {
                this.handshakeCallback(data);
            }
        }.bind(this);
        //
        const onHandshake = function (data) {
            const parseData = this._decrypt(Protocol.strdecode(data));
            //this._log('onHandshake: ' + JSON.stringify(parseData));
            if (!parseData) {
                this.emit(EVENT.ERROR, 'handshake decrypt data error');
                this._err('hands shake err : decrypt data error');
                return;
            }
            try {
                data = JSON.parse(parseData);
            } catch (err) {
                this.emit(EVENT.ERROR, 'handshake parse data error');
                this._err('hands shake err : parse data error');
                return;
            }
            if (data.code === RES_OLD_CLIENT) {
                this.emit(EVENT.ERROR, 'client version not full fill');
                this._err('hands shake err : client version not full fill');
                return;
            }
            if (data.code !== RES_OK) {
                this.emit(EVENT.ERROR, 'handshake fail');
                this._err('hands shake fail (' + data.code + ')');
                return;
            }
            handshakeInit(data);
            // 发送握手ACK
            const pkg = Package.encode(Package.TYPE_HANDSHAKE_ACK);
            this._send(pkg);
            if (this.initCallback) {
                this.initCallback(null,this);
            }
        };

        /// 心跳消息handler
        const heartbeatTimeoutCb = function () {
            const gap = this.hearbeat.nextHeartbeatTimeout - Date.now();
            if (gap > GAP_THRESHOLD) {
                this.hearbeat.heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap);
            } else {
                this._err('server heartbeat timeout');
                this.reconnectIfNeed(DISCONNECT_FLAG.TIMEOUT);
            }
        }.bind(this);
        //
        const onHeartBeat = function () {
            if (!this.hearbeat.heartbeatInterval) {
                // no heartbeat
                return;
            }
            if (this.hearbeat.heartbeatTimeoutId) {
                clearTimeout(this.hearbeat.heartbeatTimeoutId);
                this.hearbeat.heartbeatTimeoutId = null;
            }
            if (this.hearbeat.heartbeatId) {
                // already in a heartbeat interval
                return;
            }
            this.hearbeat.heartbeatId = setTimeout(function () {
                this.hearbeat.heartbeatId = null;
                const pkg = Package.encode(Package.TYPE_HEARTBEAT);
                this._log('socket heart beat: ' + pkg);
                const flag = this._send(pkg);
                if (flag){
                    this.hearbeat.nextHeartbeatTimeout = Date.now() + this.hearbeat.heartbeatTimeout;
                    this.hearbeat.heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, this.hearbeat.heartbeatTimeout);
                } else {
                    this.hearbeat.nextHeartbeatTimeout = Date.now();
                    heartbeatTimeoutCb();
                }
            }.bind(this), this.hearbeat.heartbeatInterval);
        };

        /// 数据消息handler
        const onData = function (data) {
            const msg = this._defaultDecode(data);
            this._processMessage(msg);
        };

        /// 被踢消息handler
        const onKick = function (data) {
            const msg = JSON.parse(Protocol.strdecode(data));
            this.emit(EVENT.KICK, msg);
        };

        /// 各种类型消息的handler
        this.handlers[Package.TYPE_HANDSHAKE] = onHandshake.bind(this);
        this.handlers[Package.TYPE_HEARTBEAT] = onHeartBeat.bind(this);
        this.handlers[Package.TYPE_DATA] = onData.bind(this);
        this.handlers[Package.TYPE_KICK] = onKick.bind(this);
    }

    _initHeartBeat() {
        this.hearbeat = {
            heartbeatInterval: 0, // 心跳间隔
            nextHeartbeatTimeout: 0, // 心跳超时时间
            heartbeatTimeoutId: null,// 心跳超时倒计时
            heartbeatTimeout: 0,
            heartbeatId: null,
        };
    }

    _initHandShakeBuffer() {
        this.handshakeBuffer = {
            sys: {
                type: JS_WS_CLIENT_TYPE,
                version: JS_WS_CLIENT_VERSION,
                rsa: {}
            },
            user: {}
        };
    }

    _clearHeartBeatTimers() {
        if (this.hearbeat.heartbeatId) {
            clearTimeout(this.hearbeat.heartbeatId);
            this.hearbeat.heartbeatId = undefined;
        }

        if (this.hearbeat.heartbeatTimeoutId) {
            clearTimeout(this.hearbeat.heartbeatTimeoutId);
            this.hearbeat.heartbeatTimeoutId = undefined;
        }
    }

    /// 重置重连逻辑
    _reset_rec() {
        ///清理重连定时器
        if (this.rec && this.rec.reconnectTimer) {
            clearTimeout(this.rec.reconnectTimer);
            this.rec.reconnectTimer = undefined;
        }

        ///内部重连结构
        this.rec = {
            reconnect: false, ///重连标志位
            reconnectTimer: undefined,///重连timer
            reconnectAttempts: 0,///记录尝试重连了几次
        };
    }

    ///=========================== init end ============================

    ///=========================== 日志 begin ===========================
    _prepareLogger() {
        if (!this.logger) {
            const logger = GameLog.getLogger('mr-pomelo');
            this.logger = logger;
        }
    }

    _sTag() {
        let tag = undefined;
        if (this.socket) {
            tag = this.socket.tag;
        }
        return tag;
    }

    _log(txt) {
        this._prepareLogger();
        const tag = this._sTag();
        this.logger.info('[' + tag + '] ' + txt);
    }

    _err(txt) {
        this._prepareLogger();
        const tag = this._sTag();
        this.logger.error('[' + tag + '] ' + txt);
    }

    ///=========================== 日志 end ===========================

    ///=========================== 加解密 begin ===========================

    _encrypt(data) {
        return Encrypt.encrypt(data);
    }

    _decrypt(data) {
        return Encrypt.decrypt(data);
    }

    ///=========================== 加解密 end ===========================


    ///=========================== 发送数据 begin ===========================

    /**
     * 发送消息
     * @param reqId
     * @param route
     * @param msg
     * @private
     */
    _sendMessage(reqId, route, msg) {
        // 消息字段加密
        if (this.encryptConfig.USE_ENCRYPT_REQUEST) {
            const encryptionFields = this.encryptConfig.ENCRYPT_INFO[route];
            if (encryptionFields) {
                const length = encryptionFields.length;
                for (let i = 0; i < length; i++) {
                    msg[encryptionFields[i]] = this._encrypt(msg[encryptionFields[i]]);
                }
            }

            // this._log('after encrypt:'+ JSON.stringify(msg));
        }

        // 消息编码、打包、发送
        msg = this._defaultEncode(reqId, route, msg);
        const pkg = Package.encode(Package.TYPE_DATA, msg);
        this._send(pkg);
    }

    /**
     * 对消息进行编码
     * @param reqId
     * @param route
     * @param msg
     * @return {ByteArray|Buffer|string}
     * @private
     */
    _defaultEncode(reqId, route, msg) {
        const type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
        // compress message by protobuf
        const protos = this.data.protos ? this.data.protos.client : {};
        if (protos[route]) {
            msg = Protobuf.encode(route, msg);
            //this._log('after Protobuf:'+ JSON.stringify(msg));
        } else {
            msg = Protocol.strencode(JSON.stringify(msg));
        }
        let compressRoute = 0;
        if (this.data && this.data.dict && this.data.dict[route]) {
            route = this.data.dict[route];
            compressRoute = 1;
        }
        return Message.encode(reqId, type, compressRoute, route, msg);
    }

    /**
     * 发送数据package
     * @param packet
     * @private
     */
    _send(packet) {
        if (this.socket) {
            this.socket.send(packet.buffer);
            return true;
        } else {
            this._err('this.socket is nil,can not _send packet !');
            return false;
        }
    }

    ///=========================== 发送数据 end ===========================

    ///=========================== 处理收到的数据 begin ===========================

    /**
     * 处理收到的原始包，根据包type派发到对应的handler
     * @param msgs 服务器给过来的包，根据type派发
     * @private
     */
    _processPackage(msgs) {
        if (Array.isArray(msgs)) {
            msgs.forEach(function (msg) {
                this.handlers[msg.type](msg.body);
            });
        } else {
            this.handlers[msgs.type](msgs.body);
        }
    }

    /**
     * 处理接收到的数据包
     * @param msg
     * @private
     */
    _processMessage(msg) {
        const decryptMsg = function (msg) {
            const route = msg.route;
            const data = msg.body;
            if (this.encryptConfig.USE_ENCRYPT_PUSH && !!this.encryptConfig.PUSH_ENCRYPT_INFO[route]) {
                const fields = this.encryptConfig.PUSH_ENCRYPT_INFO[route];
                const length = fields.length;
                for (let i = 0; i < length; i++) {
                    if (fields[i].indexOf('.') > -1) {
                        const names = fields[i].split('.');
                        const parentName = names[0];
                        if (data[parentName]) {
                            const arrayLength = data[parentName].length;
                            for (let j = 0; j < arrayLength; j++) {
                                const childName = names[1];
                                const encryptData = data[parentName][j][childName];
                                data[parentName][j][childName] = this._decrypt(encryptData);
                            }
                        }
                    } else {
                        const encryptData = data[fields[i]];
                        data[fields[i]] = this._decrypt(encryptData);
                    }
                }
            }
        }.bind(this);

        if (!msg || !msg.id) {
            // server push message
            decryptMsg(msg);
            this.emit(msg.route, msg.body);
            this._log(`push msg, route: ${msg.route}, msg: ${JSON.stringify(msg.body)}`);
            return;
        }
        //if have a id then find the callback function with the request
        const cb = this.callbacks[msg.id];
        delete this.callbacks[msg.id];
        if (typeof cb !== 'function') {
            return;
        }
        let parseMsgObj;
        if (this.encryptConfig.USE_ENCRYPT_RESPONSE && msg.body.msg) {
            try {
                parseMsgObj = JSON.parse(this._decrypt(msg.body.msg));
            } catch (err) {
                this._err('decrypt msg error: ' + err);
                parseMsgObj = {code: msg.code};
            }
        } else {
            parseMsgObj = msg.body;
        }

        this._log(`response msg, route: ${msg.route}, msg: ${JSON.stringify(parseMsgObj)}`);
        cb(parseMsgObj);
    }

    /**
     * 解数据包为msg
     * @param data
     * @returns {{id, type, compressRoute, route, body, compressGzip}}
     * @private
     */
    _defaultDecode(data) {
        // decode
        const msg = Message.decode(data);
        if (msg.id > 0) {
            msg.route = this.routeMap[msg.id];
            delete this.routeMap[msg.id];
            if (!msg.route) {
                return {};
            }
        }
        msg.body = this._deCompose(msg);
        return msg;
    }

    /**
     * 检查是否使用了压缩路由，然后解包
     * @param msg
     * @returns {*}
     * @private
     */
    _deCompose(msg) {
        const protos = (this.data && this.data.protos) ? this.data.protos.server : {};
        const abbrs = (this.data && this.data.abbrs) ? this.data.abbrs : {};
        let route = msg.route;
        try {
            // decompose route from dict
            if (msg.compressRoute) {
                if (!abbrs[route]) {
                    return {};
                }
                route = msg.route = abbrs[route];
            }
            if (protos[route]) {
                return Protobuf.decode(route, msg.body);
            } else {
                return JSON.parse(Protocol.strdecode(msg.body));
            }
        } catch (ex) {
            this._err('deCompose error: ' + ex);
        }
        return msg;
    }

    ///=========================== 处理收到的数据 end ===========================


    ///=========================== 使用 WebSocket 连接 begin ===========================

    _connect(params, url) {

        params = params || {};

        //连接断开后是否要重连；
        const reconnect = params.reconnect;
        // ca证书路径
        const caPath = params.caPath;

        //遇到 onerr，onclose，heart beat timeout 事件均走这里进行处理

        this.reconnectIfNeed = function (flag) {

            ///先清理掉心跳定时器
            this._clearHeartBeatTimers();
            ///关闭 web socket
            const closeIt = function () {
                if (this.socket) {
                    const socket = this.socket;
                    this._log('disconnect');
                    this.socket = undefined;
                    if (socket.disconnect) socket.disconnect();
                    if (socket.close) socket.close();
                }
            }.bind(this);

            ///on err
            if (flag === DISCONNECT_FLAG.ON_ERR) {
                closeIt();
            }
            ///on close
            else if (flag === DISCONNECT_FLAG.ON_CLOSE) {
                //just release it
                this.socket = undefined;
            }
            ///heart beat timeout
            else if (flag === DISCONNECT_FLAG.TIMEOUT) {
                closeIt();
            }

            const self = this;

            const handleSocketErr = function () {

                const cbs = self.callbacks;
                const err = {code:-1001,msg:'网络未连接'};
                self.callbacks = [];
                for(let key in cbs){
                    const cb = cbs[key];
                    cb(err);
                }
            };
            ///向请求回调错误！！
            handleSocketErr();

            ///检查上层是否要求内部重试
            if (reconnect) {
                //最大重连次数，默认5次；
                let maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS;

                if (typeof (params.maxReconnectAttempts) !== 'undefined'){
                    maxReconnectAttempts = params.maxReconnectAttempts;
                }

                //重连间隔，默认3s；
                const reconnectionDelay = params.reconnectionDelay || DEFAULT_RECONNECT_DELAY;

                if (maxReconnectAttempts < 0 || this.rec.reconnectAttempts < maxReconnectAttempts) {

                    //开始重试逻辑
                    const delayTime = this.rec.reconnectAttempts < 1 ? 0 : reconnectionDelay;
                    //重连标志位
                    this.rec.reconnect = true;
                    this.rec.reconnectAttempts++;
                    this.rec.reconnectTimer = setTimeout(function () {
                        this._connect(params, url);
                    }.bind(this), delayTime);

                    if (this.rec.reconnectAttempts === 1) {
                        this.emit(EVENT.DISCONNECT);
                    }

                } else if (this.rec.reconnectAttempts >= maxReconnectAttempts) {

                    this._err('after ' + maxReconnectAttempts + ' retry，can not connect!');
                    ///重置重连次数，以便下次重连
                    this.rec.reconnectAttempts = 0;
                    this.initCallback && this.initCallback({code:ERRCODE.RECONNECT_OVER,msg:EVENT.RECONNECT_OVER},this);
                    ///重连次数用完了
                    this.emit(EVENT.RECONNECT_OVER);
                }
            } else {
                // 上层不要求重试，则立马发送断开事件
                this._reset_rec();
                this.initCallback && this.initCallback({code:ERRCODE.DISCONNECT,msg:EVENT.DISCONNECT},this);
                this.emit(EVENT.DISCONNECT);
            }
        }.bind(this);

        if (this.socket) {
            ///清理掉之前监听的事件
            this.socket.onopen = function () {
            };
            this.socket.onmessage = function () {
            };
            this.socket.onerror = function () {
            };
            this.socket.onclose = function () {
            };
        }

        // WebSocket事件
        const onopen = function (event) {
            if (this.socket === socket) {
                this._log('socket onopen: ' + socket.tag);
                this.emit(EVENT.OPEN, event);
                this._reset_rec();
                // 连上后发送握手消息
                const pkg = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(this.handshakeBuffer)));
                this._send(pkg);
            } else {
                this._err('dirty socket [' + socket.tag +'] toggle onopen.');
            }
        };

        const onmessage = function (event) {
            if (this.socket === socket) {
                this._processPackage(Package.decode(event.data));
                // new package arrived, update the heartbeat timeout
                if (this.hearbeat.heartbeatTimeout) {
                    this.hearbeat.nextHeartbeatTimeout = Date.now() + this.hearbeat.heartbeatTimeout;
                }
            } else {
                this._err('dirty socket [' + socket.tag +'] toggle onmessage.');
            }
        };

        const onerror = function (event) {
            if (this.socket === socket) {
                this._err('onerror is ' + JSON.stringify(event, ['message', 'arguments', 'type', 'name']));
                this.reconnectIfNeed(DISCONNECT_FLAG.ON_ERR);
            } else {
                this._err('dirty socket [' + socket.tag +'] toggle onerror.');
            }
        };

        const onclose = function (event) {
            if (this.socket === socket) {
                this._err('onclose is ' + JSON.stringify(event, ['message', 'arguments', 'type', 'name']));
                this.reconnectIfNeed(DISCONNECT_FLAG.ON_CLOSE);
            } else {
                this._err('dirty socket [' + socket.tag +'] toggle onclose.');
            }
        };

        let socket = null;

        ///兼容微信小程序；
        var webSocket = WebSocket;

        if(!webSocket && global.WebSocket){
            webSocket = global.WebSocket;
        }

        if (caPath && params.wss) {
            //TODO wss
            socket = new webSocket(url, null, cc.url.raw(caPath));
        } else {
            socket = new webSocket(url);
        }

        // 创建websocket
        socket.tag = Math.floor(Math.random() * 100000); // 模拟内存地址，方便定位问题！
        socket.binaryType = 'arraybuffer';
        socket.onopen = onopen.bind(this);
        socket.onmessage = onmessage.bind(this);
        socket.onerror = onerror.bind(this);
        socket.onclose = onclose.bind(this);
        this.socket = socket;

        this._log('connect to ' + url);
    }

    ///=========================== 使用 WebSocket 连接 begin ===========================


    ///=========================== Public Functions ===================================

    // The following is all public functions which you can invoke.

    constructor() {
        super();

        this.socket = null;
        this.reqId = 0; // 请求id号，自增
        this.callbacks = {}; // 与reqId对应的回调
        this.routeMap = {}; // 与reqId对应的路由
        // compressRoute
        this.dict = {}; // route string to code
        this.abbrs = {}; // code to route string

        this.initCallback = null;
        this.handshakeCallback = null;

        this._reset_rec();
        this._initHandlers();
        this._initHeartBeat();
        this._initHandShakeBuffer();
        this._log('config pomelo constructor');
    }

    /**
     * 初始化并连接websocket
     * @param {object} params - 初始化参数
     * @param {string} params.host - 地址
     * @param {number} [params.port] - 端口号，默认80
     * @param {boolean} [params.wss] - 是否使用wss，默认false
     * @param {boolean} [params.reconnect] - 断线后是否自动重连，默认false
     * @param {number} [params.maxReconnectAttempts] - 自动重连次数，-1表示无限重连，默认5次
     * @param {number} [params.reconnectionDelay] - 重连时间间隔，默认3秒
     * @param {object} [params.user] - 用户信息
     * @param {function(data)} [params.handshakeCallback] - 握手成功后的回调
     * @param {object} [params.config] - 加密配置信息
     * @param {function(MRPomelo)} cb - 连接并握手成功后的回调
     */
    init(params, cb) {

        let url = params.url;

        if (!url){
            const host = params.host;
            if((0 != host.indexOf('ws://')) && (0 != host.indexOf('wss://'))){
                const port = params.port;
                const isWss = params.wss;

                url = (isWss ? 'wss://' : 'ws://') + host;
                if (port && port > 0) {
                    url += ':' + port;
                }
            }else {
                url = host;
            }
        }

        this.handshakeBuffer.user = params.user;
        this.handshakeCallback = params.handshakeCallback;
        this.initCallback = cb;
        // 加解密配置
        this.encryptConfig = params.config || {};
        this._connect(params, url);
    }

    /**
     * 判断当前pomelo是否连上服务器了
     * @returns {boolean} - socket是否处于连接状态
     */
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * 主动断开连接
     */
    disconnect() {
        if (this.socket) {

            this._log('disconnect');
            const socket = this.socket;
            this.socket = undefined;

            ///先把这些回调清理下，避免后续继续给上层回调导致，上层重连或者走业务逻辑
            this.initCallback = undefined;
            this.callbacks = {};
            this.routeMap = {};
            this.handshakeCallback = undefined;

            if (socket.disconnect) socket.disconnect();
            if (socket.close) socket.close();
        }

        this._clearHeartBeatTimers();
    }

    /**
     * @callback requestCallback
     * @param {object} data
     */

    /**
     * request
     * @param {string} route - 路由
     * @param {object | requestCallback} [msg] - 参数信息，也可以吧route放到msg里
     * @param {requestCallback} [cb] - 请求回调
     */
    request(route, msg, cb) {
        this._log('request: ' + route + ', ' + 'msg: ' + JSON.stringify(msg));
        if (typeof msg === 'function') {
            cb = msg;
            msg = {};
        } else {
            msg = msg || {};
        }
        route = route || msg.route;
        if (!route) {
            throw 'empty route error on request';
        }

        ///在发送请求之前上层断开了连接 或者 没有连接过就开始发送消息；
        if (!this.socket){
            const err = {code:ERRCODE.NONESOCKET,msg:'未连接'};
            cb(err);
            return;
        }

        this.reqId++;
        this._sendMessage(this.reqId, route, msg);
        this.callbacks[this.reqId] = cb;
        this.routeMap[this.reqId] = route;
    }

    /**
     * notify
     * @param {string} route - 路由
     * @param {object} [msg] 参数信息
     */
    notify(route, msg) {
        this._log('notify: ' + route + ', ' + 'msg: ' + JSON.stringify(msg));
        msg = msg || {};
        route = route || msg.route;
        if (!route) {
            throw 'empty route error on notify';
        }
        this._sendMessage(0, route, msg);
    }
}

MRPomelo.EVENT = EVENT;
MRPomelo.ERRCODE = ERRCODE;
export default MRPomelo;
// module.exports = MRPomelo;
