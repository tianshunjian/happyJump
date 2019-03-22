'use strict';

import * as _config from '../base/Config.js';

function _classCallCheck(instance, Constructor) {
    if (! (instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

var _createClass = function() {
    function defineProperties(target, props) {
        for (let i = 0; i < props.length; i++) {
            let descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
} ();

var AudioManager = function() {
    function AudioManager(game) {
        let _this = this;

        _classCallCheck(this, AudioManager);

        this.game = game;
        this.musicPool = [
            'sohu_cheng',
            'sohu_yilaguan',
            'sohu_combo1',
            'sohu_fall',
            'sohu_Light',
            'sohu_MusicBox',
            'sohu_start',
            'sohu_success',
            'scale_loop',
            'scale_intro',
            'pop',
            'icon',
            'combo1',
            'combo2',
            'combo3',
            'combo4',
            'combo5',
            'combo6',
            'combo7',
            'combo8',
            'lecard',
            'bianshen'
        ];

        this.musicPool.forEach(function(key) {
            if (window.WechatGame){
                _this[key] = wx.createInnerAudioContext();
                _this[key].src = _config.AUDIO[key];
            }else {
                //TODO:
                // _this[key] = document.createElement('audio');
                _this[key] = {
                    play: function () {
                    }, pause: function () {
                    }, stop: function () {
                    }
                };
                //测试Sound.js
                // createjs.Sound.registerSound(_config.AUDIO[key], key);
            }
        });
        this.scale_loop.loop = true;
        // this.store.onPlay(function() {
        //     _this.store.before && _this.store.before();
        // });
        // this.store.onEnded(function() {
        //     _this.store.after && _this.store.after();
        //     _this.timer = setTimeout(function() {
        //             _this.store.seek(0);
        //             _this.store.play();
        //         },
        //         3000);
        // });
        // this.sing.onEnded(function() {
        //     _this.timer = setTimeout(function() {
        //             _this.sing.seek(0);
        //             _this.sing.play();
        //         },
        //         3000);
        // });
        //
        // this.water.onEnded(function() {
        //     _this.timer = setTimeout(function() {
        //             _this.water.seek(0);
        //             _this.water.play();
        //         },
        //         3000);
        // });
        // this.sing.onPlay(() => {
        //   this.sing.before && this.sing.before();
        // });
        if (window.WechatGame){
            this.scale_intro.onEnded(function() {
                if (_this.game.bottle.status == 'prepare') _this.scale_loop.play();
            });
        }else {
            createjs.Sound.on('fileload', this.loadedHandler, this);
        }
    }

    _createClass(AudioManager, [
        {
            key: 'loadedHandler',
            value: function loadedHandler(event) {
                // console.log('加载音频完毕 '+event.id);
                if (!window.WechatGame){
                    if (event.id != 'scale_loop'){
                        if (event.id == 'sohu_start'){
                            console.log('sohu_start loaded 加载完毕');
                            createjs.Sound.play(event.id);
                        } else {
                            let instance = createjs.Sound.play(event.id);
                            if (event.id == 'scale_intro') {
                                instance.on('complete', function () {
                                    let scaleLoop = createjs.Sound.play('scale_loop');
                                    scaleLoop.loop = true;
                                }, this,true);
                            }
                        }
                    }
                }
            }
        },
        {
            key: 'play4Sound',
            value: function play4Sound(key) {
                if (!window.WechatGame){
                    createjs.Sound.registerSound(_config.AUDIO[key], key);
                    let instance = createjs.Sound.play(key);
                    if (key=='scale_intro') {
                        createjs.Sound.registerSound(_config.AUDIO['scale_loop'], 'scale_loop');
                        instance.on('complete', function () {
                            let scaleLoop = createjs.Sound.play('scale_loop');
                            scaleLoop.loop = true;
                        }, this,true);
                    }
                }
            }
        },
        {
            key: 'stop4Sound',
            value: function stop4Sound() {
                if (!window.WechatGame){
                    createjs.Sound.stop();
                }
            }
        },
        {
            key: 'resetAudio',
            value: function resetAudio() {
                let _this2 = this;

                this.musicPool.forEach(function(key) {
                    if (window.WechatGame){
                        _this2[key].stop();
                    }else {
                        //TODO:
                        _this2[key].pause();
                        _this2[key].currentTime = 0;
                        createjs.Sound.stop();
                    }
                });
            }
        },
        {
            key: 'register',
            value: function register(key, before, after) {
                this[key].before = before;
                this[key].after = after;
            }
        },
        {
            key: 'clearTimer',
            value: function clearTimer() {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
            }
        },
        {
            key: 'replay',
            value: function replay(key) {
                let music = this[key];
                if (music) {
                    if (window.WechatGame){
                        music.stop();
                        music.play();
                    }else{
                        music.pause();
                        music.currentTime = 0;
                        music.play();
                    }
                } else {
                    console.warn('there is no music', key);
                }
            }
        }]);

    return AudioManager;
} ();

export default AudioManager;
