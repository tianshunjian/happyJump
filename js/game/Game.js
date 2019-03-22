'use strict';

import * as Config from '../base/Config.js';
import * as Animation from '../base/TweenAnimation.js';
import GameCtrl from '../controller/GameCtrl.js';
import GameModel from './GameModel.js';
import InstuctionCtrl from '../controller/InstuctionCtrl.js';
import AudioManager from '../audio/AudioManager.js';
import * as THREE from '../libs/three/three.min.js';
import Ground from '../module/Ground.js';
import Wave from  '../module/Wave.js';
import Block from '../module/Block.js';
import Bottle from '../module/Bottle.js';
import Mao from '../module/Mao.js';
import Ren from '../module/Ren.js';
import Rank from '../base/Rank.js';
import UI from '../module/UI.js';
import TailSystem from '../module/TailSystem.js';
import Random from '../base/Random.js';
import pInPolygon from '../base/PointInPolygon.js';
import RankSystem from '../module/RankSystem.js';

import UserService from '../service/UserService.js';
import JumpSocketService from '../service/JumpSocketService.js';
import MRUtil from '../util/MRUtil.js';
import SignService from '../service/SignService.js';
import NetStatusUtil from '../shared/service/NetStatusUtil.js';
import {NetworkStatusChanged} from '../shared/service/NetStatusUtil.js';
import Application from '../shared/bridge/Application.js';
import Utils from '../shared/service/Utils.js';
import PageCtrl from '../controller/PageCtrl.js';
import CanvasBase from '../base/CanvasBase.js';
import PageBase from '../base/PageBase.js';

// var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
// var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
// var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
// var HEIGHT = H * Dpr; // 设备像素
// var WIDTH = W * Dpr; // 设备像素

//四季block的最大最小值
var springObjOrders = {min:100,max:111};
var summerObjOrders = {min:200,max:211};
var autumnObjOrders = {min:300,max:310};
var winterObjOrders = {min:400,max:411};
// var qinmingObjOrders = {min:500,max:504};
var dalisiObjOrders = {min:601,max:612};
var specialObjOrders = {min:100000,max:100003};

var isIPhone = window.isIPhone;

var Game = function () {
    function Game(options) {

        ///解决微信环境里没有debug方法；[mr-pomelo 使用了 console.debug 打印的日志]
        console.debug = console.log;

        console.log('Game constructor options='+JSON.stringify(options));

        let launchPs;
        if (window.WechatGame){
            launchPs = wx.getLaunchOptionsSync();
        }else {
            //TODO:
            launchPs = {};
        }

        console.error('启动参数：' + JSON.stringify(launchPs));

        // 模式：单机，围观(玩家，观察者），挑战，首屏，loading, viewerWating, viewer,viewergg,viewerout
        this.options = options;
        this.is_from_wn = 0;

        this.firstInit = true;
        this.distance = 0;

        // 目前stage有 game,friendRankList,singleSettlementPgae,groupShareList,battlePage
        this.stage = '';
        this.succeedTime = 0;
        this.lastAddBonus = -2;

        this.blockCount = 0;
        this.currentSeason = 0;

        // 定时器，死亡碰撞
        this.deadTimeout = null;

        // 本小局分数
        this.currentScore = 0;
        this.seq = 0;
        //本局乐卡数
        this.leCardNum = 0;

        this.thirdBlock = null;
        this.straight = true;
        this.guider = false;

        this.duration = [];
        this.quickArr = [];
        this.socketFirstSync = false;
        this._animation = Animation;
        this.init(launchPs);

        this.randomSeed = Date.now();
        this._random = Random;
        this._random.setRandomSeed(this.randomSeed);

        this.actionList = [];
        this.musicList = [];
        this.touchList = [];
        this.blocks = [];
        this.liveTime = 0;

        this.startElems = [];

        //游戏类型：单人无限模式、限时单人比赛模式
        this.gameType = Config.GAME.singleGame;

        this.championshipId = -1;//比赛场次id
        this.championshipInfo = {};//比赛场场次信息
        this.timeUse4Competition = 0;//开始到结束时间

        this.retryCount = 0;//重连时间：s
    }

    return Game;
}();

Game.prototype = {

    moveGradually: function (vector, duration) {
        console.log('Game moveGradually');
        if (this.animating && !this.guider) {
            (0, this._animation.TweenAnimation)(this.bottle.obj.position.x, this.bottle.obj.position.x - vector.x, duration * 500, 'Linear', function (value, complete) {
                this.bottle.obj.position.x = value;
                if (complete) {
                    this.bottle.obj.position.x = -0.098;
                }
            }.bind(this));

            for (let i = 0, len = this.blocksInUse.length; i < len; ++i) {
                (0, this._animation.TweenAnimation)(this.blocksInUse[i].obj.position.x, this.blocksInUse[i].obj.position.x - vector.x, duration * 500, 'Linear', function (value) {
                    this.obj.position.x = value;
                }.bind(this.blocksInUse[i]));
            }
            if (this.blocks[0]) {
                (0, this._animation.TweenAnimation)(this.blocks[0].obj.position.x, this.blocks[0].obj.position.x - vector.x, duration * 500, 'Linear', function (value) {
                    this.obj.position.x = value;
                }.bind(this.blocks[0]));
            }
        } else {
            (0, this._animation.TweenAnimation)(this.camera.position.x, this.camera.position.x + vector.x, duration * 500, 'Quad.easeOut', function (value) {
                this.camera.position.x = value;
            }.bind(this));
            (0, this._animation.TweenAnimation)(this.camera.position.z, this.camera.position.z + vector.z, duration * 500, 'Quad.easeOut', function (value) {
                this.camera.position.z = value;
            }.bind(this));
        }
    },

    // 重连逻辑
    retryConnectNet:function(){
        MRUtil.showLoading();
        this.loading = true;
        this.gameCtrl._fastSignIn({},function (err) {
            if (!err){
                //重连成功
                MRUtil.hiddenLoading();
                console.error('游戏中重连 成功');
                this.isConnected = true;
                this.UI.showToast('重新联网成功');
                this.retryCount = 0;
            } else{
                console.error('游戏中重连 失败');
                this.isConnected = false;
            }
            this.loading = false;
        }.bind(this));
    },

    update: function (tickTime) {
        let _this = this;

        if (!this.pendingReset && this.stage=='game'){
            //比赛场，分数达到一定分数就结束本局
            if (this.gameType === Config.GAME.competitionGame){
                const limitScore = this.championshipInfo.targetScore || 20;
                this.currentScore = this.UI.score;
                if (this.currentScore >= limitScore) {
                    //先清理计时器
                    if (this.timeUse4CompetitionTimer){
                        clearInterval(this.timeUse4CompetitionTimer);
                        this.timeUse4CompetitionTimer = null;
                    }
                    this.pendingReset = true;
                    this.offDanmuBroadcast();
                    this.deadTimeout = setTimeout(function () {
                        _this._animation.TweenAnimation.killAll();
                        _this.gameCtrl.showGameWin4Competition();
                        _this.pendingReset = false;
                    }, 1000);
                }else{
                    //判断本场比赛是否已经结束，已经结束的话就停止比赛
                    const endTime = this.championshipInfo.championshipEndTime;
                    const nowTime = new Date().getTime();
                    if (nowTime>=endTime && this.bottle.status=='stop') {
                        //超出结束时间，强行结束比赛
                        //先清理计时器
                        if (this.timeUse4CompetitionTimer){
                            clearInterval(this.timeUse4CompetitionTimer);
                            this.timeUse4CompetitionTimer = null;
                        }
                        this.pendingReset = true;
                        this.offDanmuBroadcast();
                        this.deadTimeout = setTimeout(function () {
                            _this._animation.TweenAnimation.killAll();
                            _this.gameCtrl.showNextFight4Competition();
                            _this.pendingReset = false;
                        }, 1000);
                    }
                }
            }
        }

        //检测网络连接
        // if (!this.pendingReset && this.stage=='game' && this.bottle.status=='stop'){
        //     //断网的话，showLoading 2s，并重连
        //     if( NetStatusUtil.isDisconnected() ){
        //         //  显示转圈加载，并重连
        //         // 2s没连上的话，弹框提示
        //         if (!this.isConnected){
        //             if (this.retryCount >= 2){
        //                 this.gameCtrl.showNetError();
        //                 MRUtil.hiddenLoading();
        //                 this.loading = false;
        //                 this.retryCount = 0;
        //             } else{
        //                 if (!this.loading) {
        //                     this.retryConnectNet();
        //                 }
        //                 this.retryCount += tickTime;
        //             }
        //         }
        //     }
        // }

        // 更新尾巴
        if (this.tailSystem) {
            this.tailSystem.update(tickTime * 1000);
        }

        this.bottle.update(tickTime);
        this.UI.update();
        if (this.renderer.shadowMap.enabled) {
            this.shadowTarget.position.x = this.bottle.obj.position.x;
            this.shadowTarget.position.z = this.bottle.obj.position.z;
            this.shadowLight.position.x = this.bottle.obj.position.x + 0;
            this.shadowLight.position.z = this.bottle.obj.position.z + 10;
        }

        for (let i = 0, len = this.blocksInUse.length; i < len; ++i) {
            this.blocksInUse[i].update();
        }

        if (this.guider && this.blocks[0]) this.blocks[0].update();

        if ((this.bottle.status === 'forerake' || this.bottle.status === 'hypsokinesis') && this.hit != 5) {
            let boxes = this.bottle.getBox();
            let blockBox = this.bottle.status === 'forerake' ? this.nextBlock.getBox() : this.currentBlock.getBox();
            console.log('in all in all in  this.bottle.status = ' + this.bottle.status + '; boxes.len = ' + boxes.length);
            for (let i = 0, len = boxes.length; i < len; ++i) {
                if (boxes[i].intersectsBox(blockBox)) {
                    if (i === 0) {
                        this.bottle.rotate();
                        if (this.suspendTimer) {
                            clearTimeout(this.suspendTimer);
                            this.suspendTimer = null;
                        }
                    } else if (i === 1) {
                        this.bottle.suspend();
                        if (this.suspendTimer) {
                            clearTimeout(this.suspendTimer);
                            this.suspendTimer = null;
                        }
                    } else if (i === 2 && !this.suspendTimer) {
                        this.suspendTimer = setTimeout(function () {
                            _this.bottle.suspend();
                            _this.suspendTimer = null;
                        }, 90 * this.distance);
                    }
                    break;
                }
            }
        }

        // 物理碰撞
        if (this.bottle.obj.position.y <= Config.BLOCK.height / 2 + 0.1
            && this.bottle.status === 'jump'
            && this.bottle.flyingTime > 0.3
            && !this.pendingReset) {
            console.log('物理碰撞 this.hit == ' + this.hit);
            if (this.hit === 1 || this.hit === 7) {
                this.bottle.stop();
                this.succeed();
                if (this.animating) return;
                //this.addWave(Math.min(1, 4));
                let isGetLecard = false;
                if (window.WechatGame){
                    if (this.currentBlock.LeCard && this.currentBlock.LeCard.visible){
                        console.log('current 有 乐卡');
                        //跳到了有乐卡的block中心
                        if (this.hit === 1){
                            console.log('跳到了中心');
                            console.log('restLeCardToday: '+UserService.restLeCardToday);
                            if (UserService.restLeCardToday > 0){
                                console.log('乐卡未到上限');
                                const self = this;
                                isGetLecard = true;
                                this.bottle.showAddLecard();
                                const step = this.succeedTime;
                                const index = this.currentBlock.leCardIndex;
                                JumpSocketService.pickLecard({step:step,picked:1,index:index},function (err,res) {
                                    //更新UI
                                    if (err){
                                        console.error('pickedLeCard:' + JSON.stringify(err));
                                    } else {
                                        //本局乐卡数
                                        const current = res.leCard;
                                        const sum = res.totalLeCard;
                                        self.leCardNum = current;
                                        UserService.leCard = sum;
                                        UserService.updateTodayLeCard(current);
                                        self.UI.setLeCard(sum);

                                        if (UserService.restLeCardToday == 0){
                                            //展示toast
                                            self.UI.showToast('今日获取乐卡已达到上限');
                                        }
                                    }
                                });
                            }
                            this.currentBlock.hideLeCard(true);
                        }else {
                            this.currentBlock.hideLeCard(false);
                            const index = this.currentBlock.leCardIndex;
                            JumpSocketService.pickLecard({step:this.succeedTime,picked:0,index:index},function(){});
                        }
                    }
                }else{
                    //五彩石上报
                    if (this.currentBlock.colorStone && this.currentBlock.colorStone.visible){
                        console.log('current 有 五彩石');
                        //跳到了有五彩石的block中心
                        if (this.hit === 1){
                            console.log('跳到了中心');
                            console.log('restColorStone: '+UserService.restColorStone);
                            if (UserService.restColorStoneToday > 0){
                                console.log('五彩石未到上限');
                                const self = this;
                                // isGetLecard = true;
                                this.bottle.showAddColorStone();
                                const step = this.succeedTime;
                                const index = this.currentBlock.colorStoneIndex;
                                JumpSocketService.pickColorStone({step:step,picked:1,index:index},function (err,res) {
                                    //更新UI
                                    if (err){
                                        console.error('pickColorStone:' + JSON.stringify(err));
                                    } else {
                                        //本局五彩石数
                                        const current = res.colorStone;
                                        const sum = res.totalColorStone;
                                        UserService.totalColorStone = sum;
                                        UserService.updateTodayColorStone(current);
                                        //更新五彩石数量 UI
                                        self.gameCtrl.updateDemandCount(sum);

                                        if (UserService.restColorStoneToday == 0){
                                            //展示toast
                                            // self.UI.showToast('完成收集五彩石任务，秘境中的方块不会再出现五彩石');
                                            Utils.showToast({
                                                icon:'none',
                                                title:'完成收集五彩石任务，秘境中的方块不会再出现五彩石',
                                                duration:3500
                                            });
                                            for (let i=0;i<self.blocksInUse.length;++i){
                                                let block = self.blocksInUse[i];
                                                if (block.colorStone && block.colorStone.visible){
                                                    block.hideColorStone(true);
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            this.currentBlock.hideColorStone(true);
                        }else {
                            this.currentBlock.hideColorStone(false);
                            const index = this.currentBlock.colorStoneIndex;
                            JumpSocketService.pickColorStone({step:this.succeedTime,picked:0,index:index},function(){});
                        }
                    }
                }

                if (this.hit === 1) {
                    // 播放命中靶心
                    if (window.WechatGame){
                        this.audioManager['combo' + Math.min(this.doubleHit + 1, 8)].seek(0);
                        this.audioManager['combo' + Math.min(this.doubleHit + 1, 8)].play();
                    } else {
                        this.audioManager.play4Sound('combo' + Math.min(this.doubleHit + 1, 8));
                    }

                    if (isGetLecard){
                        if (window.WechatGame){
                            this.audioManager['lecard'].seek(0);
                            this.audioManager['lecard'].play();
                        } else {
                            this.audioManager.play4Sound('lecard');
                        }
                    }else{
                        if (window.WechatGame){
                            this.audioManager['sohu_combo1'].seek(0);
                            this.audioManager['sohu_combo1'].play();
                        } else {
                            this.audioManager.play4Sound('sohu_combo1');
                        }
                    }

                    ++this.doubleHit;
                    this.UI.showComboHint(Math.min(this.doubleHit, 8));
                    this.addWave(Math.min(this.doubleHit, 4));
                    this.bottle.showAddScore(1, true, this.quick);
                    this.UI.addScore(1, true, this.quick);
                    this.currentScore = this.UI.score;


                    if (this.mode != 'observe') {
                        this.showCombo();
                    }
                } else {
                    // 播放成功音乐
                    if (window.WechatGame){
                        this.audioManager.sohu_success.seek(0);
                        this.audioManager.sohu_success.play();
                    }else {
                        this.audioManager.play4Sound('sohu_success');
                    }
                    this.doubleHit = 0;
                    this.UI.addScore(1, false, this.quick);
                    this.currentScore = this.UI.score;
                    this.bottle.showAddScore(1, false, this.quick);
                }

                this.bottlePrePostion = this.bottle.obj.position.clone();
                this.bottlePrePostion.y = Config.BLOCK.height / 2;

                if (this.mode != 'observe') {
                    // 更新超越头像
                    this.rankSystem.update();
                }
            } else if (this.hit === 2) {
                this.bottle.stop();
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
                this.bottle.obj.position.x = this.bottle.destination[0];
                this.bottle.obj.position.z = this.bottle.destination[1];
            } else if (this.hit === 3) {
                this.bottle.hypsokinesis();
                if (window.WechatGame){
                    this.audioManager.sohu_fall.play();
                }else {
                    this.audioManager.play4Sound('sohu_fall');
                }
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
            } else if (this.hit === 4 || this.hit === 5) {
                this.bottle.forerake();
                if (window.WechatGame){
                    this.audioManager.sohu_fall.play();
                }else {
                    this.audioManager.play4Sound('sohu_fall');
                }
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
            } else if (this.hit === 0) {
                this.bottle.fall();
                if (window.WechatGame){
                    this.audioManager.sohu_fall.play();
                }else {
                    this.audioManager.play4Sound('sohu_fall');
                }
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
            } else if (this.hit === 6) {
                this.bottle.stop();
                if (window.WechatGame){
                    this.audioManager.sohu_fall.play();
                }else {
                    this.audioManager.play4Sound('sohu_fall');
                }
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
            } else if (this.hit === -1) {
                this.bottle.stop();
                this.bottle.obj.position.y = Config.BLOCK.height / 2;
                this.bottle.obj.position.x = 0;
            }
            if (this.hit === 0 || this.hit === 3 || this.hit === 4 || this.hit === 5 || this.hit === 6) {
                console.log('失败了，准备展示结果');
                if (this.guider) {
                    if (this.UI.score > 0) {
                        this.guider = false;
                    } else {
                        if (this.liveTime > 3) {
                            this.guider = false;
                            this.full2D.hide2DGradually();
                        } else {
                            this.live();
                            return;
                        }
                    }
                }
                this.pendingReset = true;
                this.currentScore = this.UI.score;
                if (this.gameType === Config.GAME.competitionGame){
                    //失败了，关闭监听
                    this.offDanmuBroadcast();
                }
                this.deadTimeout = setTimeout(function () {
                    _this._animation.TweenAnimation.killAll();
                    if (_this.gameType === Config.GAME.competitionGame){
                        if (_this.timeUse4CompetitionTimer){
                            clearInterval(_this.timeUse4CompetitionTimer);
                            _this.timeUse4CompetitionTimer = null;
                        }
                        if (!_this.hasRevivaled && UserService.revivalCard>0){
                            _this.gameCtrl.showRevival4Competition();
                        } else{
                            _this.gameCtrl.showGameOver4Competition();
                        }
                    } else{
                        //普通场
                        _this.gameCtrl.showOverAgain(_this.currentScore);
                    }
                    _this.pendingReset = false;
                    if (_this.mode === 'observe') {
                        _this.instructionCtrl.onCmdComplete();
                    }
                }, 2000);
            } else {
                if (this.mode === 'observe') {
                    this.instructionCtrl.onCmdComplete();
                }
            }
        }

        CanvasBase.update && CanvasBase.update();
        this.renderer.render(this.scene, this.camera);
    },

    succeed: function () {
        let _this2 = this;

        ++this.succeedTime;
        this.musicScore = false;
        this.lastSucceedTime = Date.now();
        if (this.succeedTime % 15 == 0) {
            if(this.currentSeason !== 4){
                this.ground.changeColor();
            }
        }
        this.bottle.currentSeason = this.ground.current;
        if (this.blocksInUse.length >= 10) {
            let temp = this.blocksInUse.shift();
            temp.obj.visible = false;
            temp.reset();
            this.blocksPool.push(temp);
        }


        let firstV = this.nextBlock.obj.position.clone().sub(this.currentBlock.obj.position);
        this.bottle.obj.position.x = this.bottle.destination[0];
        this.bottle.obj.position.z = this.bottle.destination[1];
        this.bottle.squeeze();
        let block = this.thirdBlock;
        if (this.firstAnimating) return;
        if (this.guider) {
            this.guider = false;
            this.full2D.hide2DGradually();
        }
        if (!this.animating) {
            if (this.nextBlock.order == 15) {
                this.nextBlock.glow();
            } else if (this.nextBlock.order == 19) {
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    box.playMusic();
                    _this2.musicScore = true;
                    _this2.UI.addScore(30, false, false, true);
                    _this2.bottle.showAddScore(30, false, false, true);
                },
                2000);
            } else if (this.nextBlock.order == 24) {
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    _this2.musicScore = true;
                    _this2.UI.addScore(15, false, false, true);
                    _this2.bottle.showAddScore(15, false, false, true);
                },
                2000);
            } else if (this.nextBlock.order == 26) {
                this.musicTimer = setTimeout(function () {
                    _this2.UI.addScore(5, false, false, true);
                    _this2.musicScore = true;
                    _this2.bottle.showAddScore(5, false, false, true);
                },
                2000);
            } else if (this.nextBlock.order == 17) {
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    box.rotateBox();
                    _this2.musicScore = true;
                    _this2.UI.addScore(10, false, false, true);
                    _this2.bottle.showAddScore(10, false, false, true);
                },
                2000);
            }else if (this.nextBlock.order == specialObjOrders.min){
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    box.rotateCD();
                    if (window.WechatGame){
                        _this2.audioManager.sohu_MusicBox.seek(0);
                        _this2.audioManager.sohu_MusicBox.play();
                    }else {
                        _this2.audioManager.play4Sound('sohu_MusicBox');
                    }
                    _this2.UI.addScore(30, false, false, true);
                    _this2.bottle.showAddScore(30, false, false, true);
                },
                2000);
            } else if (this.nextBlock.order == specialObjOrders.min+1){
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    if (window.WechatGame){
                        _this2.audioManager.sohu_cheng.seek(0);
                        _this2.audioManager.sohu_cheng.play();
                    }else {
                        _this2.audioManager.play4Sound('sohu_cheng');
                    }
                    box.rotateIndicator();
                    _this2.UI.addScore(10, false, false, true);
                    _this2.bottle.showAddScore(10, false, false, true);
                },
                2000);
            }else if (this.nextBlock.order == specialObjOrders.min+2){
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    if (window.WechatGame){
                        _this2.audioManager.sohu_Light.seek(0);
                        _this2.audioManager.sohu_Light.play();
                    }else {
                        _this2.audioManager.play4Sound('sohu_Light');
                    }
                    let _this10 = _this2;
                    _this2.counter4Light = 0;
                    _this2.sohuLightTimer = setInterval(function () {
                        if (window.WechatGame){
                            _this10.audioManager.sohu_Light.seek(0);
                            _this10.audioManager.sohu_Light.play();
                        }else {
                            _this2.audioManager.play4Sound('sohu_Light');
                        }
                        _this10.counter4Light++;
                        if (_this10.counter4Light >=2 ){
                            if (_this10.sohuLightTimer){
                                clearInterval(_this10.sohuLightTimer);
                                _this10.sohuLightTimer = null;
                            }
                        }
                    },800);
                    box.loopLight();
                    _this2.UI.addScore(15, false, false, true);
                    _this2.bottle.showAddScore(15, false, false, true);
                },
                2000);
            } else if (this.nextBlock.order == specialObjOrders.min+3){
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    if (window.WechatGame){
                        _this2.audioManager.sohu_yilaguan.seek(0);
                        _this2.audioManager.sohu_yilaguan.play();
                    }else {
                        _this2.audioManager.play4Sound('sohu_yilaguan');
                    }
                    box.bubbleRaiseUp();
                    _this2.UI.addScore(5, false, false, true);
                    _this2.bottle.showAddScore(5, false, false, true);
                },
                2000);
            }else if (this.currentSeason<4 && this.nextBlock.order>=dalisiObjOrders.min && this.nextBlock.order<=dalisiObjOrders.max){
                let box = this.nextBlock;
                this.musicTimer = setTimeout(function () {
                    if (!window.WechatGame){
                        //进入   大理寺入口
                        console.log('停留3秒，已进入大理寺秘境');
                        _this2.audioManager.play4Sound('bianshen');
                        _this2.pendingReset = true;
                        //变身图片
                        _this2.addBianshen(_this2.bottle.direction);

                        Application.ccReport({
                            id:1005,
                            memo:{'from':'H5'}
                        });

                        let pos = _this2.bottle.obj.position.clone();
                        _this2.ren.obj.position.set(pos.x,pos.y+0.5,pos.z);
                        // _this2.ren.lookAt(_this2.mao.direction);
                        let _that = _this2;
                        _this2.mao.bianshen(function (direction) {
                            _that.mao.obj.visible = false;
                            _that.ren.obj.visible = true;
                            let _that10 = _that;
                            _that.ren.bianshen(direction,function () {
                                _that10.bottle = _this2.ren;
                                let _that5 = _that10;
                                setTimeout(function () {
                                    _that5.resetSceneDalisi();
                                    _that5.pendingReset = false;
                                },500);
                            });
                        });
                    }
                }, 2000);
            }
            //第一次跳到特殊block上给个toast
            if ((this.nextBlock.order>=specialObjOrders.min && this.nextBlock.order<=specialObjOrders.max) || (this.nextBlock.isEntry && this.currentSeason<4)) {
                if (!UserService.firstOnSpecialBlock) {
                    UserService.firstOnSpecialBlock = 1;
                    this.UI.showToast('神秘方块，停留一会儿有惊喜哟');
                }
            }

            let nextPosition = this.nextBlock.obj.position.clone();
            let distance = this.nextBlock.radius + this.distance + block.radius;
            let straight = this.straight;

            if (straight) {
                nextPosition.x += distance;
                this.bottle.lookAt('straight', nextPosition.clone());
            } else {
                nextPosition.z -= distance;
                this.bottle.lookAt('left', nextPosition.clone());
            }
            block.obj.position.x = nextPosition.x;
            block.obj.position.z = nextPosition.z;
            if (window.WechatGame){
                this.audioManager['pop'].seek(0);
                this.audioManager['pop'].play();
            }else {
                this.audioManager.play4Sound('pop');
            }
        }
        block.popup();
        let secondV = block.obj.position.clone().sub(this.nextBlock.obj.position);
        let cameraV = firstV.add(secondV);
        cameraV.x /= 2;
        cameraV.z /= 2;
        // this.blocksInUse.push(block);
        this.scene.add(block.obj);

        if (window.WechatGame){
            if (this.gameType === Config.GAME.singleGame){
                //判断block是否应该显示乐卡
                const s = UserService.queryLeCard(this.succeedTime);
                if (s.flag) {
                    block.showLeCard(s.index);
                }
            }
        }else{
            //判断是否显示五彩石
            if (this.currentSeason === 4){
                //大理寺秘境
                console.log('活动状态 activityStatus：'+UserService.activityStatus);
                console.log('剩余五彩石 restColorStoneToday：'+UserService.restColorStoneToday);
                console.log('五彩石总数 totalColorStone：'+UserService.totalColorStone);
                if (UserService.activityStatus !== 1){
                    console.log('restColorStoneToday: '+UserService.restColorStoneToday);
                    if (UserService.restColorStoneToday>0){
                        const s = UserService.queryColorStone(this.succeedTime);
                        if (s.flag){
                            block.showColorStone(s.index);
                        }
                    }
                }
            }
        }

        console.log('add new blcok:' + block.type);
        this.currentBlock = this.nextBlock;
        this.nextBlock = block;


        let duration = cameraV.length() / 10;
        if (Config.GAME.canShadow) this.bottle.scatterParticles();
        if (this.animating) cameraV.x = 19.8;
        this.moveGradually(cameraV, duration);
        this.bottle.human.rotation.z = 0;
        this.bottle.human.rotation.x = 0;

        setTimeout(function () {
            // 跳跃成功之后加载下一季节block
            this.loadOtherSeasonBlocks();
        }.bind(this),200);
    },

    handleWxOnHideEvent: function () {
        this.show = false;
        console.log('Game handleWxOnHideEvent');

        if (this.gameType === Config.GAME.competitionGame){
            //关闭广播监听
            this.offDanmuBroadcast();
            // if (this.timeUse4CompetitionTimer){
            //     clearInterval(this.timeUse4CompetitionTimer);
            //     this.timeUse4CompetitionTimer = null;
            // }
        }

        if (this.animateTimer) {
            clearTimeout(this.animateTimer);
            this.animateTimer = null;
        }

        if (this.onshowAnimateTimer) {
            clearTimeout(this.onshowAnimateTimer);
            this.onshowAnimateTimer = null;
        }

        this.gameCtrl.wxOnhide();
    },

    //TODO: 测试动画
    testAnimation: function(){
        let self = this;
        let block = new Block(612,0,function (b) {
            b.obj.position.set(10,20,0);
            b.obj.visible = true;
            self.scene.add(b.obj);

            // setTimeout(function () {
            //     // b.rotateCD();
            //     // b.bubbleRaiseUp()
            //     b.loopLight();
            //     setTimeout(function () {
            //         b.stopMusic();
            //     },3000);
            // },2000);
        },this.activityName);
    },

    _startGame: function(callback,sender){

        if(!this.bottle.body) {
            return;
        }

        this._login(callback,sender);
    },

    _login: function(callback,sender){

        /// TODO 需要优化！！

        if (!window.WechatGame){
            callback && callback(sender);
            return;
        }

        if(sender){
            sender.disable();
        }
        SignService.fastSignIn(function (err) {
            MRUtil.hiddenLoading();
            if (err){
                console.error(JSON.stringify(err));
                MRUtil.hiddenLoading();
                this.UI.showToast(err.msg);
                if(sender){
                    sender.enable();
                }
            }else{
                callback && callback(sender);
            }
        }.bind(this),function () {
            MRUtil.showLoading();
        });
    },

    init: function (launchPs) {
        console.log('Game init');
        let self = this;

        // 活动名称，应由外部启动时传入
        this.activityName = 'dalisi';

        let fb = {};//_storage2.default.getFirstBlood();
        if (!fb && !this.options.query.mode) {
            this.guider = true;
        }

        this.gameCtrl = new GameCtrl(this);
        this.gameModel = new GameModel(this);
        this.instructionCtrl = new InstuctionCtrl(this);

        /**
         * 数据初始化
         */
        this.audioManager = new AudioManager(this);
        /**
         * 初始化场景
         */
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

        /**
         * 初始化camera
         */
        let frustumSize = Config.FRUSTUMSIZE;
        let aspect = WIDTH / HEIGHT;
        console.log('window.innerHeight:' + window.innerHeight + ',frustumSize = ' + frustumSize + '; aspect = ' + aspect);
        this.camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -30, 165);
        // this.camera = new THREE.OrthographicCamera(
        //     window.innerWidth / -80, window.innerWidth / 80, window.innerHeight / 80, window.innerHeight / -80, 1, 500);
        this.initZ4Camera = 26;
        this.camera.position.set(-17, 30, this.initZ4Camera);
        // this.camera.position.set(100, 100, 100);
        this.camera.lookAt(new THREE.Vector3(13, 0, -4));
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);

        // var CameraHelper = new THREE.CameraHelper(this.camera);
        // this.scene.add(CameraHelper);

        /**
         * 初始化renderer
         */
        if (window.WechatGame){
            this.renderer = new THREE.WebGLRenderer({antialias: false,
                canvas: canvas,
                preserveDrawingBuffer: false
            });
        }else {
            const canvas = document.getElementById('WebGL-output');
            this.renderer = new THREE.WebGLRenderer({antialias: false,
                canvas: canvas,
                preserveDrawingBuffer: false
            });
        }
        window.renderer = this.renderer;
        //this.renderer.sortObjects = false
        //this.renderer.setPixelRatio(1)
        //this.renderer.setPixelRatio(window.devicePixelRatio ? (isIPhone ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio) : 1);

        // 坐标轴
        // var AxesHelper = new THREE.AxesHelper(100);//1000
        // this.scene.add(AxesHelper);

        /**
         * 小的环境元素数组
         */
        this.objForSmallElems = new THREE.Object3D();
        this.scene.add(this.objForSmallElems);
        this.smallSeasonElemsInUse = [];

        this.blocksPool = [];
        this.blocksInUse = [];
        this.doubleHit = 0;
        if (window.WechatGame){
            const system = wx.getSystemInfoSync() || {};
            const systemModel = system.model;
            if (isIPhone && (systemModel.indexOf('iPhone 4') >= 0 || systemModel.indexOf('iPhone 5') >= 0 || system.system.indexOf('iOS 9') >= 0 || system.system.indexOf('iOS 8') >= 0 || systemModel.indexOf('iPhone 6') >= 0 && systemModel.indexOf('iPhone 6s') < 0)) {
                this.renderer.shadowMap.enabled = false;
                Config.GAME.canShadow = false;
                this.renderer.setPixelRatio(1.5);
                //wx.setPreferredFramesPerSecond && wx.setPreferredFramesPerSecond(45);
            } else {
                if (typeof system.benchmarkLevel != 'undefined' && system.benchmarkLevel < 5 && system.benchmarkLevel != -1) {
                    Config.GAME.canShadow = false;
                    this.renderer.shadowMap.enabled = false;
                    this.renderer.setPixelRatio(window.devicePixelRatio ? isIPhone ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio : 1);
                } else {
                    //GAME.canShadow = false;
                    this.renderer.setPixelRatio(window.devicePixelRatio ? isIPhone ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio : 1);
                    this.renderer.shadowMap.enabled = true;
                }
            }
        }else {
            this.renderer.setPixelRatio(window.devicePixelRatio ? isIPhone ? Math.min(window.devicePixelRatio, 2) : window.devicePixelRatio : 1);
            this.renderer.shadowMap.enabled = true;
        }

        this.renderer.setSize(WIDTH, HEIGHT);
        console.log('renderer.setSize WIDTH='+WIDTH+'; HEIGHT='+HEIGHT);
        this.renderer.localClippingEnabled = true;
        this.renderer.setClearColor( 0x000000, 0 );

        this.ground = new Ground(this.activityName);
        this.ground.obj.position.z = -120;
        //this.ground.obj.rotation.x = -0.8;

        this.camera.add(this.ground.obj);

        this.waves = [];
        for (let i = 0; i < 4; ++i) {
            let wave = new Wave();
            this.waves.push(wave);
            wave.obj.visible = false;
            this.scene.add(wave.obj);
        }
        let basicMaterial = new THREE.MeshBasicMaterial({
            color: 0xF5F5F5
        });
        this.combo = new THREE.Mesh(new THREE.CircleGeometry(0.6, 40), basicMaterial);
        this.combo.name = 'combo';
        this.combo.position.x = -50;
        this.combo.rotation.x = -Math.PI / 2;
        this.scene.add(this.combo);

        if (this.renderer.shadowMap.enabled) {
            this.shadowTarget = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), basicMaterial);
            this.shadowTarget.visible = false;
            this.shadowTarget.name = 'shadowTarget';
            this.scene.add(this.shadowTarget);
        }


        //获取各个季节的 min、max
        let seasonSeg = window.ObjInfo.seasonSegment;
        let entryNum;
        for (let i=0;i<seasonSeg.length;++i){
            switch (seasonSeg[i].season){
            case 'spring':
                springObjOrders.min = seasonSeg[i].min;
                springObjOrders.max = seasonSeg[i].max;
                break;
            case 'summer':
                summerObjOrders.min = seasonSeg[i].min;
                summerObjOrders.max = seasonSeg[i].max;
                break;
            case 'autumn':
                autumnObjOrders.min = seasonSeg[i].min;
                autumnObjOrders.max = seasonSeg[i].max;
                break;
            case 'winter':
                winterObjOrders.min = seasonSeg[i].min;
                winterObjOrders.max = seasonSeg[i].max;
                break;
            case 'special':
                specialObjOrders.min = seasonSeg[i].min;
                specialObjOrders.max = seasonSeg[i].max;
                break;
            }
            if (seasonSeg[i].season == this.activityName){
                dalisiObjOrders.min = seasonSeg[i].min;
                dalisiObjOrders.max = seasonSeg[i].max;
                let objInfo = seasonSeg[i].objInfo;
                for (let j=seasonSeg[i].min;j<=seasonSeg[i].max;++j){
                    if (objInfo[j].extraInfo.isEntry){
                        entryNum = j;
                        break;
                    }
                }
            }
        }


        let firstBlockNum,secondBlockNum;
        if (window.WechatGame){
            firstBlockNum = springObjOrders.min+1;
            secondBlockNum = springObjOrders.min+2;
            this.currentBlock = new Block(firstBlockNum,0,function () {},this.activityName);
            this.initNextBlock = this.nextBlock = new Block(secondBlockNum,0,function () {},this.activityName);
        } else{
            firstBlockNum = springObjOrders.min;
            secondBlockNum = springObjOrders.min+1;
            this.currentBlock = new Block(firstBlockNum,0,function () {},this.activityName);
            this.initNextBlock = this.nextBlock = new Block(secondBlockNum,0,function () {},this.activityName);
        }

        this.nextBlock.obj.position.x = 20;
        // this.bottle = new Bottle();
        // // this.bottle.obj.position.set(-10, -Config.BLOCK.height / 2, 0);
        // var offset = 5;
        // this.bottle.obj.position.set(0, Config.BLOCK.height/2-offset, 0);
        // this.scene.add(this.bottle.obj);
        console.log('when init, this.guider='+this.guider);

        // 测试盒子
        // this.testAnimation();


        if (this.guider) {
            this.bottle.obj.position.set(-11, 50, 0);
            this.camera.position.x -= 19;
            setTimeout(function () {
                self.bottle.showup();
            }, 800);
            this.currentBlock.obj.position.x = -11;
            this.currentBlock.change(null, 'gray', 0.7);
            console.log('init() this.scene.add(this.currentBlock.obj)');
            this.scene.add(this.currentBlock.obj);
            this.guiderTimer = setInterval(function () {
                self.bottle.velocity.vz = 0;
                self.bottle.velocity.vy = 150;
                self.direction = new THREE.Vector2(1, 0);
                let direction = new THREE.Vector3(1, 0, 0);
                self.bottle.jump(direction.normalize());
                console.log('-----------------checkHit2------11111111-----------------------------');
                self.hit = self.checkHit2(self.bottle, self.currentBlock);
            }, 3000);
        }

        this.blocksInUse.push(this.currentBlock);
        this.blocksInUse.push(this.nextBlock);

        if (!window.WechatGame){
            this.scene.add(this.currentBlock.obj);
            this.scene.add(this.nextBlock.obj);
            this.currentBlock.obj.position.set(0, 0, 0);
            this.nextBlock.obj.position.set(20,0,0);
        }

        // for (var i = 2; i < 30; ++i) {
        //     var block = new Block(i);
        // if (i<5){
        //     this.blocksPool.push(block);
        // }
        // this.blocksPool.push(block);
        // this.scene.add(block.obj);
        // block.obj.position.x = - 19 + i ;
        // }

        //加载obj
        //春天的
        for (let i=springObjOrders.min;i<=springObjOrders.max;++i){
            if (i!==firstBlockNum && i!==secondBlockNum){
                let block = new Block(i,0,function (b) {
                    this.blocksPool.push(b);
                }.bind(this),this.activityName);
            }
        }
        if (!window.WechatGame){
            //加载大理寺入口block
            let block = new Block(entryNum,0,function (b) {
                this.blocksPool.push(b);
            }.bind(this),this.activityName);
        }

        // 加载 四季 环境元素
        this.seasonElementsInUse = [];
        this.smallSeasonNums = [];

        let _that = this;
        this.full2D = new Rank({
            camera: this.camera,
            scene:this.scene,

            renderer:this.renderer,//TODO 添加的渲染

            showRankToast:function (text,callback) {
                _that.UI.showToast(text,callback);
            },

            //返回首页，界面
            toBackStartPage:this.gameCtrl.backStartPage.bind(this.gameCtrl),
            //排行榜首页逻辑
            // onRankGlobalFirst:this._login.bind(this,this.gameCtrl.rankGlobal.bind(this.gameCtrl)),
            //好友榜排行榜首页逻辑
            onRankInnerFirst:this._login.bind(this,this.gameCtrl.rankInner.bind(this.gameCtrl)),
            // -- 首页：游戏开始
            onClickStartFirst: this._startGame.bind(this,this.gameCtrl.clickStart.bind(this.gameCtrl)),
            //--首页：点击前往天天抽奖界面
            onShowPickFirst : this._login.bind(this,this.gameCtrl.showPickPage.bind(this.gameCtrl)),
            //点击首页皮肤按钮
            onClickSkinFirst : this._login.bind(this,this.gameCtrl.clickSkin.bind(this.gameCtrl)),

            // --- 结算页：点击排行榜的回调
            onClickRank: this.gameCtrl.clickRank.bind(this.gameCtrl),
            // 在玩一局
            onClickReplay: this.gameCtrl.clickReplay.bind(this.gameCtrl),
            // H5返回
            onClickBack4H5:this.gameCtrl.clickBack4H5.bind(this.gameCtrl),
            //普通场结果页：分享
            onClickShare4Lecard:this.gameCtrl.clickShare4Lecard.bind(this.gameCtrl),
            //普通场结果页：排行榜
            onClickRank4H5:this.gameCtrl.clickRank4H5.bind(this.gameCtrl),
            // 分享挑战
            onClickShare: this.gameCtrl.shareBattleCard.bind(this.gameCtrl),

            //网络弹框点击处理
            onClickExitGame4Net: this.gameCtrl.clickExitGame4Net.bind(this.gameCtrl),
            onClickTryAgain4Net: this.gameCtrl.clickTryAgain4Net.bind(this.gameCtrl),

            //好友榜
            onRankInner:this.gameCtrl.rankInner.bind(this.gameCtrl),

            //排行榜其他进入逻辑
            onRankGlobal:this.gameCtrl.rankGlobal.bind(this.gameCtrl),

            // -- 其他界面游戏开始
            onClickStart: this.gameCtrl.clickStart.bind(this.gameCtrl),
            //--其他界面点击前往天天抽奖界面
            onShowPick : this.gameCtrl.showPickPage.bind(this.gameCtrl),
            //其他界面进入皮肤
            onClickSkin : this.gameCtrl.clickSkin.bind(this.gameCtrl),
            // 点击排行
            // onShowFriendRank: this.gameCtrl.showFriendRank.bind(this.gameCtrl),

            clickRedPacketsShare: this.gameCtrl.clickRedPacketsShare.bind(this.gameCtrl),
            //游戏结束页，普通场
            showOverAgain:this.gameCtrl.showOverAgain.bind(this.gameCtrl),
            //抽一次控制页
            pickCtrl:this.gameCtrl.pickCtrl.bind(this.gameCtrl), //抽一次控制
            //抽五次
            pickFiveTimes:this.gameCtrl.showPickFive.bind(this.gameCtrl),

            //获奖记录
            onClickPrizeRecord:this.gameCtrl.showPrizeRecord.bind(this.gameCtrl),
            //预告页 —— 复活卡 点击
            onClickRevivalCardShare:this.gameCtrl.clickRevivalCardShare.bind(this.gameCtrl),
            //获奖榜单，上期排行榜
            onClickPrizeRankLast:this.gameCtrl.showPrizeRankLast.bind(this.gameCtrl),
            //获奖榜单，奖金榜
            onClickPrizeRankMoney:this.gameCtrl.showPrizeRankMoney.bind(this.gameCtrl),
            //进入场次预告
            // onClickSessionInfo:this.gameCtrl.showSessionInfo.bind(this.gameCtrl),
            onClickSessionInfo:this._startGame.bind(this,this.gameCtrl.showSessionInfo.bind(this.gameCtrl)),

            //预约场次
            onChampionReservation:this.gameCtrl.championReservation.bind(this.gameCtrl),

            onClickTiXian:this.gameCtrl.showTiXian.bind(this.gameCtrl),//首页提现界面
            onClickMoreGame:this.gameCtrl.showMoreGame.bind(this.gameCtrl),//首页更多游戏界面
            //复活页面 —— 比赛场
            // showRevival4Competition:this.gameCtrl.showRevival4Competition.bind(this.gameCtrl),
            onClickRevival4Competition:this.gameCtrl.clickRevival4Competition.bind(this.gameCtrl),
            onClickStepOver4Competition:this.gameCtrl.clickStepOver4Competition.bind(this.gameCtrl),
            //比赛场 —— 开始游戏
            onClickStartGame4Competition:this.gameCtrl.clickStartGame4Competition.bind(this.gameCtrl),
            //结束页面 —— 比赛场
            // showGameOver4Competition:this.gameCtrl.showGameOver4Competition.bind(this.gameCtrl),
            onClickGameAgain4Competition:this.gameCtrl.clickGameAgain4Competition.bind(this.gameCtrl),
            onClickHelp4Competition:this.gameCtrl.clickHelp4Competition.bind(this.gameCtrl),
            //下次再战
            onClickNextFight4Competition:this.gameCtrl.clickNextFight4Competition.bind(this.gameCtrl),
            //胜利页面 —— 比赛场
            onClickShareWin4Competition:this.gameCtrl.clickShareWin4Competition.bind(this.gameCtrl),
            //恭喜获奖
            showCongratulation:this.gameCtrl.showCongratulation.bind(this.gameCtrl),
            onClickCongratulationClose:this.gameCtrl.clickCongratulationClose.bind(this.gameCtrl),
            onClickCongratulationShare:this.gameCtrl.clickCongratulationShare.bind(this.gameCtrl),
            onClickCongratulationDetail:this.gameCtrl.clickCongratulationDetail.bind(this.gameCtrl),
            onClickCongratulationDetailBack:this.gameCtrl.clickCongratulationDetailBack.bind(this.gameCtrl),

            // -- 挑战页面
            onBattlePlay: this.gameCtrl.onBattlePlay.bind(this.gameCtrl),
            // -- 好友排行，群分享
            onGroupShare: this.gameCtrl.shareGroupRank.bind(this.gameCtrl),
            // 返回上一页
            friendRankReturn: this.gameCtrl.friendRankReturn.bind(this.gameCtrl),
            // -- 群排行，我也玩一局
            groupPlayGame: this.gameCtrl.groupPlayGame.bind(this.gameCtrl),
            // -- 围观页，开启新的一局
            onLookersStart: this.gameCtrl.onViewerStart.bind(this.gameCtrl),
            // -- 返回微信
            onReturnWechat: function onReturnWechat() {
                wx.exitMiniProgram();
            },

            //大理寺活动分享
            activityShare: this.gameCtrl.activityShare.bind(this.gameCtrl),

            //大理寺获取VIP
            getVipCode: this.gameCtrl.getVipCode.bind(this.gameCtrl),
            vipShowOff: this.gameCtrl.vipShowOff.bind(this.gameCtrl)

        });

        // 新的导航站
        // this.pageCtrl = new PageCtrl(_that); //初始化导航栈
        PageCtrl.getGame(this);
        this.pageBase = new PageBase({
            camera: _that.camera,
        });
        CanvasBase.createPlane(this.camera); //创建公共canvas，挂载到camera上

        this.UI = new UI(this.scene, this.camera, this.full2D, this);

        this.addLight();
        this.bindEvent();

        // 初始化好友超越机制
        this.rankSystem = new RankSystem(this);

        if (window.WechatGame){
            this.audioManager.icon.play();
        }

        this.UI.hideScore();

        // 这个一定要放在最底下
        this.gameModel.init();
        this.gameCtrl.init();

        /**
         * 系统事件绑定
         */

        Application.onShow(this.handleWxOnShowEvent.bind(this));
        Application.onHide(this.handleWxOnHideEvent.bind(this));
        Application.onError(this.handleWxOnError.bind(this));
        Application.onAudioInterruptionBegin(this.handleInterrupt.bind(this));

        this.gameCtrl.firstInitGame(this.options,launchPs);
        // this.renderer.render(this.scene, this.camera)

        if (window.WechatGame){
            setTimeout(function () {
                this.startView();
            }.bind(this),1000);
        }

        //定时触发GC
        setInterval(function () {
            if (window.WechatGame){
                wx.triggerGC && wx.triggerGC();
            }else{
                //TODO:
            }
        },5*60*1000);

        SignService.observerNetworkStatus();

        if (window.WechatGame){
            this.bottle = new Bottle();
        } else{
            //猫和人
            this.mao = new Mao(function () {
                if (!window.WechatGame){
                    console.log('直接进入游戏界面');
                    this.gameCtrl.clickStart();
                }
            }.bind(this));

            this.bottle = this.mao;
        }
        // this.bottle.obj.position.set(-10, -Config.BLOCK.height / 2, 0);
        let offset = 5;
        this.bottle.obj.position.set(0, Config.BLOCK.height/2-offset, 0);
        this.scene.add(this.bottle.obj);

        if (Config.GAME.canShadow) {
            this.tailSystem = new TailSystem(this.scene, this.bottle);
        }

        // if (!window.WechatGame){
        //     setTimeout(function () {
        //         let today = UserService.todayColorStone;
        //         this.UI.showToast('我是测试toast '+today);
        //     }.bind(this),5000);
        // }
    },

    // 加载下一季节的block
    loadNextSeasonBlocks:function(indexArr){
        for (let i=0;i<indexArr.length;++i){
            let block = new Block(indexArr[i],0,function (b) {
                this.blocksPool.push(b);
            }.bind(this),this.activityName);
        }
    },

    // 加载其他block
    loadOtherSeasonBlocks:function(){
        let min,max;
        let nextMin,nextMax;

        switch (this.currentSeason){
        case 0:
            min = springObjOrders.min;
            max = springObjOrders.max;
            nextMin = summerObjOrders.min;
            nextMax = summerObjOrders.max;
            break;
        case 1:
            min = summerObjOrders.min;
            max = summerObjOrders.max;
            nextMin = autumnObjOrders.min;
            nextMax = autumnObjOrders.max;
            break;
        case 2:
            min = autumnObjOrders.min;
            max = autumnObjOrders.max;
            nextMin = winterObjOrders.min;
            nextMax = winterObjOrders.max;
            break;
        case 3:
            min = winterObjOrders.min;
            max = winterObjOrders.max;
            nextMin = 0;
            nextMax = -1;
            break;
        case 4:
            min = dalisiObjOrders.min;
            max = dalisiObjOrders.max;
            nextMin = 0;
            nextMax = -1;
            break;
        }

        let ordersInPool = [];
        for (let i=0;i<this.blocksPool.length;++i){
            let order = this.blocksPool[i].order;
            ordersInPool.push(order);
        }
        for (let i=0;i<this.blocksInUse.length;++i){
            let order = this.blocksInUse[i].order;
            ordersInPool.push(order);
        }

        if (this.blockCount>=4){
            let indexArr = [];
            for (let i=nextMin;i<=nextMax;++i){
                let index = ordersInPool.indexOf(i);
                if (index<0){
                    indexArr.push(i);
                }
            }
            this.loadNextSeasonBlocks(indexArr);

            //加载特殊block
            let specialArr = [];
            for (let i=specialObjOrders.min;i<=specialObjOrders.max;++i){
                let index = ordersInPool.indexOf(i);
                if (index<0){
                    specialArr.push(i);
                }
            }
            this.loadNextSeasonBlocks(specialArr);
        }
    },

    // 创建人和变身动画
    createRenAndBianshen:function(){
        // 人
        if (!this.ren){
            this.ren = new Ren(function () {}.bind(this));
            this.ren.obj.visible = false;
            this.scene.add(this.ren.obj);
        }
        // 变身
        if (!this.bianshenUp){
            let bsGeoUp = new THREE.PlaneGeometry(6,6);
            let bsMatUp = new THREE.MeshBasicMaterial({
                map: Config.loader.load('res/img/dalisi/bianshenUp.png'),
                transparent:true
            });
            this.bianshenUp = new THREE.Mesh(bsGeoUp,bsMatUp);
            this.bianshenUp.visible = false;
            this.bianshenUp.rotation.y = -Math.PI/4;
            this.scene.add(this.bianshenUp);
        }
        if (!this.bianshenDown){
            let bsGeoDown = new THREE.PlaneGeometry(5,5);
            let bsMatDown = new THREE.MeshBasicMaterial({
                map:Config.loader.load('res/img/dalisi/bianshenDown.png'),
                transparent:true
            });
            this.bianshenDown = new THREE.Mesh(bsGeoDown,bsMatDown);
            this.bianshenDown.visible = false;
            this.bianshenDown.rotation.x = -Math.PI/2;
            this.scene.add(this.bianshenDown);
        }
    },

    //释放geometry、material、texture等
    disposeNode : function (node) {
        if (node instanceof THREE.Mesh) {
            if (node.geometry) {
                node.geometry.dispose ();
            }
            if (node.material) {
                if (node.material instanceof THREE.MeshFaceMaterial) {
                    node.material.materials.forEach(function (mtrl) {
                        if (mtrl.map)           mtrl.map.dispose ();
                        if (mtrl.lightMap)      mtrl.lightMap.dispose ();
                        if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
                        if (mtrl.normalMap)     mtrl.normalMap.dispose ();
                        if (mtrl.specularMap)   mtrl.specularMap.dispose ();
                        if (mtrl.envMap)        mtrl.envMap.dispose ();
                        mtrl.dispose ();
                    });
                } else {
                    if (node.material.map)          node.material.map.dispose ();
                    if (node.material.lightMap)     node.material.lightMap.dispose ();
                    if (node.material.bumpMap)      node.material.bumpMap.dispose ();
                    if (node.material.normalMap)    node.material.normalMap.dispose ();
                    if (node.material.specularMap)  node.material.specularMap.dispose ();
                    if (node.material.envMap)       node.material.envMap.dispose ();
                    node.material.dispose ();   // disposes any programs associated with the material
                }
            }
        }
    },

    //开始界面
    startView: function(){
        console.log('准备开始界面');
        if (!this.startElems){
            return;
        }
        //去掉开场的obj
        for (let i=0,len=this.startElems.length;i<len;++i){
            let obj = this.startElems.shift();
            this.scene.remove(obj);

            if (obj.name=='smallSeasonElem4Start') {
                this.disposeNode(obj);
            }
        }

        for (let i = 0,
            len = this.blocksInUse.length; i < len; ++i) {
            let block = this.blocksInUse.pop();
            block.obj.visible = false;
            block.reset();
            this.blocksPool.push(block);
            this.scene.remove(block);
        }
        for (let i = 0,
            len = this.waves.length; i < len; ++i) {
            this.waves[i].reset();
        }

        for (let i=0,len=this.seasonElementsInUse.length;i<len;++i){
            let elem = this.seasonElementsInUse.pop();
            this.scene.remove(elem);

            this.disposeNode(elem);
        }
        let len=this.smallSeasonElemsInUse.length;
        for (let i=0;i<len;++i){
            let mesh = this.smallSeasonElemsInUse.shift();
            this.objForSmallElems.remove(mesh);

            this.disposeNode(mesh);
        }

        let offset = 5;

        this.ground.resetGround();
        this.camera.position.set( - 17, 30, this.initZ4Camera);
        this.shadowLight.position.set(0, 15-offset, 10);

        this.bottle.reset();
        this.bottle.obj.position.set(0, Config.BLOCK.height/2-offset, 0);

        this.currentBlock = new Block(springObjOrders.min+1,0,function () {},this.activityName);
        this.nextBlock = new Block(springObjOrders.min+2,0,function () {},this.activityName);
        this.currentBlock.obj.visible = true;
        this.nextBlock.obj.visible = true;
        this.scene.add(this.currentBlock.obj);
        this.scene.add(this.nextBlock.obj);
        this.currentBlock.obj.position.set(0, 0-offset, 0);
        this.nextBlock.obj.position.set(20,0-offset,0);

        this.startElems.push(this.currentBlock.obj);
        this.startElems.push(this.nextBlock.obj);

        //4个小草，3个大景物
        let springObjInfo = window.ObjInfo.seasonSegment[0];
        let seasonElem = springObjInfo.SeasonElem;
        let elemArr = [
            seasonElem.small[0],
            seasonElem.small[1],
            seasonElem.small[2],
            seasonElem.small[3],
            seasonElem.big[2],
            seasonElem.big[4],
            seasonElem.big[1]
        ];

        let posArr = [];
        let pos = this.currentBlock.obj.position.clone();
        pos.x = 20;
        pos.z = -27;
        posArr.push(pos);
        let pos1 = pos.clone();
        pos1.x = -10;
        pos1.z = 5;
        posArr.push(pos1);
        let pos2 = pos.clone();
        pos2.x = -5;
        pos2.z = 13;
        posArr.push(pos2);
        let pos3 = pos.clone();
        pos3.x = 8;
        pos3.z = 12;
        posArr.push(pos3);
        let pos4 = pos.clone();
        pos4.x = 7;
        pos4.z = -20;
        posArr.push(pos4);
        let pos5 = pos.clone();
        pos5.x = 42;
        pos5.z = -15;
        posArr.push(pos5);
        let pos6 = pos.clone();
        pos6.x = -5;
        pos6.y = -7;
        pos6.z = 32;
        posArr.push(pos6);
        for (let i=0;i<7;++i){
            let mesh = this.createSeasonElem4StartView(elemArr[i]);
            if (i===6){
                mesh.position.set(posArr[i].x,posArr[i].y,posArr[i].z);
            }else{
                mesh.position.set(posArr[i].x,posArr[i].y-offset,posArr[i].z);
            }
            this.scene.add(mesh);
            this.startElems.push(mesh);
        }
    },

    createSeasonElem4StartView:function(elemInfo){
        let filename = elemInfo.name;
        let size = elemInfo.size;
        let plane = new THREE.PlaneGeometry(size.w, size.h);
        let texture = Config.loader.load(filename);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01
        });
        // let material = elemInfo.material;
        let mesh = new THREE.Mesh(plane, material);
        mesh.rotation.y = -Math.PI/4;
        mesh.rotation.z = 0.1;
        mesh.rotation.x = 0.2;
        mesh.name = 'smallSeasonElem4Start';
        return mesh;
    },

    loopAnimate: function () {
        let _this4 = this;

        console.log('Game loopAnimate' + this);
        let duration = 0.7;
        this.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 180);
        this.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 180);
        let direction = new THREE.Vector3(this.nextBlock.obj.position.x - this.bottle.obj.position.x, 0, this.nextBlock.obj.position.z - this.bottle.obj.position.z);
        this.direction = new THREE.Vector2(this.nextBlock.obj.position.x - this.bottle.obj.position.x, this.nextBlock.obj.position.z - this.bottle.obj.position.z);

        console.log('-----------------checkHit2------222222-----------------------------');
        this.hit = this.checkHit2(this.bottle, this.currentBlock, this.nextBlock);
        this.thirdBlock = this.generateNextBlock();
        this.thirdBlock.obj.position.set(39.7, 0, 0);

        if (this.tailSystem) {

            this.tailSystem.correctPosition();
        }
        console.log('in Game loopAnimate bottle jump!');
        this.bottle.jump(direction.normalize());
        this.animateTimer = setTimeout(function () {
            _this4.loopAnimate();
        }, 3000);
    },

    animate: function () {
        //不要开场动画了
        return;

        // let _this5 = this;
        //
        // this.firstAnimating = true;
        // let that = this;
        // for (let i = 0; i < 7; ++i) {
        //     setTimeout(function (i) {
        //         return function () {
        //             if ((that.mode === 'single' && (that.stage === 'startPage' || that.stage === 'friendRankList'|| that.stage ==='everydayPick') || that.guider) && that.blocks && that.blocks.length < 7) {
        //                 let block = new Block(-1, i);//new _block2.default(-1, i);
        //                 block.showup(i);
        //                 //console.log('in Game animate(), that.scene.add(block.obj)');
        //                 that.scene.add(block.obj);
        //                 that.blocks.push(block);
        //                 if (i === 0) that.nextBlock = block;
        //             }
        //         };
        //     }(i), i * 200);
        // }
        // setTimeout(function () {
        //     if (!(that.mode === 'single' && (that.stage === 'startPage' || that.stage === 'friendRankList')) && !that.guider) return;
        //     if(!that.bottle.body) return;
        //     let duration = 0.4;
        //     _this5.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 180);
        //     _this5.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 180);
        //     _this5.direction = new THREE.Vector2(_this5.nextBlock.obj.position.x - _this5.bottle.obj.position.x, _this5.nextBlock.obj.position.z - _this5.bottle.obj.position.z);
        //     let direction = new THREE.Vector3(_this5.nextBlock.obj.position.x - _this5.bottle.obj.position.x, 0, _this5.nextBlock.obj.position.z - _this5.bottle.obj.position.z);
        //     _this5.bottle.jump(direction.normalize());
        //     _this5.hit = -1;
        //     _this5.nextBlock = _this5.initNextBlock;
        //     for (let i = 0, len = _this5.blocks.length; i < len; ++i) {
        //         that._animation.customAnimation.to(_this5.blocks[i].hitObj.material, 1, {opacity: 0, delay: i * 0.2 + 0.5});
        //     }
        //     for (let i = 1, len = _this5.blocks.length; i < len; ++i) {
        //         that._animation.customAnimation.to(_this5.blocks[i].obj.position, 0.5, {
        //             z: i % 2 === 0 ? 60 : -60,
        //             delay: i * 0.1 + 2.2
        //         });
        //     }
        //     if (_this5.guider) {
        //         that._animation.customAnimation.to(_this5.currentBlock.obj.position, 0.5, {z: -60, delay: 2.1});
        //         let currentBlock = _this5.currentBlock;
        //         setTimeout(function () {
        //             currentBlock.obj.visible = false;
        //         }, 3000);
        //     }
        //     _this5.currentBlock = _this5.blocks[0];
        //     setTimeout(function () {
        //         if (!(that.mode === 'single' && (that.stage === 'startPage' || that.stage === 'friendRankList')) && !that.guider) return;
        //         if (that.guider) {
        //             //this.nextBlock.change(null, null, 1);
        //             //this.nextBlock.obj.position.x = 14;
        //             _this5.full2D.showBeginnerPage();
        //         }
        //         _this5.nextBlock.popup();
        //         _this5.nextBlock.greenMaterial.color.setHex(0x5d5d5d);
        //         _this5.nextBlock.whiteMaterial.color.setHex(0xaaaaaa);
        //         console.log('in Game animate(), _this5.scene.add(_this5.nextBlock.obj)');
        //         _this5.scene.add(_this5.nextBlock.obj);
        //         for (let i = 1, len = _this5.blocks.length; i < len; ++i) {
        //             _this5.blocks[i].obj.visible = false;
        //         }
        //         if (_this5.guider) {
        //             _this5.animating = false;
        //         }
        //         _this5.firstAnimating = false;
        //     }.bind(this), 3000);
        //     setTimeout(function () {
        //         if (!(that.mode === 'single' && (that.stage === 'startPage' || that.stage === 'friendRankList'))) return;
        //         if (!that.show) return;
        //         _this5.loopAnimate();
        //     }, 4500);
        // }, 1500);
    },

    handleWxOnShowEvent: function (options) {
        //this.handleInterrupt();

        console.error('OnShow参数：' + JSON.stringify(options));
        if (window.WechatGame){
            wx.setKeepScreenOn && wx.setKeepScreenOn({ keepScreenOn: true });
        }else{
            //TODO:
        }
        this.show = true;
        this.gameCtrl.wxOnShow(options);

        if (!this.firstInit) this.guider = false;

        if (this.guiderTimer && !this.guider) {
            clearInterval(this.guiderTimer);
            this.guiderTimer = null;
        }

        // 处理第一次提交
        let that = this;
        this.onshowAnimateTimer = setTimeout(function (firstInit) {
            return function () {
                if (that.mode === 'single' && that.stage === 'startPage' && !that.animateTimer && that.show) {
                    if (that.blocks && that.blocks.length > 0 && !that.firstAnimating) {
                        // that.loopAnimate();
                        that.startView();
                    } else if (!that.animating && firstInit && !that.guider) {
                        console.log('onshowAnimateTimer');
                        that.animating = true;
                        // that.animate();
                        that.startView();
                    }
                }
            };
        }(this.firstInit), 1000);

        if (this.firstInit) {
            this.firstInit = false;
            return;
        }
    },

    showCombo: function () {
        let _this6 = this;

        setTimeout(function () {
            _this6.combo.position.set(_this6.nextBlock.obj.position.x, Config.BLOCK.height / 2 + 0.15, _this6.nextBlock.obj.position.z);
        }, 200);
    },

    hideCombo: function () {
        this.combo.position.set(-30, 0, 0);
    },

    replayGame: function (seed) {
        console.log('Game replayGame');
        this.currentScore = 0;
        this.leCardNum = 0;
        this.gameCtrl.onReplayGame();
        if (window.WechatGame){
            this.audioManager.sohu_start.play();
        }else {
            this.audioManager.play4Sound('sohu_start');
        }
        if (this.guider) {
            if (this.guiderTimer) {
                clearInterval(this.guiderTimer);
                this.guiderTimer = null;
            }
            this.animating = true;
            console.log('replayGame');
            this.animate();
            this.moveGradually(new THREE.Vector3(19, 0, 0), 3);
        } else {
            console.log('replay game');
            console.log('gameType: '+this.gameType);
            // this.gameType = Config.GAME.competitionGame;
            //比赛场 用时
            this.timeUse4Competition = 0;
            if (this.gameType === Config.GAME.competitionGame){
                //比赛场 计时器
                this.clearTimeUse4CompetitionTimer();
                this.timeUse4CompetitionTimer = setInterval(function () {
                    this.timeUse4Competition += 1;
                }.bind(this),1000);

                if (!UserService.showDanmu) {
                    //展示弹幕，添加广播监听
                    console.log('添加监听');
                    this.onDanmuBroadcast();
                }
            }

            if (!window.WechatGame){
                this.mao.reset();
                this.mao.obj.visible = true;
                if (this.ren){
                    this.ren.reset();
                    this.ren.obj.visible = false;
                }
                this.bottle = this.mao;
            }

            this.resetScene(seed);
            this.bottle.showup();
        }
    },

    //开关弹幕广播
    onDanmuBroadcast:function(){
        console.log('打开 弹幕广播监听');
        JumpSocketService.onTrumpet('IDS_Trumpet_Content_01',function (result) {
            console.log('接收到了完成比赛的广播');
            console.log(result);
            // if (result.showInBattle) {}//需要判断比赛场是否展示
            for (let i=0;i<result.playCount;++i){
                this.UI.addDanmu({content:result.content,avatarUrl:result.extInfo.avatarUrl});
            }
        }.bind(this));
    },
    offDanmuBroadcast:function(){
        console.log('关闭 弹幕广播监听');
        JumpSocketService.offTrumpet('IDS_Trumpet_Content_01');
        this.UI.resetThings4Danmu();
    },

    addWave: function (amount) {
        console.log('Game addWave');
        let that = this;
        for (let i = 0; i < amount; ++i) {
            setTimeout(function (i) {
                return function () {
                    that.waves[i].obj.visible = true;
                    //that.waves[i].obj.material.opacity = 1;
                    that.waves[i].obj.position.set(that.bottle.obj.position.x, Config.BLOCK.height / 2 + i * 0.1 + 1, that.bottle.obj.position.z);

                    that._animation.TweenAnimation(that.waves[i].obj.scale.x, 4, 2 / (i / 2.5 + 2) * 500, 'Linear',
                        function (value, complete) {
                            that.waves[i].obj.scale.x = value;
                            that.waves[i].obj.scale.y = value;
                            that.waves[i].obj.scale.z = value;
                        });

                    that._animation.TweenAnimation(that.waves[i].obj.material.opacity, 0, 2 / (i / 2.5 + 2) * 500, 'Linear',
                        function (value, complete) {
                            that.waves[i].obj.material.opacity = value;
                            if (complete) {
                                that.waves[i].reset();
                            }
                        });
                };
            }(i), i * 200);
        }
    },

    //变身图片动画
    addBianshen:function(direction){
        let that = this;
        let pos = this.bottle.obj.position.clone();
        this.bianshenUp.visible = true;
        this.bianshenUp.scale.y = 0.1;
        let x,z;
        if(direction == 'straight'){
            x = pos.x-Config.BOTTLE.bodyWidth/2-1;
            z = pos.z+Config.BOTTLE.bodyDepth/2;
        }else{
            x = pos.x-Config.BOTTLE.bodyWidth/2;
            z = pos.z+Config.BOTTLE.bodyDepth/2+1;
        }
        let y = Config.BLOCK.height/2+Config.BOTTLE.bodyHeight/2+3;
        this.bianshenUp.position.set(x,y,z);
        this.bianshenDown.visible = true;
        this.bianshenDown.position.set(pos.x,Config.BLOCK.height/2+1.5,pos.z);

        this._animation.TweenAnimation(this.bianshenUp.scale.y, 4, 300, 'Linear',
            function (value, complete) {
                that.bianshenUp.scale.y = value;
            });
        this._animation.customAnimation.to(this.bianshenUp.scale, 0.3, {y: 0.1, delay: 0.3,onComplete:function () {
            that.bianshenUp.visible = false;
            that.bianshenUp.scale.set(1,1,1);
        }});

        this._animation.TweenAnimation(this.bianshenDown.scale.x, 3, 600, 'Linear',
            function (value, complete) {
                that.bianshenDown.scale.x = value;
                that.bianshenDown.scale.y = value;
                if (complete){
                    that.bianshenDown.visible = false;
                    that.bianshenDown.scale.set(1,1,1);
                }
            });
    },

    addLight: function () {
        console.log('Game addLight');
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.shadowLight = new THREE.DirectionalLight(0xffffff, 0.28);
        this.shadowLight.position.set(0, 15, 10);
        if (this.renderer.shadowMap.enabled) {
            this.shadowLight.castShadow = true;
            this.shadowLight.target = this.shadowTarget;
            this.shadowLight.shadow.camera.near = 5;
            this.shadowLight.shadow.camera.far = 30;
            this.shadowLight.shadow.camera.left = -10;
            this.shadowLight.shadow.camera.right = 10;
            this.shadowLight.shadow.camera.top = 10;
            this.shadowLight.shadow.camera.bottom = -10;
            this.shadowLight.shadow.mapSize.width = 512;
            this.shadowLight.shadow.mapSize.height = 512;
            let shadowGeometry = new THREE.PlaneGeometry(65, 25);
            this.shadowGround = new THREE.Mesh(shadowGeometry, new THREE.ShadowMaterial({
                transparent: true,
                color: 0x000000,
                opacity: 0.3
            }));
            this.shadowGround.receiveShadow = true;
            //this.shadowGround.position.z = 0;
            this.shadowGround.position.x = -25;
            this.shadowGround.position.y = -18;
            this.shadowGround.position.z = -15;
            this.shadowGround.rotation.x = -Math.PI / 2;
            this.shadowLight.add(this.shadowGround);
        }
        //this.shadowLight.shadow.radius = 1024;
        // var helper = new THREE.CameraHelper(this.shadowLight.shadow.camera);
        // this.scene.add( helper );

        // var light = new THREE.DirectionalLight(0xffffff, 0.15);
        // light.position.set(-5, 2, 20);
        // this.scene.add(light);

        //this.scene.add(hemisphereLight);
        this.scene.add(this.shadowLight);

        this.scene.add(ambientLight);
    },

    checkHit2: function (bottle, currentBlock, nextBlock, initY) {
        let flyingTime = bottle.velocity.vy / Config.GAME.gravity * 2;
        initY = initY || +bottle.obj.position.y.toFixed(2);
        let destinationY = Config.BLOCK.height / 2+1;

        let differenceY = destinationY - initY;
        let time = +((-bottle.velocity.vy + Math.sqrt(Math.pow(bottle.velocity.vy, 2) - 2 * Config.GAME.gravity * differenceY)) / -Config.GAME.gravity).toFixed(2);
        flyingTime -= time;
        flyingTime = +flyingTime.toFixed(2);
        let destination = [];
        let bottlePosition = new THREE.Vector2(bottle.obj.position.x, bottle.obj.position.z);
        let translate = this.direction.setLength(bottle.velocity.vz * flyingTime);
        bottlePosition.add(translate);
        bottle.destination = [+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2)];
        destination.push(+bottlePosition.x.toFixed(2), +bottlePosition.y.toFixed(2));
        if (this.animating) return 7;

        this._pointInPolygon2 = new pInPolygon();

        let temp = 0.7;
        let result1;
        if (nextBlock) {
            let nextDiff = Math.pow(destination[0] - nextBlock.obj.position.x, 2) + Math.pow(destination[1] - nextBlock.obj.position.z, 2);
            // nextDiff = Math.sqrt(nextDiff);
            let nextPolygon = nextBlock.getVertices();

            //判断落地点是否在立方体上. 点在多边形内.
            if ((0, this._pointInPolygon2.PointInPolygon)(destination, nextPolygon)) {
                const radius = MRUtil.radiusForStep(this.succeedTime);
                console.log('s:' + this.succeedTime + ';v:' + radius);

                if (Math.abs(nextDiff) < radius) {
                    return 1;
                } else {
                    return 7;
                }
            } else if ((0, this._pointInPolygon2.PointInPolygon)([destination[0] - Config.BOTTLE.bodyWidth / 2, destination[1]], nextPolygon)
                || (0, this._pointInPolygon2.PointInPolygon)([destination[0], destination[1] + Config.BOTTLE.bodyDepth / 2], nextPolygon)) {
                result1 = 5;
            } else if ((0, this._pointInPolygon2.PointInPolygon)([destination[0], destination[1] - Config.BOTTLE.bodyDepth/2 - temp], nextPolygon)
                || (0, this._pointInPolygon2.PointInPolygon)([destination[0] + Config.BOTTLE.bodyDepth/2 + temp, destination[1]], nextPolygon)) {
                result1 = 3;
            }
        }

        let currentPolygon = currentBlock.getVertices();

        if ((0, this._pointInPolygon2.PointInPolygon)(destination, currentPolygon)) {
            return 2;
        } else if ((0, this._pointInPolygon2.PointInPolygon)([destination[0], destination[1] + Config.BOTTLE.bodyDepth / 2], currentPolygon)
            || (0, this._pointInPolygon2.PointInPolygon)([destination[0] - Config.BOTTLE.bodyWidth / 2, destination[1]], currentPolygon)) {
            if (result1) return 6;
            return 4;
        }
        return result1 || 0;
    },

    shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor((0, this._random.random)() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    },

    generateNextBlock: function () {
        console.log('Game generateNextBlock');
        let block;
        let interval = 5;
        if (this.UI.score > 1000) {
            interval = 6;
        } else if (this.succeedTime > 3000) {
            interval = 7;
        }
        let min,max;
        let nextMin,nextMax;

        switch (this.currentSeason){
        case 0:
            min = springObjOrders.min;
            max = springObjOrders.max;
            nextMin = summerObjOrders.min;
            nextMax = summerObjOrders.max;
            break;
        case 1:
            min = summerObjOrders.min;
            max = summerObjOrders.max;
            nextMin = autumnObjOrders.min;
            nextMax = autumnObjOrders.max;
            break;
        case 2:
            min = autumnObjOrders.min;
            max = autumnObjOrders.max;
            nextMin = winterObjOrders.min;
            nextMax = winterObjOrders.max;
            break;
        case 3:
            min = winterObjOrders.min;
            max = winterObjOrders.max;
            nextMin = 0;
            nextMax = -1;
            break;
        case 4:
            min = dalisiObjOrders.min;
            max = dalisiObjOrders.max;
            nextMin = 0;
            nextMax = -1;
            break;
        }

        if (!this.animating) {
            this.shuffleArray(this.blocksPool);
        }

        if (this.currentSeason===4){
            //大理寺的block
            console.log('generate--大理寺盒子');
            for (let i = 0, len = this.blocksPool.length; i < len; ++i) {
                let order = this.blocksPool[i].order;
                if (order!==this.currentBlock.order && order!==this.nextBlock.order){
                    //选大理寺
                    if (order>=dalisiObjOrders.min && order<=dalisiObjOrders.max && !this.blocksPool[i].isEntry){
                        block = this.blocksPool[i];
                        console.log('blockPool中获取 '+block.order);
                        this.blocksInUse.push(block);
                        this.blocksPool.splice(i, 1);
                        break;
                    }
                }
            }
            if (!block) {
                console.log('从 blocksInUse 中获取的');
                let temp = this.blocksInUse.shift();
                let order = temp.order;
                while (order<dalisiObjOrders.min || order>dalisiObjOrders.max || temp.isEntry){
                    temp.obj.visible = false;
                    this.blocksPool.push(temp);
                    temp = this.blocksInUse.shift();
                    order = temp.order;
                }
                block = temp;
                this.blocksInUse.push(block);
            }
            block.obj.visible = false;
            block.change();
            return block;
        }

        if (this.blockCount%15===this.randomDalisiIn){
            console.log('即将到达大理寺入口');
            //创建人和变身
            this.createRenAndBianshen();

            let ordersInPool = [];
            for (let i=0;i<this.blocksPool.length;++i){
                let order = this.blocksPool[i].order;
                ordersInPool.push(order);
            }
            for (let i=0;i<this.blocksInUse.length;++i){
                let order = this.blocksInUse[i].order;
                ordersInPool.push(order);
            }
            //加载大理寺的block
            let dalisiArr = [];
            for (let i=dalisiObjOrders.min;i<=dalisiObjOrders.max;++i){
                let index = ordersInPool.indexOf(i);
                if (index<0){
                    dalisiArr.push(i);
                }
            }
            this.loadNextSeasonBlocks(dalisiArr);

            for (let i = 0, len = this.blocksPool.length; i < len; ++i){
                let order = this.blocksPool[i].order;
                if (this.blocksPool[i].isEntry){
                    block = this.blocksPool[i];
                    this.blocksInUse.push(block);
                    this.blocksPool.splice(i, 1);
                    break;
                }
            }
            if (!block){
                let temp = this.blocksInUse.shift();
                let order = temp.order;
                while ( order<dalisiObjOrders.min || order>dalisiObjOrders.max ){
                    temp.obj.visible = false;
                    this.blocksPool.push(temp);
                    temp = this.blocksInUse.shift();
                    order = temp.order;
                }
                block = temp;
                this.blocksInUse.push(block);
            }
            block.obj.visible = false;
            block.change();
            return block;
        }

        for (let i = 0, len = this.blocksPool.length; i < len; ++i) {
            let order = this.blocksPool[i].order;
            if (order!==this.currentBlock.order && order!==this.nextBlock.order){
                // if (this.succeedTime-this.lastAddBonus>=interval&&order>=specialObjOrders.min || (order>=min && order<=max) || (order>=qinmingObjOrders.min&&order<=qinmingObjOrders.max)){
                if (this.succeedTime-this.lastAddBonus>=interval&&order>=specialObjOrders.min || (order>=min && order<=max) ){
                    if (order >= specialObjOrders.min) {
                        if (this.lastBonusOrder && this.lastBonusOrder===order) {
                            continue;
                        }
                        this.lastAddBonus = this.succeedTime;
                        this.lastBonusOrder = order;
                    }
                    console.log('从 blocksPool 中获取的');
                    block = this.blocksPool[i];
                    this.blocksInUse.push(block);
                    this.blocksPool.splice(i, 1);
                    break;
                }
            }
        }
        if (!block) {
            console.log('从 blocksInUse 中获取的');
            let temp = this.blocksInUse.shift();
            let order = temp.order;
            while ( order<min || order>max ){
                temp.obj.visible = false;
                this.blocksPool.push(temp);
                temp = this.blocksInUse.shift();
                order = temp.order;
            }
            block = temp;
            this.blocksInUse.push(block);
        }

        block.obj.visible = false;
        block.change();

        console.log('Generate a Block: '+block.order);

        return block;
    },

    live: function () {
        let _this7 = this;
        console.log('Game live');

        ++this.liveTime;
        this.firstAnimating = false;
        if (this.animateTimer) {
            clearTimeout(this.animateTimer);
            this.animateTimer = null;
        }
        this._animation.TweenAnimation.killAll();
        this.animating = false;
        Config.BLOCK.minRadiusScale = 0.8;
        Config.BLOCK.maxRadiusScale = 1;
        Config.BLOCK.minDistance = 4;
        Config.BLOCK.maxDistance = 17;
        setTimeout(function () {
            _this7.bottle.reset();
            _this7.bottle.obj.position.x = 0;
            _this7.bottle.showup();
        }, 2000);
        this.actionList = [];
        this.musicList = [];
        this.touchList = [];
    },

    // 回到游戏界面
    back2Game: function(){
        this.full2D.hide2D();
        this.stage = 'game';
        this.UI.showScore();
    },

    //原地复活
    revival: function(){
        //本局是否复活过
        this.hasRevivaled = true;

        this.full2D.hide2D();
        let dir = this.currentBlock.straight ? 'straight' : 'left';
        this.bottle.reset();
        this.bottle.obj.position.x = this.bottlePrePostion.x;
        this.bottle.obj.position.z = this.bottlePrePostion.z;
        this.stage = 'game';
        this.bottle.lookAt(dir, this.nextBlock.obj.position.clone());
        this.UI.showScore();

        if (this.gameType === Config.GAME.competitionGame){
            //比赛场 计时器
            this.clearTimeUse4CompetitionTimer();
            this.timeUse4CompetitionTimer = setInterval(function () {
                this.timeUse4Competition += 1;
            }.bind(this),1000);
            if (!UserService.showDanmu){
                //打开监听
                this.onDanmuBroadcast();
            }else{
                this.offDanmuBroadcast();
            }
        }
    },

    //清理比赛场计时器
    clearTimeUse4CompetitionTimer:function(){
        if (this.timeUse4CompetitionTimer){
            clearInterval(this.timeUse4CompetitionTimer);
            this.timeUse4CompetitionTimer = null;
        }
    },

    resetScene: function (seed) {
        console.log('Game resetScene');

        //去掉开场的obj
        for (let i=0,len=this.startElems.length;i<len;++i){
            let obj = this.startElems.shift();
            this.scene.remove(obj);

            if (obj.name=='smallSeasonElem4Start') {
                this.disposeNode(obj);
            }
        }

        //本局是否复活过
        this.hasRevivaled = false;

        this.blockCount = 0;
        this.currentSeason = 0;

        this.firstAnimating = false;
        for (let i = 0,
            len = this.blocks.length; i < len; ++i) {
            this.scene.remove(this.blocks[i].obj);
        }
        this.blocks = [];
        if (this.mode == 'observe') {
            if (window.WechatGame){
                this.audioManager.scale_intro.stop();
                this.audioManager.scale_loop.stop();
            }else{
                this.audioManager.stop4Sound();
            }
        }
        this.randomSeed = seed || Date.now();
        this._random.setRandomSeed(this.randomSeed);
        this.actionList = [];
        this.musicList = [];
        this.touchList = [];
        if (this.animateTimer) {
            clearTimeout(this.animateTimer);
            this.animateTimer = null;
        }

        // 修复围观在蓄力到一半的情况下resetScene底座压缩到一半没回弹的情况
        if (this.currentBlock) {
            this.currentBlock.reset();
        }
        this._animation.TweenAnimation.killAll();
        this.animating = false;
        Config.BLOCK.minRadiusScale = 0.8;
        Config.BLOCK.maxRadiusScale = 1;
        Config.BLOCK.minDistance = 4;
        Config.BLOCK.maxDistance = 17;
        for (let i = 0,
            len = this.blocksInUse.length; i < len; ++i) {
            let block = this.blocksInUse.pop();
            block.obj.visible = false;
            block.reset();
            this.blocksPool.push(block);
            this.scene.remove(block);
        }
        for (let i = 0,
            len = this.waves.length; i < len; ++i) {
            this.waves[i].reset();
        }

        this.blocksPool.sort(function(a, b) {
            return a.order - b.order;
        });

        this.currentBlock = this.blocksPool.shift();
        this.currentBlock.obj.visible = true;
        this.scene.add(this.currentBlock.obj);
        this.blocksInUse.push(this.currentBlock);
        this.shadowTarget && this.shadowTarget.position.set(0, 0, 0);
        this.nextBlock = this.blocksPool.shift();
        this.currentBlock.change(null, null, 1);
        this.nextBlock.change(null, null, 1);
        this.nextBlock.obj.position.set(20, 0, 0);
        this.currentBlock.obj.position.set(0, 0, 0);
        this.nextBlock.obj.visible = true;
        this.scene.add(this.nextBlock.obj);
        this.blocksInUse.push(this.nextBlock);
        this.bottle.reset();

        if (window.WechatGame){
            this.randomDalisiIn = -1;
        }else{
            this.randomDalisiIn = parseInt(Math.random()*100 % 6)+5;//大理寺入口变量
        }
        // this.randomDalisiIn = 1; // 大理寺入口位置
        console.log('this.randomDalisiIn'+this.randomDalisiIn);


        if (window.WechatGame){
            //修改狐狸颜色
            let colorIndex = UserService.currentSkin();
            this.bottle.changeColor(colorIndex);
        }

        //记录小人跳之前的位置，复活用
        this.bottlePrePostion = this.bottle.obj.position.clone();

        if (window.WechatGame){
            if (this.gameType === Config.GAME.singleGame){
                const s = UserService.queryLeCard(0);
                if (s.flag) {
                    this.nextBlock.showLeCard(s.index);
                }
            }
        }

        this.thirdBlock = null;

        /**
         * 添加环境元素
         */
        this.smallSeasonNums = [];
        for (let i=0,len=this.seasonElementsInUse.length;i<len;++i){
            let elem = this.seasonElementsInUse.shift();
            elem.visible = false;
            this.scene.remove(elem);

            this.disposeNode(elem);
            elem = null;//todo test
        }
        this.smallSeasonNums = [];
        for (let i=0,len=this.smallSeasonElemsInUse.length;i<len;++i){
            let mesh = this.smallSeasonElemsInUse.shift();
            mesh.visible = false;
            this.objForSmallElems.remove(mesh);

            this.disposeNode(mesh);
            mesh = null;//todo test
        }

        this.currentSeasonElement = this.createSeasonElem(0);
        // this.currentSeasonElement = this.createSeasonElem(4);//todo test 大理寺
        this.currentSeasonElement.visible = true;
        this.currentSeasonElement.position.set(8,0,15);
        this.scene.add(this.currentSeasonElement);
        this.seasonElementsInUse.push(this.currentSeasonElement);

        this.preElementInfo = {
            pos: this.currentSeasonElement.position.clone(),
            radius: this.currentSeasonElement.radius
        };

        //记录接下来block的位置信息
        this.nextBlockPositions = [];

        //换策略，用3个block决定第二个block旁边的元素位置
        //第一个block
        this.currentBlock.straight = 1;
        this.nextBlockPositions.push({
            block:this.currentBlock,
            pos:this.currentBlock.obj.position.clone(),
            straight:1,
            distance:this.nextBlock.obj.position.x-this.currentBlock.obj.position-this.nextBlock.radius-this.currentBlock.radius
        });
        //第2个block
        let dis = Config.BLOCK.minDistance + (0, this._random.random)() * (Config.BLOCK.maxDistance - Config.BLOCK.minDistance);
        dis = +dis.toFixed(2);
        let strai = (0, this._random.random)() > 0.5 ? 1 : 0;
        this.nextBlock.straight = strai;
        this.nextBlockPositions.push({
            block:this.nextBlock,
            pos:this.nextBlock.obj.position.clone(),
            straight:strai,
            distance:dis
        });

        //block计数器
        this.blockCount++;

        this.ground.resetGround();

        this.addSmallSeasonElem(true);
        this.addSmallSeasonElem(false,this.currentBlock);
        this.addSmallSeasonElem(false,this.nextBlock);

        //预生成3个block的信息, 并添加环境元素到scene
        for (let i=0;i<3;++i){
            this.addSeasonElement2Scene();
        }
        this.nextBlockPositions.shift();

        this.UI.reset();
        if (this.gameType === Config.GAME.singleGame){
            //单人模式，获取已获得的乐卡数
            console.log('获得的乐卡数: '+UserService.leCard);
            if (window.WechatGame){
                this.UI.setLeCard(UserService.leCard);
            }
        }else if (this.gameType === Config.GAME.competitionGame){
            //比赛模式，展示弹幕按钮
        }

        this.rankSystem.reset();

        this.lastAddBonus = -2;
        this.succeedTime = 0;

        this.doubleHit = 0;
        this.camera.position.set( - 17, 30, this.initZ4Camera);
        this.shadowLight.position.set(0, 15, 10);

        if (window.WechatGame){
            wx.triggerGC && wx.triggerGC();
        }else{
            //TODO:
        }
    },

    resetSceneDalisi: function () {
        console.log('Game resetSceneDalisi');

        this.currentSeason = 4;
        //去掉开场的obj
        for (let i=0,len=this.startElems.length;i<len;++i){
            let obj = this.startElems.shift();
            this.scene.remove(obj);

            if (obj.name=='smallSeasonElem4Start') {
                this.disposeNode(obj);
            }
        }

        //本局是否复活过
        // this.hasRevivaled = false; //TODO

        this.blockCount = 0;
        this.firstAnimating = false;
        for (let i = 0,
            len = this.blocks.length; i < len; ++i) {
            this.scene.remove(this.blocks[i].obj);
        }
        this.blocks = [];

        // 修复围观在蓄力到一半的情况下resetScene底座压缩到一半没回弹的情况
        if (this.currentBlock) {
            this.currentBlock.reset();
        }
        this._animation.TweenAnimation.killAll();
        this.animating = false;
        Config.BLOCK.minRadiusScale = 0.8;
        Config.BLOCK.maxRadiusScale = 1;
        Config.BLOCK.minDistance = 4;
        Config.BLOCK.maxDistance = 17;
        for (let i = 0,
            len = this.blocksInUse.length; i < len; ++i) {
            let block = this.blocksInUse.pop();
            block.obj.visible = false;
            block.reset();
            this.blocksPool.push(block);
            this.scene.remove(block);
        }
        for (let i = 0,
            len = this.waves.length; i < len; ++i) {
            this.waves[i].reset();
        }


        this.blocksPool.sort(function(a, b) {
            return a.order - b.order;
        });

        for (let i = 0, len = this.blocksPool.length; i < len; ++i) {
            let order = this.blocksPool[i].order;
            //选大理寺
            if (this.blocksPool[i].isEntry){
                this.currentBlock = this.blocksPool[i];
                console.log('currentBlock'+this.currentBlock.order);
                let self = this;
                this.blocksInUse.push(self.currentBlock);
                this.blocksPool.splice(i, 1);
                break;
            }
        }
        for (let i = 0, len = this.blocksPool.length; i < len; ++i) {
            let order = this.blocksPool[i].order;
            //选大理寺
            if (order>=dalisiObjOrders.min&&order<=dalisiObjOrders.max){
                this.nextBlock = this.blocksPool[i];
                console.log('nextBlock'+this.nextBlock.order);
                let self = this;
                this.blocksInUse.push(self.nextBlock);
                this.blocksPool.splice(i, 1);
                break;
            }
        }
        // this.currentBlock = this.blocksPool.shift();//TODO
        this.currentBlock.obj.visible = true;
        this.scene.add(this.currentBlock.obj);
        // this.blocksInUse.push(this.currentBlock);
        this.shadowTarget && this.shadowTarget.position.set(0, 0, 0);
        // this.nextBlock = this.blocksPool.shift();//TODO
        this.currentBlock.change(null, null, 1);
        this.nextBlock.change(null, null, 1);
        this.nextBlock.obj.position.set(20, 0, 0);
        this.currentBlock.obj.position.set(0, 0, 0);
        this.nextBlock.obj.visible = true;
        this.scene.add(this.nextBlock.obj);
        // this.blocksInUse.push(this.nextBlock);
        this.bottle.reset();



        //记录小人跳之前的位置，复活用
        // this.curStraight = 1;
        // this.bottlePrePostion = this.bottle.obj.position.clone();

        if (window.WechatGame){
            if (this.gameType === Config.GAME.singleGame){
                const s = UserService.queryLeCard(0);
                if (s.flag) {
                    this.nextBlock.showLeCard(s.index);
                }
            }
        }else {
            console.log('活动状态 activityStatus：'+UserService.activityStatus);
            console.log('剩余五彩石 restColorStoneToday：'+UserService.restColorStoneToday);
            console.log('五彩石总数 totalColorStone：'+UserService.totalColorStone);
            if (UserService.activityStatus !== 1){
                if (UserService.restColorStoneToday>0){
                    const s = UserService.queryColorStone(0);
                    if (s.flag){
                        this.nextBlock.showColorStone(s.index);
                    }
                }
            }
        }

        this.thirdBlock = null;

        /**
         * 添加环境元素
         */
        for (let i=0,len=this.seasonElementsInUse.length;i<len;++i){
            let elem = this.seasonElementsInUse.shift();
            elem.visible = false;
            this.scene.remove(elem);

            this.disposeNode(elem);
        }
        this.smallSeasonNums = [];
        for (let i=0,len=this.smallSeasonElemsInUse.length;i<len;++i){
            let mesh = this.smallSeasonElemsInUse.shift();
            mesh.visible = false;
            this.objForSmallElems.remove(mesh);

            this.disposeNode(mesh);
        }

        this.currentSeasonElement = this.createSeasonElem(4);// 大理寺季节
        this.currentSeasonElement.visible = true;
        this.currentSeasonElement.position.set(8,0,15);
        this.scene.add(this.currentSeasonElement);
        this.seasonElementsInUse.push(this.currentSeasonElement);

        this.preElementInfo = {
            pos: this.currentSeasonElement.position.clone(),
            radius: this.currentSeasonElement.radius
        };

        //记录接下来block的位置信息
        this.nextBlockPositions = [];

        //换策略，用3个block决定第二个block旁边的元素位置
        //第一个block
        this.currentBlock.straight = 1;
        this.nextBlockPositions.push({
            block:this.currentBlock,
            pos:this.currentBlock.obj.position.clone(),
            straight:1,
            distance:this.nextBlock.obj.position.x-this.currentBlock.obj.position-this.nextBlock.radius-this.currentBlock.radius
        });
        //第2个block
        let dis = Config.BLOCK.minDistance + (0, this._random.random)() * (Config.BLOCK.maxDistance - Config.BLOCK.minDistance);
        dis = +dis.toFixed(2);
        let strai = (0, this._random.random)() > 0.5 ? 1 : 0;
        this.nextBlock.straight = strai;
        this.nextBlockPositions.push({
            block:this.nextBlock,
            pos:this.nextBlock.obj.position.clone(),
            straight:strai,
            distance:dis
        });

        //block计数器
        this.blockCount++;

        this.ground.resetGround();
        this.ground.changeColor(4);

        this.addSmallSeasonElem(true);
        this.addSmallSeasonElem(false,this.currentBlock);
        this.addSmallSeasonElem(false,this.nextBlock);

        //预生成3个block的信息, 并添加环境元素到scene
        for (let i=0;i<3;++i){
            this.addSeasonElement2Scene();
        }
        this.nextBlockPositions.shift();

        // this.UI.reset();

        this.rankSystem.reset();

        this.lastAddBonus = -2;
        this.succeedTime = 0;

        this.doubleHit = 0;
        this.camera.position.set( - 17, 30, this.initZ4Camera);
        this.shadowLight.position.set(0, 15, 10);

        if (window.WechatGame){
            wx.triggerGC && wx.triggerGC();
        }else{
            //TODO:
        }

        this.bottle.showup();
    },

    //获取当前季节的环境元素信息
    getCurSeasonElem4Season: function(season){
        let seasonName = '';
        switch (season){
        case 0:
            seasonName = 'spring';
            // seasonElem = Config.SeasonElem.spring;
            break;
        case 1:
            seasonName = 'summer';
            // seasonElem = Config.SeasonElem.summer;
            break;
        case 2:
            seasonName = 'autumn';
            // seasonElem = Config.SeasonElem.autumn;
            break;
        case 3:
            seasonName = 'winter';
            // seasonElem = Config.SeasonElem.winter;
            break;
        case 4:
            seasonName = this.activityName;
            // seasonElem = Config.SeasonElem.dalisi;
            break;
        }
        let seasonElem;
        let seasonSegment = window.ObjInfo.seasonSegment;
        for (let i=0;i<seasonSegment.length;++i){
            if (seasonSegment[i].season == seasonName){
                seasonElem = seasonSegment[i].SeasonElem;
                break;
            }
        }
        return seasonElem;
    },

    //随机添加一些小的环境元素
    addSmallSeasonElem: function (isFirst,block) {
        let minX,maxX;
        let minZ,maxZ;
        if (isFirst){
            minX = -5;
            maxX = 35;
            minZ = 0;
            maxZ = 40;
        } else{
            minX = block.obj.position.x-30;
            maxX = block.obj.position.x+30;
            maxZ = block.obj.position.z+10;
            minZ = block.obj.position.z - 50;
        }
        //对应季节的小元素个数
        let curSeason = this.getCurSeasonElem4Season(this.currentSeason);
        let elemNum = curSeason.small.length;
        //要添加多少元素
        let num = 2;
        let count =  parseInt(Math.random()*100%(num+1));
        const model = window.systemModel;
        if (model.indexOf('iPhone 7')>=0 || model.indexOf('iPhone 8')>=0 || model.indexOf('iPhone X')>=0){
            count = num + parseInt(Math.random()*100%(num+1));
        }
        if (isFirst){
            count = 3;
        }
        this.smallSeasonNums.push(count);
        for (let i=0;i<count;++i){
            let k = parseInt(Math.random()*100%elemNum);
            let elemInfo = curSeason.small[k];
            let filename = elemInfo.name;
            let size = elemInfo.size;
            let plane = new THREE.PlaneGeometry(size.w, size.h);
            let texture = Config.loader.load(filename);
            let material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.01
            });
            // let material = elemInfo.material;
            let mesh = new THREE.Mesh(plane, material);
            mesh.rotation.y = -Math.PI/4;
            mesh.rotation.z = 0.1;
            mesh.rotation.x = 0.2;
            mesh.name = 'smallSeasonElem';
            let x,z;
            x = minX +  Math.random()*(maxX-minX);
            z = minZ + Math.random()*(maxZ-minZ);
            mesh.position.set(x, -8, z);
            this.objForSmallElems.add(mesh);
            this.smallSeasonElemsInUse.push(mesh);
            //todo test
            elemInfo = null;
            filename = null;
            size = null;
        }


        let len=this.smallSeasonElemsInUse.length;
        if (model.indexOf('iPhone 7')>=0 || model.indexOf('iPhone 8')>=0 || model.indexOf('iPhone X')>=0){
            // if (len>=20){
            //     for (let i=0;i<10;++i){
            //         let mesh = this.smallSeasonElemsInUse.shift();
            //         mesh.visible = false;
            //         this.objForSmallElems.remove(mesh);
            //
            //         let t = this.smallSeasonMaterials.shift();
            //         this.renderer.deallocateTexture(t);
            //         t = undefined;
            //     }
            // }
            if (this.smallSeasonNums.length>=7){
                let c = this.smallSeasonNums.shift();
                for (let i=0;i<c;++i){
                    let mesh = this.smallSeasonElemsInUse.shift();
                    mesh.visible = false;
                    this.objForSmallElems.remove(mesh);

                    this.disposeNode(mesh);
                }
            }
        }else{
            // if (len>=10){
            //     let mesh = this.smallSeasonElemsInUse.shift();
            //     mesh.visible = false;
            //     this.objForSmallElems.remove(mesh);
            //
            //     let t = this.smallSeasonMaterials.pop();
            //     this.renderer.deallocateTexture(t);
            //     t = undefined;
            // }
            if (this.smallSeasonNums.length>=5){
                let c = this.smallSeasonNums.shift();
                for (let i=0;i<c;++i){
                    let mesh = this.smallSeasonElemsInUse.shift();
                    mesh.visible = false;
                    this.objForSmallElems.remove(mesh);

                    this.disposeNode(mesh);
                }
            }
        }
    },

    //随机创建一个对应季节的大景物
    createSeasonElem: function(season){
        //随机选一个对应季节的大景物
        let curSeason = this.getCurSeasonElem4Season(season);
        let len = curSeason.big.length;
        let k = parseInt(Math.random()*100%len);
        let elemInfo = curSeason.big[k];
        let filename = elemInfo.name;
        let size = elemInfo.size;
        let plane = new THREE.PlaneGeometry(size.w,size.h);
        let texture = Config.loader.load(filename);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01
        });
        // let material = elemInfo.material;
        let mesh = new THREE.Mesh(plane, material);
        mesh.rotation.y = -Math.PI/4;
        mesh.rotation.z = 0.1;
        mesh.rotation.x = 0.2;
        mesh.radius = Math.max(size.w,size.h)/2;
        mesh.name = 'SeasonElem';
        mesh.position.y = 0;
        if(size.h/2>3){
            mesh.position.y = size.h/2-3;
        }
        return mesh;
    },

    //计算预生成block的信息
    getPreBlockInfo: function(){
        let l = this.nextBlockPositions.length;
        let preBlockInfo = this.nextBlockPositions[l-1];
        let preBlock = this.nextBlockPositions[l-1].block;
        let prePos = this.nextBlockPositions[l-1].pos.clone();
        let block = this.generateNextBlock();
        let pos = prePos;
        if (preBlockInfo.straight){
            pos.x += (preBlockInfo.distance+preBlock.radius+block.radius);
        }else {
            pos.z -= (preBlockInfo.distance+preBlock.radius+block.radius);
        }
        block.obj.position.set(pos.x,0,pos.z);
        return {block:block,pos:pos};
    },

    //预生成一个block信息, 并向scene中添加环境元素
    addSeasonElement2Scene: function(){
        //计算预生成block的信息
        let preBlockInfo = this.getPreBlockInfo();

        let distance = Config.BLOCK.minDistance + (0, this._random.random)() * (Config.BLOCK.maxDistance - Config.BLOCK.minDistance);
        distance = +distance.toFixed(2);
        let straight = (0, this._random.random)() > 0.5 ? 1 : 0;

        preBlockInfo.block.straight = straight;
        this.nextBlockPositions.push({
            block:preBlockInfo.block,
            pos:preBlockInfo.pos,
            straight:straight,
            distance:distance
        });

        //计算元素的位置
        let l = this.nextBlockPositions.length;
        let firstBlockPos = this.nextBlockPositions[l-3];
        let secondBlockPos = this.nextBlockPositions[l-2];
        let thirdBlockPos = this.nextBlockPositions[l-1];

        //添加小元素
        let tmpN = 2;
        const model = window.systemModel;
        if (model.indexOf('iPhone 7')>=0 || model.indexOf('iPhone 8')>=0 || model.indexOf('iPhone X')>=0){
            tmpN = 2;
        }else{
            tmpN = 3;
        }
        if (this.blockCount%tmpN===0) {
            this.addSmallSeasonElem(false,thirdBlockPos.block);
        }

        this.blockCount++;
        if (this.blockCount%15===0){
            if(this.currentSeason !== 4){
                if (window.WechatGame){
                    this.randomDalisiIn = -1;
                } else{
                    //大理寺入口变量
                    this.randomDalisiIn = parseInt(Math.random()*100 % 6)+5;
                }
                // this.randomDalisiIn = 1; // 大理寺入口位置
                console.log('this.randomDalisiIn '+this.randomDalisiIn);
                this.currentSeason++;
                if (this.currentSeason >= 4){
                    this.currentSeason = 0;
                }
            }
        }

        if (model.indexOf('iPhone 7')>=0 || model.indexOf('iPhone 8')>=0 || model.indexOf('iPhone X')>=0){
            //以外
        }else{
            if ((this.blockCount-1)%2!==0){
                return;
            }
        }

        //环境元素
        let elem = this.createSeasonElem(this.currentSeason);
        let x=0, z=0;
        if (firstBlockPos.straight){
            //元素在secondBlock的左边
            x = (firstBlockPos.pos.x+secondBlockPos.pos.x)/2;
            z = secondBlockPos.pos.z - 20;
            if (!secondBlockPos.straight){
                //thirdBlock也在secondBlock的左边，需要判断是否重叠
                let dx = Math.pow(x-thirdBlockPos.pos.x,2);
                let dz = Math.pow(z-thirdBlockPos.pos.z,2);
                let dis = Math.sqrt(dx+dz);
                if (dis < elem.radius+thirdBlockPos.block.radius+6){
                    // x = thirdBlockPos.pos.x-(10+elem.radius+thirdBlockPos.block.radius);
                    // z -= 3;
                    this.disposeNode(elem);
                    return;
                }
            }
        } else {
            //元素在secondBlock的右边
            x = secondBlockPos.pos.x+20;
            z = (firstBlockPos.pos.z+firstBlockPos.pos.z)/2;
            if (secondBlockPos.straight){
                //thirdBlock也在secondBlock的右边，需要判断是否重叠
                let dx = Math.pow(x-thirdBlockPos.pos.x,2);
                let dz = Math.pow(z-thirdBlockPos.pos.z,2);
                let dis = Math.sqrt(dx+dz);
                if (dis < elem.radius+thirdBlockPos.block.radius+5){
                    // z = thirdBlockPos.pos.z+(5+elem.radius+thirdBlockPos.block.radius);
                    // x += 10;
                    this.disposeNode(elem);
                    return;
                }
            }
        }
        //判断要添加的elem与之前的elem是否有重叠
        let isIntersected = false;
        let difX = Math.pow(this.preElementInfo.pos.x-x,2);
        let difZ = Math.pow(this.preElementInfo.pos.z-z,2);
        let d = Math.sqrt(difX+difZ);
        if (d > elem.radius+this.preElementInfo.radius+1){
            // elem.position.set(x,-2,z);
            elem.position.x = x;
            elem.position.z = z;
            elem.visible = true;
            this.scene.add(elem);
            this.seasonElementsInUse.push(elem);
            this.preElementInfo = {
                pos: elem.position.clone(),
                radius: elem.radius
            };
        }

        let tmpN1 = 10;
        if (model.indexOf('iPhone 7')>=0 || model.indexOf('iPhone 8')>=0 || model.indexOf('iPhone X')>=0){
            tmpN1 = 10;
        }else{
            tmpN1 = 6;
        }
        if (this.seasonElementsInUse.length>=tmpN1){
            let el = this.seasonElementsInUse.shift();
            el.visible = false;
            this.scene.remove(el);

            this.disposeNode(el);
        }

    },

    bindEvent: function () {
        console.log('Game bindEvent');
        let that = this;

        //网络情况监听
        NetStatusUtil.on(NetworkStatusChanged,function (connected) {
            if (!connected){
                console.log('网络断了');
                if (this.stage=='game'){
                    this.isConnected = false;
                }
            }
            this.gameCtrl.onNetworkStatusChanged(connected);
        }.bind(this));

        that.instructionCtrl.bindCmdHandler(function (data) {
            if (data.type === -1) {
                that.gameCtrl.showPlayerGG(data.s);
                that.instructionCtrl.onCmdComplete();
                return;
            } else if (data.type === 0) {
                // that.gameCtrl.showPlayerWaiting()
                // that.replayGame(data.seed)
                that.socketFirstSync = true;
                that.bottle.reset();
                that.UI.scoreText.changeStyle({ textAlign: 'center' });
                that.UI.setScore(0);
                that.instructionCtrl.onCmdComplete();
                return;
            } else {
                that.gameCtrl.showPlayerWaiting();
                if (data.score != that.UI.score) {
                    that.UI.score = data.score;
                    that.UI.setScore(data.score);
                }
            }

            if (!data || !data.b || !data.b.vy) {
                that.instructionCtrl.onCmdComplete();
                return;
            }
            if (that.socketFirstSync) {
                that.socketFirstSync = false;
                that.camera.position.set(data.ca.x, data.ca.y, data.ca.z);
                that.ground.obj.position.set(data.gd.x, data.gd.y, data.gd.z);
            }
            // 如果两个序号不一样，就重置两个队列
            if (that.currentBlock.order != data.c.order || that.nextBlock.order != data.n.order) {
                for (let i = 0, len = that.blocksInUse.length; i < len; ++i) {
                    let block = that.blocksInUse.pop();
                    that.scene.remove(block.obj);
                    that.blocksPool.push(block);
                }
                let cIn = that.blocksPool.findIndex(function (el) {
                    return el.order === data.c.order;
                });
                that.currentBlock = that.blocksPool[cIn];
                let temp = that.blocksPool.splice(cIn, 1);
                that.blocksInUse.push(temp[0]);

                let nIn = that.blocksPool.findIndex(function (el) {
                    return el.order === data.n.order;
                });
                that.nextBlock = that.blocksPool[nIn];
                let temp1 = that.blocksPool.splice(nIn, 1);
                that.blocksInUse.push(temp1[0]);
            }
            console.log('bindEvent that.scene.add(that.currentBlock.obj) && that.scene.add(that.nextBlock.obj);');
            that.scene.add(that.currentBlock.obj);
            that.scene.add(that.nextBlock.obj);
            that.currentBlock.obj.visible = true;
            that.nextBlock.obj.visible = true;
            that.currentBlock.obj.position.x = data.c.x;
            that.currentBlock.obj.position.z = data.c.z;
            that.currentBlock.change(data.c.r, data.c.type, data.c.rs);

            that.nextBlock.obj.position.x = data.n.x;
            that.nextBlock.obj.position.z = data.n.z;
            that.nextBlock.change(data.n.r, data.n.type, data.n.rs);

            that.bottle.obj.position.set(data.b.x, Config.BLOCK.height / 2, data.b.z);
            that.bottle.velocity.vz = data.b.vz;
            that.bottle.velocity.vy = data.b.vy;
            that.distance = data.di;
            that.straight = data.s;
            let direction = new THREE.Vector3(that.nextBlock.obj.position.x - that.bottle.obj.position.x, 0, that.nextBlock.obj.position.z - that.bottle.obj.position.z);
            that.direction = new THREE.Vector2(that.nextBlock.obj.position.x - that.bottle.obj.position.x, that.nextBlock.obj.position.z - that.bottle.obj.position.z);

            console.log('-----------------checkHit2------333333333-----------------------------');
            that.checkHit2(that.bottle, that.currentBlock, that.nextBlock, data.b.y);
            console.log('Game bindEvent checkHit2');
            that.quick = data.q;
            // 先在pool里面找第三块
            if (data.t) {

                let tIn = that.blocksPool.findIndex(function (el) {
                    return el.order === data.t.order;
                });
                if (tIn > -1) {
                    that.thirdBlock = that.blocksPool[tIn];
                    let temp = that.blocksPool.splice(tIn, 1);
                    that.blocksInUse.push(that.thirdBlock);
                } else {
                    that.thirdBlock = that.blocksInUse.find(function (el) {
                        return el.order === data.t.order;
                    });
                    that.scene.remove(that.thirdBlock.obj);
                }

                that.thirdBlock.change(data.t.r, data.t.type, data.t.rs);
            }
            that.hit = data.h;
            if (that.tailSystem) {

                that.tailSystem.correctPosition();
            }

            if (window.WechatGame){
                that.audioManager.scale_intro.stop();
                that.audioManager.scale_intro.play();
            }else {
                that.audioManager.stop4Sound();

                that.audioManager.play4Sound('scale_intro');
            }
            that.bottle.prepare();
            that.currentBlock.shrink();

            let caPos = {
                x: data.ca.x,
                y: data.ca.y,
                z: data.ca.z
            };
            let gdPos = {
                x: data.gd.x,
                y: data.gd.y,
                z: data.gd.z
            };
            that.stopBlockMusic();
            that.instructionCtrl.icTimeout = setTimeout(function () {
                if (window.WechatGame){
                    that.audioManager.scale_intro.stop();
                    that.audioManager.scale_loop.stop();
                }else {
                    that.audioManager.stop4Sound();
                }
                if (that.currentBlock.order === 15) {
                    that.currentBlock.hideGlow();
                }
                that.currentBlock.rebound();
                that.camera.position.set(caPos.x, caPos.y, caPos.z);
                that.ground.obj.position.set(gdPos.x, gdPos.y, gdPos.z);
                caPos = null;
                gdPos = null;
                that.bottle.jump(direction.normalize());
            }, data.d * 1000);
            data = null;
        });

        let __canvas;

        if (window.H5){
            __canvas = document.getElementById('WebGL-output');
        }else {
            __canvas = canvas;
        }

        // console.log('Game addEventListener canvas:' + __canvas);

        let eventNames = {start:'touchstart',end:'touchend',move:'touchmove',cancel:'touchcancel'};
        if (!window.WechatGame){
            if (!window.isMobile){
                eventNames.start = 'mousedown';
                eventNames.end = 'mouseup';
                eventNames.move = 'mousemove';
                eventNames.cancel = 'mouseout';
            }
        }

        __canvas.addEventListener(eventNames.start, function (e) {
            console.log('Game  touchstart, that.mode = ' + that.mode
                + '; that.stage = ' + that.stage);
            // console.log('Game  touchstart callback e = ' + JSON.stringify(e));
            // console.log('Game  touchstart e.type = ' + e.type + "; e.target = " + e.target);

            /**
             * 全局都能触发的事件
             */
            if (that.mode === 'single' || that.mode === 'player') {
                if (that.stage === 'game' && !that.is_from_wn && !that.guider) {
                    // if (e.changedTouches[0].clientX < WIDTH * 0.13 && e.changedTouches[0].clientY > HEIGHT * (1 - 0.12)) {
                    if (e.clientX < WIDTH * 0.13 && e.clientY > HEIGHT * (1 - 0.12)) {
                        that.gameCtrl.shareObservCard();
                        return;
                    }
                }
            }

            /**
             *  根据stage来改变派发事件
             */
            if (that.stage === 'friendRankList' || that.stage === 'battlePage' || that.stage === 'groupRankList'
                || that.stage === 'singleSettlementPgae' || that.stage === 'startPage'|| that.stage ==='everydayPick' || that.stage ==='skin' || that.stage ==='newSkin')  {
                //
                //      that.full2D.doTouchStartEvent(e);
                PageCtrl.doTouchStartEvent(e);
                return;
            }

            if (that.stage === 'revival'||that.stage === 'doBetter'||that.stage === 'winAndDisplay'||that.stage==='congratulation'||that.stage==='awardList') {
                // that.full2D.doTouchStartEvent(e);
                PageCtrl.doTouchStartEvent(e);
                return;
            }

            if (that.stage === 'rankGlobal') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }


            if (that.stage === 'testHorizontalList') {
                that.full2D.doTouchStartEvent(e);
                return;
            }

            if (that.stage === 'rankInner') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'viewerWaiting' || that.stage === 'viewerGG' || that.stage === 'viewerOut') {
                that.full2D.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'xiacizaizhan') {
                that.full2D.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'prizeRecord') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'prizeRankLast') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'prizeRankMoney') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'sessionInfo') {
                PageCtrl.doTouchStartEvent(e);
                return;
            }
            if (that.stage === 'game') {
                if (that.mode === 'observe') return;
                if (that.gameType === Config.GAME.competitionGame){
                    //比赛场，弹幕按钮点击区域
                    let __pageX ;
                    let __pageY ;
                    if (!window.WechatGame){
                        if (window.isMobile){
                            __pageX = e.changedTouches[0].pageX;
                            __pageY = e.changedTouches[0].pageY;
                        } else {
                            __pageX = e.pageX;
                            __pageY = e.pageY;
                        }
                    }else{
                        __pageX = e.changedTouches[0].pageX;
                        __pageY = e.changedTouches[0].pageY;
                    }
                    let maxY = 45;
                    if (window.isIPhoneX){
                        maxY = 75;
                    }
                    if (__pageX>=window.WIDTH/2 && __pageX<=window.WIDTH/2+100 && __pageY>=20 && __pageY<=maxY){
                        //点击了弹幕按钮
                        console.log('点击了弹幕按钮');
                        that.clickDanmuBtn = true;
                        return;
                    }
                }

                if (window.WechatGame){
                    that.audioManager.scale_loop.pause();//stop
                    that.audioManager.scale_intro.pause();
                }else {
                    // that.audioManager.stop4Sound();
                }
                if (that.bottle.status === 'stop' && !that.pendingReset && !(that.guider && that.animating)) {
                    // 缩放声音开始
                    //记录小人跳之前的位置
                    that.bottlePrePostion = that.bottle.obj.position.clone();

                    that.stopBlockMusic();
                    if (window.WechatGame){
                        that.audioManager.scale_intro.play();
                    } else {
                        that.audioManager.play4Sound('scale_intro');
                    }

                    that.bottle.prepare();
                    that.currentBlock.shrink();
                    that.mouseDownTime = Date.now();
                }

                if (that.stage == 'pickOnce'||that.stage == 'pickFive') {
                    PageCtrl.doTouchStartEvent(e);
                    return;
                }
                return;
            }
        });

        let touchEnd = function touchEnd(e) {
            console.log('Game  touchEnd, that.mode = ' + that.mode
                + '; that.stage = ' + that.stage);
            // var x = e.changedTouches[0].clientX;
            // var y = e.changedTouches[0].clientY;

            if (that.bottle.status === 'prepare' && !that.pendingReset && !(that.guider && that.animating) && that.stage != 'game') {
                that.handleWxOnError({
                    'message': 'touchstart triggered and bottle prepare but touchend error.  stage: ' + that.stage,
                    'stack': ''
                });
            }

            if (that.stage == 'singleSettlementPgae' || that.stage == 'startPage') {
                // that.full2D.doTouchEndEvent(e);
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage == 'viewerWaiting' || that.stage == 'viewerGG' || that.stage == 'viewerOut') {
                that.full2D.doTouchEndEvent(e);
                return;
            }

            if (that.stage == 'netError') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }

            if (that.stage == 'friendRankList') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'rankGlobal') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }

            if (that.stage === 'rankInner') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'xiacizaizhan') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'prizeRecord') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'prizeRankLast') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'prizeRankMoney') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage === 'sessionInfo') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage == 'pickOnce'||that.stage == 'pickFive') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }

            if (that.stage === 'overAgain') {
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if (that.stage==='revival'||that.stage==='doBetter'||that.stage==='winAndDisplay'||that.stage==='congratulation'||that.stage==='awardList') {
                // that.full2D.doTouchEndEvent(e);
                PageCtrl.doTouchEndEvent(e);
                return;
            }
            if(that.stage ==='everydayPick' || that.stage ==='skin'|| that.stage ==='newSkin'){
                PageCtrl.doTouchEndEvent(e);
                return;
            }

            if (that.stage === 'testHorizontalList') {
                that.full2D.doTouchEndEvent(e);
                return;
            }

            if (that.stage == 'battlePage') {
                that.full2D.doTouchEndEvent(e);
                return;
            }

            if (that.stage == 'groupRankList') {
                // console.log('groupRankList', 'touch')
                that.full2D.doTouchEndEvent(e);
            }

            if (that.stage == 'game') {
                if (that.gameType===Config.GAME.competitionGame && that.clickDanmuBtn) {
                    that.clickDanmuBtn = false;
                    //开关监听弹幕广播
                    if (!UserService.showDanmu) {
                        //关闭弹幕
                        console.log('关闭弹幕');
                        UserService.showDanmu = 1;
                        that.UI.hideDanmu();
                        that.offDanmuBroadcast();
                    }else{
                        //展示弹幕
                        console.log('展示弹幕');
                        UserService.showDanmu = 0;
                        that.UI.showDanmu();
                        that.onDanmuBroadcast();
                    }
                    return;
                }
                if (that.bottle.status === 'prepare' && !that.pendingReset && !(that.guider && that.animating)) {
                    console.log('game touchEnd');
                    // 缩放声音结束
                    if (window.WechatGame){
                        that.audioManager.scale_intro.stop();
                        that.audioManager.scale_loop.stop();
                    } else {
                        that.audioManager.stop4Sound();
                    }

                    that.currentBlock.rebound();
                    let duration = (Date.now() - that.mouseDownTime) / 1000;
                    // that.duration.push(duration);
                    that.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 150);
                    // that.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 110);
                    that.bottle.velocity.vz = +that.bottle.velocity.vz.toFixed(2);
                    that.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 180);
                    // that.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 140);
                    that.bottle.velocity.vy = +that.bottle.velocity.vy.toFixed(2);
                    that.direction = new THREE.Vector2(that.nextBlock.obj.position.x - that.bottle.obj.position.x, that.nextBlock.obj.position.z - that.bottle.obj.position.z);
                    that.direction.x = +that.direction.x.toFixed(2);
                    that.direction.y = +that.direction.y.toFixed(2);
                    let direction = new THREE.Vector3(that.direction.x, 0, that.direction.y);
                    that.bottle.jump(direction.normalize());
                    that.hideCombo();
                    that.hit = that.checkHit2(that.bottle, that.currentBlock, that.nextBlock);
                    console.log('game touchEnd hit: '+that.hit);

                    that.distance = that.nextBlockPositions[0].distance;
                    that.straight = that.nextBlockPositions[0].straight;

                    // that.hit = (0, that._random.random)() > 0.5 ? 1 : 7; //TODO 不会跳死

                    if (that.hit === 1 || that.hit === 7) {
                        console.log('成功');
                        //预生成一个block的信息，并添加环境元素到scene
                        that.addSeasonElement2Scene();

                        // var block = that.generateNextBlock();

                        let block = that.nextBlockPositions[1].block;
                        that.nextBlockPositions.shift();

                        that.thirdBlock = block;
                        that.quick = Date.now() - that.lastSucceedTime < 800 || false;
                        that.quickArr.push(that.quick);
                        if (that.mode === 'player') {++that.seq;
                            // that.gameSocket.sendCommand(that.seq, {
                            //     type: 1,
                            //     c: {
                            //         x: that.currentBlock.obj.position.x,
                            //         z: that.currentBlock.obj.position.z,
                            //         order: that.currentBlock.order,
                            //         type: that.currentBlock.type,
                            //         r: that.currentBlock.radius,
                            //         rs: that.currentBlock.radiusScale
                            //     },
                            //     n: {
                            //         x: that.nextBlock.obj.position.x,
                            //         z: that.nextBlock.obj.position.z,
                            //         order: that.nextBlock.order,
                            //         type: that.nextBlock.type,
                            //         r: that.nextBlock.radius,
                            //         rs: that.nextBlock.radiusScale
                            //     },
                            //     d: duration,
                            //     b: {
                            //         x: that.bottle.obj.position.x,
                            //         y: +that.bottle.obj.position.y.toFixed(2),
                            //         z: that.bottle.obj.position.z,
                            //         vy: that.bottle.velocity.vy,
                            //         vz: that.bottle.velocity.vz
                            //     },
                            //     t: {
                            //         order: that.thirdBlock.order,
                            //         type: that.thirdBlock.type,
                            //         r: that.thirdBlock.radius,
                            //         rs: that.thirdBlock.radiusScale
                            //     },
                            //     h: that.hit,
                            //     di: that.distance,
                            //     s: that.straight,
                            //     q: that.quick,
                            //     ca: {
                            //         x: that.camera.position.x,
                            //         y: that.camera.position.y,
                            //         z: that.camera.position.z
                            //     },
                            //     gd: {
                            //         x: that.ground.obj.position.x,
                            //         y: that.ground.obj.position.y,
                            //         z: that.ground.obj.position.z
                            //     },
                            //     score: that.UI.score
                            //     // nickname: myUserInfo.nickname,
                            //     // img: myUserInfo.headimg
                            // });
                        }
                    } else {
                        console.log('失败');
                        if (that.mode === 'player') {
                            console.log('mode player');
                            ++that.seq;
                            // that.gameSocket.sendCommand(that.seq, {
                            //     type: 1,
                            //     c: {
                            //         x: that.currentBlock.obj.position.x,
                            //         z: that.currentBlock.obj.position.z,
                            //         order: that.currentBlock.order,
                            //         type: that.currentBlock.type,
                            //         r: that.currentBlock.radius,
                            //         rs: that.currentBlock.radiusScale
                            //     },
                            //     n: {
                            //         x: that.nextBlock.obj.position.x,
                            //         z: that.nextBlock.obj.position.z,
                            //         order: that.nextBlock.order,
                            //         type: that.nextBlock.type,
                            //         r: that.nextBlock.radius,
                            //         rs: that.nextBlock.radiusScale
                            //     },
                            //     d: duration,
                            //     b: {
                            //         x: that.bottle.obj.position.x,
                            //         y: +that.bottle.obj.position.y.toFixed(2),
                            //         z: that.bottle.obj.position.z,
                            //         vy: that.bottle.velocity.vy,
                            //         vz: that.bottle.velocity.vz
                            //     },
                            //     // t: { order: that.thirdBlock.order, type: that.thirdBlock.type, r: that.thirdBlock.radius, rs: that.thirdBlock.radiusScale },
                            //     h: that.hit,
                            //     di: that.distance,
                            //     s: that.straight,
                            //     q: that.quick,
                            //     ca: {
                            //         x: that.camera.position.x,
                            //         y: that.camera.position.y,
                            //         z: that.camera.position.z
                            //     },
                            //     gd: {
                            //         x: that.ground.obj.position.x,
                            //         y: that.ground.obj.position.y,
                            //         z: that.ground.obj.position.z
                            //     },
                            //     score: that.UI.score
                            //     // nickname: myUserInfo.nickname,
                            //     // img: myUserInfo.headimg
                            // });
                        }
                    }
                    if (that.mode != 'observe') {
                        that.actionList.push([duration, +that.bottle.obj.position.y.toFixed(2), that.quick]);
                        that.musicList.push(that.musicScore);
                        if (e.changedTouches && e.changedTouches[0]) {
                            that.touchList.push([e.changedTouches[0].clientX, e.changedTouches[0].clientY]);
                        }
                    }
                }
            }
        };

        __canvas.addEventListener(eventNames.end, touchEnd);

        if (window.WechatGame || window.isMobile){
            __canvas.addEventListener(eventNames.move, function (e) {
                console.log('Game  touchmove, that.stage = ' + that.stage);
                if (that.stage === 'battlePage' || that.stage === 'friendRankList' || that.stage === 'groupRankList') {
                    that.full2D.doTouchMoveEvent(e);
                    return;
                }

                if (that.stage === 'rankGlobal') {
                    PageCtrl.doTouchMoveEvent(e);
                    return;
                }

                if (that.stage === 'testHorizontalList') {
                    that.full2D.doTouchMoveEvent(e);
                    return;
                }
                if (that.stage === 'prizeRecord') {
                    PageCtrl.doTouchMoveEvent(e);
                    return;
                }
                if (that.stage === 'prizeRankLast') {
                    PageCtrl.doTouchMoveEvent(e);
                    return;
                }
                if (that.stage === 'prizeRankMoney'||that.stage==='awardList') {
                    PageCtrl.doTouchMoveEvent(e);
                    return;
                }
            });
        }

        if (window.WechatGame || window.isMobile){
            __canvas.addEventListener(eventNames.cancel, function (e) {
                console.log('触发了 touchcancel');
                if (that.stage == 'game') {
                    if (that.bottle.status === 'prepare' && !that.pendingReset && !(that.guider && that.animating)) {

                        console.log('game touchcancel');
                        // 缩放声音结束
                        if (window.WechatGame){
                            that.audioManager.scale_intro.stop();
                            that.audioManager.scale_loop.stop();
                        } else {
                            that.audioManager.stop4Sound();
                        }

                        that.currentBlock.rebound();
                        let duration = (Date.now() - that.mouseDownTime) / 1000;
                        // that.duration.push(duration);
                        that.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 150);
                        // that.bottle.velocity.vz = Math.min(duration * Config.BOTTLE.velocityZIncrement, 110);
                        that.bottle.velocity.vz = +that.bottle.velocity.vz.toFixed(2);
                        that.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 180);
                        // that.bottle.velocity.vy = Math.min(Config.BOTTLE.velocityY + duration * Config.BOTTLE.velocityYIncrement, 140);
                        that.bottle.velocity.vy = +that.bottle.velocity.vy.toFixed(2);
                        that.direction = new THREE.Vector2(that.nextBlock.obj.position.x - that.bottle.obj.position.x, that.nextBlock.obj.position.z - that.bottle.obj.position.z);
                        that.direction.x = +that.direction.x.toFixed(2);
                        that.direction.y = +that.direction.y.toFixed(2);
                        let direction = new THREE.Vector3(that.direction.x, 0, that.direction.y);
                        that.bottle.jump(direction.normalize());
                        that.hideCombo();
                        that.hit = that.checkHit2(that.bottle, that.currentBlock, that.nextBlock);
                        console.log('game touchcancel hit: ' + that.hit);

                        that.distance = that.nextBlockPositions[0].distance;
                        that.straight = that.nextBlockPositions[0].straight;

                        if (that.hit === 1 || that.hit === 7) {
                            console.log('成功');
                            //预生成一个block的信息，并添加环境元素到scene
                            that.addSeasonElement2Scene();

                            let block = that.nextBlockPositions[1].block;
                            that.nextBlockPositions.shift();

                            that.thirdBlock = block;
                            that.quick = Date.now() - that.lastSucceedTime < 800 || false;
                            that.quickArr.push(that.quick);
                            if (that.mode === 'player') {
                                ++that.seq;
                            }
                        } else {
                            console.log('失败');
                            if (that.mode === 'player') {
                                console.log('mode player');
                                ++that.seq;
                            }
                        }
                        if (that.mode != 'observe') {
                            that.actionList.push([duration, +that.bottle.obj.position.y.toFixed(2), that.quick]);
                            that.musicList.push(that.musicScore);
                            if (e.changedTouches && e.changedTouches[0]) {
                                that.touchList.push([e.changedTouches[0].clientX, e.changedTouches[0].clientY]);
                            }
                        }
                    }
                }
            });
        }
    },

    stopBlockMusic: function () {
        console.log('Game stopBlockMusic');
        if (this.currentBlock.order === 19) {
            this.currentBlock.stopMusic();
        } else if (this.currentBlock.order === 24) {
            this.currentBlock.closeDoor();
        } else if (this.currentBlock.order === 26) {
            // this.audioManager.water.pause();
            // this.audioManager.water.currentTime = 0;
        }else if (this.currentBlock.order >=specialObjOrders.min){
            this.currentBlock.stopMusic();
        }
        this.audioManager.clearTimer();
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
        if (this.sohuLightTimer){
            clearInterval(this.sohuLightTimer);
            this.sohuLightTimer = null;
        }
    },

    handleNetworkFucked: function (show) {
        console.log('Game handleNetworkFucked');
        let word = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '网络异常,点击确定进入游戏';

        // this.rollBackToSingle();

        if (show) {
            // wx.showModal({
            //     title: '提示',
            //     content: word,
            //     showCancel: false
            // });
        }
    },

    handleSocketFucked: function () {
        console.log('handleSocketFucked');
        // this.gameSocket.close();
        if (this.mode === 'player') {
            this.shareObservCardFail();
        }
        if (this.mode === 'observe') {
            this.handleNetworkFucked(true);
        }
    },

    handleInterrupt: function () {
        console.log('Game handleInterrupt');
        if (this.bottle.status === 'prepare') {
            this.bottle.stopPrepare();
            this.currentBlock.reset();
            if (window.WechatGame){
                this.audioManager.scale_loop.stop();
            }else {
                this.audioManager.stop4Sound();
            }
        }
    },

    handleWxOnError: function (error) {
        this.offDanmuBroadcast();
    },

};

export default Game;
