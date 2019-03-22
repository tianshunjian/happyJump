'use strict';

function Random() {
    let seed = Date.now();
    //指定一个默认值，发现莫名其妙的走了throw逻辑
    // var seed = void 0;

    this.setRandomSeed = function setRandomSeed(s) {
        seed = s;
    };

    this.rand = function rand() {
        // if (!seed){
        //     throw new Error('生成随机数必须先指定seed！！');
        // }
        seed = (seed * 9301 + 49297) % 233280;
        return Math.floor(seed / 233280.0 * 100) / 100;
    };

    let self = this;

    this.random = function random() {
        if (arguments.length === 0) {
            return self.rand();
        } else if (arguments.length === 1) {
            let e = arguments[0];
            return Math.floor(self.rand() * e);
        } else {
            let s = arguments[0];
            let _e = arguments[1];
            return Math.floor(self.rand() * (_e - s)) + s;
        }
    };
}

/**
 * 用法：random(a,b)随机产生一个a到b之间的整数
 *
 */
export default new Random();
