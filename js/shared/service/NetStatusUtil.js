import EventEmitter from '../event/events.js';
export const NetworkStatusChanged = 'NetworkStatusChanged';
import setupSHJSBridge from '../bridge/WebNativeBridge.js';

const kSuspense = 'suspense';
const kNone = 'none';

class NetStatusUtil extends EventEmitter{


    /**
     * 私有方法，外部不应调用
     * @param n
     */
    set networkType(n){
        if (this._networkType !== n){
            this._networkType = n;
            console.log('networkType changed:' + n);
            this.emit(NetworkStatusChanged,this.isConnected());
        }
    }

    /**
     * 获取网络状态
     * @return {'wifi','2g','3g','4g','unknown' | string}
     */
    get networkType(){
        return this._networkType || kSuspense;
    }

    /**
     * 初始化网络状态，App启动后要立马调用,越早越好!
     */
    initNetStatus(){
        const self = this;
        ///兼容微信小程序，没有window对象
        const _window = window || global;
        if (_window.WechatGame){
            wx && wx.onNetworkStatusChange(function (result) {
                self.networkType = result.networkType;
            });
            wx && wx.getNetworkType({
                success:function (result) {
                    console.log('init networkType:' + JSON.stringify(result));
                    self.networkType = result.networkType;
                }
            });
        }else {
            setupSHJSBridge(function (bridge) {

                bridge.invokeNative('getNetworkType',function (result) {
                    if (result){
                        console.log('init networkType:' + JSON.stringify(result));
                        self.networkType = result.networkType;
                    }
                });

                bridge.registerMethod('onNetworkStatusChange',function (result) {
                    if (result){
                        self.networkType = result.networkType;
                    }
                });
            });
        }
    }

    /**
     * 确定连上网了
     * @return {boolean}
     */
    isConnected(){
        switch (this.networkType){
        case 'wifi':
        case '2g':
        case '3g':
        case '4g':
        case 'unknown':
        {
            ///unknown 是安卓极少机型上的，也是有网络的
            return true;
        }
        default:
        {
            return false;
        }
        }
    }

    /**
     * 确定没连上网
     * @return {boolean}
     */
    isDisconnected(){
        return this.networkType === kNone;
    }

    /**
     * 微信还没给回调，不知道当前网络的状态
     * @return {boolean}
     */
    isSuspense(){
        return this.networkType === kSuspense;
    }
}

export default new NetStatusUtil();
