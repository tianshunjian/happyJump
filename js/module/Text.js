'use strict';

import * as THREE from '../libs/three/three.min.js';
import * as Font from '../base/Font.js';
import * as Config from '../base/Config.js';

var Text = function (text, options) {
    function Text(text, options) {
        this.material = new THREE.MeshBasicMaterial({ color: options.fillStyle || 0xffffff, transparent: true });
        if (options.opacity) this.material.opacity = options.opacity;
        this.options = options || {};
        this.obj = new THREE.Object3D();
        this.obj.name = 'text';
        if (options.chinese) {
            let chinese = new THREE.Mesh(new THREE.TextGeometry(text, { 'font': Font.default, 'size': 1.0, 'height': 0.1 }), this.material);
            this.obj.add(chinese);
            if (options.textAlign == 'center') chinese.position.x = text.length * 1.1 / -2;
            // var chinese = new THREE.Mesh(new THREE.TextGeometry(text, { 'font': FONT, 'size': 1.0, 'height': 0.1 }), this.material);
            // this.obj.add(chinese);
            // if (options.textAlign == 'center') chinese.position.x = text.length * 1.1 / -2;
        } else if(options.LeCard){
            //乐卡
            this.LeCards = [];
            let amount = 3;
            for (var i=0;i<10;++i){
                let duplicateArr = [];
                let geometry = new THREE.TextGeometry(i, { 'font': Font.default, 'size': 2.0, 'height': 0.1 });
                for (let j = 0; j < amount; ++j) {
                    let leCard = new THREE.Mesh(geometry, this.material);
                    leCard.using = false;
                    duplicateArr.push(leCard);
                }
                this.LeCards.push(duplicateArr);
            }
            this.setLeCard(text);
            let LeCardGeometry = new THREE.PlaneGeometry(3, 2);
            this.TopLeCard = new THREE.Mesh(LeCardGeometry, Config.TopLeCard);
            this.TopLeCard.position.set(0, 0, 0);
            this.obj.add(this.TopLeCard);
        } else {
            this.scores = [];
            this.plus = new THREE.Mesh(new THREE.TextGeometry('+', { 'font': Font.default, 'size': 3.0, 'height': 0.1 }), this.material);
            let amount = this.options.sumScore ? 5 : 2;
            for (let i = 0; i < 10; ++i) {
                let duplicateArr = [];
                let geometry = new THREE.TextGeometry(i, { 'font': Font.default, 'size': 3.0, 'height': 0.1 });
                for (let j = 0; j < amount; ++j) {
                    let score = new THREE.Mesh(geometry, this.material);
                    score.using = false;
                    duplicateArr.push(score);
                }
                this.scores.push(duplicateArr);
            }
            this.setScore(text);
        }
    }

    return Text;
}();

Text.prototype = {
    setLeCard:function(lecard){
        let perWidth = 1.5;
        lecard = lecard.toString();
        let lengthSum = lecard.length * perWidth;
        let amount = 3;
        let sum = this.options.textAlign == 'center' ? -lengthSum / 2-1 : 0;

        if (this.TopLeCard){
            this.TopLeCard.position.x = sum-2;
            this.TopLeCard.position.y = 0.9;
        }

        for (let i = 0, len = this.LeCards.length; i < len; ++i) {
            for (let j = 0; j < amount; ++j) {
                if (this.LeCards[i][j].using) {
                    this.obj.remove(this.LeCards[i][j]);
                    this.LeCards[i][j].using = false;
                }
            }
        }
        for (let i = 0, len = lecard.length; i < len; ++i) {
            let scores = this.LeCards[lecard[i]];
            for (let j = 0; j < amount; ++j) {
                if (!scores[j].using) {
                    scores[j].position.x = sum;
                    scores[j].using = true;
                    this.obj.add(scores[j]);
                    break;
                }
            }
            sum += perWidth;
        }
    },

    setScore: function (score) {
        let perWidth = 2.5;
        score = score.toString();
        let lengthSum = score.length * perWidth;
        let amount = this.options.sumScore ? 5 : 2;
        let sum = this.options.textAlign == 'center' ? -lengthSum / 2 : 0;
        if (this.options.plusScore) {
            sum = -(lengthSum + perWidth) / 2;
            this.plus.position.x = sum;
            this.obj.add(this.plus);
            sum += perWidth;
        }
        for (let i = 0, len = this.scores.length; i < len; ++i) {
            for (let j = 0; j < amount; ++j) {
                if (this.scores[i][j].using) {
                    this.obj.remove(this.scores[i][j]);
                    this.scores[i][j].using = false;
                }
            }
        }
        for (let i = 0, len = score.length; i < len; ++i) {
            let scores = this.scores[score[i]];
            for (let j = 0; j < amount; ++j) {
                if (!scores[j].using) {
                    scores[j].position.x = sum;
                    scores[j].using = true;
                    this.obj.add(scores[j]);
                    break;
                }
            }
            sum += perWidth;
        }
    },

    changeStyle: function (obj) {
        Object.assign(this.options, obj);
        this.obj.updateMatrix();
    },
};

export default Text;
