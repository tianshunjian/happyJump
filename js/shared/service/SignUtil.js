import SocketConnector from './GameSocketConnector.js';
import UserInfo from './UserInfo.js';
import {GetPlatform, PLATFORM} from './Constants.js';
import {GetCFrom, GetVersion} from './Constants.js';
import {sha256_digest} from './sha256.js';
import setupSHJSBridge from '../bridge/WebNativeBridge.js';
import GameLog from '../log/GameLog.js';
import {SIGNAL} from './Constants';
import Utils from './Utils';
import Application from '../bridge/Application';

export const ErrCode = {
    NetErr : -1000,
    SessionErr : -999,
    WxLoginErr : 1,
    WxLoginEmptyCode : 2,
    AuthorizeDeny : 3,
    WxUserInfoErr : 4,
    InitGameErr: 5,
    NumberIdEmptyErr: 6,
    FastSignInErr: 7,
};

class SignUtil {

    static _serverLogin(ps){
        const self = this;
        return new Promise(function (resolve,reject) {
            SocketConnector.login(ps,function (err) {
                if (err){
                    if (err.code === 2){
                        self._log('code=2清理用户 NumberId');
                        UserInfo.numberId = undefined;
                        UserInfo.jsCode = undefined;
                    }else if(err.code === 3){
                        self._log('code=3清理用户 jscode');
                        UserInfo.jsCode = undefined;
                    }
                    reject(err);
                }else {
                    resolve();
                }
            });
        });
    }

    ///获取js_code
    static _wxLogin(){
        const self = this;
        return new Promise(function (resolve,reject){
            wx.login({
                success:function (res) {
                    self._log('wx.login code:' + res.code);
                    if (res.code) {
                        const jsCode = res.code;
                        UserInfo.jsCode = jsCode;
                        resolve(jsCode);
                    }else {
                        reject({code:ErrCode.WxLoginEmptyCode,msg:'微信登录失败'});
                    }
                },
                fail:function (err) {
                    self._log('wx.login fail:' + err.errMsg);
                    reject({code:ErrCode.WxLoginErr,msg:'微信登录失败'});
                }
            });
        });
    }

    ///注册
    static _signUp(callback) {

        ///兼容微信小程序，没有window对象
        const _window = window || global;
        const isWeChat = _window.WechatGame;
        const self = this;
        ///获取用户信息包括加密数据
        const _wxUserInfo = function(code){
            return new Promise(function (resolve,reject){
                if (isWeChat){
                    wx.getUserInfo({
                        withCredentials:true,
                        lang:'en',
                        success:function (res) {
                            self._log('wx.getUserInfo success:' + JSON.stringify(res.userInfo));
                            const info = res.userInfo;
                            const encryptedData = res.encryptedData;
                            const iv = res.iv;
                            const userInfo = {};
                            userInfo['avatarUrl'] = info.avatarUrl || '';
                            userInfo['gender'] = info.gender;
                            userInfo['city'] = info.city || '';
                            userInfo['province'] = info.province || '';
                            userInfo['country'] = info.country || '';
                            userInfo['nickName'] = info.nickName || '';
                            ///发现不点击按钮也能弹框了，所以这里消掉授权按钮
                            self.hiddenNewAuthorizedButtonIfNeed();
                            resolve({
                                userInfo:userInfo,
                                js_code:code,
                                encryptedData:encryptedData,
                                iv:iv
                            });
                        },
                        fail:function (err) {
                            self._log('wx.getUserInfo err:', JSON.stringify(err));
                            reject({code:ErrCode.WxUserInfoErr,msg:'获取用户信息失败'});
                        }
                    });
                }else{
                    //TODO:
                }
            });
        };

        const _makeInfo = function(info){
            return new Promise(function (resolve){
                const userInfo = info.userInfo;
                const js_code = info.js_code;
                const encryptedData = info.encryptedData;
                const iv = info.iv;
                const cFrom = GetCFrom();
                const appVersion = GetVersion();

                let nickName = userInfo.nickName;
                // nickName = '晶𓆝𓆟𓆜';
                nickName = escape(nickName);
                userInfo.nickName = nickName;
                info.userInfo = userInfo;

                const ps = {
                    js_code : js_code,
                    numberId : 0,
                    userInfo : userInfo,
                    encryptedData : encryptedData,
                    iv : iv,
                    cFrom : cFrom,
                    appVersion : appVersion
                };

                resolve(ps);
            });
        };

        ///V2注册
        const _signUpV2 = function(callback){

            ///session 无效，从头开始登录；
            this._wxLogin()
                .then(_wxUserInfo)
                .then(_makeInfo)
                .then(this._serverLogin.bind(this))
                .then(callback,callback);
        }.bind(this);

        ///V1注册
        const _signUpV1 = function(callback){
            function wxAuthorize(){
                return new Promise(function (resolve,reject){
                    if (isWeChat){
                        wx.authorize({
                            scope:'scope.userInfo',
                            success:function () {
                                self._log('wx.authorize ok');
                                resolve();
                            },
                            fail:function (err) {
                                self._log('wx.authorize err:'+ err.errMsg);//fail auth deny
                                //用户拒绝授权！需要引导到设置里打开授权！
                                wx && wx.openSetting();
                                reject({code:ErrCode.AuthorizeDeny,msg:'微信授权失败'});
                            }
                        });
                    }else {
                        //TODO:
                    }
                });
            }

            ///session 无效，从头开始登录；
            wxAuthorize()
                .then(function () {
                    _signUpV2(callback);
                })
                .catch(callback);
        };

        if (this.isV2AuthorizedSystem()){
            this._log('二代登录');
            _signUpV2(callback);
        } else {
            this._log('一代登录');
            _signUpV1(callback);
        }
    }

    ///登录
    static _signIn(callback){

        /*
         * 快速登录参数默认空，保证 code 和 numberId 即可！
         * */
        const _makeInfo = function(code){
            return new Promise(function (resolve){
                const encryptedData = '';
                const iv = '';
                const userInfo = {
                    avatarUrl : '',
                    gender : 0,
                    city : '',
                    province : '',
                    country : '',
                    nickName : '',
                };

                const numberId = UserInfo.numberId;
                const cFrom = GetCFrom();
                const appVersion = GetVersion();

                const ps = {
                    js_code : code,
                    numberId : numberId,
                    userInfo : userInfo,
                    encryptedData : encryptedData,
                    iv : iv,
                    cFrom : cFrom,
                    appVersion : appVersion
                };
                resolve(ps);
            });
        };

        const _checkJsCode = function(){
            const code = UserInfo.jsCode;
            if (code){
                return new Promise(function (resolve) {
                    resolve(code);
                });
            }else {
                this._log('jscode 为空，重新获取');
                return this._wxLogin();
            }
        }.bind(this);

        _checkJsCode()
            .then(_makeInfo)
            .then(this._serverLogin.bind(this))
            .then(callback,callback);
    }

    /**
     * 登录
     * @param callback
     * @returns {boolean} 如果返回了 true 则说明曾经登录过，直接往下走逻辑即可；返回false时走callback逻辑
     */
    static _doFastLogin(callback){
        const _canFastLogin = function () {
            const numberId = UserInfo.numberId;
            return numberId;
            // const jscode = UserInfo.jsCode;
            // return numberId && jscode;
        };

        const errHandler = function (err) {
            if (err){
                if (!UserInfo.numberId){
                    this._FastSignInRetryCount = undefined;
                    ///没有NumberId，检测下权限
                    this._authorizedStatus(function (flag) {
                        if(flag){
                            this._log('已经授权，没有NumberId，走SignUp');
                            this._signUp(callback);
                        }else {
                            callback && callback({code:ErrCode.NumberIdEmptyErr,msg:'登录失败'});
                        }
                    }.bind(this));
                }else if(!UserInfo.jsCode){

                    if (!this._FastSignInRetryCount){
                        this._FastSignInRetryCount = 1;
                    } else {
                        this._FastSignInRetryCount ++;
                    }

                    if (this._FastSignInRetryCount < 3){
                        this._log('快速登录检测到有 NumberId : ' + UserInfo.numberId + '需要重新获取jsCode');
                        this._signIn(callback);
                    } else {
                        this._FastSignInRetryCount = undefined;
                        callback && callback({code:ErrCode.FastSignInErr,msg:'快速登录失败'});
                    }
                }else {
                    this._FastSignInRetryCount = undefined;
                    callback && callback(err);
                }
            } else {
                this._FastSignInRetryCount = undefined;
                callback && callback();
            }
        }.bind(this);

        if (_canFastLogin()){
            this._signIn(errHandler);
        } else {
            this._signUp(errHandler);
        }
    }

    static _doH5FastLogin(callback, extraParam){
        const self = this;

        const onNotifyUserHASBeenLogin = function(){
            console.log('onNotifyUserHasBeenLogin');
            Utils.showModal({
                content:'您的账号刚刚在其他设备上登录，请检查账号安全',
                showCancel: false,
                confirmText:'确定'
            });
        };

        const onNotifyUserToLogin = function(){
            console.log('onNotifyUserToLogin');
            Utils.showModal({
                title:'登录提示',
                content:'用户退出搜狐账号后，绑定的游客账号仍然同步游戏数据, 并且用户可以使用该账号继续游戏，只是不能充值或者领取有人民币价值的礼物。为了更好的保障您的账号安全，请前往搜狐视频登录页面登录后继续游戏。',
                cancelText:'暂不登录',
                confirmText:'立即登录',
                success: function (res) {
                    if(res.confirm){
                        Utils.setStorageSync('bindFlag', '1');
                        UserInfo._appInfo = undefined;
                        Application.showAppLoginPage();
                    }
                }
            });
        };

        const onNotifyUserBindSuccess = function(){
            console.log('onNotifyUserBindSuccess');
            Utils.showToast({title:'绑定成功', icon:'none'});
        };

        SocketConnector.on('onNotifyUserHasBeenLogin', onNotifyUserHASBeenLogin);
        SocketConnector.on('onNotifyUserToLogin', onNotifyUserToLogin);
        SocketConnector.on('onNotifyUserBindSuccess', onNotifyUserBindSuccess);

        const h5Callback = function (err) {
            if(err){
                UserInfo._loginCode = err.code;
                //需要刷新页面的回调
                const reloadCallback = function (err) {
                    if(err){
                        callback(err);
                    }else{
                        Application.reloadPage();
                    }
                };
                switch (err.code){
                case SIGNAL.REMIND_BIND:  //未绑定，需要绑定
                    Utils.showModal({
                        title:'温馨提示',
                        content:'亲爱的用户，检测到您已登录搜狐视频账号，是否将游客账号绑定到搜狐视频上，更好的保障账号安全。',
                        cancelText:'暂不绑定',
                        confirmText:'立即绑定',
                        success: function (res) {
                            if(res.confirm){
                                self._doH5FastLogin(callback, {isBindCustomer:1, isSaveCustomer:-1, isFastLogin:-1});
                            }else{
                                self._doH5FastLogin(callback, {isBindCustomer:0, isSaveCustomer:-1, isFastLogin:-1});
                            }
                        }
                    });
                    break;
                case SIGNAL.HAVE_WECHAT: case SIGNAL.HAVE_SOHU:
                    {
                        let wechat = err.code == SIGNAL.HAVE_WECHAT ? '（微信）' : '';

                        Utils.showModal({
                            title:'账号信息覆盖',
                            content:'亲爱的用户，我们检测到您的搜狐视频账号内已有'+wechat+'小游戏数据，账号绑定时只能保留一个账号的数据信息，请选择保留游客账号还是搜狐账号的游戏数据?',
                            cancelText:'游客账号',
                            confirmText:'搜狐账号',
                            success: function (res) {
                                if(res.confirm){
                                    self._doH5FastLogin(reloadCallback, {isBindCustomer:1, isSaveCustomer:0, isFastLogin:-1});
                                }else{
                                    self._doH5FastLogin(reloadCallback, {isBindCustomer:1, isSaveCustomer:1, isFastLogin:-1});
                                }
                            }
                        });
                    }
                    break;
                case SIGNAL.HAD_BIND: case SIGNAL.HAD_NOT_BIND: //文案、方案待定。。。
                    Utils.showModal({
                        content: '该搜狐账号已绑定过其它游客账号，请更换一个搜狐账号',
                        showCancel: false,
                        confirmText:'确定',
                        success:function(res){
                            if(res.confirm){
                                Utils.removeStorageSync('bindFlag');
                                self._doH5FastLogin(reloadCallback, {isBindCustomer:-1, isSaveCustomer:-1, isFastLogin:-1});
                            }
                        }
                    });
                    break;
                default:
                    callback(err);
                    break;
                }
            }else{
                Utils.removeStorageSync('bindFlag');
                SignUtil.hadLogin = true;
                callback();
            }
        };

        const login = function (cb) {
            const params = UserInfo._appInfo;
            params.time = (new Date()).getTime().toString();
            params.signature = sha256_digest(params.identifier + params.deviceId + params.time);
            params.cFrom = GetCFrom();
            SocketConnector.login(params,cb);
        };

        const saveAppInfo  = function(obj){
            const appInfo = {};

            appInfo.deviceId = obj.deviceid || '';
            appInfo.identifier = obj.identifier || '';
            appInfo.nickname = obj.nickname || '';
            appInfo.avatarUrl = obj.avatar || '';
            appInfo.gender = obj.gender || 0;
            appInfo.shMobile = obj.loginMobile || '';
            appInfo.shLoginType = (obj.loginType == null || obj.loginType == '') ? -1 : parseInt(obj.loginType);

            UserInfo._appInfo = appInfo;
        };

        const addExtraParam = function (obj) {

            let appInfo = UserInfo._appInfo;
            if(obj == null){
                let bindFlag = Utils.getStorageSync('bindFlag');
                if(bindFlag == '1'){
                    appInfo.isBindCustomer = 1;
                    appInfo.isFastLogin = -1;
                }else {
                    appInfo.isBindCustomer = -1;
                    appInfo.isFastLogin = SignUtil.hadLogin === true ? 1 : -1;
                }
                appInfo.isSaveCustomer = -1;
            }else{
                appInfo.isBindCustomer = obj.isBindCustomer;
                appInfo.isSaveCustomer = obj.isSaveCustomer;
                appInfo.isFastLogin = obj.isFastLogin;
            }
        };

        const getUserInfo = function (callback) {
            const self = this;
            if(window.isMobile){
                setupSHJSBridge(function(bridge){
                    bridge.invokeNative('getUserInfo',{},function(json){
                        self._log('获取native用户信息:' + JSON.stringify(json));
                        callback && callback(json);
                    });
                });
            }else {
                let deviceid = localStorage.getItem('brower-uid');
                if (!deviceid){
                    deviceid = 'BU' + new Date().getTime();
                    localStorage.setItem('brower-uid',deviceid);
                }
                callback && callback({
                    identifier: deviceid + '@sohu.com',
                    avatar : 'https://duqipai.56.com/2048/avatar/a-00140.jpg',
                    nickname : '哈哈',
                    gender : 1,
                    deviceid : deviceid
                });
            }
        }.bind(this);

        const appInfo = UserInfo._appInfo;
        if (appInfo) {
            addExtraParam(extraParam);
            login(h5Callback);
        }else {
            getUserInfo(function (h5UserInfo) {
                this._log(h5UserInfo);
                saveAppInfo(h5UserInfo);
                addExtraParam(extraParam);
                login(h5Callback);
            }.bind(this));
        }
    }

    static fastLogin(cb){
        if (SocketConnector.isConnected){
            this._log('已经登录了，不用再登了哈。。。。。');
            cb && cb({error:undefined,reLogin:false});
        } else {
            if (this._fastLoginCallbacks) {
                this._log('多次调用fastLogin将被拦截住哈');
                this._fastLoginCallbacks.push(cb);
            }else {
                this._fastLoginCallbacks = [];
                this._fastLoginCallbacks.push(cb);

                const callback = function (err) {
                    let msg = '';
                    if (err){
                        if (err instanceof Error){
                            msg = 'name: ' + err.name + 'message: ' + err.message + 'stack: ' + JSON.stringify(err.stack);
                        } else {
                            msg = JSON.stringify(err);
                        }
                    }

                    this._log('fastLogin is landing' + (msg ? msg : 'succeed'));
                    const arr = this._fastLoginCallbacks;
                    this._fastLoginCallbacks = null;
                    arr.forEach(function (cb) {
                        let s = {};
                        if (err){
                            const error = {code:err.code,msg:err.msg + '(' + err.code +')'};
                            s = {error: error, reLogin: false};
                        } else {
                            s = {error: undefined, reLogin: true};
                        }
                        cb && cb(s);
                    });
                }.bind(this);

                if(GetPlatform() == PLATFORM.kH5){
                    this._doH5FastLogin(callback);
                }else{
                    this._doFastLogin(callback);
                }
            }
        }
    }

    static _log(msg){
        if (!this.logger) {
            const logger = GameLog.getLogger('SignUtil');
            this.logger = logger;
        }
        this.logger.debug(msg);
    }

    static disconnect(callback){
        this._log('主动断开');
        SocketConnector.disconnect();
        ///清理下，防止下次在调用进队列！
        this._fastLoginCallbacks = undefined;
        callback && callback();
    }

    static isV2AuthorizedSystem(){
        ///兼容微信小程序，没有window对象
        const _window = window || global;
        if (_window.WechatGame){
            return wx && wx.createUserInfoButton;
        }else {
            return false;
        }
    }

    ///当有numberId时就不用授权了，直接登录
    static _isNeedAuthorize(){
        if (UserInfo.numberId) {
            return false;
        }else {
            return true;
        }
    }

    static hiddenNewAuthorizedButtonIfNeed(){
        if (this._fuckWxButton){
            this._log('清理授权按钮');
            this._fuckWxButton.hide();
            this._fuckWxButton.destroy();
            this._fuckWxButton = undefined;
        }
    }

    ///查询授权状态
    static queryAuthorized(cb){
        this._authorizedStatus(cb);
    }

    static _authorizedStatus(cb){

        if(this._authoringCallbacks){
            if (cb){
                this._authoringCallbacks.push(cb);
            }
        }else {
            if (cb){
                this._authoringCallbacks = [];
                this._authoringCallbacks.push(cb);
            }
            const self = this;
            const handler = function (flag) {

                // self._Authorized = flag;
                const authoringCallbacks = self._authoringCallbacks;
                self._authoringCallbacks = undefined;

                authoringCallbacks && authoringCallbacks.forEach(function (c) {
                    c(flag);
                });
            };
            ///兼容微信小程序，没有window对象
            const _window = window || global;
            if (_window.WechatGame){
                wx.getSetting({
                    success:function (result) {
                        const authSetting = result.authSetting;
                        if (authSetting) {
                            const flag = authSetting['scope.userInfo'];
                            if (flag) {
                                handler && handler(true);
                            }else {
                                handler && handler(false);
                            }
                        }
                    },
                    fail:function () {
                        handler && handler(false);
                    }
                });
            }else{
                //TODO:
            }
        }

        // if(typeof (this._Authorized) == 'undefined'){
        //
        // }else {
        //     cb && cb(this._Authorized);
        // }
    }

    static showNewAuthorizedButtonIfNeed(){
        //2.0.1 开始支持
        ///没有判断过授权
        const self = this;
        if(this._isNeedAuthorize() && !this._Authorized){

            this._authorizedStatus(function (flag) {
                if (!flag && self.isV2AuthorizedSystem()){
                    self._log('布置全屏授权按钮');
                    ///兼容微信小程序，没有window对象
                    const _window = window || global;
                    if (_window.WechatGame){
                        let button = wx.createUserInfoButton({
                            type: 'text',
                            text: '',
                            style: {
                                width: _window.innerWidth,
                                height: _window.innerHeight,
                                left: 0,
                                top: 0,
                                fontSize: 15,
                                textAlign: 'center',
                                color: '#ffffff',
                                // backgroundColor: '#ff0000'
                            }
                        });
                        button.onTap((res) => {
                            if(res.userInfo){
                                self.hiddenNewAuthorizedButtonIfNeed();
                                self._SignUpHandler && self._SignUpHandler();
                            } else {
                                self._log('用户拒绝授权');
                            }
                        });
                        button.show();
                        self._fuckWxButton = button;
                    }else{
                        //TODO:
                    }
                }

                if (!flag && !self.isV2AuthorizedSystem()) {
                    ///兼容微信小程序，没有window对象
                    const _window = window || global;
                    if (_window.WechatGame) {
                        self._log('直接弹授权弹窗');
                        self._SignUpHandler && self._SignUpHandler();
                    } else {
                        //TODO
                    }
                }
            });
        }
    }

    static addSignUpHandler(callback){
        this._SignUpHandler = callback;
    }

}

/**
 * 加个重连的监听！
 * 当且仅当曾经成功登录过，然后断了，才会触发！选择在SignUtil里处理是因为：
 * 1、让登录流程相对完整，不会出现类似于 jsCode使用多次的问题
 * 2、对上层业务层透明，尽可能让上层简单
 *
 * 可能存在的问题：
 * 由于是非业务层自动重连，对于每次登录成功之后都要去刷下接口的业务需求就会有影响！！
 * 选择【当且仅当曾经成功登录过】这个条件也是基于这个考虑，让你第一次登录的时候在回调里去做相关的init请求，后续不再init。
 */
SocketConnector.setupDisconnectHandler(function () {
    SignUtil._log('SocketConnector断开了，立马重连');
    SignUtil.fastLogin();
});

export default SignUtil;
