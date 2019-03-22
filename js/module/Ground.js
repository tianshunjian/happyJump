'use strict';

import * as Animation from '../base/TweenAnimation.js';
import * as Config from '../base/Config.js';
import * as THREE from '../libs/three/three.min.js';

var Ground = function () {
    function Ground(activityName) {
        // _classCallCheck(this, Ground);

        this.obj = new THREE.Object3D();
        this.obj.name = 'ground';
        let geometry = new THREE.PlaneGeometry(window.WIDTH / window.HEIGHT * Config.FRUSTUMSIZE, Config.FRUSTUMSIZE);
        this.materials = [];
        // var colors = [['rgba(215, 219, 230, 1)', 'rgba(188, 190, 199, 1)'], ['rgba(255, 231, 220, 1)', 'rgba(255, 196, 204, 1)'], ['rgba(255, 224, 163, 1)', 'rgba(255, 202, 126, 1)'], ['rgba(255, 248, 185, 1)', 'rgba(255, 245, 139, 1)'], ['rgba(218, 244, 255, 1)', 'rgba(207, 233, 210, 1)'], ['rgba(219, 235, 255, 1)', 'rgba(185, 213, 235, 1)'], ['rgba(216, 218, 255, 1)', 'rgba(165, 176, 232, 1)'], ['rgba(207, 207, 207, 1)', 'rgba(199, 196, 201, 1)']];
        // let colors = [
        //     ['rgba(164, 232, 175, 1)', 'rgba(145, 215, 170, 1)'],
        //     ['rgba(122, 223, 214, 1)', 'rgba(53, 202, 190, 1)'],
        //     ['rgba(250, 223, 117, 1)', 'rgba(240, 190, 124, 1)'],
        //     ['rgba(223, 235, 242, 1)', 'rgba(195, 218, 232, 1)'],
        //     ['rgba(142, 153, 153, 1)', 'rgba(122, 137, 156, 1)']
        // ];
        let colors = [];
        let seasonSeg = window.ObjInfo.seasonSegment;
        for (let i=0;i<4;++i){
            colors.push(seasonSeg[i].bgColor);
        }
        for (let i=0;i<seasonSeg.length;++i){
            if (seasonSeg[i].season == activityName){
                colors.push(seasonSeg[i].bgColor);
                break;
            }
        }
        this.colorLength = colors.length;
        let that = this;
        for (let i = 0; i < this.colorLength; ++i) {
            let texture = new THREE.Texture(that.generateLaserBodyCanvas(colors[i][0], colors[i][1]));
            texture.needsUpdate = true;
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                opacity: 1,
                transparent: true
            });
            that.materials.push(material);
            let ground = new THREE.Mesh(geometry, material);
            ground.position.z = -(i + 1) * 0.1;
            ground.name = 'ground_'+i;
            ground.updateMatrix();
            ground.matrixAutoUpdate = false;
            that.obj.add(ground);
            //if ( i >= 1) ground.visible = false;

        }
        for (let i = 1; i < this.colorLength; ++i) {
            this.obj.children[i].visible = false;
        }
        this.current = 0;

        //this.obj.receiveShadow = true;
        //this.obj.rotation.x = -Math.PI / 2 ;
        //this.obj.rotation.z = -Math.PI / 3 ;
        //this.obj.matrixAutoUpdate = false;
    }

    return Ground;
}();

Ground.prototype = {
    //生成渐变色canvas
    generateLaserBodyCanvas: function (colorStart, colorStop) {
        // init canvas
        // set gradient
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        context.clearRect(0, 0, canvas.width, canvas.height);
        let gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        //gradient.addColorStop( 0.3, 'rgba(40, 40, 40, 1)' );
        //gradient.addColorStop( 0.5, 'rgba(255, 255, 255, 1)' );
        //gradient.addColorStop( 0.7, 'rgba(40, 40, 40, 1)' );
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorStop);
        // fill the rectangle
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // return the just built canvas

        return canvas;
    },

    changeColor: function (special) {
        let _this = this;

        let next = this.current + 1 > 3 ? 0 : this.current + 1;
        let duration = 3;
        if (special==4){
            next = 4;
            duration = 1;
        }
        let current = this.current;
        Animation.customAnimation.to(this.materials[this.current], duration, { opacity: 0, onComplete: function onComplete() {
            _this.obj.children[current].visible = false;
        } });
        this.obj.children[next].visible = true;
        Animation.customAnimation.to(this.materials[next], duration, { opacity: 1 });
        this.current = next;
    },

    resetGround:function () {
        this.current = 0;
        this.obj.children[0].visible = true;
        Animation.customAnimation.to(this.materials[0], 0.01, { opacity: 1 });
        for (let i=1; i<this.colorLength; ++i){
            this.obj.children[i].visible = false;
        }
    },
};

export default Ground;
