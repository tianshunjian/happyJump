///客户端还没注入交互JS的时候，本地先做个存储！
export default function setupSHJSBridge(callback) {
    ///兼容微信小程序，没有window对象
    const _window = window || global;
    if (_window.shJSBridge) {
        callback(_window.shJSBridge);
    }else if (_window.shJSCallbacks) {
        _window.shJSCallbacks.push(callback);
    }else{
        _window.shJSCallbacks = [callback];
    }
}
