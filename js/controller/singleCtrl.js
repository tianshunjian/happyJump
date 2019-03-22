'use strict';

import * as Config from '../base/Config.js';
import SingleStartPage from '../page/SingleStartPage.js';
import GamePage from '../page/GamePage.js';
import SingleGameOverPage from '../page/SingleGameOverPage.js';
import SingleFriendRankPage from '../page/SingleFriendRankPage.js';
import RevivalPage from '../page/RevivalPage.js';
import OverAgainPage from '../page/OverAgainPage.js';
import SkinPage from '../page/SkinPage.js';
import NewSkinPage from '../page/NewSkinPage.js';
import EveryDayPickPage from '../page/EverydayPickPage.js';
import PickOnce from '../page/PickOnce.js';
import PickFive from '../page/PickFive.js';
import RankGlobalPage from '../page/RankGlobalPage.js';
import RankInnerPage from '../page/RankInnerPage.js';
import PrizeRecordPage from '../page/PrizeRecordPage.js';
import PrizeRankLastPage from '../page/PrizeRankLastPage.js';
import PrizeRankMoneyPage from '../page/PrizeRankMoneyPage.js';
import GameOver4CompetitionPage from '../page/GameOver4CompetitionPage.js';
import GameWin4CompetitionPage from '../page/GameWin4CompetitionPage.js';
import CongratulationPage from '../page/CongratulationPage.js';
import SessionInfoPage from '../page/SessionInfoPage.js';
import LastAwardListPage from '../page/LastAwardListPage.js';
import NextFight4CompetePage from '../page/NextFight4CompetePage.js';
import NetErrorPage from '../page/NetErrorPage.js';
import TestHorizontalPage from '../page/TestHorizontalPage.js';
import PageCtrl from '../controller/PageCtrl.js';

var singleCtrl = function () {
    function singleCtrl(game, modeCtrl) {

        this.name = 'single';
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.view = this.game.gameView;
        this.modeCtrl = modeCtrl;
        this.netWorkCtrl = this.gameCtrl.netWorkCtrl;
        this.gameSocket = this.game.gameSocket;
        //this.currentPage = null;
        this.lastPage = null;
        this.socketTimeout = null;
    }
    return singleCtrl;
}();

singleCtrl.prototype = {
    init: function () {
        if (window.WechatGame){
            const startPage = new SingleStartPage(this.game);
            PageCtrl.pushPage(startPage,null,this.game);
            // this.startPage.show();
            // this.model.setStage(this.startPage.name);
            // this.currentPage = this.startPage;
        }
    },
    clickStart: function (gameType) {
        // this.game.pageBase.hide();
        const gamePage = new GamePage(this.game);
        PageCtrl.pushPage(gamePage,null);
        // this.gamePage.show();
        this.game.gameType = gameType || Config.GAME.singleGame;
        this.game.replayGame();
        // this.model.setStage(this.gamePage.name);
        // this.currentPage = this.gamePage;
    },
    updateRealBtn:function(){
        if (this.startPage){
            this.startPage.updateRealBtn();
        }
    },
    backStartPage: function () {
        this.hideCurrentPage();
        if(!this.startPage){
            this.startPage = new SingleStartPage(this.game);
        }
        this.model.setStage(this.startPage.name);
        this.startPage.backStartPage();
        this.currentPage = this.startPage;
    },

    rotateTurnTable:function(callback){
        //抽奖转盘
        if(!this.showDayPickPage){
            this.showDayPickPage = new EveryDayPickPage(this.game);
        }
        this.showDayPickPage.rotateTurnTable(callback);
    },
    showPickOnce :function (result) {
        //抽一次结果
        // this.hideCurrentPage(result);
        // this.pickOnce = new PickOnce(this.game);
        // this.pickOnce.show(result);
        // this.model.setStage(this.pickOnce.name);
        // this.currentPage = this.pickOnce;

        const pickOnce = new PickOnce(this.game);
        PageCtrl.pushPage(pickOnce,result);
    },

    showPickFive :function (result) {
        //抽五次结果
        // this.hideCurrentPage();
        // this.pickFive = new PickFive(this.game);
        // this.pickFive.show(result);
        // this.model.setStage(this.pickFive.name);
        // this.currentPage = this.pickFive;

        const pickFive = new PickFive(this.game);
        PageCtrl.pushPage(pickFive,result);
    },

    showSkinPage:function(){
        //未解锁皮肤页
        // this.lastPage = this.currentPage;
        // this.hideCurrentPage();
        // this.showSkin = new SkinPage(this.game);
        // this.showSkin.show();
        // this.model.setStage(this.showSkin.name);
        // this.currentPage = this.showSkin;
        const showSkin = new SkinPage(this.game);
        PageCtrl.pushPage(showSkin,null);
    },

    showNewSkinPage:function(){
        //新皮肤页面
        // this.hideCurrentPage();
        // this.showNewSkin = new NewSkinPage(this.game);
        // this.showNewSkin.show();
        // this.model.setStage(this.showNewSkin.name);
        // this.currentPage = this.showNewSkin;

        const showNewSkin = new NewSkinPage(this.game);
        PageCtrl.pushPage(showNewSkin,null);
    },
    showPickPage:function(result){
        //天天抽界面
        // this.hideCurrentPage();
        if(!this.showDayPickPage){
            this.showDayPickPage = new EveryDayPickPage(this.game);
        }
        PageCtrl.pushPage(this.showDayPickPage,result);
        // this.showDayPickPage.show(result);
        // this.model.setStage(this.showDayPickPage.name);
        // this.currentPage = this.showDayPickPage;
    },

    showLuckUser:function(result){
        //滚动中奖消息
        if(!this.showDayPickPage){
            this.showDayPickPage = new EveryDayPickPage(this.game);
        }
        this.showDayPickPage.showLuckUser(result);
    },

    overAgainPage:function (opt) {
        //游戏结束页
        // this.hideCurrentPage();
        const overAgain = new OverAgainPage(this.game);
        PageCtrl.pushPage(overAgain,opt);
        // overAgain.show(opt);
        // this.model.setStage(overAgain.name);
        // this.currentPage = overAgain;
    },

    showTiXian:function () {
        if (window.WechatGame){
            // wx.previewImage({
            //     urls:[Config.TIXIAN_QR_URL]
            // });
            if (wx.navigateToMiniProgram) {
                wx.navigateToMiniProgram({
                    appId: 'wx190de88fb63be538',
                    success(res) {
                        console.log('拉起小程序成功：' + JSON.stringify(res));
                    }
                });
            } else {
                wx.previewImage({
                    urls:[Config.TIXIAN_QR_URL]
                });
            }
        }
    },

    showMoreGame:function () {
        if (window.WechatGame){
            if (wx.navigateToMiniProgram) {
                wx.navigateToMiniProgram({
                    appId: 'wx190de88fb63be538',
                    success(res) {
                        console.log('拉起小程序成功：' + JSON.stringify(res));
                    }
                });
            } else {
                wx.previewImage({
                    urls:[Config.MOREGAME_QR_URL]
                });
            }
        }
    },

    //展示网络错误
    showNetError:function(){
        this.hideCurrentPage();
        this.netError = new NetErrorPage(this.game);
        this.netError.show();
        this.model.setStage(this.netError.name);
        this.currentPage = this.netError;
    },

    //再接再厉页面展示超过多少人
    showPassPeopleNum4GameOver4Competition:function(num){
        if (this.gameOver4CompetitionPage) {
            this.gameOver4CompetitionPage.showPassPeopleNum(num);
        }
    },
    //胜利页面展示超过多少人
    showPassPeopleNum4GameWin4Competition:function(num){
        if (this.gameWin4CompetitionPage) {
            this.gameWin4CompetitionPage.showPassPeopleNum(num);
        }
    },

    //展示复活页面
    showRevival4Competition:function(){
        // this.hideCurrentPage();
        // this.revivalPage = new RevivalPage(this.game);
        // this.revivalPage.show();
        // this.model.setStage(this.revivalPage.name);
        // this.currentPage = this.revivalPage;

        const revivalPage = new RevivalPage(this.game);
        PageCtrl.pushPage(revivalPage,null);
    },
    //使用复活卡
    clickRevival4Competition:function(opt){
        // this.hideCurrentPage();
        // this.gamePage = new GamePage(this.game);
        // this.gamePage.show();
        // this.game.revival();
        // this.model.setStage(this.gamePage.name);
        // this.currentPage = this.gamePage;
        const gamePage = new GamePage(this.game);
        PageCtrl.pushPage(gamePage,opt);
        this.game.revival();
    },
    //点击跳过
    clickStepOver4Competition:function(){
        this.showGameOver4Competition();
    },

    //比赛场 —— 开始游戏
    clickStartGame4Competition:function(){
        this.clickStart(Config.GAME.competitionGame);
    },
    //再接再厉页面
    showGameOver4Competition:function(opt){
        // this.hideCurrentPage();
        // this.gameOver4CompetitionPage = new GameOver4CompetitionPage(this.game);
        // this.gameOver4CompetitionPage.show(opt);
        // this.model.setStage(this.gameOver4CompetitionPage.name);
        // this.currentPage = this.gameOver4CompetitionPage;

        const gameOver4CompetitionPage = new GameOver4CompetitionPage(this.game);
        PageCtrl.pushPage(gameOver4CompetitionPage,opt);
    },
    disableGameAgain4Competition:function(){
        if (this.gameOver4CompetitionPage && this.currentPage == this.gameOver4CompetitionPage){
            this.gameOver4CompetitionPage.disableGameAgain4Competition();
        }
    },
    //再接再厉页面 —— 再来一局
    clickGameAgain4Competition:function(){
        this.clickStart(Config.GAME.competitionGame);
    },
    //展示 达到目标分数 页面
    showGameWin4Competition:function(opt){
        // this.hideCurrentPage();
        // this.gameWin4CompetitionPage = new GameWin4CompetitionPage(this.game);
        // this.gameWin4CompetitionPage.show(opt);
        // this.model.setStage(this.gameWin4CompetitionPage.name);
        // this.currentPage = this.gameWin4CompetitionPage;

        let gameWin4CompetitionPage = new GameWin4CompetitionPage(this.game);
        PageCtrl.pushPage(gameWin4CompetitionPage,opt);
    },
    //展示下次再战
    showNextFight4Competition:function(){
        // this.hideCurrentPage();
        // this.nextFight4CompetePage = new NextFight4CompetePage(this.game);
        // this.nextFight4CompetePage.show();
        // this.model.setStage(this.nextFight4CompetePage.name);
        // this.currentPage = this.nextFight4CompetePage;

        let nextFight4CompetePage = new NextFight4CompetePage(this.game);
        PageCtrl.pushPage(nextFight4CompetePage,null);
    },
    //展示恭喜获奖
    showCongratulation:function(opt){
        // this.lastPage = this.currentPage;
        // this.hideCurrentPage();
        // this.congratulationPage = new CongratulationPage(this.game);
        // this.congratulationPage.show(opt);
        // this.model.setStage(this.congratulationPage.name);
        // this.currentPage = this.congratulationPage;

        let congratulationPage = new CongratulationPage(this.game);
        PageCtrl.pushPage(congratulationPage,opt);
    },
    //关闭恭喜获奖
    clickCongratulationClose:function(){
        this.hideCurrentPage();
        if (this.lastPage){
            this.lastPage.show();
            this.model.setStage(this.lastPage.name);
            this.currentPage = this.lastPage;
        }else{
            this.startPage = new SingleStartPage(this.game);
            this.startPage.show();
            this.model.setStage(this.startPage.name);
            this.currentPage = this.startPage;
        }
    },
    //恭喜获奖 —— 查看详情
    clickCongratulationDetail:function(result){
        // this.hideCurrentPage();
        // this.lastAwardListPage = new LastAwardListPage(this.game);
        // this.lastAwardListPage.show(result);
        // this.model.setStage(this.lastAwardListPage.name);
        // this.currentPage = this.lastAwardListPage;

        let lastAwardListPage = new LastAwardListPage(this.game);
        PageCtrl.pushPage(lastAwardListPage,result);
    },

    showGameOverPage: function () {
        this.hideCurrentPage();
        //  this.gameOverPage.show();
        this.gameOverPage = new SingleGameOverPage(this.game);
        this.revivalPage = new RevivalPage(this.game);
        this.revivalPage.show();
        // 清空上次留存的pkId
        this.model.clearPkId();
        this.model.setStage(this.gameOverPage.name);
        this.currentPage = this.gameOverPage;
    },
    gameOverClickReplay: function () {
        this.clickStart(Config.GAME.singleGame);
    },
    showFriendRank: function () {
        this.lastPage = this.currentPage;
        this.hideCurrentPage();
        this.friendRankPage = new SingleFriendRankPage(this.game);
        this.friendRankPage.show();
        this.model.setStage(this.friendRankPage.name);
        this.currentPage = this.friendRankPage;
    },
    rankGlobal: function (result) {
        //全球榜
        this.hideCurrentPage();
        const globalRank = new RankGlobalPage(this.game);
        PageCtrl.pushPage(globalRank,result);
        // this.globalRank = new TestHorizontalPage(this.game);
        // this.globalRank.show(result);
        // this.model.setStage(this.globalRank.name);
        // this.currentPage = this.globalRank;
    },
    rankInner: function () {
        //好友榜
        this.hideCurrentPage();
        const innerRank = new RankInnerPage(this.game);
        PageCtrl.pushPage(innerRank,null);
        // this.innerRank.show();
        // this.model.setStage(this.innerRank.name);
        // this.currentPage = this.innerRank;
    },
    // rankInnerOld: function () {
    //     //微信低版本好友榜
    //     this.hideCurrentPage();
    //     this.innerRank = new RankInnerPage(this.game);
    //     this.innerRank.showOld();
    //     this.model.setStage(this.innerRank.name);
    //     this.currentPage = this.innerRank;
    // },
    showPrizeRecord: function (result) {
        //获奖记录
        this.hideCurrentPage();
        const prizeRecord = new PrizeRecordPage(this.game);
        PageCtrl.pushPage(prizeRecord,result);
        // this.prizeRecord.show(result);
        // this.model.setStage(this.prizeRecord.name);
        // this.currentPage = this.prizeRecord;
    },
    showPrizeRankLast: function (result) {
        //获奖榜单，上期排行榜
        this.hideCurrentPage();
        const prizeRankLast = new PrizeRankLastPage(this.game);
        PageCtrl.pushPage(prizeRankLast,result,this.game);
        // this.prizeRankLast.show(result);
        // this.model.setStage(this.prizeRankLast.name);
        // this.currentPage = this.prizeRankLast;
    },
    showPrizeRankMoney: function (result) {
        //获奖榜单，奖金榜
        this.hideCurrentPage();
        const prizeRankMoney = new PrizeRankMoneyPage(this.game);
        PageCtrl.pushPage(prizeRankMoney,result);
        // this.prizeRankMoney.show(result);
        // this.model.setStage(this.prizeRankMoney.name);
        // this.currentPage = this.prizeRankMoney;
    },
    showSessionInfo: function (result) {
        //场次预告
        this.hideCurrentPage();
        const sessionInfo = new SessionInfoPage(this.game);
        PageCtrl.pushPage(sessionInfo,result);
        // this.sessionInfo.show(result);
        // this.model.setStage(this.sessionInfo.name);
        // this.currentPage = this.sessionInfo;
    },
    updateRevivalCardNum:function(){
        if(this.sessionInfo && this.currentPage == this.sessionInfo){
            this.sessionInfo.updateRevivalCardNum();
        }
    },
    sessionReMainTime: function (result) {
        //场次预告
        if(this.sessionInfo && this.currentPage == this.sessionInfo){
            this.sessionInfo.sessionReMainTime(result);
        }
    },
    alreadyBookBtn: function (result) {
        //已预约按钮
        if(!this.sessionInfo){
            this.sessionInfo = new SessionInfoPage(this.game);
        }
        this.sessionInfo.alreadyBookBtn(result);
    },
    friendRankReturn: function () {
        console.log('lastPage __'+this.lastPage);
        this.hideCurrentPage();
        this.lastPage.show();

        this.model.setStage(this.lastPage.name);
        this.currentPage = this.lastPage;
        // this.lastPage = null

    },

    shareGroupRank: function () {
        let _this = this;

        (0, _shareApp.shareGroupRank)(function (success, isGroup) {
            _this.gameCtrl.afterShareGroupRank(success, isGroup);
        });
    },
    clickRank: function () {
        console.log('singleCtrl_clickRank');
        console.log('currentPage'+this.currentPage);
        console.log('lastPage'+this.lastPage);
        this.showFriendRank();
    },
    shareBattleCard: function () {

        let sessionId = this.model.getSessionId();
        let pkId = this.model.getPkId();
        if (!sessionId) {
            this.view.showNoSession();
            return;
        }

        if (pkId) {
            this.afterHavePkId();
        }
    },
    afterHavePkId: function () {
        let _this3 = this;

        let pkId = this.model.getPkId();
        let score = this.model.currentScore;

        (0, _shareApp.shareBattle)(pkId, score, function (success, isGroup) {
            _this3.gameCtrl.afterShareBattle(success, isGroup);
        });
    },
    getPKErr: function () {
        this.view.showGetPkIdFail();
    },
    shareObservCard: function () {
        this.gamePage = new GamePage(this.game);
        // this.gamePage.hideLookersShare();
        this.model.setStage('loading');
        if (window.WechatGame){
            wx.showLoading();
        }
        // let sessionId = this.model.getSessionId();
        // if (!sessionId) {
        //     this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
        // } else {
        //     this.afterLogin(true);
        // }
    },
    afterLogin: function (success) {
        if (!success) {
            this.shareObservCardFail();
        }
    },
    shareObservCardFail: function (res) {

        // 提示wording弹窗
        this.view.showShareObserveCardFail(res);

        // 清理gameId，gameTicket
        this.model.clearGameId();
        this.model.clearGameTicket();

        // 切回stage loading -> game
        if (this.model.stage == 'loading') {
            this.model.setStage('game');
        }

        // 清除定时器
        this.clearSocketTimeout();

        // 关闭socket 回到游戏页面
        this.gameSocket.close();

        // 清除wx.showloading
        if (window.WechatGame){
            wx.hideLoading();
        }
    },
    shareObservCardA: function () {
        this.socketTimeout = setTimeout(this.shareObservCardFail.bind(this), 5000);

        /**
         * 连接网络
         * socket连接上自动joingame，中间出错，直接调用分享失败,关闭socket
         */
        this.gameSocket.connectSocket();
    },
    socketJoinSuccess: function (success) {
        if (window.WechatGame){
            wx.hideLoading();
        }
        if (success) {

            // 取消定时器
            this.clearSocketTimeout();
            this.shareObservCardB();
        } else {
            this.shareObservCardFail();
        }
    },
    shareObservCardB: function () {
        let _this5 = this;

        (0, _shareApp.shareObserve)(function (success, num) {
            if (success) {
                _this5.gameCtrl.afterShareObserveCard(num);
            }
            setTimeout(function () {
                // console.log('!!!!!shareObservCardB,stage', this.model.stage)
                if (_this5.model.stage == 'loading') {
                    _this5.model.setStage('game');
                }
                _this5.modeCtrl.singleChangeToPlayer();
                _this5.currentPage = null;
            }, 50);
        });
    },
    clearSocketTimeout: function () {
        if (this.socketTimeout != null) {
            clearTimeout(this.socketTimeout);
            this.socketTimeout = null;
        }
    },
    wxOnhide: function () {
        return;
    },
    wxOnshow: function () {
        return;
    },
    destroy: function () {
        this.hideCurrentPage();
        this.currentPage = null;
        this.model.setStage('');
        // 清理gameId，gameTicket
        this.model.clearGameId();
        this.model.clearGameTicket();

        // 清除定时器
        this.clearSocketTimeout();

        this.game.resetScene();
    },
    hideCurrentPage: function () {
        if (this.currentPage) {
            this.currentPage.hide();
        }
    },
};

export default singleCtrl;
