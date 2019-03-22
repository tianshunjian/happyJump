'use strict';

import Text from './Text.js';
import * as Config from '../base/Config.js';
import * as THREE from '../libs/three/three.min.js';
import * as Animation from '../base/TweenAnimation.js';
import UserService from '../service/UserService.js';
import Utils from '../shared/service/Utils';
import {loader} from '../base/Config';

var WIDTH = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var HEIGHT = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var frustumSizeHeight = Config.FRUSTUMSIZE;
var frustumSizeWidth = WIDTH / HEIGHT * frustumSizeHeight;

var UI = function () {
    function UI(scene, camera, full2D, game) {

        this.game = game;
        this.full2D = full2D;
        this.scene = scene;
        this.camera = camera;
        this.score = 0;
        this.double = 1;

        this.leCardNum = 0;

        this._config = Config;

        //弹幕相关
        this.danmuArr = [];//装载弹幕信息用
        this.danmuMeshArr = [];//装载弹幕texture用
        this.danmuIndex1 = false;//第一个弹幕位置是否在使用
        this.danmuIndex2 = false;//第二个弹幕位置是否在使用

        this.leCardText = {};
        let obj1 = new THREE.Object3D();
        this.leCardText.obj = obj1;

        if (window.WechatGame){
            let danmuPlane = new THREE.PlaneGeometry(3,2);
            let danmuMatetial = new THREE.MeshBasicMaterial({
                map: Config.loader.load('res/img/battle/danmu.png'),
                transparent: true,
                alphaTest: 0.01
            });
            this.danmu = new THREE.Mesh(danmuPlane,danmuMatetial);
            this.danmu.position.set(6.5,26.2,-10);
            this.danmu.visible = false;
            this.camera.add(this.danmu);

            let danmuCloseMatetial = new THREE.MeshBasicMaterial({
                map: Config.loader.load('res/img/battle/danmu_close.png'),
                transparent: true,
                alphaTest: 0.01
            });
            this.danmuClose = new THREE.Mesh(danmuPlane,danmuCloseMatetial);
            this.danmuClose.position.set(6.5,26.2,-10);
            this.danmuClose.visible = false;
            this.camera.add(this.danmuClose);

            let offset2 = 3*736/HEIGHT;
            let offset3 = 10.5*414/WIDTH;
            if (window.isIPhoneX){
                offset2 = 6;
                offset3 = 12;
            }
            this.danmu.position.y = frustumSizeHeight/2 - offset2;
            this.danmu.position.x = frustumSizeWidth/2 - offset3;
            this.danmuClose.position.y = frustumSizeHeight/2 - offset2;
            this.danmuClose.position.x = frustumSizeWidth/2 - offset3;

            //乐卡
            // this.leCardText = new Text('0',{fillStyle: 0x252525, LeCard: true,textAlign:'center', opacity: 0.8});
            // this.leCardText.obj.position.set(5, 26.2, -10);
            // this.leCardText.obj.updateMatrix();
            // this.leCardText.obj.matrixAutoUpdate = false;
            // this.camera.add(this.leCardText.obj);

            this.leCardText.obj.position.set(6.5, 26.2, -10);
            let offset1 = 3.5*736/HEIGHT;
            let offsetX = 8.5*414/WIDTH;
            if (window.isIPhoneX){
                offset1 = 6.5;
                offsetX = 9;
                // this.leCardText.obj.position.x = 7.5
            }
            if (window.isAndroidLiuhai){
                offset1 = 6.5;
            }
            this.leCardText.obj.position.y = frustumSizeHeight/2 - offset1;
            this.leCardText.obj.position.x = frustumSizeWidth/2 - offsetX;
            this.camera.add(this.leCardText.obj);
            this.lecardInitX = this.leCardText.obj.position.x;

            let LeCardGeometry = new THREE.PlaneGeometry(3, 2);
            let leCardMaterial = new THREE.MeshBasicMaterial({
                map: Config.loader.load('res/img/number/smallNum/card_big.png'),
                transparent: true,
                alphaTest: 0.01
            });
            this.TopLeCard = new THREE.Mesh(LeCardGeometry, leCardMaterial);
            this.TopLeCard.name = 'TopLeCard';
            this.TopLeCard.position.set(0, 0, 0);
            this.leCardText.obj.add(this.TopLeCard);

            let SmallNumberMaterialArr = [
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/0.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/1.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/2.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/3.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/4.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/5.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/6.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/7.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/8.png'),transparent:true,alphaTest:0.01}),
                new THREE.MeshBasicMaterial({map:Config.loader.load('res/img/number/smallNum/9.png'),transparent:true,alphaTest:0.01})

            ];

            this.smallNumArr = [];
            for (let i=0;i<SmallNumberMaterialArr.length;++i){
                let temp = [];
                let geometry = new THREE.PlaneGeometry(1.2, 2.0);
                for (let j=0;j<5;++j){
                    let leCard = new THREE.Mesh(geometry, SmallNumberMaterialArr[i]);
                    leCard.using = false;
                    leCard.visible = false;
                    temp.push(leCard);
                    this.leCardText.obj.add(leCard);
                }
                this.smallNumArr.push(temp);
            }

            this.setLeCard(0);
        }

        // this.scoreText =
        //     new Text('0', {fillStyle: 0x252525, sumScore: true, opacity: 0.8});
        // this.scoreText.obj.position.set(0, 21, -10);
        // this.scoreText.obj.updateMatrix();
        // this.scoreText.obj.matrixAutoUpdate = false;
        // this.camera.add(this.scoreText.obj);

        this.scoreText = {};
        let obj = new THREE.Object3D();
        this.scoreText.obj = obj;
        this.scoreText.obj.position.set(-14, 27, -10);
        let offset = 3*736/HEIGHT;
        if (window.isIPhoneX){
            offset = 5.5;
        }
        if (window.isAndroidLiuhai){
            offset = 5.5;
        }
        this.scoreText.obj.position.y = frustumSizeHeight/2 - offset;
        this.camera.add(this.scoreText.obj);

        this.bigNumArr = [];
        for (let i=0;i<Config.NumberMaterialArr.length;++i){
            let temp = [];
            let geometry = new THREE.PlaneGeometry(2.5, 3.5);
            for (let j=0;j<6;++j){
                let leCard = new THREE.Mesh(geometry, Config.NumberMaterialArr[i]);
                leCard.using = false;
                leCard.visible = false;
                this.scoreText.obj.add(leCard);
                temp.push(leCard);
            }
            this.bigNumArr.push(temp);
        }

        this.setScore(0);

        //中心点提示语
        this.hintObjArr = [];
        for (let i=0,len=Config.HintMaterialArr.length;i<len;++i){
            let w = 9,h = 4;
            if (i==len-1){
                w = 14;
            }
            let geometry = new THREE.PlaneGeometry(w,h);
            let hint = new THREE.Mesh(geometry,Config.HintMaterialArr[i]);
            hint.visible = false;
            hint.position.set(0,20,-10);
            this.camera.add(hint);
            this.hintObjArr.push(hint);
        }

    }

    return UI;
}();

UI.prototype = {
    reset: function () {
        this.leCardNum = 0;
        // this.leCardText.setLeCard(0);
        if (this.game.gameType === Config.GAME.singleGame){
            if (window.WechatGame){
                this.leCardText.obj.visible = true;
                this.setLeCard(0);
                this.hideDanmuBtn();
            }else{
                this.leCardText.obj.visible = false;
            }
        }else if (this.game.gameType === Config.GAME.competitionGame){
            this.leCardText.obj.visible = false;
            if (!UserService.showDanmu){
                this.showDanmu();
            }else{
                this.hideDanmu();
            }
        }
        this.resetThings4Danmu();

        // this.scoreText.setScore(0);
        this.setScore(0);
        this.hideComboHint();


        this.score = 0;
        this.double = 1;
    },

    //显示toast
    showToast:function(text,callback){
        if (window.WechatGame){
            if (this._lastToast){
                const toast = this._lastToast;
                clearTimeout(toast._timeOut);
                toast.visible = false;
                this.camera.remove(toast);
                toast._callback && toast._callback();
                toast._callback = undefined;
                this._lastToast = undefined;
            }
            let width = text.length * 21 + 50;
            width = Math.max(width,280);
            const toast = this.createToast(text,width,60,20);
            toast.visible = true;
            const _timeOut = setTimeout(function () {
                toast.visible = false;
                this.camera.remove(toast);
                toast._callback && toast._callback();
                this._lastToast = undefined;
            }.bind(this),2500);
            toast._callback = callback;
            toast._timeOut = _timeOut;
            this._lastToast = toast;
        }else{
            Utils.showToast({
                icon:'none',
                title:text,
                duration:2000
            });
        }
    },

    createToast:function(text,w,h,fontSize){
        let texture = new THREE.Texture(this.createCanvasToast(text,w,h,fontSize));
        texture.needsUpdate = true;
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            opacity: 1,
            transparent: true
        });
        // material.map.minFilter = THREE.LinearFilter;
        let geometry = new THREE.PlaneGeometry(18 / 280 * w, 4);
        let toast = new THREE.Mesh(geometry, material);
        toast.position.set(0,0,11.5);
        toast.updateMatrix();
        // toast.matrixAutoUpdate = false;
        toast.update = function () {
            texture.needsUpdate = true;
        };

        this.camera.add(toast);
        return toast;
    },

    createCanvasToast:function(text,w,h,fontSize){
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._roundedRectR(ctx,0,0,w,h,h/2);
        // ctx.fillStyle = '#fff';
        ctx.fillStyle = 'rgba(255,255,255, 1.0)';
        ctx.font=fontSize+'px Helvetica';
        ctx.textBaseline = 'middle';
        ctx.textAlign='center';
        ctx.fillText(text,w/2,h/2);
        return canvas;
    },

    _roundedRectR: function (ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.arc(radius,radius,radius,0.5*Math.PI,1.5*Math.PI);
        ctx.lineTo(width-radius,0);
        ctx.arc(width-radius,radius,radius,-0.5*Math.PI,0.5*Math.PI);
        // ctx.closePath();
        ctx.lineTo(radius,2*radius);
        ctx.fill();
    },

    update: function () {
        //if (!this.bgAudio.paused) this.music.rotation.z -= 0.02;
        if(this._lastToast){
            this._lastToast.update && this._lastToast.update();
        }
    },

    //初始化弹幕相关的变量
    resetThings4Danmu:function(){
        this.danmuArr = [];
        this.danmuIndex1 = false;
        this.danmuIndex2 = false;
        if (this.danmuTimer1){
            clearTimeout(this.danmuTimer1);
            this.danmuTimer1 = null;
        }
        if (this.danmuTimer2){
            clearTimeout(this.danmuTimer2);
            this.danmuTimer2 = null;
        }
        let self = this;
        for (let i=0,len=this.danmuMeshArr.length;i<len;++i){
            let meshInfo = this.danmuMeshArr.shift();
            if (meshInfo){
                meshInfo.mesh.visible = false;
                if (meshInfo.mesh.animating){
                    setTimeout(function (meshInfo) {
                        let that = self;
                        return function(){
                            that.camera.remove(meshInfo.mesh);
                        };
                    }(meshInfo),2600);
                } else{
                    this.camera.remove(meshInfo.mesh);
                }
            }
        }
    },

    //隐藏弹幕相关的一切
    hideDanmuBtn:function(){
        if (window.WechatGame){
            this.danmu.visible = false;
            this.danmuClose.visible = false;
            this.resetThings4Danmu();
        }
    },
    //隐藏弹幕
    hideDanmu:function(){
        if (window.WechatGame){
            this.danmu.visible = false;
            this.danmuClose.visible = true;
            this.resetThings4Danmu();
        }
    },
    //展示弹幕
    showDanmu:function(){
        if (window.WechatGame){
            this.danmu.visible = true;
            this.danmuClose.visible = false;
        }
    },
    addDanmu:function(d){
        this.danmuArr.push(d);
        this.showDanmuAnimate();
    },
    showDanmuAnimate:function(){
        if (this.danmuArr.length>0 && (!this.danmuIndex1 || !this.danmuIndex2)){
            let tag = new Date().getTime();
            let d = this.danmuArr.shift();
            let texture = new THREE.Texture(this.createDanmu(tag,d));
            texture.needsUpdate = true;
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                opacity: 1,
                transparent: true
            });
            let w = 13;
            let h = 4;
            let geometry = new THREE.PlaneGeometry(w , h);
            let mesh = new THREE.Mesh(geometry, material);
            let y = 20;
            let index1Y = 20;
            let index2Y = 15;
            if (!this.danmuIndex1){
                y = index1Y;
                this.danmuIndex1 = true;
            } else if (!this.danmuIndex2) {
                y = index2Y;
                this.danmuIndex2 = true;
            }
            let srcX = -frustumSizeWidth/2-w/2;
            let destX = -frustumSizeWidth/2+w/2;
            mesh.position.set(srcX,y,9.5);
            mesh.tag = tag;
            mesh.name = 'danmu';
            mesh.animating = true;
            this.camera.add(mesh);
            this.danmuMeshArr.push({tag:tag,mesh:mesh,texture:texture});
            let self = this;
            Animation.customAnimation.to(mesh.position, 0.3, {x:destX, onComplete: function onComplete() {
                let that = self;
                self.danmuTimer1 = setTimeout(function () {
                    let _that = that;
                    Animation.customAnimation.to(mesh.position, 0.3, {x:srcX, onComplete: function onComplete() {
                        if (mesh.position.y === index1Y){
                            _that.danmuIndex1 = false;
                        } else if (mesh.position.y === index2Y){
                            _that.danmuIndex2 = false;
                        }
                        for (let i=0,len=_that.danmuMeshArr.length;i<len;++i){
                            if (i<_that.danmuMeshArr.length && _that.danmuMeshArr[i].mesh.tag===mesh.tag){
                                _that.danmuMeshArr.splice(i,1);
                                break;
                            }
                        }
                        mesh.animating = false;
                        mesh.visible = false;
                        _that.camera.remove(mesh);
                        let _that3 = _that;
                        _that.danmuTimer2 = setTimeout(function () {
                            _that3.showDanmuAnimate();
                        },1000);
                    }});
                },5*1000);
            }});
        }
    },
    //画弹幕
    createDanmu:function(tag,d){
        const content = d.content; //内容

        let text = '';
        content.forEach(function (item) {
            text += item.c;
            //TODO 样式！！
            // const style = item.style;
        });

        const avatarUrl = d.avatarUrl; //头像
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = 280;
        canvas.height = 80;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //半透明背景
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        let radius = canvas.height/2;
        let w = canvas.width;
        let h = canvas.height;
        ctx.moveTo(0,0);
        ctx.lineTo(w-radius,0);
        ctx.arc(w-radius,radius,radius,-0.5*Math.PI,0.5*Math.PI);
        ctx.lineTo(0,2*radius);
        ctx.closePath();
        ctx.fill();
        //头像
        // let avatarUrl = 'res/img/ava.png';
        this.drawCircleImage(tag,avatarUrl,20,14,h-14*2,h-14*2,ctx,function () {
            for (let i=0,len=this.danmuMeshArr.length;i<len;++i){
                if (i<this.danmuMeshArr.length && this.danmuMeshArr[i].tag==tag){
                    this.danmuMeshArr[i].texture.needsUpdate = true;
                    break;
                }
            }
        }.bind(this));
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '20px Helvetica';

        let index = text.indexOf('刚刚用时');
        let name = text.slice(0,index);
        let pre = text.slice(0,index+'刚刚用时'.length);
        let last = text.slice(index+'刚刚用时'.length);
        let num = last.replace(/[^0-9]/ig,'');
        last = last.slice(num.length);
        if (name.length>4){
            name = name.substr(0,3)+'...';
        }
        num = parseInt(num);
        let min = Math.floor(num/60);
        let sec = Math.floor(num%60);
        let useTime = min+'\''+sec+'"';
        console.log('昵称：'+name);
        console.log('前半句：'+pre);
        console.log('时间: '+num);
        console.log('时间：'+useTime);
        console.log('后半句：'+last);
        ctx.fillText(name+'刚刚用时',85,16);
        ctx.fillText(useTime+''+last,85,42);
        return canvas;
    },
    _loadImg: function(tag,src,errImg, cb){
        const img = new Image();
        const that = this;
        img._tag = tag;
        img._retryTimes = 10;
        if(!src || src == 'null' || src.length == 0){
            src = 'res/img/ava.png';
        }
        img.onload = function () {
            if (img._tag == tag) {
                !!cb && cb(img);
            }
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
    },
    drawCircleImage:function(tag,src,x,y,w,h,ctx,cb) {
        if(!src || src == 'null' || src.length == 0){
            src = 'res/img/ava.png';
        }
        let that = this;
        this._loadImg(tag,src,'res/img/ava.png',function (img) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0)';
            that._circleRectR(x , y , w, h, ctx);
            ctx.clip();
            if (img) {
                ctx.drawImage(img, x , y , w, h);
            }
            ctx.closePath();
            ctx.restore();
            !!cb && cb();
        });
    },
    _circleRectR: function (x, y, width, height, ctx) {
        ctx.beginPath();
        ctx.arc(x+width/2.0,y+height/2.0,Math.min(width,height)/2.0,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();
    },

    hideScore: function () {
        this.scoreText.obj.visible = false;
        this.leCardText.obj.visible = false;
        this.hideDanmuBtn();
        this.hideComboHint();
    },

    showScore: function () {
        this.scoreText.obj.visible = true;
        if (this.game.gameType === Config.GAME.singleGame){
            if (window.WechatGame){
                this.leCardText.obj.visible = true;
            }else{
                this.leCardText.obj.visible = false;
            }
            this.hideDanmuBtn();
        }else if (this.game.gameType === Config.GAME.competitionGame){
            this.leCardText.obj.visible = false;
            if (!UserService.showDanmu){
                this.showDanmu();
            }else{
                this.hideDanmu();
            }
        }
    },

    addScore: function (score, double, quick, keepDouble) {
        if (keepDouble) {
            this.score += score;
            this.setScore(this.score);
            return;
        }
        if (double) {
            if (this.double === 1) this.double = 2; else this.double += 2;
        } else {
            this.double = 1;
        }
        // if (quick && this.double <= 2) {
        //     this.double *= 2;
        // }
        this.double = Math.min(32, this.double);
        score = score * this.double;
        this.score += score;
        this.setScore(this.score);
    },

    setScore: function (score) {
        // this.scoreText.setScore(score);

        //创建图片mesh
        let perHeight = 3.5;
        let perWidth = 2.5;
        score = score.toString();
        let lengthSum = score.length * perWidth;

        for (let i = 0, len = this.bigNumArr.length; i < len; ++i) {
            for (let j = 0; j < 6; ++j) {
                if (this.bigNumArr[i][j].using) {
                    // this.scoreText.obj.remove(this.bigNumArr[i][j]);
                    this.bigNumArr[i][j].using = false;
                    this.bigNumArr[i][j].visible = false;
                }
            }
        }
        let sum = 0;
        for (let i = 0, len = score.length; i < len; ++i) {
            let scores = this.bigNumArr[score[i]];
            for (let j = 0; j < 6; ++j) {
                if (!scores[j].using) {
                    scores[j].position.x = sum;
                    scores[j].using = true;
                    scores[j].visible = true;
                    // this.scoreText.obj.add(scores[j]);
                    break;
                }
            }
            sum += perWidth+0.2;
        }

        this._config.BLOCK.minRadiusScale -= 0.005;
        this._config.BLOCK.minRadiusScale = Math.max(0.3, this._config.BLOCK.minRadiusScale);
        this._config.BLOCK.maxRadiusScale -= 0.005;
        this._config.BLOCK.maxRadiusScale = Math.max(this._config.BLOCK.maxRadiusScale, 0.6);
        this._config.BLOCK.maxDistance += 0.03;
        this._config.BLOCK.maxDistance = Math.min(22, this._config.BLOCK.maxDistance);
    },

    setLeCard: function (lecard) {
        this.leCardNum = lecard;
        // this.leCardText.setLeCard(lecard);

        //创建图片mesh
        let perHeight = 2.0;
        let perWidth = 1.2;
        lecard = lecard.toString();
        let amount = 5;
        let lengthSum = lecard.length * perWidth;

        let diff = lecard.length-2;
        diff = diff>=0 ? diff : 0;
        this.leCardText.obj.position.x = this.lecardInitX - diff*perWidth;

        //添加
        let x = -lengthSum / 2-1;

        //卡片的位置
        this.TopLeCard.position.x = x-2.5;
        this.TopLeCard.position.y = 0.9;


        for (let i = 0, len = this.smallNumArr.length; i < len; ++i) {
            for (let j = 0; j < amount; ++j) {
                if (this.smallNumArr[i][j].using) {
                    // this.leCardText.obj.remove(this.smallNumArr[i][j]);
                    this.smallNumArr[i][j].using = false;
                    this.smallNumArr[i][j].visible = false;
                }
            }
        }
        for (let i = 0, len = lecard.length; i < len; ++i) {
            let scores = this.smallNumArr[lecard[i]];
            for (let j = 0; j < amount; ++j) {
                if (!scores[j].using) {
                    scores[j].position.x = x;
                    scores[j].position.y = 0.9;
                    scores[j].using = true;
                    scores[j].visible = true;
                    // this.leCardText.obj.add(scores[j]);
                    break;
                }
            }
            x += perWidth+0.2;
        }

    },

    showComboHint:function (index) {
        let tmpIndex = Math.min(index-1,7);
        this.hideComboHint(tmpIndex);
        if (!this.hintObjArr[tmpIndex].visible) {
            this.hintObjArr[tmpIndex].visible = true;
            this.hintObjArr[tmpIndex].scale.y = 0.1;
            Animation.customAnimation.to(this.hintObjArr[tmpIndex].scale,0.1,{y:1.0});
        }
        this.hintObjArr[tmpIndex].visible = true;
        this.hintTimer = setTimeout(function () {
            Animation.customAnimation.to(this.hintObjArr[tmpIndex].scale,0.1,{y:0.1,onComplete: function onComplete(){
                this.hintObjArr[tmpIndex].visible = false;
            }.bind(this)});
        }.bind(this),1000);
    },
    hideComboHint:function (index) {
        if (this.hintTimer){
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        for (let i=0;i<this.hintObjArr.length;++i){
            if (i !== index){
                this.hintObjArr[i].visible = false;
            }
        }
    },

};

export default UI;
