'use strict';

import * as THREE from '../libs/three/three.min.js';

var cellTailConfig = {
    duration: 100,
    height: 2.0,
    width: 0.5,
    distance: 0.5
};

var TailSystem = function () {
    function TailSystem(scene, bottle) {
        // _classCallCheck(this, TailSystem);

        this.scene = scene;
        this.bottle = bottle;
        this.tailsRemainPool = [];
        this.tailsUsingPool = [];
        this.lastDotPosition = this.bottle.obj.position.clone();
        this.nowPosition = this.bottle.obj.position.clone();

        this.distance = cellTailConfig.distance;

        this.init();
    }

    return TailSystem;
}();

TailSystem.prototype = {
    init: function () {
        let width = cellTailConfig.width;
        let height = cellTailConfig.height;
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        //this.cloneMesh = new THREE.Mesh(geometry, material)
        //this.cloneMesh.visible = false
        // this.cloneMesh.visible = true

        // 创造50个尾巴单元,平面和圆柱，先选择平面
        for (let i = 0; i < 20; i++) {
            let cellTail = new CellTail(this.geometry, this.material);

            this.scene.add(cellTail.mesh);
            this.tailsRemainPool.push(cellTail);
        }
    },

    update: function (tickTime) {
        // console.log(tickTime)
        this.updateActiveCell(tickTime);
        if (this.bottle.status == 'prepare') {
            this.nowPosition = this.bottle.obj.position.clone();
            this.lastDotPosition = this.bottle.obj.position.clone();
        }

        if (this.bottle.status == 'jump') {
            let distance = void 0;

            // 更新位置
            this.nowPosition = this.bottle.obj.position.clone();

            distance = this.nowPosition.clone().distanceTo(this.lastDotPosition.clone());
            if (distance < 5) {
                if (distance >= this.distance) {
                    // 距离过大问题
                    let m = distance / this.distance;
                    let n = Math.floor(m);
                    let lastPosition = this.lastDotPosition.clone();
                    let nowPosition = this.nowPosition.clone();
                    let tickScale = tickTime / cellTailConfig.duration;
                    for (let i = 1; i <= n; i++) {
                        nowPosition = this.lastDotPosition.clone().lerp(this.nowPosition.clone(), i / m);
                        let scale = 1 + tickScale * (i / m - 1);
                        scale = scale <= 0 ? 0 : scale;
                        this.layEgg(lastPosition.clone(), nowPosition.clone(), scale);
                        lastPosition = nowPosition.clone();
                        if (i == n) {
                            this.lastDotPosition = nowPosition.clone();
                        }
                    }
                }
            } else {
                this.lastDotPosition = this.nowPosition.clone();
            }
        }
    },

    updateActiveCell: function (tickTime) {
        let array = this.tailsUsingPool;
        let deltaScaleY = 1 / cellTailConfig.duration;
        let delatAlpha = 1 / cellTailConfig.duration;
        for (let i = 0; i < array.length; i++) {
            // 更新时间
            array[i].tickTime += tickTime;

            // 压缩所有cell的高度
            let newScale = array[i].mesh.scale.y - deltaScaleY * tickTime;
            if (newScale > 0) {

                array[i].mesh.scale.y = newScale > 0 ? newScale : 0;

                // array[i].mesh.material.opacity = 0.3

                // 判断透明度和高度，剔除用完的
                if (array[i].tickTime >= cellTailConfig.duration) {
                    array[i].reset();
                    let cell = array.shift();
                    this.tailsRemainPool.push(cell);
                    i--;
                }
            } else {
                array[i].reset();
                let _cell = array.shift();
                this.tailsRemainPool.push(_cell);
                i--;
            }
        }
    },

    correctPosition: function () {
        this.lastDotPosition = this.bottle.obj.position.clone();
    },

    layEgg: function (lastDotPosition, nowPosition) {
        let scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

        // 获取一个
        let cellTail = this.getMesh();

        this.tailsUsingPool.push(cellTail);

        // 摆放位置
        cellTail.mesh.position.set(nowPosition.x, nowPosition.y, nowPosition.z);

        cellTail.mesh.scale.y = scale;

        // 修正方向
        cellTail.mesh.lookAt(lastDotPosition);

        cellTail.mesh.rotateY(Math.PI / 2);

        // 变可见
        cellTail.mesh.visible = true;
    },

    getMesh: function () {
        let res = this.tailsRemainPool.shift();
        if (!res) {
            res = new CellTail(this.geometry, this.material);
            this.scene.add(res.mesh);
        }
        return res;
    },

    allReset: function () {
        this.tailsRemainPool.forEach(function (el) {
            el.reset();
        });
    }
};

var CellTail = function () {
    function CellTail(geometry, material) {
        // _classCallCheck(this, CellTail);

        this.tickTime = 0;
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.visible = false;
        this.mesh.name = 'tail';
    }

    return CellTail;
}();

CellTail.prototype = {
    reset: function () {
        this.tickTime = 0;
        this.mesh.scale.set(1, 1, 1);
        this.mesh.visible = false;
    }
};

export default TailSystem;
