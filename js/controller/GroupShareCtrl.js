'use strict';

import GroupPage from '../page/GamePage.js';

var GroupShareCtrl = function () {
    function GroupShareCtrl(game, modeCtrl) {

        this.name = 'groupShare';
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.view = this.game.gameView;
        this.netWorkCtrl = this.gameCtrl.netWorkCtrl;
        this.modeCtrl = modeCtrl;
        this.groupPage =
            new GroupPage(game);
        //new _groupPage2.default(game);

        this.shareTicket = '';
        this.shareInfoTimeout = null;
    }

    return GroupShareCtrl;
}();

GroupShareCtrl.prototype = {
    init: function (options) {
        // console.log('init groupShareCtrl')
        // 服务器
        let serverConfig = this.model.getServerConfig();
        if (serverConfig) {
            if (!serverConfig.group_score_switch) {
                this.view.showServeConfigForbiddenGroupShare();
                this.modeCtrl.changeMode('singleCtrl');
                return;
            }
        }
        this.model.setStage('');
        let sessionId = this.model.getSessionId();
        this.shareTicket = options.shareTicket;
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
            //             _this.clearShareInfoTimeout();
            //             // console.log('没有触发定时器')
            //         } else {
            //             // console.log('已经触发定时器')
            //             return;
            //         }
            //
            //         _this.model.setShareTicket(res.rawData);
            //
            //         // 获取群数据
            //         _network2.default.getGroupScore(function (success, res) {
            //
            //             // 如果成功则显示好友排行
            //             if (success) {
            //                 let list = res.data.user_info || [];
            //                 let myUserInfo = res.data.my_user_info || {};
            //                 _this.showGroupRankPage(list, myUserInfo);
            //             } else {
            //
            //                 // 如果失败，回到单机模式
            //                 // this.handleNetworkFucked(true, '数据异常，点击确定进入游戏')
            //                 _this.goToGroupShareFail();
            //             }
            //             wx.hideLoading();
            //         });
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
            //         wx.hideLoading();
            //         _this.goToGroupShareFail('群里的群分享才有效哦~');
            //         // this.handleNetworkFucked(true, '数据异常，点击确定进入游戏')
            //     }
            // });
        } else {
            // wx.hideLoading();
            this.goToGroupShareFail();
        }
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
        this.goToGroupShareFail();
    },

    goToGroupShareFail: function (wording) {
        this.view.showGroupShareFail(wording);
        this.modeCtrl.changeMode('singleCtrl');
    },

    showGroupRankPage: function (list, myUserInfo) {
        this.groupPage.show(list, myUserInfo);
        this.model.setStage(this.groupPage.name);
        this.currentPage = this.groupPage;
    },

    destroy: function () {
        // wx.hideLoading();
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.model.setStage('');
        this.shareTicket = '';
        this.model.clearShareTicket();
        this.clearShareInfoTimeout();
        this.game.resetScene();
    },

    groupPlayGame: function () {
        this.modeCtrl.directPlaySingleGame();
    },

    wxOnhide: function () {
        return;
    }
};

export default GroupShareCtrl;
