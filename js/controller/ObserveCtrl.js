'use strict';

var SYCTIME = 10000;
var TIMEOUT = 9000;

var ObserveCtrl = function () {
    function ObserveCtrl(game, modeCtrl) {
        // _classCallCheck(this, ObserveCtrl);

        this.game = game;
        this.name = 'observe';
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.view = this.game.gameView;
        this.modeCtrl = modeCtrl;
        this.netWorkCtrl = this.gameCtrl.netWorkCtrl;
        this.gameSocket = this.game.gameSocket;
        this.currentPage = null;

        // this.waitingPage = new _observeWaiting2.default(game);
        // this.ggPage = new _observeGg2.default(game);
        // this.outPage = new _observeOut2.default(game);

        this.gameId = '';
        this.longTimeout = null;
    }

    return ObserveCtrl;
}();

ObserveCtrl.prototype = {
    init: function (options) {
        // TODO 如果服务器下发的配置禁止围观，返回单机游戏
        let serverConfig = this.model.getServerConfig();
        if (serverConfig) {
            if (!serverConfig.audience_mode_switch) {
                this.view.showServeConfigForbiddenObserveMode();
                this.modeCtrl.changeMode('singleCtrl');
                return;
            }
        }
        this.model.setStage('');
        let sessionId = this.model.getSessionId();
        this.gameId = options.query.gameId;
        this.model.setObserveInfo({
            headimg: options.query.headimg,
            nickName: options.query.nickName
        });
        this.model.setGameId(this.gameId);

        wx.showLoading();
        if (!sessionId) {
            this.netWorkCtrl.netWorkLogin(this.afterLogin.bind(this));
        } else {
            this.afterLogin(true);
        }
    },
    afterLogin: function (success) {
        if (success) {
            this.setLongTimeHandle();
            this.gameSocket.connectSocket();
            this.model.setStage('');
        } else {
            this.goToObserveStateFail();
        }
    },
    socketJoinSuccess: function (success) {

        // 清除定时器
        this.clearLongTimeHandle();
        wx.hideLoading();
        if (success) {

            // 切换页面
            this.waitingPage.show();
            this.model.setStage(this.waitingPage.name);
            this.currentPage = this.waitingPage;

            // 清UI分数
            this.game.UI.setScore(0);

            // 设置轮询，查主播状态
            this.checkPlayerTimeout = setInterval(this.checkPlayerState.bind(this), SYCTIME);
        } else {

            // 展示主播直播结束
            this.showPlayerDead();
        }
    },
    goToObserveStateFail: function () {

        // 提示wording
        this.view.showObserveStateFail();

        // 跳回单机主页
        this.modeCtrl.changeMode('singleCtrl');
    },
    setLongTimeHandle: function () {
        this.longTimeout = setTimeout(this.handleLongTime.bind(this), TIMEOUT);
    },
    handleLongTime: function () {
        this.goToObserveStateFail();
    },
    clearLongTimeHandle: function () {
        if (this.longTimeout != null) {
            clearTimeout(this.longTimeout);
            this.longTimeout = null;
        }
    },
    showPlayerDead: function () {
        // 关闭socket
        this.gameSocket.close();

        // 关闭定时器
        this.clearCheckPlayerTimeout();

        // 展示主播退出页面
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.outPage.show();
        this.model.setStage(this.outPage.name);
        this.currentPage = this.outPage;
    },
    checkPlayerState: function () {
        _network2.default.syncop(this.judgePlayerState.bind(this));
    },
    judgePlayerState: function (success, res) {
        if (success) {
            if (res.data.state != 0) {
                this.clearCheckPlayerTimeout();
                this.showPlayerDead();
            }
        } else {
            this.handleSyncopErr();
        }
    },
    handleSyncopErr: function () {
        this.view.showSyncopErr();
        this.goToObserveStateFail();
    },
    clearCheckPlayerTimeout: function () {
        if (this.checkPlayerTimeout != null) {
            clearInterval(this.checkPlayerTimeout);
            this.checkPlayerTimeout = null;
        }
    },
    destroy: function () {
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.currentPage = null;
        this.model.setStage('');

        // 清理gameID
        this.model.clearGameId();

        // 清理连接超时定时器
        this.clearLongTimeHandle();

        // 清理sycop定时器
        this.clearCheckPlayerTimeout();

        // 隐藏loading
        wx.hideLoading();

        if (this.gameSocket.alive) {

            // 关闭socket
            this.gameSocket.close();
        }

        // 清楚围观者的信息
        this.model.clearObserveInfo();

        this.game.instructionCtrl.destroy();

        this.game.resetScene();
    },
    showPlayerWaiting: function () {
        // 查看当前stage是否是playerWaiting，不是才改
        if (this.currentPage != this.waitingPage) {
            if (this.currentPage != null) {
                this.currentPage.hide();
            }
            this.waitingPage.show();
            this.model.setStage(this.waitingPage.name);
            this.currentPage = this.waitingPage;
        }
    },
    showPlayerGG: function (score) {
        if (this.currentPage != null) {
            this.currentPage.hide();
        }
        this.ggPage.show(score);
        this.model.setStage(this.ggPage.name);
        this.currentPage = this.ggPage;
    },
    onPlayerOut: function () {
        this.showPlayerDead();
    },
    onViewerStart: function () {
        this.gameSocket.quitObserve();
        this.game.instructionCtrl.destroy();
        this.modeCtrl.directPlaySingleGame();
    },
    showGameOverPage: function () {
        return;
    },

    wxOnhide: function () {
        this.clearCheckPlayerTimeout();
        this.gameSocket.quitObserve();
        this.gameSocket.close();
        this.game.resetScene();
    },

    wxOnshow: function () {
        return;
    },
};

export default ObserveCtrl;
