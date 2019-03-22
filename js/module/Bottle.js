'use strict';

import * as Config from '../base/Config.js';
import * as Animation from '../base/TweenAnimation.js';
import * as THREE from '../libs/three/three.min.js';
import Text from './Text.js';
import LoadOBJ from '../base/LoadOBJ.js';

var Bottle = function () {
    function Bottle(cb) {
        this.obj = new THREE.Object3D();
        this.obj.name = 'bottle';
        this.trail = null;
        this._animation = Animation;

        this.bottle = new THREE.Object3D();
        this._config = Config;
        // var basicMaterial = new THREE.MeshBasicMaterial({map: this._config.loader.load('res/head.png')});

        //加载狐狸
        let path = this._config.Fox.path;
        let filename = this._config.Fox.name;
        if (window.WechatGame){
            path = 'res/';
        }
        filename = 'huli9';
        let loadLacoal = false;
        if (window.WechatGame){
            loadLacoal = true;
        }
        this.loadOBJ = new LoadOBJ(path,filename,function (foxObj) {
            console.log('foxObj');
            foxObj.rotation.y = Math.PI/2;
            for (let i=0;i<foxObj.children.length;++i){
                foxObj.children[i].castShadow = true;
                let objname = foxObj.children[i].name;
                if (objname === 'shenzi'){
                    this.body = foxObj.children[i];
                }else if(objname === 'tou'){
                    //huli9 用tou
                    this.head = foxObj.children[i];
                }
            }
            // this.foxOriginalColor = foxObj.children[0].material.color.clone();
            this.foxOriginalColor = foxObj.children[0].material[0].color.clone();
            this.human = foxObj;
            this.bottle.add(this.human);
            this.bottle.position.y = this._config.BOTTLE.bodyHeight / 2 - 0.25;
            // this.bottle.position.y = this._config.BOTTLE.bodyHeight / 2 + 0.25;
            cb && cb();
        }.bind(this),loadLacoal);

        //之前的小人
        // var headRadius = 2.1 * 0.45;
        // this.human = new THREE.Object3D();
        // this.head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 20, 20), basicMaterial);
        // // this.head.rotation.y = 3.4;
        // // this.head.rotation.x = -1;
        // // window.hhh = this.head;
        // this.head.castShadow = true;
        // this.bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.88 * headRadius, 1.27 * headRadius, 2.68 * headRadius, 20), new THREE.MeshBasicMaterial({map: this._config.loader.load('res/bottom.png')}));
        // this.bottom.rotation.y = 4.7;
        // this.bottom.castShadow = true;
        // var middleGeometry = new THREE.CylinderGeometry(headRadius, 0.88 * headRadius, 1.2 * headRadius, 20);
        // var middleMaterial = new THREE.MeshBasicMaterial({map: this._config.loader.load('res/top.png')});
        // var materials = [middleMaterial, basicMaterial];
        // var totalGeometry = new THREE.Geometry();
        // middleGeometry.rotateY(4.7);
        // this.merge(totalGeometry, middleGeometry, 0, [{x: 0, y: this.bottom.position.y + 1.94 * headRadius, z: 0}]);
        // var topGeometry = new THREE.SphereGeometry(headRadius, 20, 20);
        // topGeometry.scale(1, 0.54, 1);
        // this.merge(totalGeometry, topGeometry, 1, [{x: 0, y: this.bottom.position.y + 2.54 * headRadius, z: 0}]);
        // this.middle = new THREE.Mesh(totalGeometry, materials);
        // this.middle.castShadow = true;
        // // this.top.rotation.y = 3.4;
        // // this.top.rotation.x = -1;
        // this.body = new THREE.Object3D();
        // this.body.add(this.bottom);
        // this.body.add(this.middle);
        // this.human.add(this.body);
        // this.head.position.y = 4.725;
        // this.human.add(this.head);
        // //this.human.scale.set(0.45, 0.45, 0.45)
        // this.bottle.add(this.human);

        // this.bottle.position.y = this._config.BOTTLE.bodyHeight / 2 - 0.25;

        this.obj.add(this.bottle);

        // 状态量
        this.status = 'stop';
        this.scale = 1;
        this.double = 1;
        this.velocity = {};
        this.flyingTime = 0;
        this.direction = 'straight';
        this.jumpStatus = 'init';

        //当前季节
        this.currentSeason = 0;

        // 粒子
        this.particles = [];
        let whiteParticleMaterial = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/white.png'),
            alphaTest: 0.5
        });
        let yellowParticleMaterial = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/yellow.png'),
            alphaTest: 0.5
        });
        let particleGeometry = new THREE.PlaneGeometry(1, 1);
        for (let i = 0; i < 15; ++i) {
            let particle = new THREE.Mesh(particleGeometry, whiteParticleMaterial);
            particle.rotation.y = -Math.PI / 4;
            particle.rotation.x = -Math.PI / 5;
            particle.rotation.z = -Math.PI / 5;
            this.particles.push(particle);
            this.obj.add(particle);
        }
        for (let i = 0; i < 5; ++i) {
            let particle = new THREE.Mesh(particleGeometry, yellowParticleMaterial);
            particle.rotation.y = -Math.PI / 4;
            particle.rotation.x = -Math.PI / 5;
            particle.rotation.z = -Math.PI / 5;
            this.particles.push(particle);
            this.obj.add(particle);
        }

        this.newParticles = [];//存四季的粒子：0：春天，1：夏天，2：秋天，3：冬天
        this.createSeasonParticles();

        this.scoreText = new Text('0', {fillStyle: 0x252525, textAlign: 'center', plusScore: true});//new _text2.default('0', {fillStyle: 0x252525, textAlign: 'center', plusScore: true});
        this.scoreText.obj.visible = false;
        this.scoreText.obj.rotation.y = -Math.PI / 4;
        this.scoreText.obj.scale.set(0.5, 0.5, 0.5);
        this.obj.add(this.scoreText.obj);

        this.createLeCardTint();
    }

    return Bottle;
}();

Bottle.prototype = {
    //四季的粒子
    createSeasonParticles:function(){
        let springMaterial1 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/hua1.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let springMaterial2 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/hua2.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let summerMaterial1 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/yezi1.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let summerMaterial2 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/yezi2.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let autumnMaterial1 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/huangye1.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let autumnMaterial2 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/huangye2.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let winterMaterial1 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/xuehua1.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let winterMaterial2 = new THREE.MeshBasicMaterial({
            map: this._config.loader.load('res/img/particle/xuehua2.png'),
            transparent:true,
            alphaTest: 0.01
        });
        let materials = [];
        materials.push(springMaterial1,springMaterial2,summerMaterial1,summerMaterial2,autumnMaterial1,autumnMaterial2,winterMaterial1,winterMaterial2);
        let particleGeometry = new THREE.PlaneGeometry(1, 1);
        for (let k=0;k<4;++k){
            let parts = [];
            for (let i = 0; i < 8; ++i) {
                let m = i%2===0 ? materials[2*k] : materials[2*k+1];
                let particle = new THREE.Mesh(particleGeometry, m);
                particle.rotation.y = -Math.PI / 4;
                particle.rotation.x = -Math.PI / 5;
                particle.rotation.z = -Math.PI / 5;
                if (k===1){
                    particle.rotation.z = 2*Math.PI * Math.random();
                }
                particle.visible = false;
                parts.push(particle);
                this.obj.add(particle);
            }
            this.newParticles.push(parts);
        }
    },

    //乐卡 +1 提示
    createLeCardTint:function(){
        var material = new THREE.MeshBasicMaterial({
            map: Config.loader.load('res/img/number/addLecard.png'),
            opacity: 1,
            transparent: true
        });
        let geometry = new THREE.PlaneGeometry(3, 1.5);
        let toast = new THREE.Mesh(geometry, material);
        toast.position.set(0,3,0);
        toast.rotation.y = -Math.PI / 4;
        toast.visible = false;
        this.leCardTint = toast;
        this.obj.add(toast);
    },

    showAddLecard:function(){
        let self = this;
        this.changeScorePos(5);
        this.leCardTint.visible = true;
        this.leCardTint.position.y = 5;
        this.leCardTint.material.opacity = 1;
        (0, this._animation.TweenAnimation)(this.leCardTint.position.y, this._config.BOTTLE.bodyHeight + 6, 800, function (value) {
            this.leCardTint.position.y = value;
        }.bind(this));
        (0, this._animation.TweenAnimation)(this.leCardTint.material.opacity, 0, 800, function (value, complete) {
            this.leCardTint.material.opacity = value;
            if (complete) {
                this.leCardTint.visible = false;
                this.changeScorePos(0);
            }
        }.bind(this));
    },

    merge: function (totalGeometry, geometry, index, positions) {
        for (let i = 0, len = geometry.faces.length; i < len; ++i) {
            geometry.faces[i].materialIndex = 0;
        }
        let mesh = new THREE.Mesh(geometry);
        for (let i = 0, len = positions.length; i < len; ++i) {
            mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
            mesh.updateMatrix();
            totalGeometry.merge(mesh.geometry, mesh.matrix, index);
        }

    },

    showAddScore: function (score, double, quick, keepDouble) {
        if (keepDouble) {
            this.scoreText.setScore(score.toString());
        } else {
            let scale4Num = 0.5;
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

            this.scoreText.setScore(score.toString());
            let d = Math.min(16,this.double);
            scale4Num = scale4Num + (0.7-0.5)/8.0*(d/2);
            this.scoreText.obj.scale.set(scale4Num,scale4Num,0.5);
            /*if (this.direction === 'left') {
    addScore.rotation.y = -Math.PI / 2;
    }*/
        }
        this.scoreText.obj.visible = true;
        this.scoreText.obj.position.y = 3;
        this.scoreText.material.opacity = 1;
        //立即执行函数  (function(){})(params)
        //请阅读完 廖雪峰JS教程：https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000
        (0, this._animation.TweenAnimation)(this.scoreText.obj.position.y, this._config.BOTTLE.bodyHeight + 6, 800, function (value) {
            this.scoreText.obj.position.y = value;
        }.bind(this));
        (0, this._animation.TweenAnimation)(this.scoreText.material.opacity, 0, 800, function (value, complete) {
            this.scoreText.material.opacity = value;
            if (complete) {
                this.scoreText.obj.visible = false;
            }
        }.bind(this));
    },

    changeScorePos: function (z) {
        this.scoreText.obj.position.z = z;
    },

    resetParticles: function () {
        if (this.gatherTimer) clearTimeout(this.gatherTimer);
        this.gatherTimer = null;
        for (let i = 0, len = this.particles.length; i < len; ++i) {
            this.particles[i].gathering = false;
            this.particles[i].visible = false;
            this.particles[i].scattering = false;
        }
        for (let i=0;i<this.newParticles.length;++i){
            for (let j=0;j<this.newParticles[i].length;++j){
                this.newParticles[i][j].gathering = false;
                this.newParticles[i][j].visible = false;
                this.newParticles[i][j].scattering = false;
            }
        }
    },

    scatterParticles: function () {
        for (let i = 0; i < 10; ++i) {
            this.particles[i].scattering = true;
            this.particles[i].gathering = false;
            this._scatterParticles(this.particles[i]);
        }
        let season = this.currentSeason;
        if (season<4){
            for (let j=0;j<this.newParticles[season].length;++j){
                this.newParticles[season][j].scattering = true;
                this.newParticles[season][j].gathering = false;
                this._scatterParticles(this.newParticles[season][j]);
            }
        }
    },

    _scatterParticles: function (particle) {
        let that = this;
        let minDistance = this._config.BOTTLE.bodyWidth / 2;
        let maxDistance = 2;
        let x = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random());
        let z = (minDistance + Math.random() * (maxDistance - minDistance)) * (1 - 2 * Math.random());
        particle.scale.set(1, 1, 1);
        particle.visible = false;
        particle.position.x = x;
        particle.position.y = -0.5;
        particle.position.z = z;
        setTimeout(function (particle) {
            return function () {
                if (!particle.scattering) return;
                particle.visible = true;
                let duration = 0.3 + Math.random() * 0.2;
                //TweenMax.to(particle.rotation, duration, { x: Math.random() * 12, y: Math.random() * 12 });
                that._animation.customAnimation.to(particle.scale, duration, {x: 0.2, y: 0.2, z: 0.2});
                that._animation.customAnimation.to(particle.position, duration, {
                    x: 2 * x, y: 2.5 * Math.random() + 2, z: 2 * z, onComplete: function onComplete() {
                        particle.scattering = false;
                        particle.visible = false;
                    }
                });
            };
        }(particle), 0);
    },

    gatherParticles: function () {
        let _this = this;

        for (let i = 10; i < 20; ++i) {
            this.particles[i].gathering = true;
            this.particles[i].scattering = false;
            this._gatherParticles(this.particles[i]);
        }
        let season = this.currentSeason;
        if (season<4){
            for (let i=4;i<this.newParticles[season].length;++i){
                this.newParticles[season][i].gathering = true;
                this.newParticles[season][i].scattering = false;
                this._gatherParticles(this.newParticles[season][i]);
            }
        }

        this.gatherTimer = setTimeout(function () {
            for (let i = 0; i < 10; ++i) {
                _this.particles[i].gathering = true;
                _this.particles[i].scattering = false;
                _this._gatherParticles(_this.particles[i]);
            }
            if (season<4){
                for (let i=0;i<4;++i){
                    _this.newParticles[season][i].gathering = true;
                    _this.newParticles[season][i].scattering = false;
                    _this._gatherParticles(_this.newParticles[season][i]);
                }
            }
        }, 500 + 1000 * Math.random());
    },

    _gatherParticles: function (particle) {
        let that = this;
        let minDistance = 1;
        let maxDistance = 8;
        particle.scale.set(1, 1, 1);
        particle.visible = false;
        let x = Math.random() > 0.5 ? 1 : -1;
        let z = Math.random() > 0.5 ? 1 : -1;
        particle.position.x = (minDistance + Math.random() * (maxDistance - minDistance)) * x;
        particle.position.y = minDistance + Math.random() * (maxDistance - minDistance);
        particle.position.z = (minDistance + Math.random() * (maxDistance - minDistance)) * z;
        setTimeout(function (particle) {
            return function () {
                if (!particle.gathering) return;
                particle.visible = true;
                let duration = 0.5 + Math.random() * 0.4;
                //TweenMax.to(particle.rotation, duration, { x: Math.random() * 12, y: Math.random() * 12 });
                (0, that._animation.TweenAnimation)(particle.scale.x, 0.8 + Math.random(), duration * 1000, function (value) {
                    particle.scale.x = value;
                });
                (0, that._animation.TweenAnimation)(particle.scale.y, 0.8 + Math.random(), duration * 1000, function (value) {
                    particle.scale.y = value;
                });
                (0, that._animation.TweenAnimation)(particle.scale.z, 0.8 + Math.random(), duration * 1000, function (value) {
                    particle.scale.z = value;
                });

                (0, that._animation.TweenAnimation)(particle.position.x, Math.random() * x, duration * 1000, function (value) {
                    particle.position.x = value;
                });
                (0, that._animation.TweenAnimation)(particle.position.y, Math.random() * 2.5, duration * 1000, function (value) {
                    particle.position.y = value;
                });
                (0, that._animation.TweenAnimation)(particle.position.z, Math.random() * z, duration * 1000, function (value, complete) {
                    particle.position.z = value;
                    if (complete && particle.gathering) {
                        that._gatherParticles(particle);
                    }
                });
            };
        }(particle), Math.random() * 500);
    },

    update: function (tickTime) {
        if (this.status == 'stop') {
            return;
        }
        if (this.status == 'prepare') {
            this._prepare();
        } else if (this.status == 'jump') {
            this._jump(tickTime);
        } else if (this.status == 'turn') {
            this.turn();
        }
    },

    lookAt: function (direction, targetPosition) {
        // console.log('lookAt');
        if (direction !== this.direction) {
            if (direction === 'straight') {
                // console.log('lookAt straight');
                this.turnAngle = -(Math.PI / 2);
                this.angle = 0;
            } else {
                // console.log('lookAt else');
                this.turnAngle = Math.PI / 2;
                this.angle = Math.PI / 2;
            }
            this.direction = direction;
            this.status = 'turn';
        }

        // targetPosition.y = (BOTTLE.bodyHeight + BLOCK.height) / 2
        // this.status = 'turn';
        // this.direction = direction;
        // this.angle = targetPosition.clone().sub(this.obj.position.clone()).angleTo(new THREE.Vector3(1, 0, 0));
        // if (this.obj.position.z < targetPosition.z) this.angle *= -1;
        // this.turnAngle = this.angle - this.obj.rotation.y;
    },

    turn: function () {
        // console.log('turn '+this.turnAngle);
        let angle = this.turnAngle > 0 ? 0.2 : -0.2;
        this.bottle.rotation.y += angle;
        this.turnAngle -= angle;
        if (this.turnAngle >= -0.2 && this.turnAngle <= 0.2) {
            this.bottle.rotation.y = this.angle;
            this.status = 'stop';
        }
    },

    fall: function () {
        console.log('fall 方法');
        this.stop();
        setTimeout(function () {
            this.status = 'fall';
            (0, this._animation.TweenAnimation)(this.obj.position.y, -this._config.BLOCK.height / 2 - 0.3, 400, function (value) {
                this.obj.position.y = value;
            }.bind(this));
            if (this.direction === 'straight'){
                (0, this._animation.TweenAnimation)(this.obj.position.x, this.obj.position.x - 0.5, 400, function (value) {
                    this.obj.position.x = value;
                }.bind(this));
            }else{
                (0, this._animation.TweenAnimation)(this.obj.position.z, this.obj.position.z + 0.5, 400, function (value) {
                    this.obj.position.z = value;
                }.bind(this));
            }
        }.bind(this), 0);
    },

    //前倾
    forerake: function () {
        let _this3 = this;

        this.stop();
        this.status = 'forerake';
        console.log('forerake 方法');
        setTimeout(function () {
            if (_this3.direction === 'straight') {
                console.log('forerake 方法 straight');
                (0, this._animation.TweenAnimation)(_this3.obj.rotation.z, -Math.PI / 2, 1000, function (value) {
                    this.obj.rotation.z = value;
                }.bind(this));

                //TweenMax.to(this.obj.position, 0.3, { x: this.obj.position.x + BOTTLE.bodyWidth });
            } else {
                console.log('forerake 方法 straight else');
                (0, this._animation.TweenAnimation)(_this3.obj.rotation.x, -Math.PI / 2, 1000, function (value) {
                    this.obj.rotation.x = value;
                }.bind(this));
                //TweenMax.to(this.obj.position, 0.3, { z: this.obj.position.z - BOTTLE.bodyWidth });
            }
            // TweenAnimation(this.obj.position.y, this.obj.position.y - 0.5, 500, function(value) {
            // 	this.obj.position.y = value;
            // }.bind(this));
            setTimeout(function () {
                if (_this3.status == 'suspend') {
                    _this3.status = 'stop';
                    return;
                }
                console.log('forerake 方法 非suspend');
                (0, this._animation.TweenAnimation)(_this3.obj.position.y, -this._config.BLOCK.height / 2 + 1.2, 400, function (value, complete) {
                    this.obj.position.y = value;
                    if (complete) this.status = 'stop';
                }.bind(this));
                this._animation.customAnimation.to(_this3.head.position, 0.2, {x: -1.125});
                this._animation.customAnimation.to(_this3.head.position, 0.2, {x: 0, delay: 0.2});
            }.bind(this), 200);
        }.bind(this), 200);
    },

    //后仰
    hypsokinesis: function () {
        let _this4 = this;

        this.stop();
        this.status = 'hypsokinesis';
        console.log('hypsokinesis 方法');
        let offset = 0;
        setTimeout(function () {
            if (_this4.direction === 'straight') {
                console.log('hypsokinesis 方法 straight');
                (0, this._animation.TweenAnimation)(_this4.obj.rotation.z, Math.PI / 2, 800, function (value) {
                    this.obj.rotation.z = value;
                }.bind(_this4));
                (0, this._animation.TweenAnimation)(_this4.obj.position.x, _this4.obj.position.x-0.5, 800, function (value) {
                    _this4.obj.position.x = value;
                }.bind(_this4));
            } else {
                console.log('hypsokinesis 方法 straight else');
                (0, this._animation.TweenAnimation)(_this4.obj.rotation.x, Math.PI / 2, 800, function (value) {
                    this.obj.rotation.x = value;
                }.bind(_this4));
                (0, this._animation.TweenAnimation)(_this4.obj.position.z, _this4.obj.position.z+1, 800, function (value) {
                    _this4.obj.position.z = value;
                }.bind(_this4));
            }
            setTimeout(function () {
                if (_this4.status == 'suspend') {
                    _this4.status = 'stop';
                    return;
                }
                console.log('hypsokinesis 方法 非suspend');
                let ff = 1.2;
                ff = -1;
                (0, this._animation.TweenAnimation)(_this4.obj.position.y, -this._config.BLOCK.height / 2 + ff, 400, function (value, complete) {
                    this.obj.position.y = value;
                    if (complete) this.status = 'stop';
                }.bind(this));
                this._animation.customAnimation.to(_this4.head.position, 0.2, {x: 1.125});
                this._animation.customAnimation.to(_this4.head.position, 0.2, {x: 0, delay: 0.2});
            }.bind(this), 350);
        }.bind(this), 200);
    },

    _jump: function (tickTime) {
        let translateV = new THREE.Vector3(0, 0, 0);
        translateV.z = this.velocity.vz * tickTime;
        translateV.y = this.velocity.vy * tickTime - this._config.GAME.gravity / 2 * tickTime * tickTime - this._config.GAME.gravity * this.flyingTime * tickTime;
        this.flyingTime += tickTime;
        this.obj.translateY(translateV.y);
        this.obj.translateOnAxis(this.axis, translateV.z);
    },

    squeeze: function () {
        // console.log('squeeze');
        this.obj.position.y = this._config.BLOCK.height / 2;
        this._animation.customAnimation.to(this.body.scale, 0.15, {y: 0.9, x: 1.07, z: 1.07});
        this._animation.customAnimation.to(this.body.scale, 0.15, {y: 1.0, x: 1.0, z: 1.0, delay: 0.15});
        this._animation.customAnimation.to(this.body.position, 0.15, {y: 0.6, delay: 0.15});
        // this._animation.customAnimation.to(this.head.position, 0.15, {y: 4.725, delay: 0.15});
        this._animation.customAnimation.to(this.head.position, 0.15, {y: 0.8, delay: 0.15});
    },

    // 改变狐狸的颜色
    changeColor:function(index){
        let color;
        if (index===0){
            color = this.foxOriginalColor.clone();
        } else if (index === 1){
            let colorInfo = Config.FoxColor[index-1];
            color = new THREE.Color();
            color.setHex(colorInfo);
        }else{
            color = this.foxOriginalColor.clone();
        }
        for (let i=0;i<this.human.children.length;++i){
            for (let j=0;j<this.human.children[i].material.length;++j){
                if (this.human.children[i].material[j].name === 'hulihong'){
                    this.human.children[i].material[j].color = color.clone();
                }
            }
        }
    },

    stop: function () {
        // console.log('stop');
        this.status = 'stop';
        this.flyingTime = 0;
        this.scale = 1;
        this.velocity = {};
        this.jumpStatus = 'init';
    },

    suspend: function () {
        // console.log('suspend');
        this.status = 'suspend';
        this._animation.TweenAnimation.killAll();
    },

    rotate: function () {
        console.log('rotate 方法');
        this._animation.TweenAnimation.killAll();
        let offset;
        if (this.direction === 'straight') {
            console.log('rotate 方法 straight');
            (0, this._animation.TweenAnimation)(this.obj.rotation.z, 0, 300, function (value) {
                this.obj.rotation.z = value;
            }.bind(this));
            if (this.status.indexOf('forerake') >= 0) {
                offset = 2;
            } else {
                offset = -2;
            }
            console.log('offset : '+offset);
            (0, this._animation.TweenAnimation)(this.obj.position.x, this.obj.position.x + offset, 300, function (value) {
                this.obj.position.x = value;
            }.bind(this));
        } else {
            console.log('rotate 方法 straight else');
            (0, this._animation.TweenAnimation)(this.obj.rotation.x, 0, 300, function (value) {
                this.obj.rotation.x = value;
            }.bind(this));
            if (this.status.indexOf('forerake') >= 0) {
                offset = -2;
            } else {
                offset = 2;
            }
            console.log('offset : '+offset);
            (0, this._animation.TweenAnimation)(this.obj.position.z, this.obj.position.z + offset, 300, function (value) {
                this.obj.position.z = value;
            }.bind(this));
        }
        (0, this._animation.TweenAnimation)(this.head.position.x, 0, 100, function (value) {
            this.head.position.x = value;
        }.bind(this));
        (0, this._animation.TweenAnimation)(this.obj.position.y, -this._config.BLOCK.height / 2, 300, function (value, complete) {
            this.obj.position.y = value;
            if (complete) this.status = 'stop';
        }.bind(this));
        this.status = 'rotate';
    },

    _prepare: function () {
        this.scoreText.obj.visible = false;
        this.leCardTint.visible = false;

        // console.log('_prepare');
        this.scale -= this._config.BOTTLE.reduction;
        this.scale = Math.max(this._config.BOTTLE.minScale, this.scale);
        if (this.scale <= this._config.BOTTLE.minScale) {
            return;
        }
        // this.bottle.scale.y = this.scale;
        // this.bottle.scale.x += 0.007;
        // this.bottle.scale.z += 0.007;
        this.body.scale.y = this.scale;
        this.body.scale.x += 0.002;
        this.body.scale.z += 0.002;
        this.head.position.y -= 0.018;
        let distance = 0.027;
        this.obj.position.y -= this._config.BLOCK.reduction / 2 * this._config.BLOCK.height / 2 + distance;
        //if (this.obj.position.y <= BLOCK.height / 2 + BOTTLE.bodyHeight / 2 - (1 - this.scale) * BOTTLE.bodyHeight / 2) return;
        //this.obj.position.y -= distance + BLOCK.moveDownVelocity;
        // this.obj.position.y -= BLOCK.moveDownVelocity;
        //this.obj.position.y -= distance;
    },

    prepare: function () {
        // console.log('prepare');
        this.status = 'prepare';
        this.gatherParticles();
    },

    jump: function (axis) {
        // console.log('jump');
        this.resetParticles();
        this.status = 'jump';
        this.axis = axis;
        this._animation.customAnimation.to(this.body.scale, 0.25, {x: 1, y: 1, z: 1});
        // this.head.position.y = 4.725;
        this.head.position.y = 0.8;
        this.scale = 1;

        let scale = Math.min(Math.max(this.velocity.vz / 35, 1.2), 1.4);
        this.human.rotation.z = this.human.rotation.x = 0;
        if (this.direction === 'straight') {
            this._animation.customAnimation.to(this.human.rotation, 0.14, {z: this.human.rotation.z + Math.PI});
            this._animation.customAnimation.to(this.human.rotation, 0.18, {
                z: this.human.rotation.z + 2 * Math.PI,
                delay: 0.14
            });
            this._animation.customAnimation.to(this.head.position, 0.1, {
                y: this.head.position.y + 0.9 * scale,
                x: this.head.position.x + 0.45 * scale
            });
            this._animation.customAnimation.to(this.head.position, 0.1, {
                y: this.head.position.y - 0.9 * scale,
                x: this.head.position.x - 0.45 * scale,
                delay: 0.1
            });
            // this._animation.customAnimation.to(this.head.position, 0.15, {y: 4.725, x: 0, delay: 0.25});
            this._animation.customAnimation.to(this.head.position, 0.15, {y: 0.8, x: 0, delay: 0.25});
            // TweenMax.to(this.head.position, 0.1, { z: this.head.position.z , delay: 0.3 });
            this._animation.customAnimation.to(this.body.scale, 0.1, {
                y: Math.max(scale, 1),
                x: Math.max(Math.min(1 / scale, 1), 0.7),
                z: Math.max(Math.min(1 / scale, 1), 0.7)
            });
            this._animation.customAnimation.to(this.body.scale, 0.1, {
                y: Math.min(0.9 / scale, 0.7),
                x: Math.max(scale, 1.2),
                z: Math.max(scale, 1.2),
                delay: 0.1
            });
            this._animation.customAnimation.to(this.body.scale, 0.3, {y: 1.0, x: 1.0, z: 1.0, delay: 0.2});
            this._animation.customAnimation.to(this.body.position, 0.3, {y: 0.6, delay: 0.2});
        } else {
            // console.log('straight else');
            this._animation.customAnimation.to(this.human.rotation, 0.14, {x: this.human.rotation.x - Math.PI});
            this._animation.customAnimation.to(this.human.rotation, 0.18, {
                x: this.human.rotation.x - 2 * Math.PI,
                delay: 0.14
            });

            this._animation.customAnimation.to(this.head.position, 0.1, {
                y: this.head.position.y + 0.9 * scale,
                z: this.head.position.z - 0.45 * scale
            });
            this._animation.customAnimation.to(this.head.position, 0.1, {
                z: this.head.position.z + 0.45 * scale,
                y: this.head.position.y - 0.9 * scale,
                delay: 0.1
            });
            this._animation.customAnimation.to(this.head.position, 0.15, {y: 0.8, z: 0, delay: 0.25});
            // TweenMax.to(this.head.position, 0.1, { z: this.head.position.z , delay: 0.3 });
            this._animation.customAnimation.to(this.body.scale, 0.05, {
                y: Math.max(scale, 1),
                x: Math.max(Math.min(1 / scale, 1), 0.7),
                z: Math.max(Math.min(1 / scale, 1), 0.7)
            });
            this._animation.customAnimation.to(this.body.scale, 0.05, {
                y: Math.min(0.9 / scale, 0.7),
                x: Math.max(scale, 1.2),
                z: Math.max(scale, 1.2),
                delay: 0.1
            });
            this._animation.customAnimation.to(this.body.scale, 0.2, {y: 1, x: 1, z: 1, delay: 0.2});
            this._animation.customAnimation.to(this.body.position, 0.2, {y: 0.6, delay: 0.2});
        }

        //TweenMax.to(this.bottle.rotation, 1, { z: 2 * Math.PI, delay: 2 });
    },

    showup: function () {
        // console.log('showup')
        this.status = 'showup';
        this.obj.position.y = 25;
        this.human.rotation.x = this.human.rotation.z = 0;
        (0, this._animation.TweenAnimation)(this.obj.position.y, this._config.BLOCK.height / 2, 500, 'Bounce.easeOut', function (value, complete) {
            this.obj.position.y = value;
            if (complete) {
                this.status = 'stop';
            }
        }.bind(this));
    },

    stopPrepare: function () {
        // console.log('stopPrepare')
        this.obj.position.y = this._config.BLOCK.height / 2;
        this.stop();
        this.body.scale.set(1, 1, 1);
        this.head.position.y = 0.8;
        this.head.position.x = 0;
        this.resetParticles();
    },

    getBox: function () {
        // return [new THREE.Box3().setFromObject(this.head), new THREE.Box3().setFromObject(this.middle), new THREE.Box3().setFromObject(this.bottom)];
        return [new THREE.Box3().setFromObject(this.head), new THREE.Box3().setFromObject(this.body)];
    },

    reset: function () {
        // console.log('reset');
        this.stop();
        this.currentSeason = 0;
        this.obj.position.y = this._config.BLOCK.height / 2;
        this.obj.position.x = this.obj.position.z = 0;
        this.obj.rotation.z = 0;
        this.obj.rotation.y = 0;
        this.obj.rotation.x = 0;
        this.bottle.rotation.y = 0;
        this.bottle.rotation.z = 0;
        this.bottle.rotation.x = 0;
        if (this.body && this.head) {
            this.body.scale.set(1, 1, 1);
            this.body.rotation.z = 0;
            this.body.rotation.x = 0;
            this.head.position.y = 0.5;
            this.head.position.x = 0;
            this.human.rotation.z = this.human.rotation.x = 0;
        }
        this.direction = 'straight';
        this.jumpStatus = 'init';
        this.double = 1;
        this.resetParticles();
        this.scoreText.obj.visible = false;
    },
};

export default Bottle;
