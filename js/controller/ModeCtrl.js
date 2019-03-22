'use strict';

import singleCtrl from './singleCtrl.js';
import GroupShareCtrl from './GroupShareCtrl.js';
import BattleCtrl from './BattleCtrl.js';
import ObserveCtrl from './ObserveCtrl.js';
import playerCtrl from './playerCtrl.js';


var ModeCtrl = function () {
    function ModeCtrl(game) {

        this.game = game;
        this.singleCtrl =
            new singleCtrl(game, this);
        this.groupShareCtrl =
            new GroupShareCtrl(game, this);
        this.battleCtrl =
            new BattleCtrl(game, this);
        this.observeCtrl =
            new ObserveCtrl(game, this);
        this.playerCtrl =
            new playerCtrl(game, this);

        this.model = game.gameModel;
        this.gameCtrl = game.gameCtrl;
        this.currentCtrl = null;
    }

    return ModeCtrl;
}();

ModeCtrl.prototype = {
    initFirstPage: function (options) {
        let mode = this.model.getMode();
        console.log('ModeCtrl initFirstPage mode = ' + mode);
        switch (mode) {
        case 'single':
            this.currentCtrl = this.singleCtrl;
            this.singleCtrl.init(options);
            this.gameCtrl.netWorkLogin();
            break;
        case 'groupShare':
            this.currentCtrl = this.groupShareCtrl;
            this.groupShareCtrl.init(options);
            break;
        case 'battle':
            this.currentCtrl = this.battleCtrl;
            this.battleCtrl.init(options);
            break;
        case 'observe':
            this.currentCtrl = this.observeCtrl;
            this.observeCtrl.init(options);
            break;

        default:
            this.currentCtrl = this.singleCtrl;
            this.model.setMode('single');
            this.singleCtrl.init(options);
            this.gameCtrl.netWorkLogin();
            // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            // console.log('InitFirstPage 找不到对应mode')
            // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            break;
        }
    },
    reInitFirstPage: function (options) {
        if (this.currentCtrl) {
            this.currentCtrl.destroy();
            this.currentCtrl = null;
        }
        this.gameCtrl.queryCtrl.identifyMode(options);
        this.initFirstPage(options);
    },
    clickStart: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.clickStart) {
                this.currentCtrl.clickStart();
            }
        }
    },
    clickStartGame4Competition:function(){
        if (this.currentCtrl) {
            if (this.currentCtrl.clickStartGame4Competition) {
                this.currentCtrl.clickStartGame4Competition();
            }
        }
    },

    backStartPage: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.backStartPage) {
                this.currentCtrl.backStartPage();
            }
        }
    },
    updateRealBtn:function(){
        if (this.currentCtrl) {
            if (this.currentCtrl.updateRealBtn) {
                this.currentCtrl.updateRealBtn();
            }
        }
    },

    showPickPage:function(result){
        //天天抽红包
        if (this.currentCtrl) {
            if (this.currentCtrl.showPickPage) {
                this.currentCtrl.showPickPage(result);
            }
        }
    },

    rotateTurnTable:function(callback){
        //抽奖九宫格转盘
        if (this.currentCtrl) {
            if (this.currentCtrl.rotateTurnTable) {
                this.currentCtrl.rotateTurnTable(callback);
            }
        }
    },

    showPickOnce:function(result){
        //抽一次
        if (this.currentCtrl) {
            if (this.currentCtrl.showPickOnce) {
                this.currentCtrl.showPickOnce(result);
            }
        }
    },
    showPickFive:function(result){
        //抽五次
        if (this.currentCtrl) {
            if (this.currentCtrl.showPickFive) {
                this.currentCtrl.showPickFive(result);
            }
        }
    },
    showSkinPage:function(){
        //皮肤页
        if (this.currentCtrl) {
            if (this.currentCtrl.showSkinPage) {
                this.currentCtrl.showSkinPage();
            }
        }
    },

    showLuckUser:function(result){
        //中奖消息滚动
        if (this.currentCtrl) {
            if (this.currentCtrl.showLuckUser) {
                this.currentCtrl.showLuckUser(result);
            }
        }
    },

    showNewSkinPage:function(){
        //新皮肤界面
        if (this.currentCtrl) {
            if (this.currentCtrl.showNewSkinPage) {
                this.currentCtrl.showNewSkinPage();
            }
        }
    },

    //再接再厉页面展示超过多少人
    showPassPeopleNum4GameOver4Competition:function(num){
        if (this.currentCtrl){
            if (this.currentCtrl.showPassPeopleNum4GameOver4Competition){
                this.currentCtrl.showPassPeopleNum4GameOver4Competition(num);
            }
        }
    },
    //胜利页面展示超过多少人
    showPassPeopleNum4GameWin4Competition:function(num){
        if (this.currentCtrl){
            if (this.currentCtrl.showPassPeopleNum4GameWin4Competition){
                this.currentCtrl.showPassPeopleNum4GameWin4Competition(num);
            }
        }
    },

    //展示复活页面
    showRevival4Competition:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.showRevival4Competition){
                this.currentCtrl.showRevival4Competition();
            }
        }
    },
    //使用复活卡
    clickRevival4Competition:function(opt){
        if (this.currentCtrl){
            if (this.currentCtrl.clickRevival4Competition){
                this.currentCtrl.clickRevival4Competition(opt);
            }
        }
    },
    //点击跳过
    clickStepOver4Competition:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.clickStepOver4Competition){
                this.currentCtrl.clickStepOver4Competition();
            }
        }
    },

    //再接再厉页面
    showGameOver4Competition:function(opt){
        if (this.currentCtrl){
            if (this.currentCtrl.showGameOver4Competition){
                this.currentCtrl.showGameOver4Competition(opt);
            }
        }
    },
    //置灰再来一局button
    disableGameAgain4Competition:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.disableGameAgain4Competition){
                this.currentCtrl.disableGameAgain4Competition();
            }
        }
    },
    //再来一局
    clickGameAgain4Competition:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.clickGameAgain4Competition){
                this.currentCtrl.clickGameAgain4Competition();
            }
        }
    },
    //展示 达到目标分数 页面
    showGameWin4Competition:function(opt){
        if (this.currentCtrl){
            if (this.currentCtrl.showGameWin4Competition){
                this.currentCtrl.showGameWin4Competition(opt);
            }
        }
    },
    //展示网络错误弹框
    showNetError:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.showNetError){
                this.currentCtrl.showNetError();
            }
        }
    },
    //下次再战页面
    showNextFight4Competition:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.showNextFight4Competition){
                this.currentCtrl.showNextFight4Competition();
            }
        }
    },
    //展示恭喜获奖
    showCongratulation:function(opt){
        if (this.currentCtrl){
            if (this.currentCtrl.showCongratulation){
                this.currentCtrl.showCongratulation(opt);
            }
        }
    },
    //关闭恭喜获奖
    clickCongratulationClose:function(){
        if (this.currentCtrl){
            if (this.currentCtrl.clickCongratulationClose){
                this.currentCtrl.clickCongratulationClose();
            }
        }
    },
    //恭喜获奖 —— 查看详情
    clickCongratulationDetail:function(result){
        if (this.currentCtrl){
            if (this.currentCtrl.clickCongratulationDetail){
                this.currentCtrl.clickCongratulationDetail(result);
            }
        }
    },

    showGameOverPage: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.showGameOverPage) {
                this.currentCtrl.showGameOverPage();
            }
        }
    },

    overAgainPage:function (opt) {
        //游戏结束页
        if (this.currentCtrl) {
            if (this.currentCtrl.overAgainPage) {
                this.currentCtrl.overAgainPage(opt);
            }
        }
    },
    showTiXian:function () {
        //首页提现界面
        if (this.currentCtrl) {
            if (this.currentCtrl.showTiXian) {
                this.currentCtrl.showTiXian();
            }
        }
    },

    showMoreGame:function () {
        //首页更多游戏界面
        if (this.currentCtrl) {
            if (this.currentCtrl.showMoreGame) {
                this.currentCtrl.showMoreGame();
            }
        }
    },

    gameOverClickReplay: function () {
        //点击再玩一次
        if (this.currentCtrl) {
            if (this.currentCtrl.gameOverClickReplay) {
                this.currentCtrl.gameOverClickReplay();
            } else {
                this.game.handleWxOnError({
                    message: 'cannot Find this.currentCtrl.gameOverClickReplay',
                    stack: this.game.mode + '' + this.game.stage
                });
            }
        }
    },
    showFriendRank: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.showFriendRank) {
                this.currentCtrl.showFriendRank();
            }
        }
    },
    rankGlobal: function (result) {
        //  全球榜
        if (this.currentCtrl) {
            if (this.currentCtrl.rankGlobal) {
                this.currentCtrl.rankGlobal(result);
            }
        }
    },

    rankInner: function () {
        //好友榜
        if (this.currentCtrl) {
            if (this.currentCtrl.rankInner) {
                this.currentCtrl.rankInner();
            }
        }
    },
    // rankInnerOld: function () {
    //     //低版本好友榜
    //     if (this.currentCtrl) {
    //         if (this.currentCtrl.rankInnerOld) {
    //             this.currentCtrl.rankInnerOld();
    //         }
    //     }
    // },
    //更新场次预告页复活卡数量
    updateRevivalCardNum:function(){
        if (this.currentCtrl) {
            if (this.currentCtrl.updateRevivalCardNum) {
                this.currentCtrl.updateRevivalCardNum();
            }
        }
    },
    showPrizeRecord: function (result) {
        //获奖记录
        if (this.currentCtrl) {
            if (this.currentCtrl.showPrizeRecord) {
                this.currentCtrl.showPrizeRecord(result);
            }
        }
    },
    showPrizeRankLast: function (result) {
        //获奖榜单，上期排行榜
        if (this.currentCtrl) {
            if (this.currentCtrl.showPrizeRankLast) {
                this.currentCtrl.showPrizeRankLast(result);
            }
        }
    },
    showPrizeRankMoney: function (result) {
        //获奖榜单，奖金榜
        if (this.currentCtrl) {
            if (this.currentCtrl.showPrizeRankMoney) {
                this.currentCtrl.showPrizeRankMoney(result);
            }
        }
    },
    showSessionInfo: function (result) {
        //场次预告
        if (this.currentCtrl) {
            if (this.currentCtrl.showSessionInfo) {
                this.currentCtrl.showSessionInfo(result);
            }
        }
    },
    sessionReMainTime: function (result) {
        //场次预告
        if (this.currentCtrl) {
            if (this.currentCtrl.sessionReMainTime) {
                this.currentCtrl.sessionReMainTime(result);
            }
        }
    },
    alreadyBookBtn: function (result) {
        //场次预约
        if (this.currentCtrl) {
            if (this.currentCtrl.alreadyBookBtn) {
                this.currentCtrl.alreadyBookBtn(result);
            }
        }
    },
    friendRankReturn: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.friendRankReturn) {
                this.currentCtrl.friendRankReturn();
            }
        }
    },
    shareGroupRank: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.shareGroupRank) {
                this.currentCtrl.shareGroupRank();
            }
        }
    },
    clickRank: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.clickRank) {
                this.currentCtrl.clickRank();
            }
        }
    },
    shareBattleCard: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.shareBattleCard) {
                this.currentCtrl.shareBattleCard();
            }
        }
    },
    changeMode: function (name) {
        console.log('ModeCtrl changeMode new mode = ' + name);
        if (this.currentCtrl) {
            if (this.currentCtrl.destroy) {
                this.currentCtrl.destroy();
            }
        }
        this.model.setMode(this[name].name);
        this.currentCtrl = this[name];
        this[name].init();
    },
    singleChangeToPlayer: function () {
        // 因为是单机转主播，所以不需要hide
        this.model.setMode(this.playerCtrl.name);
        this.currentCtrl = this.playerCtrl;
        this.playerCtrl.init();
    },
    groupPlayGame: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.groupPlayGame) {
                this.currentCtrl.groupPlayGame();
            }
        }
    },
    directPlaySingleGame: function () {
        if (this.currentCtrl) {
            this.currentCtrl.destroy();
        }
        this.model.setMode(this.singleCtrl.name);
        this.currentCtrl = this.singleCtrl;
        this.singleCtrl.clickStart();
    },
    battlePlay: function (pk) {
        if (this.currentCtrl) {
            if (this.currentCtrl.battlePlay) {
                this.currentCtrl.battlePlay(pk);
            }
        }
    },
    shareObservCard: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.shareObservCard) {
                this.currentCtrl.shareObservCard();
            }
        }
    },
    socketJoinSuccess: function (success) {
        if (this.currentCtrl) {
            if (this.currentCtrl.socketJoinSuccess) {
                this.currentCtrl.socketJoinSuccess(success);
            }
        }
    },
    showPlayerGG: function (data) {
        if (this.currentCtrl) {
            if (this.currentCtrl.showPlayerGG) {
                this.currentCtrl.showPlayerGG(data);
            }
        }
    },
    showPlayerWaiting: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.showPlayerWaiting) {
                this.currentCtrl.showPlayerWaiting();
            }
        }
    },
    onPlayerOut: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.onPlayerOut) {
                this.currentCtrl.onPlayerOut();
            } else {
                this.game.handleWxOnError({
                    message: 'cannot Find this.currentCtrl.onPlayerOut',
                    stack: this.game.mode + '' + this.game.stage
                });
            }
        }
    },
    onViewerStart: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.onViewerStart) {
                this.currentCtrl.onViewerStart();
            }
        }
    },
    wxOnhide: function () {
        if (this.currentCtrl) {
            if (this.currentCtrl.wxOnhide) {
                this.currentCtrl.wxOnhide();
            }
        }
    },
};

export default ModeCtrl;
