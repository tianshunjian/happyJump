// import './js/shared/aop/aop.js'
import './js/libs/weapp-adapter.js';

import {PLATFORM,SetPlatform,SetVersion,SetCFrom} from './js/shared/service/Constants.js';

///设置平台
SetCFrom('jumper');
SetVersion('1.1.0');
SetPlatform(PLATFORM.kWeChatGame);

const system = wx.getSystemInfoSync() || {};
const model = system.model || '';
const brand = system.brand || '';
window.wxSystem = system;
window.systemModel = model;
window.isIPhoneX = model.indexOf('iPhone X') >= 0;
window.isIPhone = system.platform === 'ios';//'android'
window.isSimulator = system.platform == 'devtools';
console.log('system info:' + JSON.stringify(system));
window.isAndroidLiuhai = false;

if (model.indexOf('vivo X21')>=0){
    window.isAndroidLiuhai = true;
}else if (brand.indexOf('OPPO')>=0){
    if (model.indexOf('PACM00')>=0){
        window.isAndroidLiuhai = true;
    }
} else if (brand.indexOf('HUAWEI')>=0){
    if (model.indexOf('P20')>=0){
        window.isAndroidLiuhai = true;
    }
}

import LoggerUtil from './js/shared/log/LoggerUtil';

LoggerUtil.init('jumper');

//--------开发环境，上线前必须注释掉！！！

//设置开发热更新服务器环境
import {HU_DEVELOP_ENV,SetHotUpdateENV} from './js/shared/hotUpdate/HotUpdateManager.js';
SetHotUpdateENV(HU_DEVELOP_ENV);

//设置开发服务器环境
import {SetENV, DEVELOP_ENV_TYPE} from './js/shared/service/Env.js';
SetENV(DEVELOP_ENV_TYPE);

//--------开发环境，上线前必须注释掉！！！


//--------摇一摇上传日志，上线前必须解除注释！！！
// LoggerUtil.closeShakeFeature();
//--------摇一摇上传日志，上线前必须解除注释！！！

import main from './js/main.js';
main();
