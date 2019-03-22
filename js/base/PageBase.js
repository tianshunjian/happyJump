'use strict';
import * as THREE from '../libs/three/three.min';
import * as Config from './Config.js';
import Button from './Button';
import CanvasBase from './CanvasBase.js';

export  default  class  PageBase {
    //页面基类
    constructor (options) {
        //公共参数
        this.Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
        this.W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
        this.H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
        this.HEIGHT = this.H * this.Dpr; // 设备像素
        this.WIDTH = this.W * this.Dpr; // 设备像素
        this.family = 'num_Regular'; //字体
        this._config = Config; //配置
        this.planList = ['btn','list1', 'list2','list3', 'list4', 'bg', 'nine'];
        // this.frustumSizeHeight = this._config.FRUSTUMSIZE; // 动画的尺寸单位坐标高度
        // this.frustumSizeWidth = this.WIDTH / this.HEIGHT * this.frustumSizeHeight; // 动画的尺寸单位坐标高度
        // this.ListLineHeight = 60;
        // this.ListLineHeight4PrizeRecord = 90;
        // this.ListColumnWidth = 90;
        this._touchInfo = {trackingID: -1, maxDy: 0, maxDx: 0};
        this.options = Object.assign({}, {}, options); //将源对象复制到目标对象
        this.imgid = {
            'btn': 0,
            'bg': 0,
            'list1': 0,
            'list2': 0,
            'list3':0,
            'list4':0,
            'nine':0,
            'startOrderList':0,
        };
    }


    // 画布更新
    _updatePlane(type) {
        // console.log('PageBase updatePlane');
        CanvasBase.getTexture(type).needsUpdate = true;
        CanvasBase.getObj(type).visible = true;
    }

    //隐藏界面
    hide(){
        let ctx = CanvasBase.getContext('btn');
        if (ctx){
            ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
        }
        this._hiddenShareCanvas();
        Button.destroyAllButtons(CanvasBase.getCanvas('btn'));
        for (let i = 0; i < this.planList.length; i++) {
            if (!CanvasBase.getObj(this.planList[i])) continue;
            CanvasBase.getObj(this.planList[i]).visible = false;
        }
        if (window.WechatGame){
            wx.triggerGC();
        }
    }

    //隐藏开放域绘图
    _hiddenShareCanvas(){
        let openDataContext = CanvasBase.openDataContext();
        if (openDataContext){
            let sharedCanvas = openDataContext.canvas;
            if (sharedCanvas.mrObj){
                sharedCanvas.mrObj.visible = false;
                this.options.camera.remove(sharedCanvas.mrObj);
                sharedCanvas.mrObj.geometry.dispose();
                sharedCanvas.mrObj.material.map.dispose();
                sharedCanvas.mrObj.material.dispose();
                sharedCanvas.mrTexture = undefined;
                sharedCanvas.mrObj = undefined;
            }
        }
    }

    /**----------------- 工具函数 -----------------*/

    formatDateTime(inputTime,type) {
        let date = new Date(inputTime);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        let timeObject = {
            year:y,
            month:m,
            day:d,
            hour:h,
            minute:minute,
            second:second
        };
        if(type == 2){
            return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
        }else if(type == 3){
            m = date.getMonth() + 1;
            d = date.getDate();
            h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            return m+'月'+d+'日'+' '+h+':'+minute;
        }
        else{
            return timeObject;
        }
    }

    unInPageBaseChange(opt){
        if(opt.toString() === '-1'){
            opt = '-';
        }
        return opt;
    }

    PageBaseChangeUnIn(opt){
        if(opt.toString() === '-1'){
            opt = '未上榜';
        }
        if(parseInt(opt) > 100){
            opt = '未上榜';
        }
        return opt;
    }

    number2MinSec(num){
        if (num<0){
            return '0\'0"';
        }
        let min = Math.floor(num/60);
        let sec = Math.floor(num%60);
        return min+'\''+sec+'"';
    }

    _cname(x, namelen) {
        namelen = namelen || 16;
        x = x || '';
        let len = x.replace(/[^\x00-\xff]/g, '**').length;
        if (len > namelen) {
            x = this._sliceName(x, namelen) + '...';
        }
        return x;
    }

    _sliceName(x, namelen) {
        x = x || '';
        let len = x.replace(/[^\x00-\xff]/g, '**').length;
        if (len > namelen) {
            x = x.substring(0, x.length - 1);
            x = this._sliceName(x, namelen);
        }
        return x;
    }

    _cwh(x) {
        let realx = x * this.W / 414;
        if (this.H / this.W < 736 / 414) {
            // 某4
            realx = x * this.H / 736;
        }
        return realx * this.Dpr;
    }

    _s(x) {
        let cxX =( x / this.Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    }

    _cx(x) {
        // change x
        // x 为 在 414*736 屏幕下的，标准像素的 x ，即为设计图的x的px值
        // realx 表示在当前屏幕下，应该得到的x值，这里所有屏幕画布将按照x轴缩放
        let realx = x * this.W / 414;
        if (this.H / this.W < 736 / 414) {
            // 某4
            realx = x * this.H / 736 + (this.W - this.H * 414 / 736) / 2;
        }
        return realx * this.Dpr;
    }

    _cxx(x){
        //按照实际尺寸，换算成414*736
        let cxX =( x / this.Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    }

    _cy(y) {
        // change y
        // y 位在 414*736 屏幕下的，标准像素的y，即为设计图的y的px值
        // realy表示在当前屏幕下，应该得到的y值，如果屏幕的长宽值特别大（某X，某note8），那么就上下留白
        let really;
        if (this.H / this.W > 736 / 414) {
            // 某X
            // 屏幕显示区域的高度h: WIDTH*736/414, 上下留白是  (HEIGHT - h)/2
            really = y * this.W / 414 + (this.H - this.W * 736 / 414) / 2;
        } else {
            really = y * this.H / 736;
        }
        return really * this.Dpr;
    }

    _cyy(y){
        let cyY = y * 736 / 1334;
        let realY = this._cy(cyY);
        return realY;
    }

    _cf(size, is_num) {
        // font size
        let realf = size * this.Dpr * this.W / 414;
        if (this.H / this.W < 736 / 414) {
            // 某4
            realf = size * this.Dpr * this.H / 736;
        }
        if (!!is_num && !!this.family) return realf + ('px ' + this.family); else return realf + 'px Helvetica';//px Helvetica
    }

    _cxp(x) {
        // 根据坐标反推出x
        return x / this.W * 414;
    }

    _cyp(y) {
        // 根据坐标反推出y
        let really;
        if (this.H / this.W > 736 / 414) {
            // 某X
            // 屏幕显示区域的高度h: WIDTH*736/414, 上下留白是  (HEIGHT - h)/2
            really = (y - (this.H - this.W * 736 / 414) / 2) / this.W * 414;
        } else {
            really = y / this.H * 736;
        }
        return really;
    }

    _negatePlane(plane, point) {
        if (!plane || !point) {
            return;
        }
        let distance = plane.distanceToPoint(point);
        if (distance < 0) {
            plane.negate();
        }
    }

    _drawImageCenter(src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // console.log('PageBase _drawImageCenter');
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片

        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        this._loadImg(src, x, y, width, height, type, function (img) {
            if (img){
                CanvasBase.getContext(type).drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            !!cb && cb(img);
            if (!noupdate){
                that._updatePlane(type); // 更新画布
            }
        }, imgid, errImg);
    }

    _drawImageRound(src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片
        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        let ctx = CanvasBase.getContext(type);

        this._loadImg(src, x, y, width, height, type, function (img) {

            ctx.save();
            that._roundedRectR(x - width / 2, y - height / 2, width, height, 2, type);
            ctx.clip();
            if (img) {
                ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            ctx.closePath();
            ctx.restore();
            !!cb && cb();
            if (!noupdate) that._updatePlane(type); // 更新画布
        }, imgid,errImg);
    }

    _drawImageCircle(src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片
        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        let ctx = CanvasBase.getContext(type);

        this._loadImg(src, x, y, width, height, type, function (img) {

            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0)';
            that._circleRectR(x - width / 2, y - height / 2, width, height, 2, type);
            ctx.clip();
            if (img) {
                ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            ctx.closePath();
            ctx.restore();
            !!cb && cb();
            if (!noupdate) that._updatePlane(type); // 更新画布

        }, imgid,errImg);
    }

    _circleRectR(x, y, width, height, radius, type) {
        let ctx = CanvasBase.getContext(type);
        ctx.beginPath();
        ctx.arc(x+width/2.0,y+height/2.0,Math.min(width,height)/2.0,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    _syncDrawImageCenter(img, x, y, width, height, type) {
        let ctx = CanvasBase.getContext(type);
        ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
    }

    _rePageBase(array) {
        // 排行榜重新排序
        let i = 0,
            len = array.length,
            j,
            d;
        for (; i < len; i++) {
            for (j = 0; j < len; j++) {
                if (array[i].week_best_score > array[j].week_best_score) {
                    d = array[j];
                    array[j] = array[i];
                    array[i] = d;
                }
            }
        }
        return array;
    }

    _loadImg(src, x, y, width, height, type, cb, imgid, errImg){
        let img = new Image();
        const that = this;
        const tag = new Date().getTime();
        img._tag = tag;
        img._retryTimes = 10;


        if(!src || src == 'null' || src.length == 0){
            src = errImg || 'res/img/ava.png';
        }


        img.onload = function () {
            if ((img._tag == tag) && (that.imgid[type] == imgid)) {
                !!cb && cb(img);
            }
            img = null;//TODO 图片加载后置空
        };
        img.onerror = function () {
            if (img._retryTimes >= 0){
                if (img._retryTimes == 0){
                    if(errImg){
                        console.error('use default img : ' + errImg);
                        img.src = errImg;
                    } else {
                        !!cb && cb();
                    }
                } else {
                    console.error('retry : ' + src);
                    setTimeout(function () {
                        img.src = src;
                    },100);
                }
                img._retryTimes --;
            } else {
                !!cb && cb();
            }
        };
        img.src = src;
    }

    _roundedRectR(x, y, width, height, radius, type) {
        let ctx = CanvasBase.getContext(type);
        ctx.beginPath();
        ctx.moveTo(x, y + radius - 1);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y); // 终点
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
        ctx.closePath();
    }

    _hemiCircleAndRect(x,y,width,height,radius,type){
        let ctx = CanvasBase.getContext(type);
        ctx.beginPath();
        ctx.arc(x+radius,y+radius,radius,0.5*Math.PI,1.5*Math.PI);
        ctx.lineTo(x+width-radius,y);
        ctx.arc(x+width-radius,y+radius,radius,-0.5*Math.PI,0.5*Math.PI);
        ctx.lineTo(x+radius,y+2*radius);
    }

    timeDefine(server){
        const championStartTime = this.formatDateTime(server);
        const timeCurrent = this.formatDateTime(Date.now());
        let day;
        if(championStartTime.day == timeCurrent.day){
            day = '今天';
        }else if((parseInt(championStartTime.day) - parseInt(timeCurrent.day)) == 1){
            day = '明天';
        }else{
            day = championStartTime.month+'-'+championStartTime.day;
        }
        return day;
    }

    rankChangeUnIn(opt){
        if(opt.toString() === '-1'){
            opt = '未上榜';
        }
        if(parseInt(opt) > 100){
            opt = '未上榜';
        }
        return opt;
    }

    unInRankChange(opt){
        if(opt.toString() === '-1'){
            opt = '-';
        }
        return opt;
    }
}


