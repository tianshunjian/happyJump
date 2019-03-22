import MRPomelo from '../pomelo/mr-pomelo.js';
import EncryptConfig from '../pomelo/EncryptConfig.js';
import UserInfo from './UserInfo.js';
import {ROUTE,SIGNAL,GameMode,GetVersion, GetPlatform, PLATFORM} from './Constants.js';
import {GetENV, PRODUCT_ENV_TYPE} from './Env.js';
import Utils from './Utils';
import setupSHJSBridge from '../bridge/WebNativeBridge.js';

const logger = console;

class GameSocket {

    constructor(opt){
        this._status = 1;
        this._connecting = false;
        this._connected = false;
        this.reconnCallbacks = [];
        this.socket = new MRPomelo();

        /**
         * 订阅小喇叭消息
         */
        this.socket.on(ROUTE.ON_RECEIVED_TRUMPET, function (data) {
            opt.onReceivedTrumpet && opt.onReceivedTrumpet(data);
        }.bind(this));

        /**
         * 监听被踢掉事件
         */
        this.socket.on(ROUTE.ON_KICK, function (data) {
            this._handleOnKick(data);
        }.bind(this));

        /**
         * 监听断开事件
	     */
        this.socket.on(MRPomelo.EVENT.DISCONNECT,function () {
            //监听到断开，改下标志位
            this._connected = false;
            this._connecting = false;
            ///之前登录成功过才抛给上层去，如果没有则说明当次正在登录，不用抛，相关回调函数会走！
            if (this._loginSucceedOnce){
                opt.disconnectHandler && opt.disconnectHandler();
            }
        }.bind(this));
    }

    _handleOnKick(data){
        console.error('onKick:' + JSON.stringify(data) + ';disconnect it！');
        this._disconnect();
        switch (data.reason) {
        case 'ServerNotRun':
            this._showModal(SIGNAL.SERVER_PAUSE_HINT);
            break;
        case 'AppVersionError':
            this._showModal(SIGNAL.UPDATE_HINT);
            break;
        case 'ServerNotOpen':
            this._showModal(SIGNAL.SERVER_PREPARE_HINT);
            break;
        case 'DupLogin':
            Utils.showModal({content:'您的账号在其他设备登录，非本人操作请注意修改密码！', showCancel:false, confirmText:'确定'});
            break;
        case 'InvalidRequest':
            this._showModal('无效请求');
            break;
        case 'AuthError':
            this._showModal('验证错误');
            break;
        case 'ServerMaintaining':
            this._showModal(SIGNAL.SERVER_PAUSE_HINT);
            break;
        case 'NotLoginState':
            this._showModal('没有登录');
            break;
        default:
            this._showModal('未知错误');
        }
    }

    get gameMode(){
        return GameMode();
    }

    get _platform(){
        return GetPlatform();
    }

    //游戏版本
    get _version () {
        if (GetENV() === PRODUCT_ENV_TYPE) {
            return GetVersion();
        } else {
            return GetVersion() + 'TEST';
        }
    }

    //微信模态弹窗
    _showModal (content) {
        const self = this;
        Utils.showModal({
            title: '提示',
            content: content,
            showCancel: false,
            success: function (res) {
                if (res.confirm) {
                    if (self._platform == PLATFORM.kH5) {
                        const method = 'goback';
                        setupSHJSBridge(function (bridge) {
                            console.log('invoke【' + method + '】');
                            bridge.invokeNative(method);
                        });
                    }
                }
            }
        });
    }

    /**
     * @typedef {object} MRPomelo
     */

    /**
     * 连接socket
     * @param {object} params - 初始化参数
     * @param {string} params.host - 地址
     * @param {number} [params.port] - 端口号，默认80
     * @param {boolean} [params.wss] - 是否使用wss，默认false
     * @param {boolean} [params.reconnect] - 断线后是否自动重连，默认false
     * @param {number} [params.maxReconnectAttempts] - 自动重连次数，-1表示无限重连，默认10次
     * @param {object} [params.user] - 用户信息
     * @param {function(data)} [params.handshakeCallback] - 握手成功后的回调
     * @param {object} [params.config] - 加密配置信息
     * @return {Promise<MRPomelo>}
     * @private
     */
    _connect(params){
        this.socket.disconnect();
        const connectorPs = Object.assign({},params);
        connectorPs.config = EncryptConfig; // 加密配置
        const self = this;
        ///底层不重连
        connectorPs.reconnect = false;
        const status = self._status;
        return new Promise(function (resolve,reject) {
            if (status !== self._status) return;
            self.socket.init(connectorPs,function(err,mrpomelo){
                if (err){
                    reject(err);
                } else {
                    resolve(mrpomelo);
                }
            });
        });
    }

    /**
     * 断开连接
     * @private
     */
    _disconnectInner(){
        // 主动断开清理callback
        this._connecting = false;
        this._connected = false;
        ///清理重连定时器
        if (this.reSignInTimer){
            clearTimeout(this.reSignInTimer);
            this.reSignInTimer = undefined;
        }
        this.socket.disconnect();
    }

    /**
     * 断开连接
     * @private
     */
    _disconnect(){
        // 主动断开清理callback
        this._status ++;
        this._connecting = false;
        this._connected = false;
        this.reconnCallbacks = [];
        ///清理重连定时器
        if (this.reSignInTimer){
            clearTimeout(this.reSignInTimer);
            this.reSignInTimer = undefined;
        }
        this.socket.disconnect();
    }

    /**
     * 如果出现连接错误，自动重连5次，重连之前会回调给上层一次错误，进而清理了回调，后续不再回调！
     * @param {object} params
     * @param {number} params.numberId - 用户id
     * @param {function(err,result)} callback
     * @param {object} callback.err
     * @param {object} callback.result
     * @private
     */
    _connectForLogin(params,callback){
        console.log('signIn parameters:' + JSON.stringify(params));

        ///检查参数
        const ps_empty_checker = function (ps,key) {
            if (!ps[key]){
                const msg = 'can not do connect server: ' + key + ' is empty!';
                const error = {code:-999,msg:msg};
                callback(error);
                return true;
            } else {
                return false;
            }
        };

        if(this._platform == PLATFORM.kH5){

            if (ps_empty_checker(params,'deviceId')){
                return;
            }

        }else{

            // if (ps_empty_checker(params,'numberId') || ps_empty_checker(params,'userInfo') || ps_empty_checker(params,'js_code') || ps_empty_checker(params,'iv') || ps_empty_checker(params,'encryptedData') || ps_empty_checker(params,'cFrom')){
            //     return;
            // }
        }

        const ps = Object.assign({},params);
        const requestPs = Object.assign({},params);
        delete requestPs['host'];
        delete requestPs['port'];
        requestPs.appVersion = this._version;

        if(ps.log === undefined){
            ps.log = true;
        }

        const self = this;
        // 连接服务器
        const connectIt = function (ps) {
            return self._connect(ps);
        };

        const status = self._status;

        /**
         * 请求gate地址
         * @param {string} appVersion - 版本号
         * @param {string} requestZone - 游戏所在分区 默认Mainland
         */
        const getGateServer = function () {
            return new Promise(function (resolve,reject) {
                if (status !== self._status) return;
                self.socket.request(ROUTE.GET_GATE_SERVER,{appVersion: self._version, requestZone: 'Mainland'},function (response) {
                    if (response && response.code === SIGNAL.OK && response.result && response.result.gateServers && response.result.gateServers.length > 0) {
                        let gateServer = response.result.gateServers[0];
                        UserInfo.gateServer = gateServer;  //存储gate地址
                        ps.url = gateServer.url;
                        ps.host = gateServer.host;
                        ps.port = gateServer.port;
                        resolve(ps);
                    }else {
                        const msg = response.msg || 'unknown err';
                        const err = {};
                        err.msg = 'server err: ' + msg;
                        err.code = response.code;
                        reject(err);
                    }
                });
            });
        };

        // 请求connector地址，不需要传参数
        const getConnector = function () {
            return new Promise(function (resolve,reject) {
                if (status !== self._status) return;
                self.socket.request(ROUTE.GET_CONNECTOR,{},function (response) {

                    if(response && response.code === SIGNAL.OK){
                        UserInfo.connector = response;  //存储connector
                        ps.url = response.url;
                        ps.host = response.host;
                        ps.port = response.port;
                        resolve(ps);
                    } else if (response && response.code === SIGNAL.EXPIRE) {  //gate过期了
                        UserInfo.cleanGateServer();
                        self._disconnectInner();
                        if (!self.didConnectForSignIn) {
                            self.didConnectForSignIn = true;
                            self._connectForLogin(params, callback);
                        }
                    } else {
                        const msg = response.msg || 'unknown err';
                        const err = {};
                        err.msg = 'server err: ' + msg;
                        err.code = response.code;
                        reject(err);
                    }
                });
            });
        };

        /**
         * 检查版本和白名单
         * @param {string} appVersion - 版本号
         */
        const checkVersionAndWhiteList = function () {
            return new Promise(function (resolve,reject) {
                if (status !== self._status) return;
                self.socket.request(ROUTE.CHECK_VERSION_AND_WHITE_LIST,{appVersion: self._version}, function (response) {
                    if (response && response.code === SIGNAL.OK) {  //成功
                        resolve();
                    } else {  //失败
                        if (response && response.code === SIGNAL.STOP) {  //服务器未运行
                            self._disconnectInner();
                            self._showModal(SIGNAL.SERVER_PAUSE_HINT);
                        } else if (response && response.code === SIGNAL.UPDATE) {  //版本过低需要更新
                            self._disconnectInner();
                            self._showModal(SIGNAL.UPDATE_HINT);
                        } else if (response && response.code === SIGNAL.PREPARE) {  //尚未开服
                            self._disconnectInner();
                            self._showModal(SIGNAL.SERVER_PREPARE_HINT);
                        } else if (response && response.code === SIGNAL.PAUSE) {  //停服维护
                            self._disconnectInner();
                            self._showModal(SIGNAL.SERVER_PAUSE_HINT);
                        }
                        const msg = response.msg || 'unknown err';
                        const err = {};
                        err.msg = 'server err: ' + msg;
                        err.code = response.code;
                        reject(err);
                    }
                });
            });
        };

        //用户登录
        const userLogin = function () {
            return new Promise(function (resolve,reject) {
                if (status !== self._status) return;
                let route = ROUTE.WeChat_USER_SIGNIN;
                if(self._platform == PLATFORM.kH5) route = ROUTE.H5_USER_SIGNIN;
                self.socket.request(route,requestPs,function (response) {
                    if(response && response.code === SIGNAL.OK){
                        const result = response.result || {};
                        resolve(result);
                    }else {
                        const msg = response.msg || 'unknown err';
                        const err = {};
                        err.msg = 'server err: ' + msg;
                        err.code = response.code;
                        reject(err);
                    }
                });
            });
        };

        ///更新用户信息
        const updateUserInfo = function(result){
            console.error('updateUserInfo:' + JSON.stringify(result));
            //{"userInfoData":{"numberId":900000004,"openId":"o4mY_0lxojSdarCCqOrdlFYPpfiw","nickName":"mango%uD83D%uDE04","avatarUrl":"https://wx.qlogo.cn/mmopen/vi_32/VibibaeUDvV7icflGuf3sZibribSSWe7arBsq8suKicVE2tK1E6qibv5qxFZAIXcnJbdJL7neBuflibXuAl9KCLiapj3ryQ/132","gender":1,"city":"Fengtai","province":"Beijing","cFrom":"jumper"},
            // "gameInfoData":{"jumperGameScore":0,"game2048Score":-1,"competeScore":-1,"championshipJumperScore":-1},
            // "skinInfoData":[],
            // "knapsackInfoData":[],
            // "currentTime":1528961948938}

            UserInfo.userInfoData = result.userInfoData;
            if(self._platform == PLATFORM.kH5){
                //H5登录成功之后，更新昵称和头像
                if (result.userInfoData && result.userInfoData.nickname){
                    UserInfo._appInfo.nickname = result.userInfoData.nickname;
                    UserInfo._appInfo.avatarUrl = result.userInfoData.avatarUrl;
                }
            }
            UserInfo.gameInfoData = result.gameInfoData;
            UserInfo.skinInfoData = result.skinInfoData;
            UserInfo.knapsackInfoData = result.knapsackInfoData;
            UserInfo.isApproving = result.isApproving;  //是审核服？
            //获取服务器当前时间和用户当前时间
            const currentUserTime = Date.now();
            const currentServerTime = result.currentTime;
            UserInfo.timeDifferSU = currentServerTime - currentUserTime;
        };

        const ReSignCounter = 3;

        const _reSignIn = function(callback){

            if (self._signInParams){
                if (!self.reSignInTimer) {
                    self.reSignInTimer = setTimeout(function () {
                        self.reSignInTimer = undefined;
                        if (self._autoReSignCounter > ReSignCounter) {
                            self._connecting = false;
                            callback && callback({code: MRPomelo.ERRCODE.DISCONNECT});
                        } else {
                            logger.error('Auto reSignIn after disconnect ' + self._autoReSignCounter);
                            self._connecting = true;
                            self._connectForLogin(params, callback);
                        }
                    }, (self._autoReSignCounter - 1) * 200);
                }
            }
        };

        const invokeSucc = function(){
            self._connected = true;
            self._connecting = false;
            ///标记下，为了断开重连抛事件
            self._loginSucceedOnce = true;

            // self.socket.once(MRPomelo.EVENT.DISCONNECT,function () {
            //     self._connected = false;
            //     self._connecting = false;
            //     self._autoReSignCounter = 1;
            //     _reSignIn(callback);
            // });

            self._autoReSignCounter = 0;

            try {
                callback && callback(null);
            }catch (err) {
                let msg = '';
                if (err instanceof Error){
                    msg = 'name: ' + err.name + '\nmessage: ' + err.message + '\nstack: ' + JSON.stringify(err.stack);
                } else {
                    msg = JSON.stringify(err);
                }
                console.error('上层回调里出现了错误：' + msg);
            }
        };

        //异常处理函数
        const exceptionFunc = function (err) {

            let msg = '';
            if (err instanceof Error){
                msg = 'name: ' + err.name + '\nmessage: ' + err.message + '\nstack: ' + JSON.stringify(err.stack);
            } else {
                msg = JSON.stringify(err);
            }

            console.error('GameSocket catch err：' + msg);

            self._connecting = false;
            self._connected = false;
            ///socket 断开导致的，内部做个重连
            if((err.code === MRPomelo.ERRCODE.DISCONNECT) || (err.code === MRPomelo.ERRCODE.RECONNECT_OVER)){
                if (typeof (self._autoReSignCounter) == 'undefined'){
                    self._autoReSignCounter = 0;
                }

                if (self._autoReSignCounter < ReSignCounter){
                    self._autoReSignCounter ++;
                    _reSignIn(callback);
                }else {
                    self._autoReSignCounter = 0;
                    callback && callback(err);
                }
            }else {
                ///没有登录上，出错了但不是网络错误说明是业务上的错误，此时断开长连接；
                ///防止长连接断了之后触发底层重连逻辑，导致拿着之前的登录信息去连接！！
                ///http://10.18.118.161:8080/browse/GAMESDK-25
                self._disconnectInner();
                callback && callback(err);
            }
        };

        /**
         * connector地址保存到内存之中，能取到就直接用
         */
        if (UserInfo.connector) {
            ps.url = UserInfo.connector.url;
            ps.host = UserInfo.connector.host;
            ps.port = UserInfo.connector.port;
            connectIt(ps)
                .then(checkVersionAndWhiteList)
                .then(userLogin)
                .then(updateUserInfo)
                .then(invokeSucc)
                .catch(exceptionFunc);
        } else {
            /**
             * gate地址保存在内存之中，能取到就直接用
             */
            if (UserInfo.gateServer) {
                ps.url = UserInfo.gateServer.url;
                ps.host = UserInfo.gateServer.host;
                ps.port = UserInfo.gateServer.port;
                connectIt(ps)
                    .then(getConnector)
                    .then(connectIt)
                    .then(checkVersionAndWhiteList)
                    .then(userLogin)
                    .then(updateUserInfo)
                    .then(invokeSucc)
                    .catch(exceptionFunc);
            } else {
                /**
                 * 取不到gate地址，就去获取
                 */
                connectIt(ps)
                    .then(getGateServer)
                    .then(connectIt)
                    .then(getConnector)
                    .then(connectIt)
                    .then(checkVersionAndWhiteList)
                    .then(userLogin)
                    .then(updateUserInfo)
                    .then(invokeSucc)
                    .catch(exceptionFunc);
            }
        }
    }

    /**
     * 连接成功后分发事件
     * @param err
     * @private
     */
    _dispatchReconnectResult(err){
        console.log('clean GameSocket signIn callbacks');
        const callbacks = this.reconnCallbacks;
        this.reconnCallbacks = [];
        callbacks.forEach(function(callback){
            callback(err);
        });
    }


    doLogin(params,callback){
        // socket 没连上，也没有正在连，那么就开始连；
        if (!this._connected && !this._connecting){
            this._connecting = true;
            if (callback){
                // 保存起来，当连上后回调
                this.reconnCallbacks.push(callback);
            }
            this._connectForLogin(params,function(err){
                this._connecting = false;
                if (err){
                    this._connected = false;
                }else {
                    /**
                     * 加入小喇叭
                     */
                    this.request(ROUTE.JOIN_TRUMPET_CHANNEL, {gameMode:this.gameMode}, function (err) {
                        const msg = '加入小喇叭: ' + (err ? JSON.stringify(err) : 'succeed');
                        console.log(msg);
                    });

                    ///没有错误将标志位置位true；
                    this._connected = true;
                }

                this._dispatchReconnectResult(err);
            }.bind(this));
        }else if(callback){
            if(this._connected){
                callback && callback(undefined);
            }else {
                if (callback) {
                    // 保存起来，当连上后回调
                    this.reconnCallbacks.push(callback);
                }
            }
        }
    }

    /**
     * 登录
     * @param params
     * @param callback
     */
    login(params,callback){
        this._signInParams = params;
        this.doLogin(params,callback);
    }

    /**
     * 断开连接
     */
    disconnect() {
        this._disconnect();
    }

    /**
     * 发送请求(用于请求带result结构的接口)
     * @param {string} route - 消息路由
     * @param {object|requestCallback} params - 参数
     * @param {requestCallback} [callback]
     */
    request(route,params,callback){
        if (this._connected){
            this.socket && this.socket.request(route, params, function (resp) {
                if (callback){
                    const code = resp.code;
                    if (code === SIGNAL.OK){
                        const result = resp.result;
                        callback(undefined,result);
                    }else {
                        const msg = resp.msg || '网络未连接';
                        const err = {};
                        err.msg = msg;
                        err.code = code;
                        callback(err,undefined);
                    }
                }
            }.bind(this));
        } else {
            if (callback){
                const msg = '网络未连接';
                const err = {};
                err.msg = msg;
                err.code = -1000;
                logger.error(JSON.stringify(err));
                callback(err,undefined);
            }
        }
    }

    /**
     * 发送请求(用于请求不带result结构的接口)
     * @param {string} route - 消息路由
     * @param {object|requestCallback} params - 参数
     * @param {requestCallback} [callback]
     */
    requestV2(route,params,callback){
        if (this._connected){
            this.socket && this.socket.request(route, params, function (resp) {
                if (callback){
                    const code = resp.code;
                    if (code === SIGNAL.OK){
                        const result = resp;
                        callback(null,result);
                    }else {
                        const msg = resp.errorMsg || '网络未连接';
                        const err = {};
                        err.msg = msg;
                        err.code = code;
                        callback(err,null);
                    }
                }
            }.bind(this));
        } else {
            if (callback){
                const msg = '网络未连接';
                const err = {};
                err.msg = msg;
                err.code = -1000;
                logger.error(JSON.stringify(err));
                callback(err,null);
            }
        }
    }

    /**
     * @callback onCallback
     * @param {object} data
     */

    /**
     * 监听服务器消息
     * @param {string} route - 消息路由
     * @param {onCallback} callback
     */
    on(route,callback){
        this.socket && this.socket.on(route,callback);
    }

    /**
     * 移除该路由下对应的某个监听
     * @param {string} route
     * @param {function} callback
     */
    off(route, callback) {
        if(callback) {
            this.socket && this.socket.removeListener(route, callback);
        }else{
            this.socket && this.socket.removeAllListeners(route);
        }
    }

    /**
     * 是否已经登录上了
     * @return {boolean}
     */
    connected(){
        return this._connected;
    }
}

export default GameSocket;
