'use strict';

import ModeCtrl from './ModeCtrl.js';
import JumpSocketService from '../service/JumpSocketService.js';
import MRUtil from '../util/MRUtil.js';
import UserService, {kUserServiceDidUpdate} from '../service/UserService.js';
import Button from '../base/Button.js';
import SignService from '../service/SignService.js';
import UserInfo from '../shared/service/UserInfo.js';
import SignUtil from '../shared/service/SignUtil.js';
import GameSocketConnector from '../shared/service/GameSocketConnector.js';
import ShareUtil from '../service/ShareUtil.js';
import {ShareType} from '../service/ShareUtil.js';
import Utils from '../shared/service/Utils.js';
import NetStatusUtil from '../shared/service/NetStatusUtil.js';
import Application from '../shared/bridge/Application';
import {SIGNAL} from '../shared/service/Constants';

var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素


var GameCtrl = function () {
    function GameCtrl(game) {
        this.game = game;

        this.arrayLucky = []; //存广播接受到的中奖人
        this.cacheRankGlobal = null;//全球榜缓存
        this.cachePrizeRankLast = null;//上期排行榜缓存
        this.cachePrizeRankMoney = null;//奖金榜榜缓存

        this.sessionReMainTimer = null;//场次预告界面倒计时计时器
        this.hasShare2GetRevival = false;

        this.zaijiezailiTimer = null;//再接再厉页面计时器
        this.clear = null;//中奖调用计时器
        this.luckyAppear = null;//展示中奖计时器
        this.luckyAppearRemain = null;//中奖停留时间计时器
        this.lastStage = 'start';

        //是否正在展示登录失败的弹框
        this.isShowingModal = false;

    }
    return GameCtrl;
}();

GameCtrl.prototype = {

    init: function () {
        console.log('GameCtrl init()');
        this.gameView = this.game.gameView;
        this.modeCtrl = new ModeCtrl(this.game);
        this.model = this.game.gameModel;
        this.reporter = this.game.reporter;
        this.historyTimes = this.game.historyTimes;
        this.viewer = this.game.viewer;

        if (window.WechatGame){
            //监听中奖信息广播
            GameSocketConnector.on('onChampionshipOver',function (result) {
                //如果有的话，在非游戏页，展示中奖信息，否则先缓存到本地，游戏结束再展示
                console.log('收到了 中奖信息广播');
                console.log(result);
                UserService.haveAwardInfo = 1;
                if (this.game.stage == 'game'){
                    //在游戏中，存到本地
                    console.log('在游戏中，先存到本地');
                    UserService.haveAwardInfo = 1;
                } else {
                    this.showCongratulation();
                }
            }.bind(this));
        }
    },

    //清除再接再厉页面的计时器
    clearZaijiezailiTimer:function(){
        if (this.zaijiezailiTimer){
            clearInterval(this.zaijiezailiTimer);
            this.zaijiezailiTimer = null;
        }
    },
    clearSessionReMainTimer:function(){
        if (this.sessionReMainTimer){
            clearInterval(this.sessionReMainTimer);
            this.sessionReMainTimer = null;
        }
    },

    showRankToast:function(text,callback){
        //rank中展示toast
        this.game.UI.showToast(text,callback);
    },

    firstInitGame: function (options,launchPs) {
        this.lastStage = 'start';
        this.modeCtrl.initFirstPage(options);
        ///初始化分享
        ShareUtil.initShare();
        ///游戏自动登录
        let cb4H5SighIn = function (err) {
            if (!window.WechatGame){
                if (err){
                    //登录失败，展示弹框
                    if (!NetStatusUtil.isConnected()){
                        this.onNetworkStatusChanged(false);
                    } else{
                        let code = err.code;
                        if (code !== 7 && code !== 15 && code !== 17 && code !== 18 && code != SIGNAL.HAD_BIND && code != SIGNAL.HAD_NOT_BIND) {
                            if (!this.isShowingModal){
                                this.isShowingModal = true;
                                Utils.showModal({
                                    title: '提示',
                                    content: '登录失败，请重新登录',
                                    showCancel: false,
                                    success: function (res) {
                                        if (res.confirm) {
                                            this.isShowingModal = false;
                                            this._fastSignIn(launchPs,cb4H5SighIn);
                                        }
                                    }.bind(this)
                                });
                            }
                        }
                    }
                } else{
                    //登录成功了，调开始游戏
                    let ps = {championshipId:-1};//普通场传 -1
                    this._joinGame(ps,function () {
                        this.game.championshipId = ps.championshipId;
                    }.bind(this),function (code) {
                        console.log(code);
                    }.bind(this));
                    //大理寺活动-初始化
                    this.initActivity();
                }
            }
        }.bind(this);
        this._fastSignIn(launchPs,cb4H5SighIn);

        if (window.WechatGame){
            //添加更新提现的监听
            // this.realBtnUpdate = function(){
            //     console.log('提现按钮刷新');
            //     this.updateRealBtn();
            // }.bind(this);
            // UserService.on(kUserServiceDidUpdate,this.realBtnUpdate);
        }
    },

    _fastSignIn:function(options,cb){
        ///H5 走到这里出错了
        options = options || {};
        const query = options.query;
        let loading = false;
        if (query){
            let numberId = query.numberId;

            if(!numberId){
                const info = options.referrerInfo;
                if (info){
                    const extraData = info.extraData;
                    if (extraData) {
                        numberId = extraData.numberId;
                    }
                }
            }

            if (UserInfo.numberId){
                console.error('保持之前的登录状态，numberId:' + UserInfo.numberId);
            }else if(numberId){
                console.error('保存透传的numberId:' + numberId);
                UserInfo.numberId = numberId;
                UserInfo.jsCode = null;
                loading = true;
            }else {
                console.error('没有登录信息');
            }
        }

        if(loading){
            MRUtil.showLoading();
            SignService.fastSignIn(function (err) {
                MRUtil.hiddenLoading();
                if (!err){
                    if (window.WechatGame){
                        //登录成功后，查询是否有获奖信息
                        this.showCongratulation();
                        SignUtil.hiddenNewAuthorizedButtonIfNeed();
                    }
                }
                cb && cb(err);
            }.bind(this));
        }else {
            SignService.fastSignIn(function(err){
                if (!err){
                    if (window.WechatGame){
                        //登录成功后，查询是否有获奖信息
                        this.showCongratulation();
                    }
                }
                cb && cb(err);
            }.bind(this));
        }
    },

    _joinGame: function(ps,succ,fail){
        const socket = JumpSocketService;
        const self = this;
        socket.startGame(ps,function (err,result) {
            if (err){
                if (err.code == 2){
                    let tmpPs = {championshipId:ps.championshipId,score:0,time:0};
                    socket.endGame(tmpPs,function (err,data) {
                        if(!err){
                            ///更新总乐卡数
                            UserService.leCard = data.totalLeCard;
                            //更新总五彩石数
                            UserService.totalColorStone = data.totalColorStone;
                        }
                        console.log('先结束掉之前的游戏，然后重新开始！');
                        self._joinGame(ps,succ);
                    },tmpPs);
                }else {
                    console.error('游戏未能开始|' + JSON.stringify(err));
                    fail && fail(err.code);
                }
            }else {
                const restLeCard = result.restLeCard;
                UserService.restLeCard = restLeCard;
                //当局乐卡重置为0；
                UserService.clearLeCards();
                //更新剩余五彩石数
                UserService.restColorStone = result.restColorStoneCount;
                UserService.clearColorStones();
                //更新活动状态
                UserService.activityStatus = result.activityStatus;
                console.log('mr startGame:' + restLeCard);
                console.log('开始游戏，剩余五彩石：'+result.restColorStoneCount);
                console.log('开始游戏，活动状态：'+result.activityStatus);
                // for (var i = 0;i < 301;i ++){
                //     UserService.queryLeCard(i);
                // }
                succ && succ();
            }
        }.bind(this),ps);
    },

    //进入比赛场
    _joinCompeteGame: function(ps,succ,fail){
        const socket = JumpSocketService;
        const self = this;

        socket.startGame4Compete(ps,function (err,result) {
            if (err){
                if (err.code == 2){
                    let tmpPs = {championshipId:ps.championshipId,score:0,time:0};
                    socket.endGame4Compete(tmpPs,function () {
                        console.log('先结束掉之前的游戏，然后重新开始！');
                        self.clickStartGame4Competition(null,self.game.championshipInfo);
                    });
                }else {
                    console.error('游戏未能开始|' + JSON.stringify(err));
                    fail && fail(err.code);
                }
            }else {
                console.log('进入比赛场成功');
                console.log(result);
                succ && succ();
            }
        }.bind(this));
    },

    // 首页：开始游戏
    clickStart: function (sender) {
        console.log('GameCtrl clickStart()');
        if (!window.WechatGame) {
            this.modeCtrl.clickStart();
            let ps = {championshipId:-1};//普通场传 -1
            this.game.championshipId = ps.championshipId;
            this._joinGame(ps,function(){
                console.log('游戏开始成功');
                this.game.championshipId = ps.championshipId;
                //再次调用initActivity，刷新五彩石数量
                this.initActivity();
                // JumpSocketService.initActivity({gameMode: 'jumper'}, function (err, result) {
                //     if (!err && result) {
                //         console.log('活动初始化 success');
                //         this.demandValue = result.demandValue || 500;
                //         this.myValue = result.myValue || 0;
                //         this.didGetVip = result.status == 1 ? true : false;
                //         this.showActivityBanner();
                //     } else {
                //         console.log('活动初始化 fail: ' + JSON.stringify(err));
                //     }
                // }.bind(this));
            }.bind(this),function (code) {
                console.log('游戏未能开始(' + code + ')');
            }.bind(this));
            return;
        }

        sender && sender.disable();
        let ps = {championshipId:-1};//普通场传 -1
        this.game.championshipId = ps.championshipId;
        this._joinGame(ps,function(){
            this.game.championshipId = ps.championshipId;
            this.modeCtrl.clickStart();
            this.hasShare2GetRevival = false;
            //关闭提现按钮更新的监听
            this.offUpdateTixianBtn();
        }.bind(this),function (code) {
            this.showRankToast('游戏未能开始(' + code + ')',function () {
                sender && sender.enable();
            });
        }.bind(this));
    },

    //比赛场 —— 开始游戏
    clickStartGame4Competition:function(sender,championshipInfo,isFromEnd){
        //时间判断，结束前5分钟禁止进入游戏
        const registerEndTime = championshipInfo.registerEndTime || 0;
        const endTime = championshipInfo.championshipEndTime || 0;
        const nowTime = new Date().getTime();
        if (registerEndTime < nowTime){
            if (!isFromEnd){
                let dif = Math.floor((endTime-registerEndTime)/1000/60);
                this.showRankToast('比赛结束前'+dif+'分钟停止进入游戏');
            }
            return;
        }
        //比赛场：先注册游戏，再开始游戏，最后结束游戏
        console.log('比赛场 注册游戏');
        sender && sender.disable();

        let championshipId = championshipInfo.championshipId || 4;
        this.game.championshipId = championshipId;
        this.game.championshipInfo = championshipInfo;

        let ps = {championshipId:championshipId};
        const socket = JumpSocketService;
        socket.registerGame4Compete(ps,function(err,result){
            if (!err){
                console.log('注册 比赛场 成功');
                console.log('比赛场 开始游戏');
                console.log(result);
                this._joinCompeteGame(ps,function(){
                    this.clearSessionReMainTimer();
                    this.clearZaijiezailiTimer();
                    this.hasShare2GetRevival = false;
                    this.game.championshipId = ps.championshipId;
                    this.game.championshipInfo = championshipInfo;
                    this.modeCtrl.clickStartGame4Competition();
                }.bind(this),function (code) {
                    this.showRankToast('游戏未能开始(' + code + ')',function () {
                        sender && sender.enable();
                    });
                }.bind(this));
            } else{
                if (err.msg == 'IDS_Championship_DuplicateRegistration'){
                    //已经注册过了，直接开始游戏
                    console.log('已经注册过了，直接开始游戏');
                    console.log('比赛场 开始游戏');
                    this._joinCompeteGame(ps,function(){
                        this.clearSessionReMainTimer();
                        this.clearZaijiezailiTimer();
                        this.hasShare2GetRevival = false;
                        this.game.championshipId = ps.championshipId;
                        this.game.championshipInfo = championshipInfo;
                        this.modeCtrl.clickStartGame4Competition();
                    }.bind(this),function (code) {
                        this.showRankToast('游戏未能开始(' + code + ')',function () {
                            sender && sender.enable();
                        });
                    }.bind(this));
                }else if (err.msg == 'IDS_Championship_ChampionshipExpired'){
                    this.showRankToast('比赛结束前5分钟停止进入游戏',function () {
                        sender && sender.enable();
                    });
                }
                else{
                    console.error('注册 比赛场 失败');
                    console.error(err);
                    this.showRankToast('注册比赛场失败',function () {
                        sender && sender.enable();
                    });
                }
            }
        }.bind(this));
    },

    backStartPage:function(){
        //返回首页
        this.clearTimeClear();
        this.clearLuckyAppearTimer();
        this.clearLuckyAppearRemainTimer();
        this.clearSessionReMainTimer();
        this.lastStage = 'start';
        GameSocketConnector.removeTrumpetPreprocess('IDS_Trumpet_Content_02');
        JumpSocketService.offTrumpet('IDS_Trumpet_Content_02');
        this.game.offDanmuBroadcast();
        this.game.clearTimeUse4CompetitionTimer();
        this.game.UI.hideScore();
        this.hasShare2GetRevival = false;
        this.clearZaijiezailiTimer();
        this.game.startView();
        this.modeCtrl.backStartPage();
        this.cacheRankGlobal = null;//全球榜缓存
        this.cachePrizeRankLast = null;//上期排行榜缓存
        this.cachePrizeRankMoney = null;//奖金榜榜缓存
        this.arrayLucky = [];//中奖人数组清除
        this.luckyX = null;//中奖位置清空
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else{
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){
            let openDataContext = wx.getOpenDataContext();//返回主页，向开放域传消息，清空缓存
            openDataContext.postMessage({
                type:'cache',
                key: 'cache',
            });
        }
        //添加更新提现的监听
        // this.realBtnUpdate = function(){
        //     console.log('提现按钮刷新');
        //     this.updateRealBtn();
        // }.bind(this);
        // UserService.on(kUserServiceDidUpdate,this.realBtnUpdate);
        //返回首页时，查询是否有恭喜获奖信息
        this.showCongratulation();
    },

    //关闭提现按钮更新的监听
    offUpdateTixianBtn:function(){
        if(this.realBtnUpdate){
            UserService.off(kUserServiceDidUpdate,this.realBtnUpdate);
            this.realBtnUpdate = undefined;
        }
    },

    //更新提现按钮
    updateRealBtn:function(){
        if (this.game.stage == 'startPage'){
            this.modeCtrl.updateRealBtn();
        }
        //关闭提现按钮更新的监听
        this.offUpdateTixianBtn();
    },

    clearTimeClear:function(){
        if(this.clear){
            clearTimeout(this.clear);
            console.log('clearTimeClear');
            this.clear = null;
        }
    },

    clearLuckyAppearTimer:function(){
        if(this.luckyAppear){
            clearInterval(this.luckyAppear);
            console.log('clearLuckyAppearTimer');
            this.luckyAppear = null;
        }
    },

    clearLuckyAppearRemainTimer:function(){
        if(this.luckyAppearRemain){
            clearTimeout(this.luckyAppearRemain);
            this.luckyAppearRemain = null;
        }
    },
    // 结算页面：重新玩
    clickReplay: function () {
        // this._joinGame(function () {
        //     this.modeCtrl.gameOverClickReplay();
        // }.bind(this));

        //清排行榜缓存，防止数据不更新
        this.cacheRankGlobal = null;
        this.clickStart();
    },
    //普通场结果页：分享
    clickShare4Lecard:function(sender){
        if (window.WechatGame){
            console.log('分享换乐卡相关');
            sender && sender.disable();
            const type = ShareType.kLecard;
            //调分享
            ShareUtil.shareAppMessage(type,function () {
                ///分享成功
                console.log('分享成功');
                if (this.hasShare2GetRevival){
                    setTimeout(function () {
                        this.showRankToast('分享成功');
                    }.bind(this),500);
                    sender && sender.enable();
                }else {
                    // 乐卡相关 逻辑
                    const socket = JumpSocketService;
                    socket.sharedByType(type,function (err,result) {
                        if (!err){
                            console.log('乐卡相关分享 成功');
                            console.log(result);
                            setTimeout(function () {
                                this.showRankToast(result.text || '乐卡相关更改成功');
                            }.bind(this),500);
                            this.hasShare2GetRevival = true;
                        } else {
                            setTimeout(function () {
                                this.showRankToast('分享成功');
                            }.bind(this),500);
                            console.error('乐卡相关分享 失败');
                            console.error(err);
                        }
                        sender && sender.enable();
                    }.bind(this));
                }
            }.bind(this),function (res) {
                ///分享失败
                console.log(res);
                setTimeout(function () {
                    this.showRankToast('分享失败');
                }.bind(this),500);
                sender && sender.enable();
            }.bind(this));
        }else{
            console.log('H5 分享战绩');

            Application.ccReport({
                id:1001,
                memo:{'from':'H5'}
            });//H5结束页分享上报

            //显示loading
            Utils.showLoading({mask:true});

            //拼分享图片
            const score = this.game.currentScore;
            ShareUtil.shareToH5(score,function (result) {
                if (result.code == 0){

                    Application.ccReport({
                        id:1002,
                        memo:{'from':'H5'}
                    });//H5结束页分享成功上报

                    this.showRankToast('分享成功');
                }else if (result.code==1){
                    this.showRankToast('分享失败');
                } else if (result.code==2){
                    this.showRankToast('分享取消');
                }else if (result.code==3){
                    this.showRankToast('复制成功');
                }else if (result.code==4){
                    this.showRankToast('复制失败');
                }

                //隐藏loading
                if (result.hideLoading){
                    Utils.hideLoading();
                }
            }.bind(this));
        }
    },
    clickBack4H5:function(){
        console.log('H5 返回');
        Application.goback();
    },
    //H5普通场结果页：排行榜
    clickRank4H5:function(sender){
        console.log('点击了结果页的排行榜');
        this.rankGlobal(sender);
    },

    //展示网络错误弹框
    showNetError:function(){
        this.modeCtrl.showNetError();
    },
    //网络错误弹框 —— 退出
    clickExitGame4Net: function(){
        console.log('退出游戏');
        //回到首页
        this.backStartPage();
    },
    //网络错误弹框 —— 重试
    clickTryAgain4Net: function(){
        console.log('重试连接');
        //重新连接，
        // 连接成功回到游戏界面并toast提示，连接失败再弹网络错误弹窗
        this.game.back2Game();
        this.game.retryConnectNet();
    },

    showPickPage:function(sender){
        //天天抽红包界面
        sender && sender.disable();
        this.modeCtrl.showPickPage(sender);

        // const that = this;
        // this.clearTimeClear();
        // this.clearLuckyAppearTimer();
        // this.clearLuckyAppearRemainTimer();
        // const showPage = function(result){
        //     that.lastStage = 'showPickPage';
        //     that.modeCtrl.showPickPage(result);
        //     // console.log('arrayLength---'+that.arrayLucky.length);
        //     // that.addLuckyUser();//调用广播，中奖人添加到中奖队列
        //     // that.luckyX = 0;
        //     // that.boardLuckyUser();//中奖人绘画，入界面时先画一次
        //     // that.clear = setInterval(function () {
        //     //     if(that.luckyX < -410){
        //     //         that.boardLuckyUser();
        //     //     }
        //     // }.bind(this),700);
        //
        //     that.queryIsNeed2ShowCongratulation();
        //     //关闭提现按钮更新的监听
        //     that.offUpdateTixianBtn();
        // };
        //
        // let ps ={
        //     count:80
        // }
        // JumpSocketService.lotteryItemConfigs(ps,function (err,data) {
        //     if(!err){
        //         // this.fakeLuckyData = {
        //         //     // redPocketHistory:[["%u7409%u7941",0.3],["%u7409%u7941",0.6],["%u7409%u7941",0.2],["%u7409%u7941",0.2],["%u7409%u7941",0.3],["%u7409%u7941",0.3],["%u7409%u7941",0.5],["%u7409%u7941",5.1],["%u7409%u7941",0.3],["%u7409%u7941",0.1]],
        //         //     // dataTemplate:["IDS_Trumpet_Content_02"]
        //         //     redPocketHistory:data.redPocketHistory,
        //         //     dataTemplate:data.dataTemplate
        //         // };
        //         let result = data.result;
        //         that.nine = [];
        //         for (let i = 0; i < result.length; i++) {
        //             const obj = result[i];
        //             const type = obj.type;
        //             const value = obj.value;
        //             let e = undefined;
        //             //redPocket：1  leCard：2  skin：3  nextTime:0
        //             if (type == 1) {
        //                 e = {
        //                     img: 'res/img/red_envelopes.png',
        //                     imgLuck:'res/img/package.png',
        //                     locationX: 89,
        //                     locationY: 64,
        //                     locationTextY: 132,
        //                     text: value + '元红包',
        //                     choice: false,
        //                     type:1
        //                 };
        //             } else if (type == 2) {
        //                 e = {
        //                     img: 'res/img/card_big_luck.png',
        //                     imgLuck:'res/img/prize_card.png',
        //                     locationX: 89,
        //                     locationY: 64,
        //                     locationTextY: 132,
        //                     text: '乐卡×' + value,
        //                     choice: false,
        //                     type:2
        //                 }
        //             } else if (type == 3) {
        //                 const hasSkin = UserService.hasNewSkin();
        //                 if(hasSkin){
        //                     e = {
        //                         img: 'res/img/card_big_luck.png',
        //                         imgLuck:'res/img/prize_card.png',
        //                         locationX: 89,
        //                         locationY: 64,
        //                         locationTextY: 132,
        //                         text: '乐卡×4',
        //                         choice: false,
        //                         type:2
        //                     }
        //                 }else{
        //                     console.log('pack'+JSON.stringify(UserService.pack));
        //                     e = {
        //                         img: 'res/img/skin_black.png',
        //                         imgLuck:'res/img/skinNew.png',
        //                         locationX: 89,
        //                         locationY: 64,
        //                         locationTextY: 132,
        //                         text: '新皮肤',
        //                         choice: false,
        //                         type:3
        //                     }
        //                 }
        //             }else if(type == 0){
        //                 e = {
        //                     img : 'res/img/next_time.png',
        //                     imgLuck :'res/img/package_jieguo.png',
        //                     locationX:89,
        //                     locationY:89,
        //                     choice:false,
        //                     type:0,
        //                 }
        //             }
        //             that.nine.push(e);
        //         }
        //         // that.luckyUserArray();//将添加历史广播数据
        //         for(let i = 0;i < result.length;i++){
        //             if(result[i].type === 3){
        //                 that._skinIndex = i;
        //                 break;
        //             }
        //         }
        //         showPage(data);
        //     }else{
        //         sender && sender.enable();
        //     }
        // }.bind(this));
    },

    //展示抽奖页中奖信息
    boardLuckyUser:function(){
        const that = this;
        if (this.arrayLucky && this.arrayLucky.length > 0) {
            // this.clearTimeClear();
            this.clearLuckyAppearTimer();
            this.clearLuckyAppearRemainTimer();
            if(this.boardAddRealLuckUser){
                this.arrayLucky.push(this.boardAddRealLuckUser);
                this.boardAddRealLuckUser = null;
            }
            let currentLucky = this.arrayLucky.pop();
            let a = 0;
            this.luckyAppear = setInterval(function () {
                that.modeCtrl.showLuckUser({
                    info: currentLucky,
                    x: 680 - a
                });
                that.luckyX = 680 - a;
                a = a + 3;
            }, 20);//移动位置
            this.luckyAppearRemain = setTimeout(function () {
                if(that.luckyX < -410){
                    clearInterval(that.luckyAppear);
                }
            }, 700);//清除出现的计时器
        }
    },

    addLuckyUser:function(){
        //添加真实广播中奖人
        const that = this;
        const route = 'IDS_Trumpet_Content_02';//红包
        GameSocketConnector.addTrumpetPreprocess(route,function (ps) {
            if ((ps instanceof Array) && (ps.length > 1)){
                let nickName = ps[0];
                nickName = unescape(nickName);
                if (nickName.length > 4){
                    const r = nickName.substring(0,3) + '...';
                    ps[0] = r;
                }
                return ps;
            }
        });

        JumpSocketService.onTrumpet(route,function(result){
            console.log('广播已打开-播中奖人-'+JSON.stringify(result));
            const contents = result.content;
            if(contents) {
                that.boardAddRealLuckUser = result.content;
            }
        });
    },

    luckyUserArray:function(){
        if(this.fakeLuckyData){
            let route = this.fakeLuckyData.dataTemplate || '';
            let finalParams = this.fakeLuckyData.redPocketHistory || [];
            for(let i = 0;i < finalParams.length;i++){
                let item = finalParams[i];
                if (item) {
                    if ((item instanceof Array) && (item.length > 1)){
                        let nickName = item[0];
                        nickName = unescape(nickName);
                        if (nickName.length > 4){
                            const r = nickName.substring(0,3) + '...';
                            item[0] = r;
                        }
                    }
                    const templateObj = window.BroadcastConfigs[route] || '';
                    let template = templateObj.ZH_CN|| '';
                    ///替换占位符，构建文案
                    for (let i = 0; i < item.length; i ++){
                        let p = item[i];
                        p = unescape(p);
                        template = template.replace('{' + i + '}',p);
                    }
                    const msg = {};
                    msg.c = Utils.parseString(template);
                    msg.params = item;
                    this.arrayLucky.push(msg.c);
                }
            }
            this.fakeLuckyData = null;
        }
    },

    pickCtrl:function(sender){
        //抽一次控制
        if(UserService.freeLotteryNum > 0){
            this.showPickFree(sender);
        }else{
            if(UserService.leCard > 5){
                this.showPickOnce(sender);
            }else{
                sender.disable();
                this.showRankToast('乐卡不足，快去玩游戏吧~',function () {
                    sender.enable();
                });
            }
        }
    },

    hasSkinCtrl:function(result){
        //是否获取皮肤
        if(UserService.hasNewSkin()){
            return;
        }else{
            for(let i = 0;i < result.length;i++){
                if(result[i] === this._skinIndex){
                    UserService.setNewSkin({id:2});
                    break;
                }
            }
        }
    },

    showPickOnce:function(result){
        //抽一次结果
        this.modeCtrl.showPickOnce(result);

        // sender.disable();
        // const fiveBtn = Button.buttonWithTag(sender.superCanvas,'pickFiveBtn');
        // if(fiveBtn){
        //     fiveBtn.disable && fiveBtn.disable();
        // }
        // this.arrayLucky = [];//中奖人数组清除
        // this.luckyX = null;//中奖位置清空
        // const that = this;
        // const socketOnce = JumpSocketService;
        // socketOnce.startLottery({
        //         type : 1 //抽奖抽一次
        //     },function (err,result) {
        //     if(!err){
        //         UserService.redPocket = result.redPocket;
        //         UserService.leCard = result.leCard;
        //         UserService.timesToGetRedPocket = result.timesToGetRedPocket;
        //         that.hasSkinCtrl(result.index);
        //         ///转盘
        //         that.modeCtrl.rotateTurnTable(function () {
        //             JumpSocketService.offTrumpet('IDS_Trumpet_Content_02');
        //             that.clearTimeClear();
        //             that.clearLuckyAppearTimer();
        //             that.clearLuckyAppearRemainTimer();
        //             result.nine = that.nine;
        //             that.modeCtrl.showPickOnce(result);
        //         });
        //     }else {
        //
        //         that.showRankToast(err.msg || '请稍后重试',function () {
        //             sender.enable();
        //             fiveBtn.enable && fiveBtn.enable();
        //         });
        //     }
        // });
        // console.log('Game showPickOnce');
    },
    showPickFree:function(sender){
        //免费抽奖结果
        sender.disable();
        const fiveBtn = Button.buttonWithTag(sender.superCanvas,'pickFiveBtn');
        if(fiveBtn){
            fiveBtn.disable && fiveBtn.disable();
        }
        this.arrayLucky = [];//中奖人数组清除
        this.luckyX = null;//中奖位置清空
        const that = this;
        const socketOnce = JumpSocketService;
        socketOnce.startLottery({
            type : 0 //免费抽奖
        },function (err,result) {
            if(!err){
                UserService.redPocket = result.redPocket;
                UserService.leCard = result.leCard;
                UserService.freeLotteryNum = result.freeLotteryNum;
                UserService.timesToGetRedPocket = result.timesToGetRedPocket;
                that.hasSkinCtrl(result.index);
                ///转盘
                that.modeCtrl.rotateTurnTable(function () {
                    JumpSocketService.offTrumpet('IDS_Trumpet_Content_02');
                    that.clearTimeClear();
                    that.clearLuckyAppearTimer();
                    that.clearLuckyAppearRemainTimer();
                    result.nine = that.nine;
                    that.modeCtrl.showPickOnce(result);
                });
            }else {
                that.showRankToast(err.msg || '请稍后重试',function () {
                    sender.enable();
                    fiveBtn.enable && fiveBtn.enable();
                });
            }
        });
        console.log('Game showPickOnce');
    },

    showPickFive:function(result){
        //抽五次
        this.modeCtrl.showPickFive(result);

        // const onceBtn = Button.buttonWithTag(sender.superCanvas,'pickOnceBtn');
        // if(onceBtn){
        //     onceBtn.disable && onceBtn.disable();
        // }
        // this.arrayLucky = [];//中奖人数组清除
        // this.luckyX = null;//中奖位置清空
        // sender.disable();
        // console.log('Game showPickFive');
        // const that = this;
        // const socketFive = JumpSocketService;
        // socketFive.startLottery({
        //     type : 2 //抽奖抽5次
        // },function (err,result) {
        //     if(!err){
        //         UserService.redPocket = result.redPocket;
        //         UserService.leCard = result.leCard;
        //         that.hasSkinCtrl(result.index);
        //
        //         ///转盘
        //         that.modeCtrl.rotateTurnTable(function () {
        //             JumpSocketService.offTrumpet('IDS_Trumpet_Content_02');
        //             that.clearTimeClear();
        //             that.clearLuckyAppearTimer();
        //             that.clearLuckyAppearRemainTimer();
        //             result.nine = that.nine;
        //             that.modeCtrl.showPickFive(result);
        //         });
        //     }else {
        //         that.showRankToast(err.msg || '请稍后重试',function () {
        //             sender.enable();
        //             onceBtn.enable && onceBtn.enable();
        //         });
        //     }
        // });
    },

    showTiXian:function(){
        //提现
        this.lastStage = 'showTiXian';
        this.modeCtrl.showTiXian();
        //关闭提现按钮更新的监听
        this.offUpdateTixianBtn();
    },
    showMoreGame:function(){
        //更多游戏
        this.lastStage = 'showMoreGame';//TODO
        this.modeCtrl.showMoreGame();
        //关闭提现按钮更新的监听
        this.offUpdateTixianBtn();
    },

    clickSkin:function(){
        //点击皮肤页
        this.lastStage = 'clickSkin';
        console.log('GameCtrl clickSkin');
        let skinLock = UserService.hasNewSkin();
        console.log('skinLock--'+skinLock);
        if(skinLock){
            this.modeCtrl.showNewSkinPage();//跳转到新皮肤界面
            this.queryIsNeed2ShowCongratulation();
        }else{
            this.modeCtrl.showSkinPage();//未解锁皮肤界面
            this.queryIsNeed2ShowCongratulation();
        }
        //关闭提现按钮更新的监听
        this.offUpdateTixianBtn();
    },

    //普通场 —— 结果页
    showOverAgain:function(){
        //游戏结束页
        this.modeCtrl.overAgainPage();
        // this.lastStage = 'showOverAgain';
        // const score = this.game.currentScore;
        // const time = this.game.timeUse4Competition;
        // let ps = {championshipId:this.game.championshipId,score:score,time:time};
        // const socket = JumpSocketService;
        //
        // socket.endGame(ps,function(err,data){
        //     if(!err){
        //         ///更新总乐卡数
        //         UserService.leCard = data.totalLeCard;
        //         //更新总五彩石数
        //         UserService.totalColorStone = data.totalColorStone;
        //         const highScore = data.score || 0; //获取用户的最高分
        //         ///等于也上报，因为第一次玩没有新纪录！
        //         let sysInfo;
        //         if (window.WechatGame){
        //             sysInfo = wx.getSystemInfoSync();
        //         }else{
        //             sysInfo = {SDKVersion:'0'};
        //         }
        //         // let highScore = 160;
        //         if(highScore >= score && sysInfo.SDKVersion >= '1.9.92'){
        //             wx.setUserCloudStorage({
        //                 KVDataList:[{key:GameConfig.openJumperScore,value:highScore.toString()}]
        //             });
        //         }
        //         this.cacheRankGlobal = null;
        //     }
        // }.bind(this));
        // this.model.setScore(score);
        // let historyScore = UserService.historyScore;
        // if (score > historyScore){
        //     UserService.historyScore = score;
        // }
        // UserService.playNormalCount += 1;
        // let hintStr = '';
        // if (UserService.playNormalCount >= 3){
        //     hintStr = ShareUtil.placeHolderText(ShareType.kLecard);
        // }
        // let opt = {currentScore:score,historyScore:historyScore,hintStr:hintStr};
        // this.modeCtrl.overAgainPage(opt);
        // if (window.WechatGame){
        //     this.queryIsNeed2ShowCongratulation();
        // }
    },

    //展示复活页面
    showRevival4Competition:function(){
        this.lastStage = 'showRevival4Competition';
        this.modeCtrl.showRevival4Competition();
        // this.queryIsNeed2ShowCongratulation();
    },
    //点击使用复活
    clickRevival4Competition:function(){
        this.modeCtrl.clickRevival4Competition();
        // const socket = JumpSocketService;
        // const ps = {championshipMode:'championshipJumper'};
        // socket.useRevivalCard(ps,function (err,result) {
        //     if (!err){
        //         console.log('使用复活卡成功');
        //         console.log(result);
        //         UserService.revivalCard = result.restRevivedCard;
        //         this.modeCtrl.clickRevival4Competition();
        //     }else{
        //         console.error('使用复活卡失败');
        //         console.error(err);
        //         setTimeout(function () {
        //             this.showRankToast('使用复活卡失败');
        //         }.bind(this),500)
        //         sender && sender.enable();
        //     }
        // }.bind(this));
    },
    //点击跳过
    clickStepOver4Competition:function(){
        //展示再接再厉页面
        this.showGameOver4Competition();
    },

    //再接再厉页面展示超过多少人
    showPassPeopleNum4GameOver4Competition:function(num){
        this.modeCtrl.showPassPeopleNum4GameOver4Competition(num);
    },
    //胜利页面展示超过多少人
    showPassPeopleNum4GameWin4Competition:function(num){
        this.modeCtrl.showPassPeopleNum4GameWin4Competition(num);
    },

    // 再接再厉页面
    showGameOver4Competition:function(){
        //游戏结束页
        this.modeCtrl.showGameOver4Competition();

        // const self = this;
        // this.lastStage = 'showGameOver4Competition';
        // console.log('得分:'+this.game.currentScore);
        // const score = this.game.currentScore;
        // const time = this.game.timeUse4Competition;
        // let ps = {championshipId:this.game.championshipId,score:score,time:time};
        // if (isFromAwardInfo){
        //     //从获奖信息页返回的
        //     ps.exceed = this.exceedPeople;
        // } else{
        //     //从游戏直接跳过来的
        //     const socket = JumpSocketService;
        //     socket.endGame4Compete(ps,function (err,data) {
        //         if(!err){
        //             console.log('比赛场 结束 成功');
        //             console.log(data);
        //             let exceed = data.exceed;//超越人数
        //             self.exceedPeople = data.exceed;
        //             self.showPassPeopleNum4GameOver4Competition(exceed);
        //         }else{
        //             console.error('比赛场 结束 失败');
        //             console.error(err);
        //         }
        //     });
        // }
        // this.model.setScore(score);
        // ps.targetScore = this.game.championshipInfo.targetScore || 2000;
        // ps.registerEndTime = this.game.championshipInfo.registerEndTime || 0;
        // ps.endTime = this.game.championshipInfo.championshipEndTime || 0;
        // ps.shareContent = ShareUtil.placeHolderText(ShareType.kHelp);
        // this.modeCtrl.showGameOver4Competition(ps);
        // this.clearZaijiezailiTimer();
        // this.zaijiezailiTimer = setInterval(function () {
        //     let nowTime = new Date().getTime();
        //     let registerEndTime = this.game.championshipInfo.registerEndTime;
        //     if (nowTime >= registerEndTime){
        //         //置灰再来一局button
        //         this.disableGameAgain4Competition();
        //         this.clearZaijiezailiTimer();
        //     }
        // }.bind(this),1000);
        // this.queryIsNeed2ShowCongratulation();
    },
    //置灰再来一局按钮
    disableGameAgain4Competition:function(){
        this.modeCtrl.disableGameAgain4Competition();
    },
    //再来一局
    clickGameAgain4Competition:function(){
        this.clickStartGame4Competition(null,this.game.championshipInfo,true);
    },
    //求助好友
    clickHelp4Competition:function(sender){
        sender && sender.disable();
        const type = ShareType.kHelp;
        //调分享
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            if (this.hasShare2GetRevival){
                setTimeout(function () {
                    this.showRankToast('您已获得复活卡');
                }.bind(this),500);
                sender && sender.enable();
            }else {
                // 复活卡+1 逻辑
                const socket = JumpSocketService;
                socket.sharedByType(type,function (err,result) {
                    if (!err){
                        console.log('复活卡+1 成功');
                        console.log(result);
                        // UserService.revivalCard += 1;
                        this.hasShare2GetRevival = true;
                        setTimeout(function () {
                            this.showRankToast(result.text || '成功获得复活卡x1');
                        }.bind(this),500);
                    } else {
                        setTimeout(function () {
                            this.showRankToast('分享成功');
                        }.bind(this),500);
                        console.error('复活卡+1 失败');
                        console.error(err);
                    }
                    sender && sender.enable();
                }.bind(this));
            }
        }.bind(this),function (res) {
            ///分享失败
            console.log(res);
            setTimeout(function () {
                this.showRankToast('分享失败');
            }.bind(this),500);
            sender && sender.enable();
        }.bind(this));
    },
    //展示 达到目标分数 页面
    showGameWin4Competition:function(){
        this.modeCtrl.showGameWin4Competition();

        // let self = this;
        // this.lastStage = 'showGameWin4Competition';
        // const score = this.game.currentScore;
        // const time = this.game.timeUse4Competition;
        // let ps = {championshipId:this.game.championshipId,score:score,time:time};
        // if (isFromAwardInfo){
        //     //从获奖信息页返回的
        //     ps.exceed = this.exceedPeople;
        // }else{
        //     const socket = JumpSocketService;
        //     socket.endGame4Compete(ps,function (err,data) {
        //         if(!err){
        //             console.log('比赛场 结束 成功');
        //             console.log(data);
        //             let exceed = data.exceed;//超越人数
        //             self.exceedPeople = data.exceed;
        //             self.showPassPeopleNum4GameWin4Competition(exceed);
        //         }else{
        //             console.error('比赛场 结束 失败');
        //             console.error(err);
        //             self.showRankToast('结束游戏失败('+err.code+')');
        //         }
        //     });
        // }
        // ps.targetScore = this.game.championshipInfo.targetScore || 2000;
        // ps.shareContent = ShareUtil.placeHolderText(ShareType.kXuanYao);
        // this.modeCtrl.showGameWin4Competition(ps);
        // this.queryIsNeed2ShowCongratulation();
    },
    //达到目标分数页面 —— 炫耀一下，有复活卡
    clickShareWin4Competition:function(sender){
        sender && sender.disable();
        const type = ShareType.kXuanYao;
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            if (this.hasShare2GetRevival){
                setTimeout(function () {
                    this.showRankToast('您已获得复活卡');
                }.bind(this),500);
                sender && sender.enable();
            }else {
                // 复活卡+1逻辑
                JumpSocketService.sharedByType(type,function (err,result) {
                    if (!err){
                        console.log('复活卡+1 成功');
                        console.log(result);
                        // UserService.revivalCard += 1;
                        this.hasShare2GetRevival = true;
                        setTimeout(function () {
                            this.showRankToast(result.text || '成功获得复活卡x1');
                        }.bind(this),500);
                    } else {
                        setTimeout(function () {
                            this.showRankToast('分享成功');
                        }.bind(this),500);
                        console.error('复活卡+1 失败');
                        console.error(err);
                    }
                    sender && sender.enable();
                }.bind(this));
            }
        }.bind(this),function (res) {
            ///分享失败
            console.log(res);
            setTimeout(function () {
                this.showRankToast('分享失败');
            }.bind(this),500);
            sender && sender.enable();
        }.bind(this));
    },

    //下次再战页面
    showNextFight4Competition:function(){
        this.lastStage = 'showNextFight4Competition';
        this.modeCtrl.showNextFight4Competition();
        // this.queryIsNeed2ShowCongratulation();
    },
    //点击下次再战
    clickNextFight4Competition:function(){
        this.showGameOver4Competition();
    },

    //查询是否需要展示恭喜获奖页面
    // exceedInfo 是比赛场结束页传进来的，其他页面不用传参
    queryIsNeed2ShowCongratulation:function(exceedInfo){
        if (UserService.haveAwardInfo){
            this.showCongratulation(exceedInfo);
        }
    },

    //展示恭喜获奖
    showCongratulation:function(exceedInfo){
        if (this.game.stage == 'game'){
            return;
        }
        console.log('获取 恭喜获奖 信息');
        const socket = JumpSocketService;
        let ps = {championshipMode:'championshipJumper'};
        socket.awardInfo4Compete(ps,function (err,result) {
            if (!err){
                console.log('获取 恭喜获奖 信息成功');
                console.log(result);
                UserService.haveAwardInfo = 0;
                UserService.redPocket = result.redPocket;
                let awardList = result.awardList || [];
                console.log('awardList');
                console.log(awardList);
                let opt = {ranking:-1,itemCount:0,isLastChampionship:1};//在awardList找红包信息，type=1，itemId=2
                opt.isLastChampionship = result.isLastChampionship;
                for (let i=0;i<awardList.length;++i){
                    if (awardList[i].type==1 && awardList[i].itemId==2){
                        opt.ranking = awardList[i].ranking;
                        opt.itemCount = awardList[i].itemCount;
                        this.cachePrizeRankLast = null;//上期排行榜缓存置空
                        this.cachePrizeRankMoney = null;//奖金榜缓存置空
                        this.awardInfo = opt;
                        this.clearZaijiezailiTimer();
                        this.clearLuckyAppearRemainTimer();
                        this.clearLuckyAppearTimer();
                        this.clearSessionReMainTimer();
                        this.clearTimeClear();
                        //关闭提现按钮更新的监听
                        this.offUpdateTixianBtn();
                        // 如果从结束页进来的，需要保存一下超越人数
                        opt.exceedInfo = exceedInfo;
                        setTimeout(function () {
                            this.modeCtrl.showCongratulation(opt);
                        }.bind(this),500);
                        break;
                    }
                }
            }else{
                console.log('获取 恭喜获奖 信息失败');
                console.error(err);
            }
        }.bind(this));
    },
    //关闭恭喜获奖
    clickCongratulationClose:function(){
        switch (this.lastStage){
        case 'start':
            this.backStartPage();
            break;
        case 'showPickPage':
            this.showPickPage();
            break;
        case 'showTiXian':
            this.showTiXian();
            break;
        case 'showMoreGame':
            this.showMoreGame();
            break;
        case 'clickSkin':
            this.clickSkin();
            break;
        case 'showOverAgain':
            this.showOverAgain();
            break;
        case 'rankInner':
            this.rankInner();
            break;
        case 'rankGlobal':
            this.rankGlobal();
            break;
        case 'rankLeCard':
            this.rankLeCard();
            break;
        case 'showRevival4Competition':
            this.showRevival4Competition();
            break;
        case 'showGameOver4Competition':
            this.showGameOver4Competition(true);
            break;
        case 'showGameWin4Competition':
            this.showGameWin4Competition(true);
            break;
        case 'showNextFight4Competition':
            this.showNextFight4Competition();
            break;
        case 'showPrizeRecord':
            this.showPrizeRecord();
            break;
        case 'showPrizeRankLast':
            this.showPrizeRankLast();
            break;
        case 'showPrizeRankMoney':
            this.showPrizeRankMoney();
            break;
        case 'showSessionInfo':
            this.showSessionInfo();
            break;
        default:
            this.backStartPage();
        }
    },

    //恭喜获奖 —— 炫耀
    clickCongratulationShare:function(sender){
        sender && sender.disable();
        const self = this;
        ShareUtil.shareAppMessage(ShareType.kXuanYao,function () {
            ///分享成功
            setTimeout(function () {
                self.showRankToast('分享成功');
            },500);
            sender && sender.enable();
        },function (res) {
            ///分享失败
            console.log(res);
            setTimeout(function () {
                self.showRankToast('分享失败');
            },500);
            sender && sender.enable();
        });
    },
    //恭喜获奖 —— 查看详情
    clickCongratulationDetail:function(result){

        this.modeCtrl.clickCongratulationDetail(result);

        // sender && sender.disable();
        // const socket = JumpSocketService;
        // let that = this;
        // let ps = {
        //     game:'jumper',
        //     sortBy:'championshipJumperScore',// 'RedPocket' 'LeCard'
        //     top:100
        // };
        // socket.prizeRankLast(ps,function (err,result) {
        //     if(!err){
        //         console.log('result----');
        //         console.log(result);
        //         const rankList = result.rankList;
        //         if (rankList){
        //             const sortedResult = rankList.sort(function (v1,v2) {
        //                 return (v1.rank - v2.rank);
        //             });
        //             result.rankList = sortedResult;
        //         }
        //         that.modeCtrl.clickCongratulationDetail(result);
        //     }else {
        //         console.log('err----'+JSON.stringify(err));
        //         that.showRankToast('网络数据请求错误('+err.code+')',function () {
        //             sender && sender.enable();
        //         });
        //     }
        // });
    },
    //关闭 查看详情
    clickCongratulationDetailBack:function(){
        this.modeCtrl.showCongratulation(this.awardInfo);
    },

    showFriendRank: function () {
        this.modeCtrl.showFriendRank();
    },

    //全球榜
    rankGlobal:function (sender) {
        sender && sender.disable();
        this.modeCtrl.rankGlobal(sender);
        // const rightTime =  Date.now();
        // if (!window.WechatGame){
        //     Utils.showLoading({mask:true});
        // }
        // /// TODO 伪实时刷新？？？？
        // if(this.cacheRankGlobal && (rightTime < this.cacheRankGlobal.dataTime)){
        //     this.lastStage = 'rankGlobal';
        //     this.modeCtrl.rankGlobal(this.cacheRankGlobal.dataGlobal);
        //     if (window.WechatGame){
        //         this.queryIsNeed2ShowCongratulation();
        //         //关闭提现按钮更新的监听
        //         this.offUpdateTixianBtn();
        //     }else {
        //         Utils.hideLoading();
        //     }
        // }else{
        //     console.log('rankGlobal_request');
        //     const that = this;
        //     let ps = {
        //         game:'jumper',
        //         sortBy:'score',
        //         top:100
        //     };
        //     JumpSocketService.prizeRank(ps,function (err,result) {
        //         if (!window.WechatGame){
        //             Utils.hideLoading();
        //         }
        //         if(!err){
        //             const rankList = result.rankList;
        //             if (rankList){
        //                 const sortedResult = rankList.sort(function (v1,v2) {
        //                     return (v1.rank - v2.rank);
        //                 });
        //                 result.rankList = sortedResult;
        //             }
        //             //排行榜中，头像和昵称与登录接口中的保持一致
        //             if(result.myRank && result.myRank.toString() !== '-1'){
        //                 for(let i = 0;i < result.rankList.length ;i++){
        //                     if(result.myRank == result.rankList[i].rank){
        //                         result.rankList[i].nickname = UserService.nickName;
        //                         result.rankList[i].avatarUrl = UserService.avatarUrl;
        //                         break;
        //                     }
        //                 }
        //             }
        //             that.lastStage = 'rankGlobal';
        //             result.myCurrentScore = that.game.currentScore;
        //             that.modeCtrl.rankGlobal(result);
        //             that.cacheRankGlobal = {
        //                 dataGlobal:result,
        //                 dataTime:result.nextRankTime,
        //             }
        //             if (window.WechatGame){
        //                 that.queryIsNeed2ShowCongratulation();
        //                 //关闭提现按钮更新的监听
        //                 that.offUpdateTixianBtn();
        //             }
        //         }else {
        //             if (window.WechatGame){
        //                 that.showRankToast('网络异常，请重试');
        //             }else{
        //                 // let result = {rankList:[],myValue:-1,myRank:-1,myCurrentScore:that.game.currentScore,errMsg:'请求数据出错'+JSON.stringify(err)};
        //                 // that.modeCtrl.rankGlobal(result);
        //                 that.showRankToast('请求出错，请稍后重试');
        //             }
        //             sender && sender.enable();
        //         }
        //     });
        // }
    },

    rankInner:function () {
        //好友榜
        this.lastStage = 'rankInner';
        this.modeCtrl.rankInner();
    },

    // 结算页：点击排行
    clickRank: function () {
        this.modeCtrl.clickRank();
    },

    ///处理天天红包页面点击 立即分享
    clickRedPacketsShare: function(){

        const self = this;
        const type = ShareType.kRedPack;
        ShareUtil.shareAppMessage(type,function () {
            JumpSocketService.sharedByType(type,function (err,result) {
                if (result){
                    setTimeout(function () {
                        self.showPickPage();
                        self.showRankToast(result.text || '获得一次免费抽奖机会');
                    },500);

                }else{
                    setTimeout(function () {
                        self.showRankToast('分享成功');
                    },500);
                }
            });
            // if (tickets){
            //
            // }else {
            //     setTimeout(function () {
            //         self.showRankToast('分享到群才能获得~');
            //     },500);
            // }
        },function (res) {
            console.error(JSON.stringify(res));
            setTimeout(function () {
                self.showRankToast('分享失败');
            },500);
        });
    },

    //获奖记录
    showPrizeRecord: function (sender) {
        sender && sender.disable();
        this.modeCtrl.showPrizeRecord(sender);
        // this.clearSessionReMainTimer();
        // const that = this;
        // let ps = {
        //     championshipMode:'championshipJumper'
        // };
        // this.prizeRecord = JumpSocketService.prizeRecord(ps,function (err,result) {
        //     if(!err){
        //         that.lastStage = 'showPrizeRecord';
        //         that.modeCtrl.showPrizeRecord(result);
        //         that.queryIsNeed2ShowCongratulation();
        //     }else{
        //         that.showRankToast('网络数据请求错误('+err.code+')',function () {
        //             sender && sender.enable();
        //         });
        //     }
        // });
    },

    //预告页 —— 复活卡 点击分享
    clickRevivalCardShare:function(sender){
        sender && sender.disable();
        const type = ShareType.kRevivalCard;
        //调分享
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            // 复活卡+1 逻辑
            console.log('分享成功');
            const socket = JumpSocketService;
            socket.sharedByType(type,function (err,result) {
                if (!err){
                    console.log('复活卡+1 成功');
                    console.log(result);
                    //更新预告页
                    this.modeCtrl.updateRevivalCardNum();
                } else {
                    console.error('复活卡+1 失败');
                    console.error(err);
                }
                sender && sender.enable();
            }.bind(this));
        }.bind(this),function (res) {
            ///分享失败
            console.log('分享失败');
            console.log(res);
            sender && sender.enable();
        }.bind(this));
    },
    //获奖榜单，上期排行榜
    showPrizeRankLast: function (sender) {
        sender && sender.disable();
        this.modeCtrl.showPrizeRankLast(sender);
        // this.clearSessionReMainTimer();
        // if(this.cachePrizeRankLast && (Date.now() < this.cachePrizeRankLast.dataTime)){
        //     this.modeCtrl.showPrizeRankLast(this.cachePrizeRankLast.data);
        //     this.lastStage = 'showPrizeRankLast';
        //     this.queryIsNeed2ShowCongratulation();
        // }else{
        //     const that = this;
        //     let ps = {
        //         game:'jumper',
        //         sortBy:'championshipJumperScore',// 'RedPocket' 'LeCard'
        //         top:100
        //     };
        //     this.prizeRankLastSocket = JumpSocketService.prizeRankLast(ps,function (err,result) {
        //         if(!err){
        //             const rankList = result.rankList;
        //             if (rankList){
        //                 const sortedResult = rankList.sort(function (v1,v2) {
        //                     return (v1.rank - v2.rank);
        //                 });
        //                 result.rankList = sortedResult;
        //             }
        //             that.cachePrizeRankLast = {
        //                 data:result,
        //                 dataTime:result.endTime
        //             }
        //             that.lastStage = 'showPrizeRankLast';
        //             that.modeCtrl.showPrizeRankLast(result);
        //             that.queryIsNeed2ShowCongratulation();
        //         }else {
        //             that.showRankToast('网络异常，请重试');
        //             sender && sender.enable();
        //         }
        //     });
        // }
    },

    //获奖榜单，奖金榜
    showPrizeRankMoney: function (sender) {
        sender && sender.disable();
        this.modeCtrl.showPrizeRankMoney(sender);
        // if(this.cachePrizeRankMoney && (Date.now() < this.cachePrizeRankMoney.dataTime)){
        //     this.modeCtrl.showPrizeRankMoney(this.cachePrizeRankMoney.data);
        //     this.lastStage = 'showPrizeRankMoney';
        //     this.queryIsNeed2ShowCongratulation();
        // }else{
        //     const that = this;
        //     let ps = {
        //         game:'jumper',
        //         sortBy:'championshipJumperBonus',// 'RedPocket' 'LeCard'
        //         top:10
        //     };
        // JumpSocketService.prizeRank(ps,function (err,result) {
        //         if(!err){
        //             const rankList = result.rankList;
        //             if (rankList){
        //                 const sortedResult = rankList.sort(function (v1,v2) {
        //                     return (v1.rank - v2.rank);
        //                 });
        //                 result.rankList = sortedResult;
        //             }
        //             that.modeCtrl.showPrizeRankMoney(result);
        //
        //             that.cachePrizeRankMoney = {
        //                 data:result,
        //                 dataTime:result.nextRankTime
        //             }
        //             that.lastStage = 'showPrizeRankMoney';
        //             that.queryIsNeed2ShowCongratulation();
        //         }else {
        //             that.showRankToast('网络异常，请重试');
        //             sender && sender.enable();
        //         }
        //     });
        // }
    },
    //场次预告
    showSessionInfo: function (sender){

        console.log('sender',sender);
        sender && sender.disable();
        this.modeCtrl.showSessionInfo(sender);
    //     this.hasShare2GetRevival = false;
    //     if(this.prizeRecord){
    //         this.prizeRecord.cancel();
    //         this.prizeRecord = undefined;
    //     }
    //     if(this.prizeRankLastSocket){
    //         this.prizeRankLastSocket.cancel();
    //         this.prizeRankLastSocket = undefined;
    //     }
    //
    //     this.clearSessionReMainTimer();
    //     const that = this;
    //     let ps = {
    //         displayCount:4,//需要展示的场次个数
    //         championshipMode :'championshipJumper'
    //     };
    //     JumpSocketService.sessionInfo(ps,function (err,result) {
    //         //关闭提现按钮更新的监听
    //         that.offUpdateTixianBtn();
    //         that.clearZaijiezailiTimer();
    //         if(!err){
    //             UserService.revivalCard = result.restRevivedCard;
    //
    //             console.log('result--'+JSON.stringify(result));
    //             let timeDiffer = Date.now() - result.currentTime;
    //             if(!result.championshipList || result.championshipList.length == 0){
    //                 //返回数据没有此字段,或长度为零
    //                 that.lastStage = 'showSessionInfo';
    //                 that.modeCtrl.showSessionInfo({info:result});
    //             }else{
    //                 let showPage,inBanTime;//所在情况、是否在禁止分钟内
    //                 const championList = result.championshipList;//场次列表
    //                 //---查看开始和结束时间
    //                 let start = new Array();
    //                 let regisstart = new Array();
    //                 for(let i = 0;i<championList.length;i++){
    //                     const startTime = championList[i].championshipStartTime;
    //                     const endTime = championList[i].championshipEndTime;
    //                     const regisStartTime = championList[i].registerStartTime;
    //                     const regisEndTime = championList[i].registerEndTime;
    //                     start[i] = {start:that.formatDateTime(startTime),end:that.formatDateTime(endTime)};
    //                     console.log(JSON.stringify(start[i])+i);
    //                     regisstart[i] = {regisstart:that.formatDateTime(regisStartTime),regisEnd:that.formatDateTime(regisEndTime)};
    //                     console.log(JSON.stringify(regisstart[i])+i);
    //                 }
    //                 //-----结束
    //                 const currentSession = championList[0];//当前、最近场次
    //
    //                 // ---------测试时间区间-----------
    //                 // var testStartDate = new Date('2018-06-26 9:10:00');
    //                 // var testRegisterEndDate = new Date('2018-06-26 14:05:10');
    //                 // var testEndDate = new Date('2018-06-26 14:10:10');
    //                 // var testStartTime = Date.parse(testStartDate);
    //                 // var testRegisterTime = Date.parse(testRegisterEndDate);
    //                 // var testEndTime = Date.parse(testEndDate);
    //                 // currentSession.championshipStartTime = testStartTime;
    //                 // currentSession.registerEndTime = testRegisterTime;
    //                 // currentSession.championshipEndTime = testEndTime;
    //                 // ------------
    //
    //                 let registerEndTime = currentSession.registerEndTime;//最近场次注册结束时间
    //                 let sessionStartTime = currentSession.championshipStartTime;//最近场次开始时间
    //                 let sessionEndTime = currentSession.championshipEndTime;//最近场次游戏结束时间
    //                 let currentTime = Date.now() - timeDiffer;
    //
    //                 let optSessionTime,sessionTime;//optSessionTime时间差，换算小时用、sessionTime基准时间，传给界面倒计时进行计算
    //                 let banTime = sessionEndTime - registerEndTime;
    //                 inBanTime = 'no';
    //                 if(currentTime < sessionStartTime){
    //                     //即将开始，立即预约/已预约
    //                     showPage = 'jijiangkaishi';
    //                     optSessionTime = sessionStartTime - currentTime;
    //                     sessionTime = sessionStartTime;
    //                     inBanTime = 'no';
    //                     console.log('showSessionInfo-开始前预约');
    //                 }else if(currentTime <= sessionEndTime){
    //                     //时间在场次时间内
    //                     console.log('showSessionInfo-在场次时间内');
    //                     // let remainTime = sessionEndTime - currentTime;//距离游戏结束的时间
    //
    //                     if(currentSession.isFinished == 0){
    //                         if(currentTime < registerEndTime){
    //                             //未获奖，大于5分钟
    //                             showPage = 'jinxingzhong';
    //                             inBanTime = 'no';
    //                         }else{
    //                             //未获奖，小于5分钟
    //                             showPage = 'jinxingzhong';
    //                             inBanTime = 'yes';
    //                         }
    //                     }else{
    //                         if(currentTime < registerEndTime){
    //                             //已获奖，大于5分钟
    //                             showPage = 'yihuojiang';
    //                             inBanTime = 'no';
    //                         }else{
    //                             //已获奖，小于5分钟
    //                             showPage = 'yihuojiang';
    //                             inBanTime = 'yes';
    //                         }
    //                     }
    //                     optSessionTime = sessionEndTime - currentTime;
    //                     sessionTime = sessionEndTime;
    //                 }else{
    //                     //todo 场次信息配错怎么展示
    //                     that.showRankToast('场次信息出错，请重新请求');
    //                     console.log('场次信息出错，请重新请求');
    //                 }
    //                 //页面倒计时，画的时候展示一次
    //                   let hour,minute,second,time;
    //                 hour = parseInt(optSessionTime/3600000);
    //                 if(hour < 10){
    //                     hour = '0' + hour;
    //                 }
    //                 minute = parseInt(optSessionTime % 3600000 / 60000);
    //                 if(minute < 10){
    //                     minute = '0' + minute;
    //                 }
    //                 second = parseInt(optSessionTime % 3600000 % 60000 /1000);
    //                 if(second < 10){
    //                     second = '0' + second;
    //                 }
    //                 if(hour >= 1){ //区分1小时展示情况
    //                     time = hour + ':' + minute;
    //                 }else{
    //                     time = minute + ':' + second;
    //                 }
    //
    //                 if (showPage == 'jinxingzhong') {
    //                     time = '比赛进行中...';
    //                 }
    //
    //                 let banTimeTitle = '比赛结束前'+ parseInt(banTime/60000)+'分钟禁止进入游戏';
    //                 console.log('比赛结束前'+ parseInt(banTime/60000)+'分钟禁止进入游戏');
    //
    //                 let opt ={ //需传到前端进行展示的界面参数
    //                     info:result,
    //                     showPage:showPage,
    //                     inBanTime:inBanTime,
    //                     banTimeTitle:banTimeTitle,
    //                     time:time,
    //                     timeDiffer:timeDiffer
    //                 }
    //                 that.lastStage = 'showSessionInfo';
    //                 that.showSessionTime({sessionTime:sessionTime,showPage:showPage,result:result,banTime:banTime,timeDiffer:timeDiffer,inBanTime:inBanTime,});
    //                 that.modeCtrl.showSessionInfo(opt);
    //                 that.queryIsNeed2ShowCongratulation();
    //             }
    //         }else {
    //             sender && sender.enable();
    //             that.showRankToast('网络异常，请重试');
    //             let opt ={ //需传到前端进行展示的界面参数
    //                 netBreakUp:'yes'
    //             }
    //             that.modeCtrl.showSessionInfo(opt);
    //         }
    //     });
    },

    showSessionTime:function(opt){
        console.log('gameCtrl 场次预告页倒计时');
        const that = this;
        let sessionTime = opt.sessionTime;//基准比较时间
        let curr,differTime,hour,minute,second;
        let freshMark = true; //5分钟时，刷新一次的标记

        let registerEndTime = opt.result.championshipList[0].registerEndTime;

        this.clearSessionReMainTimer();
        this.sessionReMainTimer = setInterval(function () {
            curr = Date.now() - opt.timeDiffer;

            differTime = sessionTime - curr;
            let banTemp = opt.banTime > 0 ? opt.banTime : 0;
            let bantimeMinute = parseInt(banTemp / 60000).toString();
            // let bantimeSecond = parseInt(banTemp % 60000 / 1000).toString();

            hour = parseInt(differTime/3600000);
            minute = parseInt(differTime % 3600000 / 60000);
            second = parseInt(differTime % 3600000 % 60000 /1000);
            minute =  minute < 0 ? 0 : minute;
            second =  second < 0 ? 0 : second;
            if(hour < 10){
                hour = '0' + hour;
            }
            if(minute < 10){
                minute = '0' + minute;
            }
            if(second < 10){
                second = '0' + second;
            }

            let changeTime;
            if(hour >= 1){ //区分1小时展示情况
                changeTime = hour + ':' + minute;
            }else{
                changeTime = minute + ':' + second;
            }

            if(opt.showPage == 'jijiangkaishi'){
                console.log('即将开始界面画倒计时');
                that.modeCtrl.sessionReMainTime({optSessionTime:changeTime,showPage:opt.showPage,reservationNum:opt.result.reservationCount,playNum:opt.result.playerCount});
            }

            if(curr >= sessionTime){
                console.log('00:00,重新调取接口，注意是否有准确返回的场次数据');
                that.showSessionInfo();
            }else{
                let banTimeTitle = '比赛结束前'+ parseInt(bantimeMinute)+'分钟禁止进入游戏';
                if(((curr >= registerEndTime) && freshMark && opt.inBanTime == 'no') || opt.banTime <= 0){
                    //到置灰时间内
                    console.log('到置灰时间内');
                    switch (opt.showPage){
                    case 'jinxingzhong':
                        that.modeCtrl.showSessionInfo({
                            info:opt.result,
                            showPage:'jinxingzhong',
                            inBanTime:'yes',
                            banTimeTitle:banTimeTitle,
                            time:'比赛进行中...',
                        });
                        console.log('到禁止时间，立即参赛界面');
                        break;
                    case 'yihuojiang':
                        that.modeCtrl.showSessionInfo({
                            info:opt.result,
                            showPage:'yihuojiang',
                            inBanTime:'yes',
                            banTimeTitle:banTimeTitle,
                            time:'比赛进行中...',
                        });
                        console.log('到禁止时间，已获奖');
                        break;
                    default:
                        console.log('到禁止时间，其他情况，这时注意是不是正常的预约界面');
                        break;
                    }
                    freshMark = false;
                }
            }
        },1000);
    },
    //场次预约
    championReservation: function (sender,btnInfo){
        sender && sender.disable();
        const sessionId = btnInfo.sessionId;
        const that = this;
        let ps = {
            championshipId:sessionId
        };
        JumpSocketService.sessionReservation(ps,function (err,result) {
            if(!err){
                that.modeCtrl.alreadyBookBtn(btnInfo);
                console.log(result);
            }else {
                sender && sender.enable();
            }
        });
    },

    formatDateTime:function (inputTime) {
        let date = new Date(inputTime);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        let timeObject = {
            year:y,
            month:m,
            day:d,
            hour:h,
            minute:minute,
            second:second
        };
        // return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
        console.log('timeSee---'+(y + '-' + m + '-' + d+' '+h+':'+minute+':'+second));
        return timeObject;
    },


    // 好友排行：返回上一页
    friendRankReturn: function () {
        this.modeCtrl.friendRankReturn();
    },

    netWorkLogin: function () {

    },

    // 好友排行页面：群分享
    shareGroupRank: function () {
        this.modeCtrl.shareGroupRank();
    },

    // afterShareGroupRank: function (success, isGroup) {
    //     console.log(success, isGroup);
    //     //this.reporter.shareGroupReport(isGroup);
    // },

    // 结算页面：
    shareBattleCard: function () {
        this.modeCtrl.shareBattleCard();
    },

    // afterShareBattle: function (success, isGroup) {
    //     console.log(success, isGroup)
    //     if (success) {
    //         // this.reporter.sharePKReport(isGroup);
    //     }
    // },

    groupPlayGame: function () {
        this.modeCtrl.groupPlayGame();
    },

    // 获取PK的信息之后触发事件
    // showPkPage: function (ownerScore) {
    //     console.log('showPkPage', ownerScore)
    //     // this.reporter.playPKScore(ownerScore);
    // },

    // 挑战页面：点击挑战
    onBattlePlay: function (pk) {
        this.modeCtrl.battlePlay(pk);
    },

    battleToSingle: function () {
        // this.reporter.resetPKReport();
    },

    shareObservCard: function () {
        this.modeCtrl.shareObservCard();
    },

    socketJoinSuccess: function (success) {
        this.modeCtrl.socketJoinSuccess(success);
        if (this.model.mode == 'observe') {
            if (success) {
                this.game.socketFirstSync = true;
                // this.reporter.joinAudienceReportStart();
            }
        } else {
            // this.reporter.joinAudienceReport();
        }

        if (this.model.mode == 'player') {
            // this.reporter.playAudienceReportStart();
        }
    },

    // afterShareObserveCard: function (isGroup) {
    //     // this.reporter.shareAudienceReport(isGroup);
    // },

    showPlayerGG: function (data) {
        this.modeCtrl.showPlayerGG(data);
    },

    showPlayerWaiting: function () {
        this.modeCtrl.showPlayerWaiting();
    },

    onPlayerOut: function () {
        this.modeCtrl.onPlayerOut();
    },

    onViewerStart: function () {
        console.log('GameCtrl  onViewerStart, set pendingReset false');
        if(window.WechatGame){
            this.game.audioManager.scale_intro.stop();
        }else{
            this.game.audioManager.scale_intro.pause();
        }
        if (this.game.deadTimeout) {
            clearTimeout(this.game.deadTimeout);
            this.game.deadTimeout = null;
        }
        this.game.pendingReset = false;
        // TweenAnimation.killAll();
        this.modeCtrl.onViewerStart();
        //this.reporter.joinAudienceReport();
    },

    wxOnShow: function (options) {
        this._fastSignIn(options);
        let nowTime = new Date().getTime();
        //如果回到小游戏，距离上次离开超过3分钟，就回到首页
        if (nowTime-UserService.lastHideTime > 3*60*1000 && this.game.stage!='startPage'){
            if (window.WechatGame){
                // 需要延迟处理
                setTimeout(function () {
                    this.backStartPage();
                }.bind(this),500);
            }
        }
    },

    wxOnhide: function () {
        SignService.disconnect();
        this.modeCtrl.wxOnhide();
        //记录退后台时间
        UserService.lastHideTime = new Date().getTime();
    },

    onNetworkStatusChanged:function(connected){
        if (!connected){
            this.isShowingModal = true;
            Utils.showModal({
                title: '提示',
                content: '网络不给力哦',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        this.isShowingModal = false;
                        Application.goback();
                    }
                }.bind(this)
            });
        }
    },

    onReplayGame: function () {
    },

    _cx: function (x) {
        // change x
        // x 为 在 414*736 屏幕下的，标准像素的 x ，即为设计图的x的px值
        // realx 表示在当前屏幕下，应该得到的x值，这里所有屏幕画布将按照x轴缩放
        let realx = x * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realx = x * H / 736 + (W - H * 414 / 736) / 2;
        }
        return realx * Dpr;
    },

    _cxx:function(x){
        //按照实际尺寸，换算成414*736
        let cxX =( x / Dpr)* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    },

    //大理寺活动-初始化
    initActivity: function () {
        JumpSocketService.initActivity({gameMode: 'jumper'}, function (err, result) {
            if (!err && result) {
                console.log('initActivity success');
                this.activityId = result.activityId || 1;
                this.demandValue = result.demandValue || 500;
                this.myValue = result.myValue || 0;
                this.didGetVip = false;
                this.isAlreadyGetVip = false;
                if (result.status == 0) {  //用户首次进入
                    this.showLetterPage();
                } else if (result.status == 1) {  //用户领取过vip
                    this.didGetVip = true;
                    this.isAlreadyGetVip = true;
                } else if (result.status == 2) {  //用户接受了活动
                    //todo
                }
                //展示大理寺活动运营位
                this.showActivityBanner();
            } else {
                console.log('initActivity fail:' + JSON.stringify(err));
            }
        }.bind(this));
    },

    //展示“来自茹小岚的一封信”
    showLetterPage: function () {
        this.game.full2D.showLetterPage(function () {
            JumpSocketService.acceptActivity({activityId: this.activityId}, function (err, result) {
                if (!err) {
                    console.log('acceptActivity success');
                    console.log(result);

                } else {
                    console.log('acceptActivity fail:' + JSON.stringify(err));
                }
            }.bind(this));
        }.bind(this));
    },

    //展示大理寺活动运营位
    showActivityBanner: function () {
        this.game.full2D.showActivityBanner(this.demandValue, this.myValue, this.didGetVip);
    },

    //更新五彩石数量
    updateDemandCount: function (count) {
        this.myValue = count;
        this.showActivityBanner();
    },

    //大理寺活动分享
    activityShare: function () {

        Utils.showLoading({mask: true});

        Application.ccReport({
            id:1001,
            memo:{'from':'H5'}
        });//分享上报

        ShareUtil.shareActivity(1, function (result) {
            if (result.hideLoading){
                Utils.hideLoading();
            }

            if (result.code == 0){
                this.showRankToast('分享成功');

                Application.ccReport({
                    id:1002,
                    memo:{'from':'H5'}
                });//分享成功上报

                JumpSocketService.shareByTypeActivity(function (err, count) {
                    if (!err) {
                        console.log('shareByTypeActivity success 获得五彩石:' + count);
                        this.myValue += count;
                        this.showActivityBanner();
                        this.game.full2D.stopVipDialogAnimate();
                        this.game.full2D.activityButtonClicked();
                        UserService.totalColorStone += count;
                        UserService.restColorStone -= count;
                    } else {
                        console.log('shareByTypeActivity fail:' + JSON.stringify(err));
                    }
                }.bind(this));
            }else if (result.code==1){
                this.showRankToast('分享失败');
            } else if (result.code==2){
                this.showRankToast('分享取消');
            }else if (result.code==3){
                this.showRankToast('复制成功');
            }else if (result.code==4){
                this.showRankToast('复制失败');
            }
        }.bind(this));
        // setTimeout(function () {
        //     JumpSocketService.shareByTypeActivity(function (err, count) {
        //         if (!err) {
        //             console.log('shareByTypeActivity success 获得五彩石:' + count);
        //             this.myValue += count;
        //             this.showActivityBanner();
        //             this.game.full2D.stopVipDialogAnimate();
        //             this.game.full2D.activityButtonClicked();
        //             UserService.totalColorStone += count;
        //             UserService.restColorStone -= count;
        //         } else {
        //             console.log('shareByTypeActivity fail:' + JSON.stringify(err));
        //         }
        //     }.bind(this));
        // }.bind(this), 3000);
    },

    //大理寺活动，炫耀一下
    vipShowOff:function(){
        Utils.showLoading({mask: true});

        Application.ccReport({
            id:1001,
            memo:{'from':'H5'}
        });

        ShareUtil.shareActivity(2, function (result) {
            if (result.hideLoading){
                Utils.hideLoading();
            }
            if (result.code == 0){

                Application.ccReport({
                    id:1002,
                    memo:{'from':'H5'}
                });//炫耀分享成功
                this.showRankToast('分享成功');
            }else if (result.code==1){
                this.showRankToast('分享失败');
            } else if (result.code==2){
                this.showRankToast('分享取消');
            }else if (result.code==3){
                this.showRankToast('复制成功');
            }else if (result.code==4){
                this.showRankToast('复制失败');
            }
        }.bind(this));
    },

    //获取vip
    getVipCode:function (callback) {
        JumpSocketService.acquireActivityAward({activityId: this.activityId}, function (err, result) {
            if (!err && result) {
                console.log('acquireActivityAward success');

                if(!this.isAlreadyGetVip){
                    this.isAlreadyGetVip = true;
                    Application.ccReport({
                        id:1004,
                        memo:{'from':'H5'}
                    });
                }

                if (!this.didGetVip) {
                    this.myValue -= this.demandValue;
                    this.didGetVip = true;
                    this.showActivityBanner();
                }
                callback && callback(result.redeemCode);
            } else {
                console.log('acquireActivityAward fail:' + JSON.stringify(err));
                switch (err.code){
                case SIGNAL.REMIND_LOGIN_SOHU: case SIGNAL.REMIND_LOGIN_OTHER: case SIGNAL.REMIND_LOGIN_PHONE:
                    break;
                default:
                    if (err.msg == 'IDS_Common_NotEnoughThisProp') {
                        Utils.showToast({title:'结束本局游戏后才能领取哦', icon:'none'});
                    } else {
                        Utils.showToast({title:'领取失败，请稍后重试', icon:'none'});
                    }
                    break;
                }
            }
        }.bind(this));
    },
};

export default GameCtrl;
