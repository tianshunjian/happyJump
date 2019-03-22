'use strict';

import * as THREE from '../libs/three/three.min.js';
import * as Config from '../base/Config.js';
import * as _animation from '../base/TweenAnimation.js';
import Random from '../base/Random.js';
import LoadOBJ from '../base/LoadOBJ.js';
import {ObjInfo} from '../base/Config';

var colors = {
    green: 0x619066,
    white: 0xeeeeee,
    lightGreen: 0x7ba980,
    gray: 0x9e9e9e,
    black: 0x6d6d6d,
    lightGray: 0xdbdbdb,
    lightBlack: 0xcbcbcb,
    brown: 0x676767,
    middleLightGreen: 0x774a379,
    middleLightGray: 0xbbbbbb,
    middleLightBlack: 0x888888
};

// let biggerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2 + 0.02, Config.BLOCK.height + 0.04, Config.BLOCK.radius * 2 + 0.02);
// let staticGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, Config.BLOCK.height, Config.BLOCK.radius * 2);
var shadowGeometry = new THREE.PlaneGeometry(11, 11);
// let stripeMaterial = new THREE.MeshBasicMaterial({map: Config.loader.load('res/img/stripe.png')});
// let customMaterial = Config.GAME.canShadow ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial;


var Block = function () {
    function Block(type, number,cb,activityName) {
        let _this = this;
        // _classCallCheck(this, Block);

        //this.radiusSegments = BLOCK.radiusSegments[Math.floor(Math.random() * BLOCK.radiusSegments.length)];
        //this.geometry = new THREE.CylinderGeometry(BLOCK.radius, BLOCK.radius, BLOCK.height, this.radiusSegments);
        //this.colors = ['pink', 'cyan', 'yellowBrown', 'purple', 'orange'];
        //this.material = new THREE.MeshLambertMaterial({ color: COLORS[this.colors[Math.floor(5 * Math.random())]], shading: THREE.FlatShading });
        //this.obj = new THREE.Mesh(this.geometry, this.material);
        //this.obj.castShadow = true;
        this.radius = Config.BLOCK.radius;
        this.status = 'stop';
        this.scale = 1;
        this.type = 'green';
        this.types = ['green', 'black', 'gray'];
        this.radiusScale = 1;
        //this.obj.castShadow = true;
        //this.obj.receiveShadow = true;
        //if (this.radiusSegments === 4) this.obj.rotation.y = Math.PI / 4;
        //this.obj.scale.set(this.radiusScale, 1, this.radiusScale);

        this.height = Config.BLOCK.height-0.5;

        this.obj = new THREE.Object3D();
        this.obj.name = 'block';
        this.body = new THREE.Object3D();
        if (type <= 8 || type == 27) {
            this.greenMaterial = new THREE.MeshLambertMaterial({color: colors.green});
            this.whiteMaterial = new THREE.MeshLambertMaterial({color: colors.white});
        }
        this.shadowWidth = 11;

        // if (type == 2 || type == 7) {
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.desk_shadow);
        //     this.shadow.position.set(0, -this.height / 2 - 0.001 * type, -4.5);
        //     this.shadow.scale.y = 1.2;
        // } else if (type == 3 || type == 21 || type == 27 || type == 28 || type == 29 || type == 31) {
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.cylinder_shadow);
        //     this.shadow.position.set(-0.1, -this.height / 2 - 0.001 * type, -2.8);
        //     this.shadow.scale.y = 1.4;
        //     this.shadow.scale.x = 1;
        // }else if (type==100 || type==201 || type==300 || type==409){
        //     // 0
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.desk_shadow);
        //     this.shadow.position.set(-0.6, -this.height / 2 - 0.001, -3.5);
        //     this.shadow.scale.y = 1.1;
        //     this.shadow.scale.x = 1.0;
        //     this.shadow.scale.z = 0.8;
        // }else if(type>=1000&&type<=1002 || type>=101&&type<=104 || type>=204&&type<=208 || type==210 || type==211 || type>=303&&type<=306 || type==309 || type==310 || type>=400&&type<=405 || type==408 || type>=500&&type<=502 || type == 602|| type == 603|| type>=606&&type<=612){
        //     // 1
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.5, -this.height / 2-0.01 , -2.73);
        //     this.shadow.scale.y = 1.2;
        // }else if(type==105 || type==209){
        //     // 2
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.huaban_shadow);
        //     this.shadow.position.set(-0.5, -this.height / 2-0.01 , -5.0);
        //     this.shadow.scale.y = 0.8;
        //     this.shadow.scale.x = 0.8;
        //     // this.shadow.rotation.y = -Math.PI/2;
        // } else if(type==106 || type == 107 || type==308 || type==407){
        //     // 3
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.5, -this.height / 2-0.01 , -2.8);
        //     this.shadow.scale.y = 1.2;
        //     this.shadow.scale.z = 1.0;
        //     this.shadow.scale.x = 1.0;
        // }else if(type==307){
        //     // 4
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.5, -this.height / 2-0.01 , -3.6);
        //     this.shadow.scale.y = 1.2;
        //     this.shadow.scale.z = 1.0;
        //     this.shadow.scale.x = 1.0;
        // } else if(type==108 || type==406){
        //     // 5
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.2, -this.height / 2-0.01 , -2.8);
        //     this.shadow.scale.y = 1.2;
        //     this.shadow.scale.z = 1.0;
        //     this.shadow.scale.x = 1.0;
        // }else if(type==110 ){
        //     // 6
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.3, -this.height / 2-0.01 , -2.2);
        //     this.shadow.scale.y = 1.2;
        //     this.shadow.scale.x = 1.0;
        // } else if (type == 1003 || type==109|| type==111 || type==200 || type==202 || type==203 || type==301 ||type==302 || type==410 || type==411 || type==503 || type==504|| type == 601 || type==604|| type==605){
        //     // 7
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.cylinder_shadow);
        //     this.shadow.position.set(-0.4, -this.height / 2 - 0.001 , -2.6);
        //     this.shadow.scale.y = 1.2;
        //     this.shadow.scale.x = 1.0;
        // } else {
        //     this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
        //     this.shadow.position.set(-0.74, -this.height / 2 - 0.001 * type, -2.73);
        //     this.shadow.scale.y = 1.4;
        // }

        // 阴影
        let objInfo = this.getObjInfo4Type(type);
        let posX = objInfo.posX, posZ = objInfo.posZ;
        switch (objInfo.shadow){
        case 0:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.desk_shadow);
            this.shadow.position.set(-0.6, -this.height / 2 - 0.001, -3.5);
            this.shadow.scale.y = 1.1;
            this.shadow.scale.z = 0.8;
            break;
        case 1:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.5, -this.height / 2-0.01 , -2.73);
            this.shadow.scale.y = 1.2;
            break;
        case 2:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.huaban_shadow);
            this.shadow.position.set(-0.5, -this.height / 2-0.01 , -5.0);
            this.shadow.scale.y = 0.8;
            this.shadow.scale.x = 0.8;
            break;
        case 3:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.5, -this.height / 2-0.01 , -2.8);
            this.shadow.scale.y = 1.2;
            break;
        case 4:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.5, -this.height / 2-0.01 , -3.6);
            this.shadow.scale.y = 1.2;
            break;
        case 5:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.2, -this.height / 2-0.01 , -2.8);
            this.shadow.scale.y = 1.2;
            break;
        case 6:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.3, -this.height / 2-0.01 , -2.2);
            this.shadow.scale.y = 1.2;
            break;
        case 7:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.cylinder_shadow);
            this.shadow.position.set(-0.4, -this.height / 2 - 0.001 , -2.6);
            this.shadow.scale.y = 1.2;
            break;
        default:
            this.shadow = new THREE.Mesh(shadowGeometry, Config.shadow);
            this.shadow.position.set(-0.5, -this.height / 2-0.01 , -2.73);
            this.shadow.scale.y = 1.2;
        }


        this.isEntry = objInfo.extraInfo.isEntry;//是否是活动的入口
        this.season = objInfo.seasonName;//季节名称

        this.shadow.rotation.x = -Math.PI / 2;
        this.order = type;
        this.radiusSegments = 4;
        this.canChange = true;
        this._random = Random;

        //console.log('in Block constructor, type = ' + type + "; num = " + number);
        // if (type == 0) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let innerHeight = 3;
        //     let outerHeight = (Config.BLOCK.height - innerHeight) / 2;
        //     let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
        //     this.geometry = outerGeometry;
        //     let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
        //     this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
        //         x: 0,
        //         y: innerHeight / 2 + outerHeight / 2,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 1) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let bottomHeight = Config.BLOCK.height / 5;
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, bottomHeight, Config.BLOCK.radius * 2);
        //     this.geometry = geometry;
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}, {x: 0, y: -2 * bottomHeight, z: 0}, {
        //         x: 0,
        //         y: 2 * bottomHeight,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, geometry, 1, [{x: 0, y: -bottomHeight, z: 0}, {x: 0, y: bottomHeight, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 2) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.radiusSegments = 50;
        //     let bottomHeight = 5;
        //     let topHeight = Config.BLOCK.height - bottomHeight;
        //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 4, Config.BLOCK.radius - 2, bottomHeight, 50);
        //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
        //     this.geometry = topGeometry;
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -(Config.BLOCK.height - bottomHeight) / 2, z: 0}]);
        //     this.merge(totalGeometry, topGeometry, 0, [{
        //         x: 0,
        //         y: bottomHeight + topHeight / 2 - Config.BLOCK.height / 2,
        //         z: 0
        //     }]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 3) {
        //     this.radiusSegments = 50;
        //     this.middleLightGreenMaterial = new THREE.MeshLambertMaterial({color: colors.middleLightGreen});
        //     let materials = [this.greenMaterial, this.whiteMaterial, this.middleLightGreenMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let bottomHeight = 5;
        //     let topHeight = Config.BLOCK.height - bottomHeight;
        //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, bottomHeight, 50);
        //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
        //     this.geometry = topGeometry;
        //     let ringGeometry = new THREE.RingGeometry(Config.BLOCK.radius * 0.6, Config.BLOCK.radius * 0.8, 30);
        //     ringGeometry.rotateX(-Math.PI / 2);
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -(Config.BLOCK.height - bottomHeight) / 2, z: 0}]);
        //     this.merge(totalGeometry, topGeometry, 0, [{
        //         x: 0,
        //         y: bottomHeight + topHeight / 2 - Config.BLOCK.height / 2,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, ringGeometry, 2, [{x: 0, y: Config.BLOCK.height / 2 + 0.01, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 4) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let geometry = staticGeometry;
        //     this.geometry = geometry;
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     let ringGeometry = new THREE.RingGeometry(1, 2, 30, 1);
        //     this.merge(totalGeometry, ringGeometry, 1, [{x: 0, y: 0, z: Config.BLOCK.radius + 0.01}]);
        //     ringGeometry.rotateY(-Math.PI / 2);
        //     this.merge(totalGeometry, ringGeometry, 1, [{x: -Config.BLOCK.radius - 0.01, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 5) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let innerHeight = 3;
        //     let outerHeight = (Config.BLOCK.height - innerHeight) / 2;
        //     let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
        //     let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
        //     this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
        //         x: 0,
        //         y: innerHeight / 2 + outerHeight / 2,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 6) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let innerHeight = 3;
        //     let outerHeight = (Config.BLOCK.height - innerHeight) / 2;
        //     let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
        //     let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
        //     this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
        //         x: 0,
        //         y: innerHeight / 2 + outerHeight / 2,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 7) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.radiusSegments = 50;
        //     let bottomHeight = 5;
        //     let topHeight = Config.BLOCK.height - bottomHeight;
        //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 4, Config.BLOCK.radius - 2, bottomHeight, 50);
        //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
        //     this.geometry = topGeometry;
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -(Config.BLOCK.height - bottomHeight) / 2, z: 0}]);
        //     this.merge(totalGeometry, topGeometry, 0, [{
        //         x: 0,
        //         y: bottomHeight + topHeight / 2 - Config.BLOCK.height / 2,
        //         z: 0
        //     }]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 8) {
        //     let materials = [this.greenMaterial, this.whiteMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let bottomHeight = Config.BLOCK.height / 5;
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, bottomHeight, Config.BLOCK.radius * 2);
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}, {x: 0, y: -2 * bottomHeight, z: 0}, {
        //         x: 0,
        //         y: 2 * bottomHeight,
        //         z: 0
        //     }]);
        //     this.merge(totalGeometry, geometry, 1, [{x: 0, y: -bottomHeight, z: 0}, {x: 0, y: bottomHeight, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 9) {
        //     let pinkMaterial = new THREE.MeshLambertMaterial({color: 0xed7c38});
        //     let planeMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/game.png'),
        //         transparent: true
        //     });
        //     let materials = [pinkMaterial, planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let geometry = staticGeometry;
        //     this.geometry = geometry;
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, new THREE.PlaneGeometry(5, 5), 1, [{
        //         x: 0,
        //         y: 0.1,
        //         z: Config.BLOCK.radius + 0.01
        //     }]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 10) {
        //     let yellowMaterial = new THREE.MeshLambertMaterial({color: 0xfbe65e});
        //     let planeMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/emotion.png'),
        //         transparent: true
        //     });
        //     let materials = [yellowMaterial, planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     let geometry = staticGeometry;
        //     let faceGeometry = new THREE.CylinderGeometry(2, 2, 1, 50);
        //     let planeGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        //     this.geometry = geometry;
        //     //let yellowLambertMaterial = new THREE.MeshLambertMaterial({ color: 0xfbe65e });
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     faceGeometry.rotateX(Math.PI / 2);
        //     this.merge(totalGeometry, faceGeometry, 0, [{x: 0, y: 0, z: Config.BLOCK.radius + 0.51}]);
        //     faceGeometry.rotateZ(Math.PI / 2);
        //     faceGeometry.rotateY(Math.PI / 2);
        //     this.merge(totalGeometry, faceGeometry, 0, [{x: -Config.BLOCK.radius - 0.51, y: 0, z: 0}]);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0, y: 0, z: Config.BLOCK.radius + 1.02}]);
        //     planeGeometry.rotateY(-Math.PI / 2);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: -Config.BLOCK.radius - 1.02, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 11) {
        //     let geometry = staticGeometry;
        //     let earGeometry = new THREE.BoxGeometry(3, 2, 4);
        //     this.geometry = geometry;
        //     let greenMaterial = new THREE.MeshLambertMaterial({color: 0xb4e842});
        //     let planeMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/green_face.png'),
        //         transparent: true
        //     });
        //     let planeGeometry = new THREE.PlaneGeometry(6, 3);
        //     let materials = [greenMaterial, planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0.5, y: -1, z: Config.BLOCK.radius + 0.01}]);
        //     earGeometry.rotateZ(Math.PI / 5);
        //     this.merge(totalGeometry, earGeometry, 0, [{x: -Config.BLOCK.radius - 1, y: 1, z: 2.5}]);
        //     earGeometry.rotateZ(-2 * Math.PI / 5);
        //     this.merge(totalGeometry, earGeometry, 0, [{x: Config.BLOCK.radius, y: 1, z: 2.5}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 12) {
        //     let geometry = staticGeometry;
        //     let earGeometry = new THREE.BoxGeometry(3, 2, 4);
        //     this.geometry = geometry;
        //     let greenMaterial = new THREE.MeshLambertMaterial({color: 0xf2f2f2});
        //     let planeMaterial = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/white_face.png')
        //     });
        //     let planeGeometry = new THREE.PlaneGeometry(6, 3);
        //     let materials = [greenMaterial, planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0.5, y: -1, z: Config.BLOCK.radius + 0.01}]);
        //     earGeometry.rotateZ(Math.PI / 5);
        //     this.merge(totalGeometry, earGeometry, 0, [{x: -Config.BLOCK.radius - 1, y: 1, z: 2.5}]);
        //     earGeometry.rotateZ(-2 * Math.PI / 5);
        //     this.merge(totalGeometry, earGeometry, 0, [{x: Config.BLOCK.radius, y: 1, z: 2.5}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 13) {
        //     let geometry = staticGeometry;
        //     this.geometry = geometry;
        //     let planeMaterial = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/money.png')
        //     });
        //     let planeGeometry = new THREE.PlaneGeometry(3, 3);
        //     let materials = [planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.mapUv(64, 64, geometry, 1, 2, 2, 4, 4);
        //     this.mapUv(64, 64, geometry, 2, 2, 2, 4, 4);
        //     this.mapUv(64, 64, geometry, 4, 2, 2, 4, 4);
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, planeGeometry, 0, [{x: 0, y: 0, z: Config.BLOCK.radius + 0.01}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 14) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     this.geometry = geometry;
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/tit.png')
        //     });
        //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
        //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
        //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
        //
        //     this.hitObj = new THREE.Mesh(geometry, material);
        //
        //     // let materials = [material,  new THREE.ShadowMaterial({ transparent: true, color: 0x000000, opacity: 0.3, })];
        //     // let totalGeometry = new THREE.Geometry();
        //     // this.merge(totalGeometry, geometry, 0, [{ x: 0, y: 0, z: 0 }]);
        //     // let planeGeometry = new THREE.PlaneGeometry(BLOCK.radius * 2, BLOCK.radius * 2);
        //     // planeGeometry.rotateX(-Math.PI / 2);
        //     // this.merge(totalGeometry, planeGeometry, 1, [{ x: 0, y: BLOCK.height / 2 + 0.1, z: 0 }]);
        //     // this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 15) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     this.map = Config.loader.load('res/img/bag.png');
        //     let material = new THREE.MeshLambertMaterial({
        //         map: this.map
        //     });
        //     this.glowMap = Config.loader.load('res/img/glow_bag.png');
        //     this.hitObj = new THREE.Mesh(geometry, material);
        // } else if (type == 16) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/dict.png')
        //     });
        //     this.mapUv(428, 428, geometry, 1, 0, 148, 280, 0);
        //     this.mapUv(428, 428, geometry, 2, 0, 148, 280, 428); //top
        //     this.mapUv(428, 428, geometry, 4, 280, 148, 428, 428); //right
        //     this.hitObj = new THREE.Mesh(geometry, material);
        // } else if (type == 17) {
        //     this.height /= 3;
        //     let topMaterial = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/box_top.png')
        //     });
        //     let bottomMaterial = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/box_bottom.png')
        //     });
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     this.geometry = geometry;
        //     let middleGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     let materials = [topMaterial, bottomMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.mapUv(198, 198, geometry, 1, 0, 0, 148, 50);
        //     this.mapUv(198, 198, geometry, 2, 0, 50, 148, 198); //top
        //     this.mapUv(198, 198, geometry, 4, 148, 50, 198, 198); //right
        //
        //     this.mapUv(444, 50, middleGeometry, 4, 148, 0, 296, 50, true);
        //     this.mapUv(444, 50, middleGeometry, 1, 0, 0, 148, 50);
        //     this.mapUv(444, 50, middleGeometry, 2, 0, 0, 1, 1); //top
        //     this.mapUv(444, 50, middleGeometry, 0, 296, 50, 444, 0);
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, middleGeometry, 1, [{x: 0, y: -2 * this.height, z: 0}]);
        //
        //     let middleMaterial = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/box_middle.png')
        //     });
        //     this.middle = new THREE.Mesh(middleGeometry, middleMaterial);
        //     this.middle.position.y = -this.height;
        //     this.body.add(this.middle);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 18) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/express.png')
        //     });
        //     this.mapUv(428, 428, geometry, 1, 0, 0, 280, 148);
        //     this.mapUv(428, 428, geometry, 2, 0, 148, 280, 428); //top
        //     this.mapUv(428, 428, geometry, 4, 280, 148, 428, 428); //right
        //     this.hitObj = new THREE.Mesh(geometry, material);
        // } else if (type == 19) {
        //     this.min = 0.9;
        //     this.height = Config.BLOCK.height / 21 * 4;
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height + 0.1, Config.BLOCK.radius * 2);
        //     this.geometry = geometry;
        //     let material = new THREE.MeshLambertMaterial({
        //         color: 0xffffff,
        //         transparent: true,
        //         opacity: 0.3
        //     });
        //     let bottomGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2.05, Config.BLOCK.height / 21 * 17, Config.BLOCK.radius * 2.05);
        //     let bottomMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/sing.png')
        //     });
        //     let materials = [material, bottomMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.mapUv(416, 416, bottomGeometry, 1, 0, 0, 256, 160);
        //     this.mapUv(416, 416, bottomGeometry, 2, 0, 160, 256, 416); //top
        //     this.mapUv(416, 416, bottomGeometry, 4, 256, 160, 416, 416); //right
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -Config.BLOCK.height / 21 * 10.5, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     this.record = new THREE.Object3D();
        //
        //     this.record.add(new THREE.Mesh(new THREE.CylinderGeometry(Config.BLOCK.radius * 0.9, Config.BLOCK.radius * 0.9, 0.4, 50), new THREE.MeshBasicMaterial({color: 0x2c2c2c})));
        //     let planeGeometry = new THREE.CircleGeometry(Config.BLOCK.radius * 0.9, 40);
        //     let planeMaterial = new THREE.MeshBasicMaterial({map: Config.loader.load('res/img/record.png')});
        //     let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        //     plane.rotation.x = -Math.PI / 2;
        //     plane.position.y = 0.26;
        //     this.record.add(plane);
        //     this.body.add(this.record);
        //     let planeGeometry = new THREE.PlaneGeometry(2, 2);
        //     this.musicIcon = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/music_icon.png'),
        //         transparent: true
        //     }));
        //     this.musicIcon.position.set(0, 0, 0);
        //     this.musicIcon.rotation.y = -Math.PI / 4;
        //     this.musicIcon.rotation.x = -Math.PI / 5;
        //     this.musicIcon.rotation.z = -Math.PI / 5;
        //     this.musicIcon.visible = false;
        //     this.secondMusicIcon = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/music_icon_two.png'),
        //         transparent: true
        //     }));
        //     this.secondMusicIcon.rotation.y = -Math.PI / 4;
        //     this.secondMusicIcon.rotation.x = -Math.PI / 5;
        //     this.secondMusicIcon.rotation.z = -Math.PI / 5;
        //     this.secondMusicIcon.visible = false;
        //     this.icons = [];
        //     this.icons.push(this.musicIcon, this.secondMusicIcon);
        //     for (let i = 0; i < 2; ++i) {
        //         this.body.add(this.icons[i]);
        //     }
        // } else if (type == 20) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2 / 38 * 48);
        //     this.geometry = geometry;
        //     this.shadow.scale.set(1, 61 / 38, 48 / 38);
        //     //this.shadow.position.z += ;
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/disk.png')
        //     });
        //     let darkMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/disk_dark.png'),
        //         transparent: true
        //     });
        //     let planeGeometry = new THREE.PlaneGeometry(3, 3);
        //     let materials = [darkMaterial, material];
        //     let totalGeometry = new THREE.Geometry();
        //     this.mapUv(236, 300, geometry, 1, 0, 250, 10, 260);
        //     this.mapUv(236, 300, geometry, 2, 0, 300, 236, 0); //top
        //     this.mapUv(236, 300, geometry, 4, 0, 250, 10, 260); //right
        //     this.merge(totalGeometry, geometry, 1, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, planeGeometry, 0, [{x: 3.5, y: 0.5, z: Config.BLOCK.radius / 38 * 48 + 0.01}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     this.plane = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/disk_light.png'),
        //         transparent: true
        //     }));
        //     this.plane.position.set(3.5, 0.5, Config.BLOCK.radius / 38 * 48 + 0.03);
        //     this.plane.updateMatrix();
        //     this.plane.matrixAutoUpdate = false;
        //     this.body.add(this.plane);
        //     this.timer = setInterval(function () {
        //         _this.plane.visible = !_this.plane.visible;
        //     }, 1000);
        // } else if (type == 21) {
        //     this.radiusSegments = 50;
        //     this.min = 0.8;
        //     this.height = Config.BLOCK.height / 21 * 4;
        //     let geometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 0.7, Config.BLOCK.radius * 0.8, this.height, 50);
        //     this.geometry = geometry;
        //     let planeGeometry = new THREE.CircleGeometry(Config.BLOCK.radius * 0.7, 50);
        //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 0.7, Config.BLOCK.radius * 0.5, Config.BLOCK.height / 21 * 17, 50);
        //     let material = new THREE.MeshBasicMaterial({color: 0x4d4d4d});
        //     let planeMaterial = new THREE.MeshLambertMaterial({map: Config.loader.load('res/img/westore_desk.png')});
        //     let bottomMaterial = new THREE.MeshBasicMaterial({map: Config.loader.load('res/img/westore.png')});
        //     this.shadow.scale.set(0.55, 0.9, 0.7);
        //     let materials = [material, bottomMaterial, planeMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     bottomGeometry.rotateY(2.3);
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -Config.BLOCK.height / 21 * 10.5, z: 0}]);
        //     planeGeometry.rotateX(-Math.PI / 2);
        //     planeGeometry.rotateY(-0.7);
        //     this.merge(totalGeometry, planeGeometry, 2, [{x: 0, y: this.height / 2 + 0.01, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 22) {
        //     this.height = Config.BLOCK.height / 21 * 6;
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2.1, this.height, Config.BLOCK.radius * 2.1);
        //     this.geometry = geometry;
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/gift.png')
        //     });
        //     let bottomGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, Config.BLOCK.height / 21 * 15, Config.BLOCK.radius * 2);
        //     let bottomMaterial = new THREE.MeshLambertMaterial({
        //         color: 0xb193f5
        //     });
        //     this.mapUv(300, 370, geometry, 1, 0, 0, 300, 70);
        //     this.mapUv(300, 370, geometry, 2, 0, 70, 300, 370); //top
        //     this.mapUv(300, 370, geometry, 4, 0, 0, 300, 70, true); //right
        //     let materials = [material, bottomMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -Config.BLOCK.height / 21 * 10.5, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 23) {
        //     this.height = Config.BLOCK.height / 21 * 5;
        //     let geometry = new THREE.Geometry();
        //     let deskGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2 / 38 * 40);
        //     geometry.merge(deskGeometry);
        //     this.shadow.scale.set(1, 48 / 38, 48 / 38);
        //     let legGeometry = new THREE.BoxGeometry(1.5, 3.5, 1.5);
        //     legGeometry.rotateZ(-0.3);
        //     legGeometry.vertices[7].y -= 0.4;
        //     legGeometry.vertices[6].y -= 0.4;
        //     legGeometry.translate(-4, -3, -3.5);
        //     geometry.merge(legGeometry);
        //     legGeometry.vertices[6].y += 0.5;
        //     legGeometry.translate(0, 0, 7);
        //     legGeometry.rotateX(-0.2);
        //     geometry.merge(legGeometry);
        //     legGeometry.vertices[7].y += 0.4;
        //     legGeometry.translate(5, -1, 0);
        //     legGeometry.rotateZ(0.4);
        //     geometry.merge(legGeometry);
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/stool.png')
        //     });
        //     this.hitObj = new THREE.Mesh(geometry, material);
        //     this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(this.shadowWidth, this.shadowWidth), new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/stool_shadow.png'),
        //         transparent: true,
        //         alphaTest: 0.01
        //     }));
        //     this.shadow.position.set(-0.76, -Config.BLOCK.height / 2 - 0.001 * type, -3.6);
        //     this.shadow.scale.y = 1.4;
        //     this.shadow.scale.x = 0.9;
        //     this.shadow.rotation.x = -Math.PI / 2;
        // } else if (type == 24) {
        //     this.height = Config.BLOCK.height / 21 * 6;
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2 / 38 * 45, this.height, Config.BLOCK.radius * 2 / 38 * 45);
        //     this.geometry = geometry;
        //     let bottomGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2 / 38 * 40, Config.BLOCK.height / 21 * 15, Config.BLOCK.radius * 2 / 38 * 40);
        //     this.shadow.scale.set(40 / 38, 1.4, 1);
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/store_top.png')
        //     });
        //     let bottomMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/store_bottom.png'),
        //         transparent: true
        //     });
        //     let planeMaterial = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/indoor.png'),
        //         transparent: true
        //     });
        //     let materials = [material, bottomMaterial, planeMaterial];
        //     let planeGeometry = new THREE.PlaneGeometry(3.1, 3.1);
        //     let totalGeometry = new THREE.Geometry();
        //     this.mapUv(340, 340, geometry, 1, 0, 0, 280, 60);
        //     this.mapUv(340, 340, geometry, 2, 0, 60, 280, 340); //top
        //     this.mapUv(340, 340, geometry, 4, 280, 60, 340, 340); //right
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     this.mapUv(434, 164, bottomGeometry, 1, 0, 0, 217, 164);
        //     this.mapUv(434, 164, bottomGeometry, 4, 217, 0, 434, 164, true); //right
        //     this.merge(totalGeometry, bottomGeometry, 1, [{x: 0, y: -Config.BLOCK.height / 21 * 10.5, z: 0}]);
        //     planeGeometry.rotateY(-Math.PI / 2);
        //     this.merge(totalGeometry, planeGeometry, 2, [{
        //         x: -Config.BLOCK.radius / 38 * 40 - 0.01,
        //         y: -3.3,
        //         z: -2.5
        //     }]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     let doorGeometry = new THREE.PlaneGeometry(1.55, 3.1);
        //     this.door = new THREE.Mesh(doorGeometry, new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/door.png'),
        //         transparent: true
        //     }));
        //     this.door.rotation.y = -Math.PI / 2;
        //     this.door.position.set(-Config.BLOCK.radius / 38 * 40 - 0.02, -3.3, -3.3);
        //     this.body.add(this.door);
        //     this.secondDoor = new THREE.Mesh(doorGeometry, new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/second_door.png'),
        //         transparent: true
        //     }));
        //     this.secondDoor.rotation.y = -Math.PI / 2;
        //     this.secondDoor.position.set(-Config.BLOCK.radius / 38 * 40 - 0.02, -3.3, -1.7);
        //     this.body.add(this.secondDoor);
        //     // this.shadow.position.x += 0.6;
        //     // this.shadow.position.z += 1;
        // } else if (type == 25) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     this.geometry = geometry;
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/clock.png')
        //     });
        //     this.mapUv(320, 200, geometry, 1, 0, 0, 5, 5);
        //     this.mapUv(320, 200, geometry, 2, 0, 0, 5, 5); //top
        //     this.mapUv(320, 200, geometry, 4, 0, 200, 320, 0, true); //right
        //     let buttonMaterial = stripeMaterial;
        //     let buttonGeometry = new THREE.CylinderGeometry(1, 1, 1, 30);
        //     let materials = [material, buttonMaterial];
        //     let totalGeometry = new THREE.Geometry();
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     buttonGeometry.rotateZ(Math.PI / 2);
        //     this.merge(totalGeometry, buttonGeometry, 1, [{x: -Config.BLOCK.radius - 0.5, y: 0, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     this.plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/point.png'),
        //         transparent: true
        //     }));
        //     this.plane.position.set(0, 0, Config.BLOCK.radius + 0.04);
        //     this.body.add(this.plane);
        //     this.timer = setInterval(function () {
        //         _this.plane.visible = !_this.plane.visible;
        //     }, 1000);
        //     this.numbers = [];
        //     let numberGeometry = new THREE.PlaneGeometry(3, 3);
        //     for (let i = 0; i < 10; ++i) {
        //         let clockNumberMaterial = new THREE.MeshBasicMaterial({
        //             map: Config.loader.load('res/img/' + i + '.png'),
        //             alphaTest: 0.5
        //         });
        //         let arr = [];
        //         for (let j = 0; j < 4; ++j) {
        //             let time = new THREE.Mesh(numberGeometry, clockNumberMaterial);
        //             time.position.z = Config.BLOCK.radius + 0.01;
        //             time.visible = false;
        //             arr.push(time);
        //             this.body.add(time);
        //         }
        //         this.numbers.push(arr);
        //     }
        //     let date = new Date();
        //     let hour = ('0' + date.getHours()).slice(-2);
        //     let minute = ('0' + date.getMinutes()).slice(-2);
        //     this.numbers[hour[0]][0].position.x = -3.2 * this.radiusScale;
        //     this.numbers[hour[0]][0].visible = true;
        //     this.numbers[hour[1]][1].position.x = -1.3 * this.radiusScale;
        //     this.numbers[hour[1]][1].visible = true;
        //     this.numbers[minute[0]][2].position.x = 1.3 * this.radiusScale;
        //     this.numbers[minute[0]][2].visible = true;
        //     this.numbers[minute[1]][3].position.x = 3.2 * this.radiusScale;
        //     this.numbers[minute[1]][3].visible = true;
        // } else if (type == 26) {
        //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
        //     let material = new THREE.MeshLambertMaterial({
        //         map: Config.loader.load('res/img/well.png')
        //     });
        //     this.mapUv(280, 428, geometry, 1, 0, 0, 280, 148);
        //     this.mapUv(280, 428, geometry, 2, 0, 148, 280, 428); //top
        //     this.mapUv(280, 428, geometry, 4, 0, 0, 280, 148, true); //right
        //     this.hitObj = new THREE.Mesh(geometry, material);
        // } else if (type == 27) {
        //     this.radiusSegments = 50;
        //     let geometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 2 / 38 * 25, Config.BLOCK.radius * 2 / 38 * 25, this.height, 50);
        //     this.geometry = geometry;
        //     this.shadow.scale.set(50 / 38, 50 / 38, 50 / 38);
        //     let material = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/golf_bottom.png')
        //     });
        //     let planeGeometry = new THREE.CircleGeometry(Config.BLOCK.radius * 2 / 38 * 25 + 0.01, 30);
        //     let planeMaterial = new customMaterial({map: Config.loader.load('res/img/golf_top.png')});
        //     let totalGeometry = new THREE.Geometry();
        //     let materials = [material, planeMaterial];
        //     geometry.rotateY(3);
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     planeGeometry.rotateX(-Math.PI / 2);
        //     planeGeometry.rotateY(-0.7);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0, y: this.height / 2 + 0.01, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     this.sphere = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 10), this.whiteMaterial);
        //     this.sphere.position.set(-8, -1, -1.5);
        //     this.obj.add(this.sphere);
        // } else if (type == 28) {
        //     this.radiusSegments = 50;
        //     let geometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 2 / 38 * 15, Config.BLOCK.radius * 2 / 38 * 15, this.height, 50);
        //     this.geometry = geometry;
        //     this.shadow.scale.set(30 / 38, 30 / 38, 30 / 38);
        //     let material = new THREE.MeshBasicMaterial({
        //         map: Config.loader.load('res/img/paper_bottom.png')
        //     });
        //     let planeGeometry = new THREE.CircleGeometry(Config.BLOCK.radius * 2 / 38 * 15 + 0.01, 30);
        //     let planeMaterial = new customMaterial({map: Config.loader.load('res/img/paper_top.png')});
        //     let totalGeometry = new THREE.Geometry();
        //     let materials = [material, planeMaterial];
        //     geometry.rotateY(4);
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     planeGeometry.rotateX(-Math.PI / 2);
        //     planeGeometry.rotateY(-0.7);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0, y: this.height / 2 + 0.01, z: 0}]);
        //     this.shadow.scale.y = 1.1;
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        // } else if (type == 29) {
        //     this.radiusSegments = 50;
        //     this.min = 0.8;
        //     this.height = Config.BLOCK.height / 21 * 4;
        //     let geometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 0.4, Config.BLOCK.radius * 0.4, this.height, 50);
        //     this.geometry = geometry;
        //     let material = stripeMaterial;
        //     let planeGeometry = new THREE.CircleGeometry(Config.BLOCK.radius * 0.4, 50);
        //     let planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
        //     let middleGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 0.4, Config.BLOCK.radius * 0.5, Config.BLOCK.height / 21 * 1, 50);
        //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius * 0.5, Config.BLOCK.radius * 0.5, Config.BLOCK.height / 21 * 16, 50);
        //     let bottomMaterial = new THREE.MeshBasicMaterial({map: Config.loader.load('res/img/medicine.png')});
        //     let totalGeometry = new THREE.Geometry();
        //     let materials = [material, planeMaterial, bottomMaterial];
        //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
        //     planeGeometry.rotateX(-Math.PI / 2);
        //     this.merge(totalGeometry, planeGeometry, 1, [{x: 0, y: this.height / 2 + 0.01, z: 0}]);
        //     this.merge(totalGeometry, middleGeometry, 1, [{x: 0, y: -Config.BLOCK.height / 21 * 2.5, z: 0}]);
        //     bottomGeometry.rotateY(2.3);
        //     this.merge(totalGeometry, bottomGeometry, 2, [{x: 0, y: -Config.BLOCK.height / 21 * 11, z: 0}]);
        //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
        //     this.shadow.scale.set(0.55, 0.9, 0.7);
        // }
        // else
        if(type>=100){
            this.canChange = false;
            // if (type==100){
            //     //春季 dengzi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 50;
            //     let material = new THREE.MeshLambertMaterial({color: 0x40d0be});
            //     let materials = [material];
            //     let totalGeometry = new THREE.Geometry();
            //     let bottomHeight = 3.8;
            //     let topHeight = this.height - bottomHeight;
            //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 3, Config.BLOCK.radius - 2, bottomHeight, 50);
            //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
            //     this.geometry = topGeometry;
            //     this.merge(totalGeometry, bottomGeometry, 0, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
            //     this.merge(totalGeometry, topGeometry, 0, [{
            //         x: 0,
            //         y: bottomHeight + topHeight / 2 - this.height / 2,
            //         z: 0
            //     }]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            //     this.body.position.z = -0.15;
            //     this.body.position.x = 0.3;
            // }
            // else if (type==101){
            //     //春季 hezi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material = new THREE.MeshLambertMaterial({color: 0xffffff});
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
            //     this.geometry = geometry;
            //     this.hitObj = new THREE.Mesh(geometry,material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            // else
            if(type==102){
                //春季 hezi2
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xfec329});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 1.2;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                // this.body.position.z = 0.1;
            }else if (type==103){
                //春季 hezi3
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0x61dc8f});
                let materials = [material0,material1];
                let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
                this.geometry = geometry;
                let perW = Config.BLOCK.radius*2/10;
                let green1 = new THREE.BoxGeometry(perW*4,this.height,perW);
                let green2 = new THREE.BoxGeometry(perW,this.height,perW*4);
                let green3 = new THREE.BoxGeometry(perW*8,this.height,perW);
                let green4 = new THREE.BoxGeometry(perW,this.height,perW*8);

                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry, green1, 1, [{x:0, y:0.01, z:perW*3/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*3/2
                }]);
                this.merge(totalGeometry, green2, 1, [{x:-perW*3/2, y:0.01, z:0}, {
                    x: perW*3/2,
                    y: 0.01,
                    z: 0
                }]);
                this.merge(totalGeometry, green3, 1, [{x:0, y:0.01, z:perW*7/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*7/2
                }]);
                this.merge(totalGeometry, green4, 1, [{x:-perW*7/2, y:0.01, z:0}, {
                    x: perW*7/2,
                    y: 0.01,
                    z: 0
                }]);

                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
                this.body.position.z = -0.5;
            } else if (type==104){
                //春季 hezi4
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xfec329});
                let materials = [material0,material1];

                let perH = this.height/5;
                let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,perH,Config.BLOCK.radius*2);
                this.geometry = geometry;
                let perW = Config.BLOCK.radius*2/10;
                let green0 = new THREE.BoxGeometry(perW*2,this.height,perW*2);
                let green1 = new THREE.BoxGeometry(perW*6,this.height,perW);
                let green2 = new THREE.BoxGeometry(perW,this.height,perW*6);
                let green3 = new THREE.BoxGeometry(perW*10-0.01,this.height,perW-0.01);
                let green4 = new THREE.BoxGeometry(perW-0.01,this.height,perW*10-0.01);

                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0},{x:0,y:perH*2,z:0},{x:0,y:-perH*2,z:0}]);
                this.merge(totalGeometry,geometry,1,[{x:0,y:perH,z:0},{x:0,y:-perH,z:0}]);
                this.merge(totalGeometry,green0,1,[{x:0,y:0.01,z:0}]);
                this.merge(totalGeometry, green1, 1, [{x:0, y:0.01, z:perW*5/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*5/2
                }]);
                this.merge(totalGeometry, green2, 1, [{x:-perW*5/2, y:0.01, z:0}, {
                    x: perW*5/2,
                    y: 0.01,
                    z: 0
                }]);
                this.merge(totalGeometry, green3, 1, [{x:0, y:0.01, z:perW*9/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*9/2
                }]);
                this.merge(totalGeometry, green4, 1, [{x:-perW*9/2, y:0.01, z:0}, {
                    x: perW*9/2,
                    y: 0.01,
                    z: 0
                }]);

                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
            }
            // else if(type==105){
            //     //春季 huanban
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
            //     let material1 = new THREE.MeshLambertMaterial({color: 0xfeb3ae});
            //     let materials = [material0,material1];
            //
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
            //     this.geometry = geometry;
            //
            //     let r = Config.BLOCK.radius/2;
            //     //白色圆心
            //     let geometry0 = new THREE.CylinderGeometry(0.5, 0.5, this.height, 50);
            //     let geometry1 = new THREE.BoxGeometry(r*2,this.height,r*2);
            //     let geometry2 = new THREE.CylinderGeometry(r, r, this.height, 50);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry,geometry0,0,[{x:0,y:0.01,z:0}]);
            //     this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
            //     this.merge(totalGeometry,geometry2,1,[{x:0,y:0,z:r},{x:0,y:0,z:-r},{x:-r,y:0,z:0},{x:r,y:0,z:0}]);
            //     this.hitObj = new THREE.Mesh(totalGeometry,materials);
            //     cb(this);
            // }
            else if (type==109){
                //春季 zhuzi1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xfec329});
                let materials = [material0,material1];

                let r = Config.BLOCK.radius;
                let perH = this.height/6;
                let geometry = new THREE.CylinderGeometry(r, r, this.height, 50);
                this.geometry = geometry;

                let geometry1 = new THREE.CylinderGeometry(r+0.01, r+0.01, perH, 50);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[{x:0,y:perH/2,z:0},{x:0,y:perH*5/2-0.01,z:0},{x:0,y:-perH*3/2,z:0}]);
                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
                this.body.position.x = 0.05;
            }
            // else if(type==200){
            //     //夏季 x_dengzi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 50;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xdef5a5});
            //     let materials = [material0];
            //
            //     let r = Config.BLOCK.radius;
            //     let outH = 1.2;
            //     let geometry = new THREE.CylinderGeometry(r, r, outH, 50);
            //     this.geometry = geometry;
            //     let geometry1 = new THREE.CylinderGeometry(r/2+0.5, r/2+0.5, this.height, 50);
            //
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry,geometry,0,[{x:0,y:(this.height/2-outH/2),z:0},{x:0,y:-(this.height/2-outH/2),z:0}]);
            //     this.merge(totalGeometry,geometry1,0,[{x:0,y:0,z:0}]);
            //     this.hitObj = new THREE.Mesh(totalGeometry,materials);
            //     cb(this);
            //     this.body.position.x = -0.1;
            // }
            else if(type==201){
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xf8d228});
                let material2 = new THREE.MeshLambertMaterial({color: 0x91733c});
                let materials = [material0,material1,material2];
                let totalGeometry = new THREE.Geometry();
                let bottomHeight = 3.8;
                let topHeight = this.height - bottomHeight;
                let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 3, Config.BLOCK.radius - 2, bottomHeight, 50);
                let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
                let geometry = new THREE.CylinderGeometry(1.5, 1.5, topHeight, 50);
                this.geometry = topGeometry;
                this.merge(totalGeometry, bottomGeometry, 2, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
                this.merge(totalGeometry, geometry, 0, [{
                    x: 1.5,
                    y: bottomHeight + topHeight / 2 - this.height / 2+0.01,
                    z: 1.5
                }]);
                this.merge(totalGeometry, topGeometry, 1, [{
                    x: 0,
                    y: bottomHeight + topHeight / 2 - this.height / 2,
                    z: 0
                }]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }else if (type==202){
                //夏季 x_yuanzhu1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xf8d228});
                let material2 = new THREE.MeshLambertMaterial({color: 0xfd9724});
                let materials = [material0,material1,material2];

                let perH = this.height/3;
                let perR = Config.BLOCK.radius;
                let geometry = new THREE.CylinderGeometry(perR, perR, perH, 50);
                this.geometry = geometry;
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry, 0, [{x: 0, y: -perH, z: 0}]);
                this.merge(totalGeometry, geometry, 1, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, geometry, 2, [{x: 0, y: perH, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                this.body.position.z = -0.2;
                cb(this);
            }
            // else if(type==204){
            //     //夏季 x_fangzhuo
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
            //     let materials = [material0];
            //
            //     let r = Config.BLOCK.radius;
            //     let topH = 2.1;
            //     let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
            //     this.geometry = geometry0;
            //     let smallR = 2.8;
            //     let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
            //     this.merge(totalGeometry, geometry1, 0, [
            //         {x: -r+smallR/2, y: 0, z: r-smallR/2},
            //         {x: r-smallR/2, y: 0, z: r-smallR/2},
            //         {x: -r+smallR/2, y: 0, z: -r+smallR/2},
            //         {x: r-smallR/2, y: 0, z: -r+smallR/2}
            //     ]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            //     this.body.position.z = -0.2;
            //     this.body.position.x = 0.1;
            // }
            else if(type==205){
                //夏季 x_hezi2
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0x2fffd6});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 1.2;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }else if(type==206){
                //夏季 x_hezi3
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0x2fffd6});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let r = Config.BLOCK.radius;
                let sR = r*2/10;
                let geometry = new THREE.BoxGeometry(r*2, this.height, r*2);
                this.geometry = geometry;
                let geometry1 = new THREE.BoxGeometry(sR, this.height-0.01, sR);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[
                    {x:-sR*9/2+0.01,y:0,z:r-sR/2+0.01},
                    {x:-sR*5/2,y:0,z:r-sR/2+0.01},
                    {x:-sR/2,y:0,z:r-sR/2+0.01},
                    {x:sR*3/2,y:0,z:r-sR/2+0.01},
                    {x:sR*7/2,y:0,z:r-sR/2+0.01},
                    {x:-r+sR/2-0.01,y:0,z:-sR*9/2+0.01},
                    {x:-r+sR/2-0.01,y:0,z:-sR*5/2},
                    {x:-r+sR/2-0.01,y:0,z:-sR/2},
                    {x:-r+sR/2-0.01,y:0,z:sR*3/2},
                    {x:-r+sR/2-0.01,y:0,z:sR*7/2},
                    {x:-r+sR*3/2,y:0.02,z:-r+sR*3/2},
                    {x:-r+sR*5/2,y:0.02,z:sR/2},
                    {x:r-sR*5/2,y:0.02,z:-r+sR*5/2},
                    {x:r-sR*7/2,y:0.02,z:r-sR*5/2}
                ]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            } else if(type==207){
                //夏季 x_hezi4
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xfec329});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let r = Config.BLOCK.radius;
                let sR = r*2/10;
                let mainGeometry = new THREE.BoxGeometry(r*2-0.01, this.height-0.01, r*2-0.01);
                this.geometry = mainGeometry;
                let geometry = new THREE.BoxGeometry(r, this.height, r);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,mainGeometry,1,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry,0,[{x:-r/2,y:0,z:-r/2},{x:r/2,y:0,z:r/2}]);
                this.merge(totalGeometry,geometry,1,[{x:-r/2,y:0,z:r/2},{x:r/2,y:0,z:-r/2}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }else if(type==208){
                //夏季 x_hezi5
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xe54a3b});
                let materials = [material0,material1];
                let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
                this.geometry = geometry;
                let perW = Config.BLOCK.radius*2/10;
                let green1 = new THREE.BoxGeometry(perW*4,this.height,perW);
                let green2 = new THREE.BoxGeometry(perW,this.height,perW*4);
                let green3 = new THREE.BoxGeometry(perW*8,this.height,perW);
                let green4 = new THREE.BoxGeometry(perW,this.height,perW*8);
                let geometry1 = new THREE.BoxGeometry(Config.BLOCK.radius*2+0.01,1,Config.BLOCK.radius*2+0.01);

                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry, green1, 1, [{x:0, y:0.01, z:perW*3/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*3/2
                }]);
                this.merge(totalGeometry, green2, 1, [{x:-perW*3/2, y:0.01, z:0}, {
                    x: perW*3/2,
                    y: 0.01,
                    z: 0
                }]);
                this.merge(totalGeometry, green3, 1, [{x:0, y:0.01, z:perW*7/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*7/2
                }]);
                this.merge(totalGeometry, green4, 1, [{x:-perW*7/2, y:0.01, z:0}, {
                    x: perW*7/2,
                    y: 0.01,
                    z: 0
                }]);

                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
            }
            // else if(type==209){
            //     //夏季 x_huaban
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
            //     let material1 = new THREE.MeshLambertMaterial({color: 0x2fffd6});
            //     let materials = [material0,material1];
            //
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
            //     this.geometry = geometry;
            //
            //     let r = Config.BLOCK.radius/2;
            //     //白色圆心
            //     let geometry0 = new THREE.CylinderGeometry(0.5, 0.5, this.height, 50);
            //     let geometry1 = new THREE.BoxGeometry(r*2,this.height,r*2);
            //     let geometry2 = new THREE.CylinderGeometry(r, r, this.height, 50);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry,geometry0,0,[{x:0,y:0.01,z:0}]);
            //     this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
            //     this.merge(totalGeometry,geometry2,1,[{x:0,y:0,z:r},{x:0,y:0,z:-r},{x:-r,y:0,z:0},{x:r,y:0,z:0}]);
            //     this.hitObj = new THREE.Mesh(totalGeometry,materials);
            //     cb(this);
            // }
            // else if(type==300){
            //     //秋季 q_dengzi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 50;
            //     let material = new THREE.MeshLambertMaterial({color: 0x9e8458});
            //     let materials = [material];
            //     let totalGeometry = new THREE.Geometry();
            //     let bottomHeight = 3.8;
            //     let topHeight = this.height - bottomHeight;
            //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 3, Config.BLOCK.radius - 2, bottomHeight, 50);
            //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
            //     this.geometry = topGeometry;
            //     this.merge(totalGeometry, bottomGeometry, 0, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
            //     this.merge(totalGeometry, topGeometry, 0, [{
            //         x: 0,
            //         y: bottomHeight + topHeight / 2 - this.height / 2,
            //         z: 0
            //     }]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            //     this.body.position.z = -0.15;
            //     this.body.position.x = 0.3;
            // }
            else if(type==302){
                //秋季 q_yuanzhu1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xfd9028});
                let materials = [material0,material1];

                let r = Config.BLOCK.radius;
                let perH = this.height/6;
                let geometry = new THREE.CylinderGeometry(r, r, this.height, 50);
                this.geometry = geometry;

                let geometry1 = new THREE.CylinderGeometry(r+0.01, r+0.01, perH, 50);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[{x:0,y:perH/2,z:0},{x:0,y:perH*5/2-0.01,z:0},{x:0,y:-perH*3/2,z:0}]);
                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
            }else if(type==303){
                //秋季 q_hezi1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xfd9b2a});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 1.2;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }else if(type==304){
                //秋季 q_hezi2
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xfd9b2a});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = this.height/3;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
                let sR = Config.BLOCK.radius*2/7;
                let sGeometry = new THREE.BoxGeometry(sR, this.height, sR);
                let sGeometry1 = new THREE.BoxGeometry(sR, this.height, sR*5);
                let sGeometry2 = new THREE.BoxGeometry(sR*5, this.height, sR);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, sGeometry, 1, [{x: 0, y: 0.01, z: 0}]);
                this.merge(totalGeometry, sGeometry1, 1, [{x: sR*2, y: 0.01, z: 0},{x: -sR*2, y: 0.01, z: 0}]);
                this.merge(totalGeometry, sGeometry2, 1, [{x: 0, y: 0.01, z: sR*2},{x: 0, y: 0.01, z: -sR*2}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }else if(type==306){
                //秋季 q_hezi4
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xeeddb2});
                let material1 = new THREE.MeshLambertMaterial({color: 0x767220});
                let materials = [material0, material1];
                let r = Config.BLOCK.radius;
                let sR = r*2/9;
                let sH = sR*2-0.5;
                let geometry = new THREE.BoxGeometry(r*2, this.height, r*2);
                this.geometry = geometry;
                let sGeometry = new THREE.BoxGeometry(sR, sH, sR);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, sGeometry, 1, [
                    {x: -r+sR/2-0.01, y: -this.height/2+sH/2, z: -sR*3},
                    {x: -r+sR/2-0.01, y: -this.height/2+sH/2, z: -sR},
                    {x: -r+sR/2-0.01, y: -this.height/2+sH/2, z: sR},
                    {x: -r+sR/2-0.01, y: -this.height/2+sH/2, z: sR*3},
                    {x: -sR*3, y: -this.height/2+sH/2, z: r-sR/2+0.01},
                    {x: -sR, y: -this.height/2+sH/2, z: r-sR/2+0.01},
                    {x: sR, y: -this.height/2+sH/2, z: r-sR/2+0.01},
                    {x: sR*3, y: -this.height/2+sH/2, z: r-sR/2+0.01}
                ]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.5;
            }else if(type==307){
                //秋季 q_pingtai1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xfdb42f});
                let material1 = new THREE.MeshLambertMaterial({color: 0x91723c});
                let materials = [material0, material1];
                let r = Config.BLOCK.radius;
                let sR = r-1.3;
                let topH = 2.2;
                let bH = this.height-topH;
                let geometry = new THREE.BoxGeometry(r*2, topH, r*2);
                this.geometry = geometry;
                let sGeometry = new THREE.BoxGeometry(sR*2, bH, sR*2);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
                this.merge(totalGeometry, sGeometry, 1, [{x: 0, y: -(this.height-bH)/2, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }
            // else if(type==310){
            //     //秋季 q_zhuozi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xc4b694});
            //     let materials = [material0];
            //
            //     let r = Config.BLOCK.radius;
            //     let topH = 2.1;
            //     let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
            //     this.geometry = geometry0;
            //     let smallR = 2.8;
            //     let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
            //     this.merge(totalGeometry, geometry1, 0, [
            //         {x: -r+smallR/2, y: 0, z: r-smallR/2},
            //         {x: r-smallR/2, y: 0, z: r-smallR/2},
            //         {x: -r+smallR/2, y: 0, z: -r+smallR/2},
            //         {x: r-smallR/2, y: 0, z: -r+smallR/2}
            //     ]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            //     this.body.position.z = -0.2;
            //     this.body.position.x = 0.1;
            // }
            // else if (type==400){
            //     //冬季 d_fangdeng
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0x93b0c9});
            //     let materials = [material0];
            //
            //     let r = Config.BLOCK.radius;
            //     let topH = 2.1;
            //     let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
            //     this.geometry = geometry0;
            //     let smallR = 2.8;
            //     let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
            //     this.merge(totalGeometry, geometry1, 0, [
            //         {x: -r+smallR/2, y: 0, z: r-smallR/2},
            //         {x: r-smallR/2, y: 0, z: r-smallR/2},
            //         {x: -r+smallR/2, y: 0, z: -r+smallR/2},
            //         {x: r-smallR/2, y: 0, z: -r+smallR/2}
            //     ]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            //     this.body.position.z = -0.2;
            //     this.body.position.x = 0.1;
            // }
            // else if(type==401){
            //     //冬季 d_hezi1
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material = new THREE.MeshLambertMaterial({color: 0x97b5d0});
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
            //     this.geometry = geometry;
            //     this.hitObj = new THREE.Mesh(geometry,material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            //     this.body.position.x = -0.1;
            // }
            else if(type==402){
                //冬季 d_hezi2
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xb6b6b6});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 1.2;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, innerHeight, Config.BLOCK.radius * 2);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }else if (type==403){
                //冬季 d_hezi3
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0x6872ac});
                let material1 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let materials = [material0, material1];
                let r = Config.BLOCK.radius;
                let sR = r*2/10;
                let mainGeometry = new THREE.BoxGeometry(r*2-0.01, this.height-0.01, r*2-0.01);
                this.geometry = mainGeometry;
                let geometry = new THREE.BoxGeometry(r, this.height, r);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,mainGeometry,1,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry,0,[{x:-r/2,y:0,z:-r/2},{x:r/2,y:0,z:r/2}]);
                this.merge(totalGeometry,geometry,1,[{x:-r/2,y:0,z:r/2},{x:r/2,y:0,z:-r/2}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }else if (type==404){
                //冬季 d_hezi4
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0x6872ac});
                let materials = [material0,material1];
                let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
                this.geometry = geometry;
                let perW = Config.BLOCK.radius*2/10;
                let green1 = new THREE.BoxGeometry(perW*4,this.height,perW);
                let green2 = new THREE.BoxGeometry(perW,this.height,perW*4);
                let green3 = new THREE.BoxGeometry(perW*8,this.height,perW);
                let green4 = new THREE.BoxGeometry(perW,this.height,perW*8);
                let geometry1 = new THREE.BoxGeometry(Config.BLOCK.radius*2+0.01,1,Config.BLOCK.radius*2+0.01);

                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry, green1, 1, [{x:0, y:0.01, z:perW*3/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*3/2
                }]);
                this.merge(totalGeometry, green2, 1, [{x:-perW*3/2, y:0.01, z:0}, {
                    x: perW*3/2,
                    y: 0.01,
                    z: 0
                }]);
                this.merge(totalGeometry, green3, 1, [{x:0, y:0.01, z:perW*7/2}, {
                    x: 0,
                    y: 0.01,
                    z: -perW*7/2
                }]);
                this.merge(totalGeometry, green4, 1, [{x:-perW*7/2, y:0.01, z:0}, {
                    x: perW*7/2,
                    y: 0.01,
                    z: 0
                }]);

                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
            }else if(type==405){
                //冬季 d_hezi5
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xd1463b});
                let materials = [material0,material1];
                let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
                this.geometry = geometry;
                let sR = Config.BLOCK.radius+0.01;
                let w = 1;
                let geometry1 = new THREE.BoxGeometry(sR*2,this.height+0.01,w);
                let geometry2 = new THREE.BoxGeometry(w,this.height+0.01,sR*2);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry,geometry,0,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
                this.merge(totalGeometry,geometry2,1,[{x:0,y:0,z:0}]);
                this.hitObj = new THREE.Mesh(totalGeometry,materials);
                cb(this);
            }
            // else if(type==409){
            //     //冬季 d_yuandeng
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 50;
            //     let material = new THREE.MeshLambertMaterial({color: 0x6e78b7});
            //     let materials = [material];
            //     let totalGeometry = new THREE.Geometry();
            //     let bottomHeight = 3.8;
            //     let topHeight = this.height - bottomHeight;
            //     let bottomGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius - 3, Config.BLOCK.radius - 2, bottomHeight, 50);
            //     let topGeometry = new THREE.CylinderGeometry(Config.BLOCK.radius, Config.BLOCK.radius, topHeight, 50);
            //     this.geometry = topGeometry;
            //     this.merge(totalGeometry, bottomGeometry, 0, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
            //     this.merge(totalGeometry, topGeometry, 0, [{
            //         x: 0,
            //         y: bottomHeight + topHeight / 2 - this.height / 2,
            //         z: 0
            //     }]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            // }
            else if(type==411){
                //冬季 d_yuanzhu1
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material1 = new THREE.MeshLambertMaterial({color: 0xb0d3f3});
                let material2 = new THREE.MeshLambertMaterial({color: 0x6e78b7});
                let materials = [material0,material1,material2];

                let perH = this.height/3;
                let perR = Config.BLOCK.radius;
                let geometry = new THREE.CylinderGeometry(perR, perR, perH, 50);
                this.geometry = geometry;
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry, 0, [{x: 0, y: -perH, z: 0}]);
                this.merge(totalGeometry, geometry, 1, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, geometry, 2, [{x: 0, y: perH, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                this.body.position.z = -0.3;
                cb(this);
            }
            // else if(type==500){
            //     //秦明——绝密
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let radius = this.radius;
            //     let geometry = new THREE.BoxGeometry(radius * 2, this.height, radius * 2);
            //     this.geometry = geometry;
            //     let material = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/qinming/qingming1.png')
            //     });
            //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            //     this.hitObj = new THREE.Mesh(geometry, material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            // else if (type==501){
            //     //秦明 —— 礼物盒
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
            //     this.geometry = geometry;
            //     let material = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/qinming/hezi.png')
            //     });
            //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            //     this.hitObj = new THREE.Mesh(geometry, material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            else if (type==502){
                //秦明 —— 手提箱
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xd4d4d4});
                let material1 = new THREE.MeshLambertMaterial({color: 0xe7e7e7});
                let material2 = new THREE.MeshLambertMaterial({color: 0x434343});
                let material3 = new THREE.MeshLambertMaterial({color: 0xb7b7b7});
                let material4 = new THREE.MeshLambertMaterial({color: 0x5f5f5f});
                let material5 = new THREE.MeshLambertMaterial({color: 0xffffff});
                let material6 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/qinming/xiangzi.png')
                });
                let materials = [material0,material1,material2,material3,material4,material5,material6];
                let radius = this.radius;
                let height = this.height;
                let h1 = 0.5;
                let h2 = 0.2;
                let h3 = 1.5;
                let depth1 = 1.2;
                let depth2 = 0.6;
                let w = 0.5;
                let h4 = 1.2;
                let h5 = 0.3;
                let w1 = 0.6;
                let depth3 = 0.3;
                let depth4 = 2;
                let geometry = new THREE.BoxGeometry(radius * 2, height, radius * 2);
                this.geometry = geometry;
                let geo1 = new THREE.BoxGeometry(radius*2+0.01,h1,radius*2+0.01);
                let geo2 = new THREE.BoxGeometry(radius*2+0.02,h2,radius*2+0.02);
                let geo3 = new THREE.BoxGeometry(w,h3,depth1);
                let geo4 = new THREE.BoxGeometry(w,h3,depth2);
                let geo5 = new THREE.BoxGeometry(w,h3-0.01,depth1-0.01);
                let geo6 = new THREE.BoxGeometry(w,h3-0.01,depth2-0.01);
                let geo7 = new THREE.BoxGeometry(w,h4,depth3);
                let geo8 = new THREE.BoxGeometry(w,h5,depth4);
                let plane = new THREE.PlaneGeometry(radius*2,radius*2);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, geo1, 1, [
                    {x: 0, y: h1/2, z: 0},
                    {x: 0, y: -h1/2, z: 0},
                    {x: 0, y: height/2-h1/2, z: 0},
                    {x: 0, y: -height/2+h1/2, z: 0},
                ]);
                this.merge(totalGeometry, geo2, 2, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, geo3, 5, [
                    {x: -radius, y: 0, z: 1.2},
                    {x: -radius, y: 0, z: -1.2}
                ]);
                this.merge(totalGeometry, geo4, 5, [
                    {x: -radius, y: 0, z: 3.5},
                    {x: -radius, y: 0, z: -3.5}
                ]);
                this.merge(totalGeometry, geo5, 3, [
                    {x: -radius-0.1, y: 0, z: 1.2},
                    {x: -radius-0.1, y: 0, z: -1.2}
                ]);
                this.merge(totalGeometry, geo6, 3, [
                    {x: -radius-0.1, y: 0, z: 3.51},
                    {x: -radius-0.1, y: 0, z: -3.51}
                ]);
                this.merge(totalGeometry, geo7, 4, [
                    {x: -radius-0.5, y: -h4/2, z: 1.2},
                    {x: -radius-0.5, y: -h4/2, z: -1.2}
                ]);
                this.merge(totalGeometry, geo8, 4, [{x: -radius-0.5, y: -h4+h5/2, z: 0}]);
                plane.rotateX(-Math.PI / 2);
                this.merge(totalGeometry,plane,6,[{x:0,y:height/2+0.01,z:0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
            }
            // else if (type==503){
            //     //秦明 —— 眼睛
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 50;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
            //     let material1 = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/qinming/eye.png')
            //     });
            //     let materials = [material0,material1];
            //     let radius = this.radius;
            //     let geometry = new THREE.CylinderGeometry(radius, radius, this.height, 50);
            //     this.geometry = geometry;
            //     let plane = new THREE.CircleGeometry(radius,50);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
            //     plane.rotateX(-Math.PI / 2);
            //     this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            // }
            else if (type==601){
                //秦明 —— 大理寺，黄色圆形铜钱状
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xF1A827});//大柱体
                let material1 = new THREE.MeshLambertMaterial({color: 0xFEDE92});//浅黄色圆环
                let material2 = new THREE.MeshLambertMaterial({color: 0xA9713C});//内部深褐色方形
                let materials = [material0,material1,material2];
                let radius = this.radius;
                let geometryBig = new THREE.CylinderGeometry(radius, radius, this.height, 50);
                let plane = new THREE.CircleGeometry(radius,50);
                this.geometry = geometryBig;
                let plane2 = new THREE.CircleGeometry(radius/1.12,50);
                let plane3 = new THREE.PlaneGeometry(radius/1.5,radius/1.5);
                let plane4 = new THREE.PlaneGeometry(radius/2.1,radius/2.1);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometryBig, 0, [{x: 0, y: 0, z: 0}]);
                plane.rotateX(-Math.PI / 2);
                plane2.rotateX(-Math.PI / 2);
                plane3.rotateX(-Math.PI / 2);
                plane4.rotateX(-Math.PI / 2);
                this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
                this.merge(totalGeometry, plane2, 0, [{x: 0, y: this.height/2+0.02, z: 0}]);
                this.merge(totalGeometry, plane3, 1, [{x: 0, y: this.height/2+0.03, z: 0}]);
                this.merge(totalGeometry, plane4, 2, [{x: 0, y: this.height/2+0.04, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.x = -0.1;
                this.body.position.z = -0.1;
            }else if(type==602){
                //大理寺 宫廷风拼接贴图盒子
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xA76F18});
                let material1 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/yellowban.png')
                });
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 3.8;
                let outerHeight = (this.height - innerHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 1.7, innerHeight, Config.BLOCK.radius * 1.7);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
                this.body.position.x = 0.2;
            }else if(type==603){
                //大理寺 桌子形状
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0xB56E22});
                let material1 = new THREE.MeshLambertMaterial({color: 0xFBED34});
                let materials = [material0,material1];

                let r = Config.BLOCK.radius;
                let topH = 1;
                let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
                let smallR2 = 1.8;
                let geometryYellow = new THREE.BoxGeometry(smallR2,topH,smallR2);
                this.geometry = geometry0;
                let smallR = 0.9;
                let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
                let totalGeometry = new THREE.Geometry();
                this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
                this.merge(totalGeometry, geometryYellow, 1, [
                    {x: -r+smallR2/2-0.01, y: (this.height-topH)/2-0.01, z: r-smallR2/2+0.01},
                    {x: r-smallR2/2-0.01, y: (this.height-topH)/2-0.01, z: r-smallR2/2+0.01},
                    {x: -r+smallR2/2-0.01, y: (this.height-topH)/2-0.01, z: -r+smallR2/2+0.01},
                    {x: r-smallR2/2-0.01, y: (this.height-topH)/2-0.01, z: -r+smallR2/2+0.01}
                ]);
                let geometryCir = new THREE.CircleGeometry(smallR2,50,0,Math.PI/2);
                let geometryCir1 = new THREE.CircleGeometry(smallR2,50,Math.PI/2,Math.PI/2);
                let geometryCir2 = new THREE.CircleGeometry(smallR2,50,Math.PI*1.5,Math.PI/2);
                let geometryCir3 = new THREE.CircleGeometry(smallR2,50,Math.PI,Math.PI/2);
                geometryCir.rotateX(-Math.PI/2);
                geometryCir1.rotateX(-Math.PI/2);
                geometryCir2.rotateX(-Math.PI/2);
                geometryCir3.rotateX(-Math.PI/2);
                this.merge(totalGeometry,geometryCir,1,[
                    {x: -r, y: (this.height)/2+0.01, z: r}]);
                this.merge(totalGeometry,geometryCir1,1,[
                    {x: r, y: (this.height)/2+0.01, z: r}]);
                this.merge(totalGeometry,geometryCir2,1,[
                    {x: -r, y: (this.height)/2+0.01, z: -r}]);
                this.merge(totalGeometry,geometryCir3,1,[
                    {x: r, y: (this.height)/2+0.01, z: -r}]);

                this.merge(totalGeometry, geometry1, 0, [
                    {x: -r+smallR/2, y: 0, z: r-smallR/2},
                    {x: r-smallR/2, y: 0, z: r-smallR/2},
                    {x: -r+smallR/2, y: 0, z: -r+smallR/2},
                    {x: r-smallR/2, y: 0, z: -r+smallR/2}
                ]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.2;
                this.body.position.x = 0.1;
            }else if(type==604){
                //大理寺 八边形贴图盒子
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 8;
                let material0 = new THREE.MeshLambertMaterial({color: 0xC46924});
                let material1 = new THREE.MeshLambertMaterial({color: 0xFFD98C});
                let material2 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/bajiaoxing.png'),
                    transparent:true
                });
                let material3 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/red2.png')
                });
                let materials = [material0, material1, material2, material3];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 3.8;
                let outerHeight = (this.height - innerHeight) / 2;
                let radius = this.radius;
                // let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                let upGeometry = new THREE.CylinderGeometry(radius, radius, outerHeight, 8);
                let downInGeometry = new THREE.CylinderGeometry(radius/1.4, radius/1.4, outerHeight, 8);
                this.geometry = upGeometry;
                let plane = new THREE.CylinderGeometry(radius, radius, 0.1, 8);
                plane.rotateX(Math.PI);
                // plane.rotateY(Math.PI *2 /16);
                this.merge(totalGeometry, plane, 2, [{x: 0, y: this.height/2 +0.01, z: 0}]);
                let innerGeometry = new THREE.CylinderGeometry(radius/2.4, radius/2.4, innerHeight, 50);
                this.merge(totalGeometry, upGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, downInGeometry, 1, [{x: 0, y: -innerHeight / 2 - outerHeight / 2 + 0.02, z: 0}]);
                this.merge(totalGeometry, innerGeometry, 3, [{x: 0, y: 0, z: 0}]);
                totalGeometry.rotateY(Math.PI /8);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
                this.body.position.x = 0.1;
            }else if(type==605){
                //大理寺 红色鼓形状
                this.canChange = false;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0xB00B11});//红色鼓身
                let material1 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/yuanhuan.png')
                });
                let materials = [material0, material1];
                let totalGeometry = new THREE.Geometry();

                let downHeight = 1;
                let upHeight = this.height - downHeight;
                let radius = this.radius;
                let plane = new THREE.CircleGeometry(radius-0.5,50);
                let upPlane = new THREE.CylinderGeometry(radius-0.5, radius-0.5, 0.1, 50);
                this.geometry = upPlane;
                let upGeometry = new THREE.SphereGeometry(radius-0.1, 50, 9, 1,2*Math.PI,1,1.7);
                let downGeometry = new THREE.SphereGeometry(radius-0.3, 50, 9, 1,2*Math.PI,0.6,0.6);
                this.merge(totalGeometry, upGeometry, 0, [{
                    x: 0,
                    y: this.height/2-upHeight/2-1.1,
                    z: 0
                }]);
                plane.rotateX(-Math.PI / 2);
                this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height / 2+0.8-1.1, z: 0}]);
                this.merge(totalGeometry, downGeometry, 0, [{x: 0, y: -this.height+downHeight/2-1.1, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.x = -0.2;
            }else if(type==606){
                //大理寺 八卦圆盘形状
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 50;
                let material0 = new THREE.MeshLambertMaterial({color: 0x743926});//下方棕色立方体
                let material1 = new THREE.MeshLambertMaterial({color: 0xFFBB2F});//上方黄色柱体
                let material2 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/bagua.png')
                });
                let materials = [material0, material1,material2 ];
                let totalGeometry = new THREE.Geometry();
                let upHeight = 1;
                let downHeight = this.height - upHeight;
                // let upGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, upHeight, Config.BLOCK.radius * 2);
                let radius = this.radius;
                let upGeometry = new THREE.CylinderGeometry(radius, radius, upHeight, 50);
                let plane = new THREE.CircleGeometry(radius,50);
                this.geometry = upGeometry;
                let downGeometry = new THREE.BoxGeometry(Config.BLOCK.radius *2, downHeight, Config.BLOCK.radius * 2);
                this.merge(totalGeometry, upGeometry, 1, [{
                    x: 0,
                    y: this.height / 2 - upHeight/2,
                    z: 0
                }]);
                plane.rotateX(-Math.PI / 2);
                this.merge(totalGeometry, plane, 2, [{x: 0, y: this.height/2+0.1, z: 0}]);
                this.merge(totalGeometry, downGeometry, 0, [{x: 0, y: -this.height/2 + downHeight/2, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }else if(type==607){
                //大理寺 宫廷风拼接贴图盒子2
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0x934D2E});
                let material1 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/redban.png')
                });
                let material2 = new THREE.MeshLambertMaterial({color: 0xFEEC37});
                let materials = [material0, material1,material2];
                let totalGeometry = new THREE.Geometry();
                let innerHeight = 2.9;
                let legHeight = 0.9;
                let outerHeight = (this.height - innerHeight - legHeight) / 2;
                let outerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, outerHeight, Config.BLOCK.radius * 2);
                this.geometry = outerGeometry;
                let innerGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 1.7, innerHeight, Config.BLOCK.radius * 1.7);
                this.merge(totalGeometry, outerGeometry, 0, [{x: 0, y: -innerHeight / 2 - outerHeight / 2, z: 0}, {
                    x: 0,
                    y: innerHeight / 2 + outerHeight / 2,
                    z: 0
                }]);
                let r = Config.BLOCK.radius;
                let topH = 1;
                let smallR = 0.7;
                let geometry1 =  new THREE.CylinderGeometry(smallR, smallR-0.3, legHeight, 4);
                geometry1.rotateY(Math.PI/4);
                let smallR2 = 1.5;
                let geometryYellow = new THREE.BoxGeometry(smallR2,smallR,smallR2);
                this.merge(totalGeometry, geometryYellow, 2, [
                    {x: -r+smallR2/2-0.01, y: -innerHeight / 2 - outerHeight / 2-0.01, z: r-smallR2/2+0.01},
                    {x: r-smallR2/2-0.01, y: -innerHeight / 2 - outerHeight / 2-0.01, z: r-smallR2/2+0.01},
                    {x: -r+smallR2/2-0.01, y: -innerHeight / 2 - outerHeight / 2-0.01, z: -r+smallR2/2+0.01},
                    {x: r-smallR2/2-0.01, y: -innerHeight / 2 - outerHeight / 2-0.01, z: -r+smallR2/2+0.01}
                ]);

                this.merge(totalGeometry, geometry1, 0, [
                    {x: -r+smallR/2, y: -innerHeight / 2 - outerHeight / 2-legHeight/2-0.2, z: r-smallR/2},
                    {x: r-smallR/2, y: -innerHeight / 2 - outerHeight / 2-legHeight/2-0.2, z: r-smallR/2},
                    {x: -r+smallR/2, y: -innerHeight / 2 - outerHeight / 2-legHeight/2-0.2, z: -r+smallR/2},
                    {x: r-smallR/2, y: -innerHeight / 2 - outerHeight / 2-legHeight/2-0.2, z: -r+smallR/2}
                ]);
                this.merge(totalGeometry, innerGeometry, 1, [{x: 0, y: 0, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }
            // else if (type==608){
            //     //大理寺-蓝色书籍立方体
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
            //     this.geometry = geometry;
            //     let material = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/dalisi/blueBook.png')
            //     });
            //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            //     this.hitObj = new THREE.Mesh(geometry, material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            else if(type==609){
                //大理寺 蓝绿色风格
                this.canChange = true;
                this.isDrawBySelf = true;
                this.radiusSegments = 4;
                let material0 = new THREE.MeshLambertMaterial({color: 0x92CCBC});//上表面
                let material1 = new THREE.MeshLambertMaterial({color: 0x61C5C1});//下表面
                let material2 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/yun.png')
                });//中间贴图
                let material3 = new THREE.MeshLambertMaterial({
                    map: Config.loader.load('res/img/dalisi/blueSquare.png')
                });//中间贴图
                let materials = [material0, material1,material2,material3];
                let totalGeometry = new THREE.Geometry();

                let middleHeight = 3.3;
                let upHeight =  (this.height - middleHeight)/2;
                let downHeight = upHeight ;
                let upGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, upHeight, Config.BLOCK.radius * 2);
                this.geometry = upGeometry;
                let downGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, upHeight, Config.BLOCK.radius * 2);
                let middleGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 1.7, middleHeight, Config.BLOCK.radius * 1.7);
                let radius = this.radius;
                let plane = new THREE.BoxGeometry(Config.BLOCK.radius * 2, 0.01, Config.BLOCK.radius * 2);
                plane.rotateX(-Math.PI);
                this.merge(totalGeometry, plane, 3, [{x: 0, y: this.height/2+0.1, z: 0}]);
                this.merge(totalGeometry, upGeometry, 0, [{x: 0, y: -middleHeight / 2 - upHeight / 2, z: 0}, {
                    x: 0,
                    y: middleHeight / 2 + upHeight / 2,
                    z: 0
                }]);
                this.merge(totalGeometry, middleGeometry, 2, [{x: 0, y: 0, z: 0}]);
                this.merge(totalGeometry, downGeometry, 1, [{x: 0, y: -middleHeight / 2 - upHeight / 2, z: 0}]);
                this.hitObj = new THREE.Mesh(totalGeometry, materials);
                cb(this);
                this.body.position.z = -0.3;
            }
            // else if (type==610){
            //     //大理寺-符咒黄色立方体
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let material0 = new THREE.MeshLambertMaterial({color: 0xFED032});
            //     let material1 = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/dalisi/fuzhou.png')
            //     });
            //     let materials = [material0,material1];
            //     let radius = this.radius;
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius*2,this.height,Config.BLOCK.radius*2);
            //     this.geometry = geometry;
            //     let plane = new THREE.PlaneGeometry(Config.BLOCK.radius*2,Config.BLOCK.radius*2);
            //     let totalGeometry = new THREE.Geometry();
            //     this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
            //     plane.rotateX(-Math.PI / 2);
            //     this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            //     this.hitObj = new THREE.Mesh(totalGeometry, materials);
            //     cb(this);
            // }
            // else if (type==611){
            //     //大理寺-红色花纹立方体
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
            //     this.geometry = geometry;
            //     let material = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/dalisi/redBlock.png')
            //     });
            //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            //     this.hitObj = new THREE.Mesh(geometry, material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            // else if (type==612){
            //     //大理寺-大理寺志书籍立方体
            //     this.canChange = true;
            //     this.isDrawBySelf = true;
            //     this.radiusSegments = 4;
            //     let geometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, this.height, Config.BLOCK.radius * 2);
            //     this.geometry = geometry;
            //     let material = new THREE.MeshLambertMaterial({
            //         map: Config.loader.load('res/img/dalisi/dalisizhi.png')
            //     });
            //     this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            //     this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            //     this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            //     this.hitObj = new THREE.Mesh(geometry, material);
            //     cb(this);
            //     this.body.position.z = -0.2;
            // }
            else {
                let objInfo = this.getObjInfo4Type(type);
                if (!objInfo.isObj){
                    this.createHitObj(objInfo,cb);
                } else {
                    this.isDrawBySelf = false;
                    this.isCylinder = objInfo.isCylinder;
                    this.loadObjFile(type,objInfo,cb);
                }
            }
        }
        // else if (type == -1) {
        //     let color = [0xee6060, 0xe4965e, 0xefbf57, 0x8ab34e, 0x71b4c4, 0x637cbd, 0xa461d4];
        //     let geometry = biggerGeometry;
        //     let material = new THREE.MeshLambertMaterial({color: color[number], transparent: true});
        //     this.hitObj = new THREE.Mesh(geometry, material);
        //     let grayGeometry = new THREE.BoxGeometry(Config.BLOCK.radius * 2, Config.BLOCK.height, Config.BLOCK.radius * 2);
        //     this.mapUv(100, 88, grayGeometry, 2, 0, 0, 5, 5);
        //     let gray = new THREE.Mesh(grayGeometry, Config.grayMaterial);
        //     if (number == 0) gray.receiveShadow = true;
        //     this.body.add(gray);
        //     let planeGeometry = new THREE.PlaneGeometry(4, 8);
        //     let x1, y1, x2, y2;
        //     x1 = 64 * (number % 4);
        //     x2 = x1 + 64;
        //     y1 = parseInt(number / 4) * 128;
        //     y2 = y1 + 128;
        //     this.mapUv(256, 256, planeGeometry, 0, x1, y2, x2, y1);
        //     let plane = new THREE.Mesh(planeGeometry, Config.numberMaterial);
        //     plane.rotation.x = -Math.PI / 2;
        //     plane.rotation.z = -Math.PI / 2;
        //     plane.position.y = Config.BLOCK.height / 2 + 0.05;
        //     this.body.add(plane);
        //     this.obj.scale.set(0.7, 1, 0.7);
        // }

        this.shadow.initZ = this.shadow.position.z;
        if (type < 30 || this.isDrawBySelf){
            this.hitObj.receiveShadow = true;
            this.hitObj.name = 'hitObj';
            this.body.add(this.hitObj);
            this.hitObj.matrixAutoUpdate = false;
        }
        this.shadow.initScale = this.shadow.scale.y;
        this.body.position.z = posZ;
        this.body.position.x = posX;
        this.body.position.y = Config.BLOCK.height / 2 - this.height / 2;
        this.obj.add(this.shadow);
        this.obj.add(this.body);


        if (window.WechatGame){
            //添加乐卡
            this.addLeCard();
        }else{
            //添加五彩石
            // if (type>=601 && type<=612){
            if (this.season == activityName){
                this.addColorStone();
            }
        }
    }

    return Block;
}();

Block.prototype = {
    createHitObj:function(objInfo,cb){
        // 代码画hitObj
        let meshInfo = objInfo.meshInfo;
        let geoType = meshInfo.type;
        if (geoType==0){
            //纯色方块
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let color = meshInfo.color;
            let material = new THREE.MeshLambertMaterial({color:color});
            let radius = this.radius, height = this.height;
            let geometry = new THREE.BoxGeometry(radius*2,height,radius*2);
            this.geometry = geometry;
            this.hitObj = new THREE.Mesh(geometry, material);
            cb(this);
        } else if (geoType==1){
            //纯贴图方块
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let pic = meshInfo.pic;
            let material = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let radius = this.radius, height = this.height;
            let geometry = new THREE.BoxGeometry(radius*2, height, radius*2);
            this.geometry = geometry;
            this.mapUv(310, 310, geometry, 1, 0, 0, 200, 110);
            this.mapUv(310, 310, geometry, 2, 0, 110, 200, 310); //top
            this.mapUv(310, 310, geometry, 4, 200, 110, 310, 310); //right
            this.hitObj = new THREE.Mesh(geometry, material);
            cb(this);
        } else if (geoType==2){
            //纯色方块 + 正上方的面贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material0,material1];
            let radius = this.radius;
            let geometry = new THREE.BoxGeometry(radius*2,this.height,radius*2);
            this.geometry = geometry;
            let plane = new THREE.PlaneGeometry(radius*2,radius*2);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }else if (geoType==3){
            //纯色圆柱
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let material = new THREE.MeshLambertMaterial({color:color});
            let radius = this.radius, height = this.height;
            let geometry = new THREE.CylinderGeometry(radius,radius,height,50);
            this.geometry = geometry;
            this.hitObj = new THREE.Mesh(geometry, material);
            cb(this);
        } else if (geoType==4){
            // 纯色圆柱 + 上方贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material0,material1];
            let radius = this.radius;
            let geometry = new THREE.CylinderGeometry(radius, radius, this.height, 50);
            this.geometry = geometry;
            let plane = new THREE.CircleGeometry(radius,50);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry, 0, [{x: 0, y: 0, z: 0}]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }else if (geoType==5){
            // 圆柱侧面贴图 + 上方纯色
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material0,material1];
            let radius = this.radius;
            let geometry = new THREE.CylinderGeometry(radius, radius, this.height, 50);
            this.geometry = geometry;
            let plane = new THREE.CircleGeometry(radius,50);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry, 1, [{x: 0, y: 0, z: 0}]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 0, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        } else if (geoType==6){
            //纯色圆凳
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let material = new THREE.MeshLambertMaterial({color: color});
            let materials = [material];
            let totalGeometry = new THREE.Geometry();
            let radius = this.radius, height = this.height;
            let bottomHeight = 3.8;
            let topHeight = this.height - bottomHeight;
            let bottomGeometry = new THREE.CylinderGeometry(radius - 3, radius - 2, bottomHeight, 50);
            let topGeometry = new THREE.CylinderGeometry(radius, radius, topHeight, 50);
            this.geometry = topGeometry;
            this.merge(totalGeometry, bottomGeometry, 0, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
            this.merge(totalGeometry, topGeometry, 0, [{
                x: 0,
                y: bottomHeight + topHeight / 2 - this.height / 2,
                z: 0
            }]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        } else if (geoType==7){
            //纯色圆凳 + 正上方的面贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material,material1];
            let totalGeometry = new THREE.Geometry();
            let radius = this.radius, height = this.height;
            let bottomHeight = 3.8;
            let topHeight = this.height - bottomHeight;
            let bottomGeometry = new THREE.CylinderGeometry(radius - 3, radius - 2, bottomHeight, 50);
            let topGeometry = new THREE.CylinderGeometry(radius, radius, topHeight, 50);
            this.geometry = topGeometry;
            let plane = new THREE.CircleGeometry(radius,50);
            this.merge(totalGeometry, bottomGeometry, 0, [{x: 0, y: -(this.height - bottomHeight) / 2, z: 0}]);
            this.merge(totalGeometry, topGeometry, 0, [{
                x: 0,
                y: bottomHeight + topHeight / 2 - this.height / 2,
                z: 0
            }]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }else if (geoType==8){
            //纯色花瓣
            this.canChange = false;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let color = meshInfo.color;
            let material0 = new THREE.MeshLambertMaterial({color: 0xffffff});
            let material1 = new THREE.MeshLambertMaterial({color: color});
            let materials = [material0,material1];
            let radius = this.radius, height = this.height;
            let geometry = new THREE.BoxGeometry(radius*2,this.height,radius*2);
            this.geometry = geometry;
            let r = radius/2;
            //白色圆心
            let geometry0 = new THREE.CylinderGeometry(0.5, 0.5, this.height, 50);
            let geometry1 = new THREE.BoxGeometry(r*2,this.height,r*2);
            let geometry2 = new THREE.CylinderGeometry(r, r, this.height, 50);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry,geometry0,0,[{x:0,y:0.01,z:0}]);
            this.merge(totalGeometry,geometry1,1,[{x:0,y:0,z:0}]);
            this.merge(totalGeometry,geometry2,1,[{x:0,y:0,z:r},{x:0,y:0,z:-r},{x:-r,y:0,z:0},{x:r,y:0,z:0}]);
            this.hitObj = new THREE.Mesh(totalGeometry,materials);
            cb(this);
        }else if (geoType==9){
            // 纯色方凳
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let color = meshInfo.color;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let materials = [material0];
            let r = Config.BLOCK.radius;
            let topH = 2.1;
            let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
            this.geometry = geometry0;
            let smallR = 2.8;
            let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
            this.merge(totalGeometry, geometry1, 0, [
                {x: -r+smallR/2, y: 0, z: r-smallR/2},
                {x: r-smallR/2, y: 0, z: r-smallR/2},
                {x: -r+smallR/2, y: 0, z: -r+smallR/2},
                {x: r-smallR/2, y: 0, z: -r+smallR/2}
            ]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }else if (geoType==10){
            // 纯色方凳 + 上面贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 4;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material0,material1];
            let r = Config.BLOCK.radius;
            let topH = 2.1;
            let geometry0 = new THREE.BoxGeometry(r*2,topH,r*2);
            this.geometry = geometry0;
            let smallR = 2.8;
            let geometry1 = new THREE.BoxGeometry(smallR,this.height,smallR);
            let plane = new THREE.PlaneGeometry(r*2,r*2);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry0, 0, [{x: 0, y: (this.height-topH)/2, z: 0}]);
            this.merge(totalGeometry, geometry1, 0, [
                {x: -r+smallR/2, y: 0, z: r-smallR/2},
                {x: r-smallR/2, y: 0, z: r-smallR/2},
                {x: -r+smallR/2, y: 0, z: -r+smallR/2},
                {x: r-smallR/2, y: 0, z: -r+smallR/2}
            ]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }else if (geoType==11){
            // 纯色"工"字圆凳
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let materials = [material0];
            let r = Config.BLOCK.radius;
            let outH = 1.2;
            let geometry = new THREE.CylinderGeometry(r, r, outH, 50);
            this.geometry = geometry;
            let geometry1 = new THREE.CylinderGeometry(r/2+0.5, r/2+0.5, this.height, 50);

            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry,geometry,0,[{x:0,y:(this.height/2-outH/2),z:0},{x:0,y:-(this.height/2-outH/2),z:0}]);
            this.merge(totalGeometry,geometry1,0,[{x:0,y:0,z:0}]);
            this.hitObj = new THREE.Mesh(totalGeometry,materials);
            cb(this);
        } else if (geoType==12){
            // 纯色"工"字圆凳 + 正上方贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let color = meshInfo.color;
            let pic = meshInfo.pic;
            let material0 = new THREE.MeshLambertMaterial({color: color});
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pic)
            });
            let materials = [material0,material1];
            let r = Config.BLOCK.radius;
            let outH = 1.2;
            let geometry = new THREE.CylinderGeometry(r, r, outH, 50);
            this.geometry = geometry;
            let geometry1 = new THREE.CylinderGeometry(r/2+0.5, r/2+0.5, this.height, 50);
            let plane = new THREE.CircleGeometry(r,50);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry,geometry,0,[{x:0,y:(this.height/2-outH/2),z:0},{x:0,y:-(this.height/2-outH/2),z:0}]);
            this.merge(totalGeometry,geometry1,0,[{x:0,y:0,z:0}]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 1, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry,materials);
            cb(this);
        }else if (geoType==13){
            // 圆柱侧面贴图 + 上方贴图
            this.canChange = true;
            this.isDrawBySelf = true;
            this.radiusSegments = 50;
            let pics = meshInfo.pic.split(/[,，]/);
            let material0 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pics[0])
            });
            let material1 = new THREE.MeshLambertMaterial({
                map: Config.loader.load(pics[1])
            });
            let materials = [material0,material1];
            let radius = this.radius;
            let geometry = new THREE.CylinderGeometry(radius, radius, this.height, 50);
            this.geometry = geometry;
            let plane = new THREE.CircleGeometry(radius,50);
            let totalGeometry = new THREE.Geometry();
            this.merge(totalGeometry, geometry, 1, [{x: 0, y: 0, z: 0}]);
            plane.rotateX(-Math.PI / 2);
            this.merge(totalGeometry, plane, 0, [{x: 0, y: this.height/2+0.01, z: 0}]);
            this.hitObj = new THREE.Mesh(totalGeometry, materials);
            cb(this);
        }
    },
    getObjInfo4Type:function(type){
        let seasonSeg = window.ObjInfo.seasonSegment;
        let objInfo;
        for (let i=0;i<seasonSeg.length;++i){
            if (type>=seasonSeg[i].min && type<=seasonSeg[i].max){
                objInfo = seasonSeg[i].objInfo[type];
                objInfo.seasonName = seasonSeg[i].season;
                break;
            }
        }
        return objInfo;
    },
    //加载OBJ
    loadObjFile:function(type,objInfo,cb){
        let path = objInfo.path;
        let filename = objInfo.name;
        let index = objInfo.index;
        let rotateY = objInfo.rotateY;
        let posX = objInfo.posX;
        let posZ = objInfo.posZ;

        let loadOBJ = new LoadOBJ(path,filename,function (foxObj) {

            for (let i=0;i<foxObj.children.length;++i){
                foxObj.children[i].receiveShadow = true;
            }

            this.geometry = foxObj.children[index].geometry;

            this.hitObj = foxObj;
            this.hitObj.receiveShadow = true;
            this.hitObj.name = 'hitObj';
            this.body.add(this.hitObj);
            this.hitObj.matrixAutoUpdate = false;

            //记录特殊block的特殊geometry
            if (type==100000){
                //cd
                this.cdMeshes = [
                    foxObj.children[3],
                    foxObj.children[4],
                    foxObj.children[5],
                    foxObj.children[6]
                ];
                this.body.position.x = -0.06;
            }else if(type==100001){
                //称
                this.indicatorMeshed = [
                    foxObj.children[4],
                    foxObj.children[5]
                ];
                // 指针1处理
                let obj = new THREE.Object3D();
                let pos = this.indicatorMeshed[0].position.clone();
                obj.position.set(pos.x,pos.y-2,pos.z);
                this.hitObj.add(obj);
                this.hitObj.remove(this.indicatorMeshed[0]);
                this.indicatorMeshed[0].position.set(pos.x,pos.y+2,pos.z);
                obj.add(this.indicatorMeshed[0]);
                // obj.rotation.x = -Math.PI/3;

                // 指针2处理
                let obj1 = new THREE.Object3D();
                let pos1 = this.indicatorMeshed[1].position.clone();
                obj1.position.set(pos1.x,pos1.y-2,pos1.z);
                this.hitObj.add(obj1);
                this.hitObj.remove(this.indicatorMeshed[1]);
                this.indicatorMeshed[1].position.set(pos1.x,pos1.y+2,pos1.z);
                obj1.add(this.indicatorMeshed[1]);
                // obj1.rotation.z = Math.PI/3;

                this.indicatorMeshed.pop();
                this.indicatorMeshed.pop();
                this.indicatorMeshed.push(obj,obj1);

                this.body.position.x = -0.1;
                this.body.position.z = -0.1;

            }else if (type==100002){
                this.lightsMeshes = [
                    //红灯
                    foxObj.children[2],
                    foxObj.children[5],
                    //黄灯
                    foxObj.children[3],
                    foxObj.children[6],
                    //绿灯
                    foxObj.children[1],
                    foxObj.children[4]
                ];
                this.green2Light = foxObj.children[1].material.color.clone();
                this.yellow2Light = foxObj.children[3].material.color.clone();
                this.red2Light = foxObj.children[2].material.color.clone();
                this.white2Light = new THREE.Color(1,1,1);
                for (let i=0;i<this.lightsMeshes.length;++i){
                    this.lightsMeshes[i].material.color = this.white2Light.clone();
                }
                this.body.position.x = -0.2;
                this.body.position.z = -0.5;
            } else if (type==100003){
                //易拉罐
                this.bubblesMeshes = [
                    foxObj.children[0],
                    foxObj.children[1],
                    foxObj.children[2]
                ];
                this.y4BubblePostions = [
                    {min:-2.5,max:3.5},
                    {min:-4.5,max:1.5},
                    {min:-7,max:-1},
                ];
                for (let i=0;i<this.bubblesMeshes.length;++i){
                    this.bubblesMeshes[i].position.y = this.y4BubblePostions[i].min;
                    this.bubblesMeshes[i].material.transparent = true;
                }
            }

            this.hitObj.rotation.y = rotateY * Math.PI / 180.0;
            this.body.position.x = posX;
            this.body.position.z = posZ;

            this.hitObj.updateMatrix();
            this.shadow.initZ = this.shadow.position.z;
            this.shadow.initScale = this.shadow.scale.y;
            this.body.position.y = Config.BLOCK.height / 2 - this.height / 2;
            this.obj.add(this.shadow);
            this.obj.add(this.body);
            if (cb){
                cb(this);
            }
        }.bind(this));
    },
    //在block上添加乐卡
    addLeCard:function(){
        let objInfo = Config.LeCardInBlock;
        let path = objInfo.path;
        let filename = objInfo.name;
        let loadOBJ = new LoadOBJ(path,filename,function (foxObj) {
            this.LeCard = foxObj;
            this.LeCard.castShadow = false;
            for (let i=0;i<foxObj.children.length;++i){
                foxObj.children[i].castShadow = false;
                foxObj.children[i].material.transparent = true;
            }
            this.LeCard.name = 'LeCard';
            this.LeCard.position.set(0, Config.BLOCK.height/2+1, 0);
            this.body.add(this.LeCard);
            this.LeCard.visible = false;
        }.bind(this));
    },
    showLeCard:function(index){
        this.leCardIndex = index;
        if (this.LeCard){
            _animation.customAnimation.to(this.LeCard.children[0].material, 0.01, { opacity: 1 });
            this.LeCard.visible = true;
            let self = this;
            this.LeCardIntervalTimer = setInterval(function () {
                self.LeCard.rotation.y += 0.02;
            },20);
        }
    },

    hideLeCard:function(now){
        if (this.LeCard){
            if (now){
                if (this.LeCardIntervalTimer){
                    clearInterval(this.LeCardIntervalTimer);
                    this.LeCardIntervalTimer = null;
                }
                this.LeCard.visible = false;
            }else {
                let self = this;
                _animation.customAnimation.to(this.LeCard.children[0].material, 2, { opacity: 0, onComplete: function onComplete() {
                    if (self.LeCardIntervalTimer){
                        clearInterval(self.LeCardIntervalTimer);
                        self.LeCardIntervalTimer = null;
                    }
                    self.LeCard.visible = false;
                } });
            }
        }
    },

    //添加五彩石
    addColorStone:function(){
        let objInfo = Config.colorStoneInBlock;
        let path = objInfo.path;
        let filename = objInfo.name;
        let loadOBJ = new LoadOBJ(path,filename,function (foxObj) {
            this.colorStone = foxObj;
            this.colorStone.castShadow = false;
            for (let i=0;i<foxObj.children.length;++i){
                foxObj.children[i].castShadow = false;
                foxObj.children[i].material.transparent = true;
            }
            this.colorStone.name = 'colorStone';
            this.colorStone.position.set(0, Config.BLOCK.height/2+1, 0);
            this.body.add(this.colorStone);
            this.colorStone.visible = false;
        }.bind(this));
    },
    showColorStone:function(index){
        console.log('展示五彩石');
        this.colorStoneIndex = index;
        if (this.colorStone){
            let colorArr = [
                new THREE.Color(92/255.0,213/255.0,98/255.0),
                new THREE.Color(147/255.0,62/255.0,212/255.0),
                new THREE.Color(0/255.0,210/255.0,255/255.0),
                new THREE.Color(255/255.0,222/255.0,0/255.0),
                new THREE.Color(255/255.0,161/255.0,43/255.0),
            ];
            let selected = parseInt(Math.random()*100%colorArr.length);
            this.colorStone.children[0].material.color = colorArr[selected].clone();
            _animation.customAnimation.to(this.colorStone.children[0].material, 0.01, { opacity: 1 });
            this.colorStone.visible = true;
            let self = this;
            this.colorStoneIntervalTimer = setInterval(function () {
                self.colorStone.rotation.y += 0.02;
            },20);
        }
    },
    hideColorStone:function(now){
        if (this.colorStone){
            if (now){
                if (this.colorStoneIntervalTimer){
                    clearInterval(this.colorStoneIntervalTimer);
                    this.colorStoneIntervalTimer = null;
                }
                this.colorStone.visible = false;
            }else {
                let self = this;
                _animation.customAnimation.to(this.colorStone.children[0].material, 2, { opacity: 0, onComplete: function onComplete() {
                    if (self.colorStoneIntervalTimer){
                        clearInterval(self.colorStoneIntervalTimer);
                        self.colorStoneIntervalTimer = null;
                    }
                    self.colorStone.visible = false;
                } });
            }
        }
    },

    //cd旋转
    rotateCD:function(){
        let self = this;
        if (this.cdMeshes.length > 0){
            this.cdIntervalTimer = setInterval(function () {
                for (let i=0;i<self.cdMeshes.length;++i){
                    self.cdMeshes[i].rotation.y += 0.02;
                }
            },20);
        }
    },
    //循环亮灯
    loopLight:function(){
        let self = this;
        if (this.lightsMeshes.length>0){
            self.lightsMeshes[0].material.color = self.red2Light.clone();
            self.lightsMeshes[1].material.color = self.red2Light.clone();
            this.lightUpIndex = 0;
            this.lightIntervalTImer = setInterval(function () {
                self.lightUpIndex++;
                if (self.lightUpIndex>2){
                    self.lightUpIndex = 0;
                    clearInterval(self.lightIntervalTImer);
                    self.lightIntervalTImer = null;
                    for (let i=0;i<self.lightsMeshes.length;++i){
                        self.lightsMeshes[i].material.color = self.white2Light.clone();
                    }
                    return;
                }

                let color;
                if (self.lightUpIndex==0){
                    //红灯
                    color = self.red2Light.clone();
                }else if (self.lightUpIndex==1){
                    //黄灯
                    color = self.yellow2Light.clone();
                } else if (self.lightUpIndex==2){
                    //绿灯
                    color = self.green2Light.clone();
                }
                self.lightsMeshes[2*self.lightUpIndex].material.color = color.clone();
                self.lightsMeshes[2*self.lightUpIndex+1].material.color = color.clone();
                for (let i=0;i<self.lightsMeshes.length;++i){
                    if (i!==2*self.lightUpIndex && i!==2*self.lightUpIndex+1){
                        self.lightsMeshes[i].material.color = self.white2Light.clone();
                    }
                }

            },800);
        }
    },
    //气泡上升
    bubbleRaiseUp:function(){
        if (this.bubblesMeshes.length>0){
            let self = this;
            let deltaX = 3;
            // let deltaZ = 0;
            _animation.customAnimation.to(this.bubblesMeshes[2].position, 1.5, {y: this.y4BubblePostions[2].max, x:deltaX, onComplete: function onComplete() {
                let that = self;
                setTimeout(function () {
                    that.bubblesMeshes[2].position.x = 0;
                    that.bubblesMeshes[2].position.y = that.y4BubblePostions[2].min;
                    that.bubblesMeshes[2].scale.set(1,1,1);
                    that.bubblesMeshes[2].material.opacity = 1;
                },100);
            }});
            _animation.customAnimation.to(this.bubblesMeshes[2].scale, 1.5, {x:2,y:2,z:2});
            _animation.customAnimation.to(this.bubblesMeshes[2].material, 1.5, {opacity: 0});


            _animation.customAnimation.to(this.bubblesMeshes[1].position, 1.5, {y: this.y4BubblePostions[1].max, x:deltaX, delay: 0.5, onComplete: function onComplete() {
                let that = self;
                setTimeout(function () {
                    that.bubblesMeshes[1].position.x = 0;
                    that.bubblesMeshes[1].position.y = that.y4BubblePostions[1].min;
                    that.bubblesMeshes[1].scale.set(1,1,1);
                    that.bubblesMeshes[1].material.opacity = 1;
                },100);
            }});
            _animation.customAnimation.to(this.bubblesMeshes[1].scale, 1.5, {x:2,y:2,z:2,delay: 0.5});
            _animation.customAnimation.to(this.bubblesMeshes[1].material, 1.5, {opacity: 0, delay: 0.5});
            //
            //
            _animation.customAnimation.to(this.bubblesMeshes[0].position, 1.5, {y: this.y4BubblePostions[0].max, x:deltaX, delay: 1, onComplete: function onComplete() {
                let that = self;
                setTimeout(function () {
                    that.bubblesMeshes[0].position.x = 0;
                    that.bubblesMeshes[0].position.y = that.y4BubblePostions[0].min;
                    that.bubblesMeshes[0].scale.set(1,1,1);
                    that.bubblesMeshes[0].material.opacity = 1;
                },100);
            }});
            _animation.customAnimation.to(this.bubblesMeshes[0].scale, 1.5, {x:2,y:2,z:2,delay: 1});
            _animation.customAnimation.to(this.bubblesMeshes[0].material, 1.5, {opacity: 0, delay: 1});
        }
    },
    //指针转动
    rotateIndicator:function(){
        let delta = 0.04;
        this.angle4Indicator0 = delta;
        this.isAdd4Indicator0 = -1;

        this.angle4Indicator1 = delta;
        this.isAdd4Indicator1 = 1;
        let self = this;

        self.indicatorMeshed[0].rotation.x = self.angle4Indicator0;
        self.indicatorMeshed[1].rotation.z = self.angle4Indicator1;

        this.indicatorIntervalTimer = setInterval(function () {
            self.angle4Indicator0 += delta*self.isAdd4Indicator0;
            self.angle4Indicator1 += delta*self.isAdd4Indicator1;
            if (self.angle4Indicator0 < -Math.PI *5/12) {
                self.isAdd4Indicator0 = 1;
            }else if (self.angle4Indicator0 > Math.PI *5/12){
                self.isAdd4Indicator0 = -1;
            }
            if (self.angle4Indicator1 < -Math.PI *5/12) {
                self.isAdd4Indicator1 = 1;
            }else if (self.angle4Indicator1 > Math.PI *5/12){
                self.isAdd4Indicator1 = -1;
            }
            self.indicatorMeshed[0].rotation.x = self.angle4Indicator0;
            self.indicatorMeshed[1].rotation.z = self.angle4Indicator1;
        },20);

        this.indicatorTimeoutTimer = setTimeout(function () {
            self.rotateIndicator2One();
        },2000);

    },

    //指针定到右偏一格
    rotateIndicator2One:function(){
        if (this.indicatorIntervalTimer) {
            clearInterval(this.indicatorIntervalTimer);
            this.indicatorIntervalTimer = null;
        }
        _animation.customAnimation.to(this.indicatorMeshed[0].rotation, 0.5, {x: -Math.PI *2/ 12});
        _animation.customAnimation.to(this.indicatorMeshed[1].rotation, 0.5, {z: Math.PI *2/ 12});
    },

    //将一个geometry合并到totalGeometry中
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

    //贴图用
    mapUv: function (textureWidth, textureHeight, geometry, faceIdx, x1, y1, x2, y2, flag) {
        let tileUvW = 1 / textureWidth;
        let tileUvH = 1 / textureHeight;
        if (geometry.faces[faceIdx] instanceof THREE.Face3) {
            let UVs = geometry.faceVertexUvs[0][faceIdx * 2];
            if (faceIdx == 4 && !flag) {
                UVs[0].x = x1 * tileUvW;
                UVs[0].y = y1 * tileUvH;
                UVs[2].x = x1 * tileUvW;
                UVs[2].y = y2 * tileUvH;
                UVs[1].x = x2 * tileUvW;
                UVs[1].y = y1 * tileUvH;
            } else {
                UVs[0].x = x1 * tileUvW;
                UVs[0].y = y1 * tileUvH;
                UVs[1].x = x1 * tileUvW;
                UVs[1].y = y2 * tileUvH;
                UVs[2].x = x2 * tileUvW;
                UVs[2].y = y1 * tileUvH;
            }
            let UVs1 = geometry.faceVertexUvs[0][faceIdx * 2 + 1];
            if (faceIdx == 4 && !flag) {
                UVs1[2].x = x1 * tileUvW;
                UVs1[2].y = y2 * tileUvH;
                UVs1[1].x = x2 * tileUvW;
                UVs1[1].y = y2 * tileUvH;
                UVs1[0].x = x2 * tileUvW;
                UVs1[0].y = y1 * tileUvH;
            } else {
                UVs1[0].x = x1 * tileUvW;
                UVs1[0].y = y2 * tileUvH;
                UVs1[1].x = x2 * tileUvW;
                UVs1[1].y = y2 * tileUvH;
                UVs1[2].x = x2 * tileUvW;
                UVs1[2].y = y1 * tileUvH;
            }
        }
    },

    //得到包围body的包围盒
    getBox: function () {
        if (this.boundingBox) return this.boundingBox;
        this.boundingBox = new THREE.Box3().setFromObject(this.body);
        return this.boundingBox;
    },

    // order = type = 15 专用
    glow: function () {
        this.hitObj.material.map = this.glowMap;
    },

    // order = type = 24 专用
    openDoor: function () {
        _animation.customAnimation.to(this.door.position, 1, {z: -4.5});
        _animation.customAnimation.to(this.secondDoor.position, 1, {z: -0.5});
    },

    closeDoor: function () {
        _animation.customAnimation.to(this.door.position, 1, {z: -3.3});
        _animation.customAnimation.to(this.secondDoor.position, 1, {z: -1.7});
    },

    // order = type = 17 专用
    rotateBox: function () {
        _animation.customAnimation.to(this.middle.rotation, 0.5, {y: -Math.PI / 2});
    },
    // order = type = 19 专用
    playMusic: function () {
        let _this2 = this;

        for (let i = 0; i < 2; ++i) {
            setTimeout(function (icon) {
                return function () {
                    icon.visible = true;
                    icon.position.set(0, 0, 0);
                    icon.material.opacity = 1;
                    _animation.customAnimation.to(icon.position, 2, {
                        x: 5 * (1 - 2 * Math.random()),
                        y: 15,
                        z: 5 * (1 - 2 * Math.random())
                    });
                    // customAnimation.to(this.icons[i].position, 3, { y: 15,  delay: i * 1 });
                    // customAnimation.to(this.icons[i].position, 3, { z: 10 * (1 - 2 * Math.random()),  delay: i * 1 });
                    _animation.customAnimation.to(icon.material, 2, {opacity: 0});
                };
            }(this.icons[i]), i * 1000);
        }
        this.musicTimer = setTimeout(function () {
            _this2.playMusic();
        }, 2500);
    },

    stopMusic: function () {
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
        if (this.cdIntervalTimer){
            clearInterval(this.cdIntervalTimer);
            this.cdIntervalTimer = null;
        }
        if (this.lightIntervalTImer){
            clearInterval(this.lightIntervalTImer);
            this.lightIntervalTImer = null;
            for (let i=0;i<this.lightsMeshes.length;++i){
                this.lightsMeshes[i].material.color = this.white2Light.clone();
            }
        }
        if (this.order==100001){
            if (this.indicatorIntervalTimer) {
                clearInterval(this.indicatorIntervalTimer);
                this.indicatorIntervalTimer = null;
            }
            if (this.indicatorTimeoutTimer){
                clearTimeout(this.indicatorTimeoutTimer);
                this.indicatorTimeoutTimer = null;
            }
            // _animation.TweenAnimation.killAll();
            _animation.customAnimation.to(this.indicatorMeshed[0].rotation, 0.5, {x: 0});
            _animation.customAnimation.to(this.indicatorMeshed[1].rotation, 0.5, {z: 0});

        }
    },

    change: function (radius, t, radiusScale) {

        if (!this.canChange) return;
        if (this.order >= 9) {
            let min = this.order >= 13 ? 0.7 : 0.6;
            this.radiusScale = radiusScale || Math.max(this._random.random() * (Config.BLOCK.maxRadiusScale - Config.BLOCK.minRadiusScale) + Config.BLOCK.minRadiusScale, this.min || min);
            this.radiusScale = +this.radiusScale.toFixed(2);
            this.radius = radius || this.radiusScale * Config.BLOCK.radius;
            this.radius = +this.radius.toFixed(2);
            this.obj.scale.set(this.radiusScale, 1, this.radiusScale);
            if (this.order == 27) {
                this.sphere.scale.set(1 / this.radiusScale, 1, 1 / this.radiusScale);
                this.sphere.updateMatrix();
            }
            //this.plane.scale.z = this.radiusScale;
            return;
        }
        this.radiusScale = radiusScale || this._random.random() * (Config.BLOCK.maxRadiusScale - Config.BLOCK.minRadiusScale) + Config.BLOCK.minRadiusScale;
        this.radiusScale = +this.radiusScale.toFixed(2);
        this.radius = radius || this.radiusScale * Config.BLOCK.radius;
        this.radius = +this.radius.toFixed(2);
        this.obj.scale.set(this.radiusScale, 1, this.radiusScale);
        // this.changeColor(t);
    },

    changeColor: function (t) {
        let type = t || this.types[Math.floor(Math.random() * 3)];
        if (this.type != type) {
            this.type = type;
            if (type == 'green') {
                this.greenMaterial.color.setHex(colors.green);
                this.whiteMaterial.color.setHex(colors.white);
                if (this.middleLightGreenMaterial) {
                    this.middleLightGreenMaterial.color.setHex(colors.middleLightGreen);
                }
            } else if (type == 'gray') {
                this.greenMaterial.color.setHex(colors.white);
                this.whiteMaterial.color.setHex(colors.gray);
                if (this.middleLightGreenMaterial) {
                    this.middleLightGreenMaterial.color.setHex(colors.middleLightGray);
                }
            } else if (type == 'black') {
                this.greenMaterial.color.setHex(colors.black);
                this.whiteMaterial.color.setHex(colors.lightBlack);
                if (this.middleLightGreenMaterial) {
                    this.middleLightGreenMaterial.color.setHex(colors.middleLightBlack);
                }
            }
        }
    },

    //通用方法，获得几何体的顶点信息,(x,z)的数组
    getVertices: function () {
        let _this3 = this;

        //this.hitObj.updateMatrixWorld();
        let vertices = [];
        let geometry = this.geometry || this.hitObj.geometry;
        if (this.order >= 100 && !this.isDrawBySelf){
            //获取obj模型的vertices,(x,z)的数组
            let vArr = this.geometry.attributes.position.array;
            for (let i=0;i<vArr.length-3;i+=3){
                let v = new THREE.Vector3(vArr[i],vArr[i+1],vArr[i+2]).applyMatrix4(_this3.hitObj.matrixWorld);
                let isIn = false;
                for (let j=0;j<vertices.length;++j){
                    if (v.x===vertices[j][0] && v.z===vertices[j][1]){
                        isIn = true;
                        break;
                    }
                }
                if (!isIn){
                    vertices.push([v.x,v.z]);
                }
            }
            let minX=vertices[0][0], maxX=vertices[0][0];
            let minZ=vertices[0][1], maxZ=vertices[0][1];
            for (let i=1;i<vertices.length;++i){
                let x = vertices[i][0], z = vertices[i][1];
                if (minX > x){
                    minX = x;
                }
                if (maxX < x){
                    maxX = x;
                }
                if (minZ > z){
                    minZ = z;
                }
                if (maxZ < z){
                    maxZ = z;
                }
            }
            if (this.isCylinder){
                //圆柱
                let len = vertices.length;
                vertices.splice(0,len);
                let centerX = (maxX+minX)/2;
                let centerZ = (maxZ+minZ)/2;
                let R = (maxX-minX)/2;
                let delta = Math.PI*2/50;
                for (let i=0;i<50;++i){
                    let x = centerX + R*Math.cos(delta*i);
                    let z = centerZ - R*Math.sin(delta*i);
                    vertices.push([x,z]);
                }
            }else {
                //立方体
                let len = vertices.length;
                vertices.splice(0,len);
                console.log('vertices length = '+vertices.length);
                let offset = 0;
                if (this.order === 107 || this.order===308||this.order===407){
                    offset = 0.8;
                }
                maxX -= offset;
                minX -= offset;
                maxZ -= offset;
                minZ -= offset;
                vertices.push([maxX,maxZ],[maxX,minZ],[minX,minZ],[minX,maxZ]);
            }
            return vertices;
        }
        if (this.radiusSegments === 4) {
            [0, 1, 4, 5].forEach(function (index) {
                let vertice = geometry.vertices[index].clone().applyMatrix4(_this3.hitObj.matrixWorld);
                vertices.push([vertice.x, vertice.z]);
            });
        } else {
            for (let i = 0; i < this.radiusSegments; ++i) {
                let vertice = geometry.vertices[i].clone().applyMatrix4(_this3.hitObj.matrixWorld);
                vertices.push([vertice.x, vertice.z]);
            }
        }
        return vertices;
    },

    //缩小
    shrink: function () {
        this.status = 'shrink';
    },

    _shrink: function () {
        //if (this.obj.position.y <= -BLOCK.floatHeight + 25) {
        this.scale -= Config.BLOCK.reduction;
        this.scale = Math.max(Config.BLOCK.minScale, this.scale);
        if (this.scale <= Config.BLOCK.minScale) {
            this.status = 'stop';
            return;
        }
        this.body.scale.y = this.scale;
        this.shadow.scale.y -= Config.BLOCK.reduction / 2;
        this.shadow.position.z += Config.BLOCK.reduction / 4 * this.shadowWidth;
        let distance = Config.BLOCK.reduction / 2 * Config.BLOCK.height
            * (Config.BLOCK.height - this.height / 2) / Config.BLOCK.height * 2;
        this.body.position.y -= distance;
        //}
        //this.obj.position.y -=  BLOCK.moveDownVelocity;
    },

    showup: function (i) {
        let shadowZ = this.shadow.position.z;
        // this.body.position.set(0, 20, 0);
        this.body.position.y = 20;
        this.shadow.position.z = -15;
        this.obj.visible = true;
        if (i == 3 || i == 4 || i == 6) {
            this.obj.position.set((i == 6 ? 5 : 3) * 7.5, 0, (i == 3 || i == 6 ? -1 : 1) * 3.8);
        } else if (i == 5) {
            this.obj.position.set(4 * 7.5, 0, 0);
        } else {
            this.obj.position.set(i * 7.5, 0, 0);
        }
        //TweenMax.to(this.obj.position, 0.5, { ease: Bounce.easeOut, y: 0 });
        (0, _animation.TweenAnimation)(this.body.position.y, Config.BLOCK.height / 2 - this.height / 2, 500, 'Bounce.easeOut', function (value, complete) {
            this.body.position.y = value;
        }.bind(this));
        (0, _animation.TweenAnimation)(this.shadow.position.z, shadowZ, 500, 'Bounce.easeOut', function (value, complete) {
            this.shadow.position.z = value;
        }.bind(this));
    },

    // order = type = 15 专用
    hideGlow: function () {
        this.hitObj.material.map = this.map;
    },

    popup: function () {
        this.status = 'popup';
        if (this.order == 15) {
            this.hideGlow();
        } else if (this.order == 25) {
            for (let i = 0; i < 10; ++i) {
                for (let j = 0; j < 4; ++j) {
                    this.numbers[i][j].visible = false;
                }
            }
            let date = new Date();
            let hour = ('0' + date.getHours()).slice(-2);
            let minute = ('0' + date.getMinutes()).slice(-2);
            this.numbers[hour[0]][0].position.x = -3.1 * this.radiusScale;
            this.numbers[hour[0]][0].visible = true;
            this.numbers[hour[1]][1].position.x = -1.2 * this.radiusScale;
            this.numbers[hour[1]][1].visible = true;
            this.numbers[minute[0]][2].position.x = 1.2 * this.radiusScale;
            this.numbers[minute[0]][2].visible = true;
            this.numbers[minute[1]][3].position.x = 3.1 * this.radiusScale;
            this.numbers[minute[1]][3].visible = true;
        } else if (this.order == 17) {
            this.middle.rotation.y = 0;
        }
        let shadowZ = this.shadow.position.z;
        this.body.position.y = 20;
        this.shadow.position.z = -15;
        this.obj.visible = true;
        this.boundingBox = null;
        // if (window.WechatGame){
        _animation.customAnimation.to(this.body.position, 0.5, {
            y: Config.BLOCK.height / 2 - this.height / 2,
            ease: 'Bounce.easeOut'
        });
        _animation.customAnimation.to(this.shadow.position, 0.5, {z: shadowZ, ease: 'Bounce.easeOut'});
        // }else{
        //     this.body.position.y = Config.BLOCK.height / 2 - this.height / 2;
        //     this.shadow.position.z = shadowZ;
        // }
    },

    reset: function () {
        this.status = 'stop';
        this.scale = 1;
        this.obj.scale.y = 1;
        this.body.scale.y = 1;
        this.obj.position.y = 0;
        this.body.position.y = Config.BLOCK.height / 2 - this.height / 2;
        this.shadow.scale.y = this.shadow.initScale;
        this.shadow.position.z = this.shadow.initZ;
        this.boundingBox = null;
        if (this.LeCard) {
            this.LeCard.visible = false;
        }
        if (this.colorStone){
            this.colorStone.visible = false;
        }
    },

    rebound: function () {
        this.status = 'stop';
        this.scale = 1;
        _animation.customAnimation.to(this.body.scale, 0.5, {ease: 'Elastic.easeOut', y: 1});
        _animation.customAnimation.to(this.body.position, 0.5, {
            ease: 'Elastic.easeOut',
            y: Config.BLOCK.height / 2 - this.height / 2
        });

        _animation.customAnimation.to(this.shadow.scale, 0.5, {ease: 'Elastic.easeOut', y: this.shadow.initScale});
        _animation.customAnimation.to(this.shadow.position, 0.5, {ease: 'Elastic.easeOut', z: this.shadow.initZ});
    },

    update: function () {
        //console.log('in Block update() this.status = ' + this.status);
        if (this.order == 19) {
            this.record.rotation.y += 0.01;
        }
        if (this.status === 'stop') return;
        if (this.status === 'shrink') {
            this._shrink();
        } else if (this.status === 'popup') {
            //this._popup();
        }
    },
};

export default Block;
