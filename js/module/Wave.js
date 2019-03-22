'use strict';

import * as Config from '../base/Config.js';
import * as THREE from '../libs/three/three.min.js';

var Wave = function () {
    function Wave() {
        // _classCallCheck(this, Wave);

        let geometry = new THREE.RingGeometry(Config.WAVE.innerRadius, Config.WAVE.outerRadius, Config.WAVE.thetaSeg);
        let material = new THREE.MeshBasicMaterial({ color: Config.COLORS.pureWhite, transparent: true });
        this.obj = new THREE.Mesh(geometry, material);
        this.obj.rotation.x = -Math.PI / 2;
        this.obj.name = 'wave';
        //this.obj.visible = false;
    }

    return Wave;
}();

Wave.prototype = {
    reset: function () {
        this.obj.scale.set(1, 1, 1);
        this.obj.material.opacity = 1;
        this.obj.visible = false;
    }
};

export default Wave;
