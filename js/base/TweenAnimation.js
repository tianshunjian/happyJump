'use strict';

import Tween from './Tween.js';


var animationId = -1;
var killAnimationId = animationId - 1;

var customAnimation = {};
customAnimation.to = function(obj, duration, options) {
    duration *= 1000;
    var delay = options.delay || 0;
    for (let name in options) {
        if (name === 'delay') {
            delay = options[name];
        } else if (name === 'onComplete') {
            //'onComplete'
        } else if (name === 'ease') {
            //'ease'
        } else {
            setTimeout(function(name) {
                return function() {
                    //console.log("name", name, obj[name], options[name], duration, delay, obj)
                    TweenAnimation(obj[name], options[name], duration, options.ease || 'Linear',
                        function(value, complete) {
                            obj[name] = value;
                            if (complete) {
                                options.onComplete && options.onComplete();
                            }
                        });
                };
            } (name), delay * 1000);
        }
    }
};

// 对运动方法进行封装
var TweenAnimation = function TweenAnimation() {

    function TweenAnimation(from, to, duration, easing, callback) {
        let selfAnimationId = ++animationId;
        let isUndefined = function isUndefined(obj) {
            return typeof obj == 'undefined';
        };
        let isFunction = function isFunction(obj) {
            return typeof obj == 'function';
        };
        let isNumber = function isNumber(obj) {
            return typeof obj == 'number';
        };
        let isString = function isString(obj) {
            return typeof obj == 'string';
        };

        // 转换成毫秒
        let toMillisecond = function toMillisecond(obj) {
            if (isNumber(obj)) {
                return obj;
            } else if (isString(obj)) {
                if (/\d+m?s$/.test(obj)) {
                    if (/ms/.test(obj)) {
                        return 1 * obj.replace('ms', '');
                    }
                    return 1000 * obj.replace('s', '');
                } else if (/^\d+$/.test(obj)) {
                    return + obj;
                }
            }
            return - 1;
        };

        if (!isNumber(from) || !isNumber(to)) {
            if (window.console) {
                console.error('from和to两个参数必须且为数值');
            }
            return 0;
        }

        // 缓动算法
        let tween = new Tween();

        if (!tween) {
            if (window.console) {
                console.error('缓动算法函数缺失');
            }
            return 0;
        }

        // duration, easing, callback均为可选参数
        // 而且顺序可以任意
        let options = {
            duration: 300,
            easing: 'Linear',
            callback: function callback() {}
        };

        let setOptions = function setOptions(obj) {
            if (isFunction(obj)) {
                options.callback = obj;
            } else if (toMillisecond(obj) != -1) {
                options.duration = toMillisecond(obj);
            } else if (isString(obj)) {
                options.easing = obj;
            }
        };
        setOptions(duration);
        setOptions(easing);
        setOptions(callback);

        // requestAnimationFrame的兼容处理
        if (!window.requestAnimationFrame) {
            requestAnimationFrame = function requestAnimationFrame(fn) {
                setTimeout(fn, 17);
            };
        }

        // 算法需要的几个变量
        let start = -1;
        // during根据设置的总时间计算
        let during = Math.ceil(options.duration / 17);

        // 当前动画算法
        // 确保首字母大写
        options.easing = options.easing.slice(0, 1).toUpperCase() + options.easing.slice(1);
        let arrKeyTween = options.easing.split('.');
        let fnGetValue;

        if (arrKeyTween.length == 1) {
            fnGetValue = tween[arrKeyTween[0]];
        } else if (arrKeyTween.length == 2) {
            fnGetValue = tween[arrKeyTween[0]] && tween[arrKeyTween[0]][arrKeyTween[1]];
        }
        if (isFunction(fnGetValue) == false) {
            console.error('没有找到名为"' + options.easing + '"的动画算法');
            return;
        }

        let startTime = Date.now();
        let lastTime = Date.now();
        // 运动
        let step = function step() {
            let currentTime = Date.now();
            let interval = currentTime - lastTime;
            let fps = Math.ceil(1000 / interval);
            lastTime = currentTime;
            if (interval > 100) {
                requestAnimationFrame(step);
                return;
            }
            if (fps >= 30) {
                start++;
            } else {
                let _start = Math.floor((currentTime - startTime) / 17);
                start = _start > start ? _start: start + 1;
            }

            // 当前的运动位置
            let value = fnGetValue(start, from, to - from, during);

            // 如果还没有运动到位，继续
            if (start <= during && selfAnimationId > killAnimationId) {
                options.callback(value);
                requestAnimationFrame(step);
            } else if (start > during && selfAnimationId > killAnimationId) {
                // 动画结束，这里可以插入回调...
                options.callback(to, true);
            }
        };
        // 开始执行动画
        step();
    }

    return TweenAnimation;
}();

TweenAnimation.killAll = function() {
    killAnimationId = animationId;
};

export {customAnimation,TweenAnimation};
