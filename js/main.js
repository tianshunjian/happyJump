import Game from './game/Game.js';
import HotUpdateService from './dynamic/HotUpdateService.js';
import NetStatusUtil from './shared/service/NetStatusUtil.js';
import SignUtil from './shared/service/SignUtil.js';

const main = function () {

    window.HEIGHT = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
    window.WIDTH = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;

    /**
     * 启动游戏
     */
    const enterGame = function () {

        var options = {};
        options.scene = 1001;
        options.query = {};

        var game = new Game(options);

        //--------持续更新游戏场景--------
        var oRequestAnimation = requestAnimationFrame;
        var frameCallbacks = [];
        var lastestFrameCallback = void 0;

        var requestAnimationFrameHandler = function requestAnimationFrameHandler() {
            var _frameCallbacks = [];
            var _lastestFrameCallback = lastestFrameCallback;

            frameCallbacks.forEach(function (cb) {
                _frameCallbacks.push(cb);
            });
            lastestFrameCallback = undefined;
            frameCallbacks.length = 0;

            _frameCallbacks.forEach(function (cb) {
                typeof cb === 'function' && cb();
            });
            if (typeof _lastestFrameCallback === 'function') {
                _lastestFrameCallback();
            }

            oRequestAnimation(requestAnimationFrameHandler);
        };

        window.requestAnimationFrame = function (callback, isLastest) {
            if (!isLastest) {
                frameCallbacks.push(callback);
            } else {
                lastestFrameCallback = callback;
            }
        };

        requestAnimationFrameHandler();

        var lastFrameTime = Date.now();

        loop();

        function loop() {
            //console.log('in main.js --animate()--game = ' + game);
            //stats.begin();
            var now = Date.now();
            var tickTime = now - lastFrameTime;
            lastFrameTime = now;
            requestAnimationFrame(loop, true);
            if (tickTime > 100) return;
            game.update(tickTime / 1000);
            // test();
        }

        function test() {
            var ctx=canvas.getContext('2d');

            const r = Math.floor(Math.random() * 256).toString(16);
            const g = Math.floor(Math.random() * 256).toString(16);
            const b = Math.floor(Math.random() * 256).toString(16);

            const c = '#' + r + g + b;
            ctx.fillStyle = c;
            ctx.fillRect(0,0,window.WIDTH,window.HEIGHT);
        }
    };

    SignUtil.queryAuthorized();
    /**
     * 初始化网络状态
     */
    NetStatusUtil.initNetStatus();

    /**
     * 更新配置项
     */

    HotUpdateService.updateIfNeed(function (configs) {
        const keys = Object.keys(configs);
        keys.forEach(function (key) {
            const value = configs[key];
            window[key] = value;
        });

        HotUpdateService.getObjInfoConfig(function (res) {
            const ks = Object.keys(res);
            ks.forEach(function (k) {
                const v = res[k];
                window[k] = v;
            });
            console.log('objInfo的配置信息');
            console.log(window.ObjInfo);
            enterGame();
        });
    });
};

export default main;
