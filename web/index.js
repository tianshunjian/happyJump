import './libs/less.min.js';
import './libs/lib-flexible.min.js';

import {PLATFORM,SetPlatform,SetVersion,SetCFrom} from '../js/shared/service/Constants.js';

///设置平台
SetCFrom('jumper');
SetVersion('1.2.9');
SetPlatform(PLATFORM.kH5);

//--------开发环境配置上线前必须注释掉！！！

import LoggerUtil from '../js/shared/log/LoggerUtil';

LoggerUtil.init('jumper');

// //设置开发热更新服务器环境
// import {HU_DEVELOP_ENV,SetHotUpdateENV} from '../js/shared/hotUpdate/HotUpdateManager.js';
// SetHotUpdateENV(HU_DEVELOP_ENV);
//
// //设置开发服务器环境
// import {SetENV, DEVELOP_ENV_TYPE} from '../js/shared/service/Env.js';
// SetENV(DEVELOP_ENV_TYPE);

//--------开发环境配置上线前必须注释掉！！！

///TODO
window.isIPhoneX = false;
window.isIPhone = true;//'android'
window.isSimulator = false;

// var canvas = document.getElementById('WebGL-output');

//检测客户端类型
const userAgent = navigator.userAgent;
console.log('客户端类型：'+userAgent);
window.isMobile = false;
if (userAgent.match(/Android/i) || userAgent.match(/webOS/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPad/i)) {
    window.isMobile = true;
}
window.isIPhone = false;
if (userAgent.match(/iPhone/i)){
    window.isIPhone = true;
}
window.systemModel = '';
console.log('是否是移动端：'+window.isMobile);

//游戏初始化，通知SDK产品号
import Application from '../js/shared/bridge/Application';
Application.gameInit({productId: '044'});

import main from '../js/main.js';
main();
