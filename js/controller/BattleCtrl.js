'use strict';

import BattleGamePage from '../page/BattleGamePage.js';
import BattlePkPage from '../page/BattlePkPage.js';

var BattleCtrl = function () {
    function BattleCtrl(game, modeCtrl) {

        this.name = 'battlePage';
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.view = this.game.gameView;
        this.modeCtrl = modeCtrl;
        this.netWorkCtrl = this.gameCtrl.netWorkCtrl;
        this.currentPage = null;
        this.pkPage = new BattlePkPage(game);//new _battlePkPage2.default(game);
        this.gamePage = new BattleGamePage(game);//new _battleGamePage2.default(game);

        this.shareTicket = '';
        this.pkId = '';
        this.shareInfoTimeout = null;
        this.battleScore = undefined;
    }

    return BattleCtrl;
}();

BattleCtrl.prototype = {
    init: function (options) {
        let sessionId = this.model.getSessionId();
        this.shareTicket = options.shareTicket;
        this.pkId = options.query.pkId;
        this.model.setStage('');
        // wx.showLoading();
        if (!sessionId) {
            this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
        } else {
            this.afterLogin(true);
        }
    },

    afterLogin: function (success) {
        let _this = this;

        if (success) {
            this.setShareInfoTimeout();

            // 换取rawdata
            // wx.getShareInfo({
            //     shareTicket: this.shareTicket,
            //     success: function success(res) {
            //
            //         // 如果定时器还没有触发，就取消定时器
            //         if (_this.shareInfoTimeout != null) {
            //             // console.log('没有触发定时器')
            //             _this.clearShareInfoTimeout();
            //         } else {
            //             // console.log('已经触发定时器')
            //             return;
            //         }
            //         _this.model.setShareTicket(res.rawData);
            //
            //         // console.log('wx.getShareInfo success group', res)
            //         _this.gotoBattlePage();
            //         _this.gameCtrl.loginBattle(1);
            //     },
            //     fail: function fail(res) {
            //
            //         // 如果定时器还没有触发，就取消定时器
            //         if (_this.shareInfoTimeout != null) {
            //             _this.clearShareInfoTimeout();
            //             // console.log('没有触发定时器')
            //         } else {
            //             // console.log('已经触发定时器')
            //             return;
            //         }
            //
            //         // 失败就是个人
            //         _this.gotoBattlePage();
            //         _this.gameCtrl.loginBattle(0);
            //     }
            // });
        } else {
            this.goToBattleFail();
        }
    },

    gotoBattlePage: function () {

        // 拉分数
        _network2.default.getBattleData(this.gotoBattlePageAfterHaveData.bind(this), this.pkId);
    },

    gotoBattlePageAfterHaveData: function (success, res) {
        // wx.hideLoading();
        if (success) {
            let pkList = [];
            if (res.data.challenger.length) {
                res.data.challenger.forEach(function (el) {
                    pkList.push({
                        headimg: el.headimg,
                        is_self: el.is_self ? 1 : 0,
                        nickname: el.nickname,
                        score_info: [{
                            score: el.score
                        }]
                    });
                }, this);
            }

            pkList.sort(function (a, b) {
                return b.score_info[0].score - a.score_info[0].score;
            });

            let obj = {
                data: {
                    organizerInfo: {
                        headimg: res.data.owner.headimg,
                        nickname: res.data.owner.nickname,
                        score_info: [{
                            score: res.data.owner.score
                        }],
                        // create_time: res.data.create_time,
                        left_time: res.data.left_time,
                        is_self: res.data.is_owner ? 1 : 0
                    },
                    pkListInfo: pkList,
                    gg_score: this.battleScore
                }
            };

            if (this.currentPage) {
                this.currentPage.hide();
            }
            this.pkPage.show(obj);
            this.model.setStage(this.pkPage.name);
            this.currentPage = this.pkPage;

            this.gameCtrl.showPkPage(res.data.owner.score);
        } else {
            this.goToBattleFail();
        }
    },

    goToBattleFail: function () {
        this.view.showGoToBattleFail();
        this.modeCtrl.changeMode('singleCtrl');
    },

    setShareInfoTimeout: function () {
        this.shareInfoTimeout = setTimeout(this.handleShareInfoTimeout.bind(this), 5000);
    },

    clearShareInfoTimeout: function () {
        if (this.shareInfoTimeout != null) {
            clearTimeout(this.shareInfoTimeout);
            this.shareInfoTimeout = null;
        }
    },

    handleShareInfoTimeout: function () {
        this.clearShareInfoTimeout();
        this.goToBattleFail();
    },

    destroy: function () {
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.model.setStage('');
        // wx.hideLoading();
        this.shareTicket = '';
        this.pkId = '';
        this.clearShareInfoTimeout();
        this.model.clearShareTicket();
        this.game.resetScene();
        this.battleScore = undefined;
    },

    battlePlay: function (pk) {
        if (pk) {
            if (this.currentPage) {
                this.currentPage.hide();
            }
            this.gamePage.show();
            this.game.replayGame();
            this.model.setStage(this.gamePage.name);
            this.currentPage = this.gamePage;
        } else {
            this.modeCtrl.directPlaySingleGame();
            this.gameCtrl.battleToSingle();
        }
    },

    showGameOverPage: function () {
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.model.setStage('');
        this.currentPage = null;
        let score = this.model.currentScore;
        this.battleScore = score;

        // 先上传分数，然后再拉分数
        // wx.showLoading();
        _network2.default.updatepkinfo(this.gotoBattlePageAgain.bind(this), this.pkId, score);
    },

    gotoBattlePageAgain: function (scoreUpLoad) {
        if (!scoreUpLoad) {
            this.view.showUploadPkScoreFail();
        }

        this.gotoBattlePage();
    },

    wxOnhide: function () {
        return;
    },
};

export default BattleCtrl;
