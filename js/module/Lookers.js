'use strict';
import * as _config from './Config.js';
import * as THREE from '../libs/three/three.min.js';
var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var HEIGHT = H * Dpr; // 设备像素
var WIDTH = W * Dpr; // 设备像素
var frustumSizeHeight = _config.FRUSTUMSIZE; // 动画的尺寸单位坐标高度
var frustumSizeWidth = WIDTH / HEIGHT * frustumSizeHeight; // 动画的尺寸单位坐标高度

var Lookers = function () {
    function Lookers(options) {
        // _classCallCheck(this, Lookers);
        
        this.planList = ['bg'];

        this.texture = {};
        this.material = {};
        this.geometry = {};
        this.obj = {};
        this.canvas = {};
        this.context = {};
        this._touchInfo = { trackingID: -1, maxDy: 0, maxDx: 0 };
        this.cwidth = WIDTH;
        this.cheight = 50;
        this.options = Object.assign({}, {}, options);
        this._createPlane();
        // --- 显示X人围观和头像
        // this.showLookers({
        // 	avaImg: false,
        // 	icon: true,
        // 	wording: true,
        // 	num : 9,
        // 	avatar : ['','','']
        // })
        // 隐藏这个界面：
        // this.hideLookers()
        // --- 邀请围观
        // this.showLookersShare({});
    }

    return Lookers;
}();

Lookers.prototype = {
    // ----------------- show/hide 方法 -----------------
    showLookers: function (opt) {
        this.showState = true;
        opt = opt || {};
        this._drawLookers(opt);
    },

    showLookersShare: function (opt) {
        this.showState = true;
        opt = opt || {};
    },

    hideLookers: function () {
        this.showState = false;
        for (let i = 0; i < this.planList.length; i++) {
            this.obj[this.planList[i]].visible = false;
            this.options.camera.remove(this.obj[this.planList[i]]);
        }
    },

    // ----------------- 背景绘制 -----------------
    _drawLookers: function (opt) {
        let _this = this;

        let ctx = this.context['bg'];
        ctx.fillStyle = 'pink';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 * Dpr;
        // ctx.fillRect(0, 0, this._cx( 414 ), this._cx( this.cheight ));
        ctx.clearRect(0, 0, this._cx(414), this._cx(this.cheight));
        // ctx.strokeRect(0, 0, this._cx( 414 ), this._cx( this.cheight ));
        let height = this.cheight;

        if (opt.avaImg) {
            let right_offset = WIDTH - opt.avatar.length * this._cx(32);
            let that = this;

            let _loop = function _loop(i) {
                let x = i * _this._cx(36) + right_offset;
                _this._drawImageCenter(opt.avatar[i], x, height / 2, that._cx(25), that._cx(25), 'bg', function () {
                    that._drawImageCenter('res/ava_big1.png', x, height / 2, that._cx(29), that._cx(29), 'bg');
                });
            };

            for (let i = 0; i < opt.avatar.length; i++) {
                _loop(i);
            }
            // 绘制背景图

            ctx.fillStyle = 'rgba(0,0,0,0.56)';
            ctx.font = this._cf(14);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('有' + opt.num + '位好友正在围观', right_offset - this._cx(20), this._cx(16));
        }

        if (opt.icon) {
            this._drawImageCenter('res/observShare.png', this._cx(35), height / 2, this._cx(14), this._cx(16), 'bg');
        }
        if (opt.wording) {
            ctx.fillStyle = 'rgba(0,0,0,0.56)';
            ctx.font = this._cf(14);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('邀请围观', this._cx(55), this._cx(16));
        }

        this._updatePlane('bg');
    },

    // ----------------- 画布创建与更新 -----------------
    _createPlane: function () {
        // 创建画布
        for (let i = 0; i < this.planList.length; i++) {
            this.canvas[this.planList[i]] = document.createElement('canvas');
            this.context[this.planList[i]] = this.canvas[this.planList[i]].getContext('2d');
            this.canvas[this.planList[i]].width = WIDTH;
            this.canvas[this.planList[i]].height = this.cheight * Dpr;
            this.texture[this.planList[i]] = new THREE.Texture(this.canvas[this.planList[i]]);
            this.material[this.planList[i]] = new THREE.MeshBasicMaterial({ map: this.texture[this.planList[i]], transparent: true });
            this.geometry[this.planList[i]] = new THREE.PlaneGeometry(frustumSizeWidth, this.cheight / H * frustumSizeHeight);
            this.obj[this.planList[i]] = new THREE.Mesh(this.geometry[this.planList[i]], this.material[this.planList[i]]);
            this.material[this.planList[i]].map.minFilter = THREE.LinearFilter;
            // console.log( HEIGHT, WIDTH)
            this.obj[this.planList[i]].position.y = -(0.5 - this.cheight / 2 / H) * frustumSizeHeight; // - frustumSizeHeight/15*7; // 上下
            this.obj[this.planList[i]].position.x = 0; // frustumSizeWidth/5; // 左右
            this.obj[this.planList[i]].position.z = 9 - i * 0.001;
        }
    },

    _updatePlane: function (type) {

        // 画布更新
        if (!this.showState) {
            return;
        }
        this.texture[type].needsUpdate = true;
        this.obj[type].visible = true;
        this.options.camera.add(this.obj[type]);
    },

    // ----------------- 工具函数 -----------------
    _drawImageCenter: function (src, x, y, width, height, type, cb) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片

        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/ava.png';
        }
        let img = new Image();
        let that = this;
        let ctx = this.context[type];
        img.onload = function () {
            ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
            !!cb && cb();
            that._updatePlane(type); // 更新画布
        };
        img.onerror = function () {
            !!cb && cb();
        };
        img.src = src;
    },

    _cx: function (x) {
        let realx = x * W / 414;
        return realx * Dpr;
    },

    _cf: function (size) {
        // font size
        let realf = size * Dpr * W / 414;
        return realf + 'px Helvetica';
    }
};