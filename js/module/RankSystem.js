'use strict';

import * as THREE from '../libs/three/three.min.js';
import Text from './Text.js';

// 间隔时常
// const minDistance = 0
var minDistance = 5;

// 启动步数
// const minStartDistance = 10
var minStartDistance = 2;

var AvatorRadius = 1.3;
var OuterRadius = AvatorRadius / 20 * 21;
var InnerRadius = OuterRadius - 0.5;
var AvatorY = 10;
var AnimateDuration = 0.8;
var AnimateHeight = 3;

var startScale = 0;

function roundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    return ctx;
}

function reMapUv(geometry) {
    geometry.computeBoundingBox();

    let max = geometry.boundingBox.max,
        min = geometry.boundingBox.min;
    let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    let range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    let faces = geometry.faces;

    geometry.faceVertexUvs[0] = [];

    for (let i = 0; i < faces.length; i++) {

        let v1 = geometry.vertices[faces[i].a],
            v2 = geometry.vertices[faces[i].b],
            v3 = geometry.vertices[faces[i].c];

        geometry.faceVertexUvs[0].push([new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y), new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y), new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)]);
    }
    geometry.uvsNeedUpdate = true;
}

var RankSystem = function () {
    function RankSystem(game) {
        //_classCallCheck(this, RankSystem);

        this.game = game;
        this.seed = 0;
        this.startDist = 0;

        this.hitPoint = {
            uuid: '',
            ready: false,
            texture: null
        };

        this.loader = new THREE.TextureLoader();

        this.text = new Text('超越！', {
            fillStyle: 0x252525,
            chinese: true,
            textAlign: 'center'
        });
        // this.avatorFrame = new THREE.Mesh(new THREE.PlaneGeometry(AvatorRadius * 2, AvatorRadius * 2), new THREE.MeshBasicMaterial({
        //   transparent: true,
        //   opacity: 1
        // }))

        let shape = new THREE.Shape();
        shape = roundedRect(shape, -OuterRadius, -OuterRadius, OuterRadius * 2, OuterRadius * 2, 0.5);
        let shape2 = new THREE.Shape();
        shape2 = roundedRect(shape2, -AvatorRadius, -AvatorRadius, AvatorRadius * 2, AvatorRadius * 2, 0.5);

        let geometry = new THREE.ShapeGeometry(shape2);
        reMapUv(geometry);

        this.avatorFrame = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1
        }));

        this.avatorOuter = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        }));

        this.text.obj.scale.set(0.8, 0.8, 0.8);
        this.text.obj.position.set(0, 2.2, 0.1);

        this.avatorFrame.position.set(0, 0, 0.1);
        // this.avatorFrame.scale.set(startScale, startScale, startScale)
        this.avatorFrame.material.opacity = 0;

        this.avatorOuter.position.set(0, 0, 0);
        // this.avatorOuter.scale.set(startScale, startScale, startScale)
        this.avatorOuter.material.opacity = 0;
        this.text.material.opacity = 0;

        this.obj = new THREE.Object3D();

        this.text.obj.visible = false;
        this.obj.add(this.avatorOuter);
        this.obj.add(this.avatorFrame);
        this.obj.add(this.text.obj);

        this.obj.rotateY(-Math.PI / 4);
        this.obj.rotateX(-Math.PI / 16 * 3);
        this.game.scene.add(this.obj);
        this.obj.visible = false;
    }

    return RankSystem;
}();

RankSystem.prototype = {
    update: function () {

        // 没有好友数据就不更新了
        if (!this.game.gameModel.friendsScore) {
            return;
        }
        if (!this.game.gameModel.friendsScore.length) {
            return;
        }

        // 计步器++
        this.seed++;

        if (this.hitPoint.uuid == this.game.currentBlock.obj.uuid && this.hitPoint.ready && this.hitPoint.texture) {
            if (this.startDist < minStartDistance) {
                this.startDist++;
                // this.obj.add(this.text.obj)
                this.text.obj.visible = true;
            }
            this.playAnimate();
            this.seed = 0;
        }

        // 如果开始走过的步数小于最小出现步数
        // if (this.startDist < minStartDistance) {
        //   this.startDist++
        //   return
        // }

        // 计算计步器是不是大于间隔步伐
        if (this.seed >= minDistance) {
            // if (this.game.UI.score >= this.game.heightestScore) {
            this.checkScore();
            // }
        }
        // console.log('seed', this.seed)
    },

    checkScore: function () {
        // 获取当前分数，找出下一个分数与你差别在1的人
        let score = this.game.UI.score;
        let friends = this.game.gameModel.friendsScore;

        // 遍历数组，获取人-----待优化性能
        try {
            for (let i = 0; i < friends.length; i++) {
                // !! roy 这里有风险，score_info[0]可能会是次数
                if (friends[i].week_best_score == score) {
                    this.hitPoint.uuid = this.game.nextBlock.obj.uuid;
                    this.hitPoint.ready = false;
                    // this.showAvator(friends[i])
                    this.animateAvator(friends[i]);
                    break;
                }
            }
        } catch (e) {
            console.log('RankSystem checkScore err:', e);
        }
    },

    animateAvator: function (user) {
        let _this = this;

        this.loader.load(user.headimg, function (texture) {
            if (_this.hitPoint.uuid == _this.game.nextBlock.obj.uuid) {
                _this.hitPoint.ready = true;
                texture.minFilter = THREE.LinearFilter;
                _this.hitPoint.texture = texture;
            }
        });
    },

    playAnimate: function () {
        let _this2 = this;

        /**
         * 更改加分位置
         */
        // console.log('showAvator')
        this.game.bottle.changeScorePos(3);

        let _game$bottle$obj$posi = this.game.bottle.obj.position.clone(),
            x = _game$bottle$obj$posi.x,
            z = _game$bottle$obj$posi.z;

        this.obj.position.set(x, AvatorY, z);

        this.avatorFrame.material.map = this.hitPoint.texture;

        this.obj.visible = true;

        // TweenMax.to(this.obj.position, 1.6, {
        //   y: AnimateHeight + AvatorY,
        //   // onComplete: () => {
        //   //   this.resetAvator()
        //   //   this.game.bottle.changeScorePos(0)
        //   // }
        // });

        // TweenMax.to([this.text.obj.material, this.avatorOuter.material, this.avatorFrame.material], 1.6, {
        //   opacity: 0,
        //   onComplete: () => {
        //     this.resetAvator()
        //     this.game.bottle.changeScorePos(0)
        //   }
        // });

        _animation.customAnimation.to(this.obj.position, 0.4, {
            y: AnimateHeight + AvatorY
        });
        _animation.customAnimation.to(this.text.material, 0.4, {
            opacity: 1
        });
        _animation.customAnimation.to(this.avatorOuter.material, 0.4, {
            opacity: 1
        });
        _animation.customAnimation.to(this.avatorFrame.material, 0.4, {
            opacity: 1
        });

        _animation.customAnimation.to(this.text.material, 0.4, {
            opacity: 0,
            delay: 0.6,
            onComplete: function onComplete() {
                _this2.resetAvator();
                _this2.game.bottle.changeScorePos(0);
            }
        });
        _animation.customAnimation.to(this.avatorOuter.material, 0.4, {
            opacity: 0,
            delay: 0.6
        });
        _animation.customAnimation.to(this.avatorFrame.material, 0.4, {
            opacity: 0,
            delay: 0.6
        });

        this.hitPoint.uuid = '';
        this.hitPoint.ready = false;
        this.hitPoint.texture = null;
    },

    resetAvator: function () {
        this.obj.visible = false;
        this.text.obj.visible = false;
        // this.obj.remove(this.text.obj)

        this.avatorFrame.material.opacity = 0;
        // this.avatorFrame.material.opacity = 1
        // this.avatorFrame.scale.set(startScale, startScale, startScale)
        this.avatorFrame.material.map = '';

        // this.avatorOuter.scale.set(startScale, startScale, startScale)
        this.avatorOuter.material.opacity = 0;
        // this.avatorOuter.material.opacity = 1

        // this.text.obj.material.opacity = 1
        this.text.material.opacity = 0;
    },

    reset: function () {
        this.seed = 0;
        this.seed = 0;
        this.startDist = 0;
        this.startDist = 0;
        this.hitPoint = {
            uuid: '',
            ready: false,
            texture: null
        };
        this.obj.visible = false;
    },
};

export default RankSystem;
