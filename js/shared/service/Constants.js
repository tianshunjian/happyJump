const GAME_MODE = {
    kGameBox: 1,
    kJumper : 2,
    k2048 : 3,
    kRiseup: 4,
    kEliminate: 5,
    kStayWithYou: 6,
    kExpressionBattle: 7,
    kBrainMatch: 8,
};

let __cFrom = '';

let __version = '';

let __platform = '';  //标识平台 h5 , wx

export const ROUTE = {
    /**
     * 获取gate服务器
     */
    GET_GATE_SERVER: 'version.versionHandler.getGateServer',
    /**
     * 连接
     */
    GET_CONNECTOR: 'gate.gateHandler.getConnector',
    /**
     * 检查版本和白名单
     */
    CHECK_VERSION_AND_WHITE_LIST: 'connector.userHandler.checkVersionAndWhiteList',

    /**
     * H5登录接口
     * */
    H5_USER_SIGNIN: 'connector.userHandler.loginFromH5',

    /**
     * 新登录接口
     * */
    WeChat_USER_SIGNIN: 'connector.userHandler.loginFromWeChat',
    /**
     * 加入喇叭
     */
    JOIN_TRUMPET_CHANNEL: 'lobby.lobbyHandler.joinTrumpetChannel',
    /**
     * 监听广播
     */
    ON_RECEIVED_TRUMPET: 'onReceivedTrumpet',
    /**
     * 被踢出
     */
    ON_KICK: 'kick'
};

export const SIGNAL = {
    FAIL: 0,  //失败
    OK: 1,  //成功
    STOP: 7,  //服务器未运行
    UPDATE: 15,  //版本过低需要更新
    PREPARE: 17,  //尚未开服
    PAUSE: 18,  //停服维护
    EXPIRE: 19,  //gate过期

    REMIND_BIND: 5001,  //提示用户绑定
    HAVE_WECHAT: 50020,
    HAVE_SOHU: 50021,
    HAD_BIND: 50030,
    HAD_NOT_BIND: 50031,
    REMIND_LOGIN_SOHU: 5004001,
    REMIND_LOGIN_OTHER: 5004002,
    REMIND_LOGIN_PHONE: 5004003,
    

    SERVER_PAUSE_HINT: '停服维护，敬请期待',
    SERVER_PREPARE_HINT: '尚未开服，敬请期待',
    UPDATE_HINT: '发现新版本，请立即重启更新',
};

export const SetCFrom = function (c) {
    __cFrom = c;
};

export const GetCFrom = function () {
    if(!__cFrom){
        console.assert(false,'必须先设置cFrom！');
    }
    return __cFrom;
};

export const SetVersion = function (v) {
    __version = v;
    console.log('version:' + v);
};

export const GetVersion = function () {
    if(!__version){
        console.assert(false,'必须先设置Version！');
    }
    return __version;
};

export const PLATFORM = {
    kH5 : 'H5',
    kWeChatGame : 'WechatGame'
};

export const SetPlatform = function (p) {

    ///兼容微信小程序，没有window对象
    const _window = window || global;

    switch (p){
    case PLATFORM.kH5 : {
        _window.H5 = true;
        _window.WechatGame = false;
        console.log('platform:H5');
    }
        break;
    case PLATFORM.kWeChatGame : {
        _window.H5 = false;
        _window.WechatGame = true;
        console.log('platform:WeChatGame');
    }
        break;
    }
    __platform = p;
};

export const GetPlatform = function () {
    if(!__platform){
        console.assert(false,'必须先设置Platform！');
    }
    return __platform;
};

export const GameMode = function () {

    if (__cFrom == 'jumper'){
        return GAME_MODE.kJumper;
    }

    if (__cFrom == '2048'){
        return GAME_MODE.k2048;
    }

    if (__cFrom == 'miniprogram'){
        return GAME_MODE.kGameBox;
    }

    if (__cFrom === 'riseup') {
        return GAME_MODE.kRiseup;
    }

    if (__cFrom === 'eliminate') {
        return GAME_MODE.kEliminate;
    }

    if (__cFrom === 'staywithyou') {
        return GAME_MODE.kStayWithYou;
    }

    if (__cFrom === 'expresssionBattle') {
        return GAME_MODE.kExpressionBattle;
    }

    if (__cFrom === 'brain_match') {
        return GAME_MODE.kBrainMatch;
    }

    console.assert(false,'无法获取GameMode，必须先设置cFrom！');
};
