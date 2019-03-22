'use strict';

import singleCtrl from './singleCtrl.js';
import GamePage from '../page/GamePage.js';

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }return call && ((typeof call === 'undefined' ? 'undefined' : typeof(call)) === 'object' || typeof call === 'function') ? call : self;
}

var playerCtrl = function (_SingleCtrl) {
    // _inherits(playerCtrl, _SingleCtrl);

    function playerCtrl(game, modeCtrl) {
        // _classCallCheck(this, playerCtrl);

        let _this = _possibleConstructorReturn(this, (playerCtrl.__proto__ || Object.getPrototypeOf(playerCtrl)).call(this, game, modeCtrl));

        if (_this) {
            _this.name = 'player';
            _this.currentPage = null;
            _this.gamePage = new GamePage(game);//new _playerGamePage2.default(game);
        }
        return _this;
    }

    return playerCtrl;
}(singleCtrl.default);//_singleCtrl2


playerCtrl.prototype = {
    init: function () {
        // this.model.setStage(this.gamePage.name)
        // this.gamePage.show()
        let stage = this.model.stage;
        switch (stage) {
        case 'game':
            this.currentPage = this.gamePage;
            this.currentPage.show();
            break;
        case 'singleSettlementPgae':
            this.currentPage = this.gameOverPage;
            break;
        default:
            this.model.setStage(this.gamePage.name);
            this.currentPage = this.gamePage;
            this.currentPage.show();
            break;
        }
    },
    showGameOverPage: function () {
        this.game.seq++;
        this.gameSocket.sendCommand(this.game.seq, {
            type: -1,
            s: this.game.currentScore
        });
        _get(playerCtrl.prototype.__proto__ || Object.getPrototypeOf(playerCtrl.prototype), 'showGameOverPage', this).call(this);
    },
    shareObservCard: function () {
        this.shareObservCardA();
    },
    shareObservCardA: function () {
        this.shareObservCardB();
    },
    shareObservCardB: function () {
        let _this2 = this;

        this.model.setStage('loading');
        (0, _shareApp.shareObserve)(function (success, num) {
            if (success) {
                _this2.gameCtrl.afterShareObserveCard(num);
            }
            setTimeout(function () {
                // console.log('!!!!!!shareObservCardB,stage2', this.model.stage)
                if (_this2.model.stage == 'loading') {
                    _this2.model.setStage('game');
                }
            }, 50);
        });
    },
    gameOverClickReplay: function () {
        _get(playerCtrl.prototype.__proto__ || Object.getPrototypeOf(playerCtrl.prototype), 'gameOverClickReplay', this).call(this);
        this.game.seq++;
        this.gameSocket.sendCommand(this.game.seq, {
            type: 0,
            seed: this.game.randomSeed
        });
    },
    destroy: function () {
        if (this.currentPage) {
            this.currentPage.hide();
        }
        this.currentPage = null;
        this.model.setStage('');
        if (this.gameSocket.alive) {
            // 关闭socket
            this.gameSocket.close();
        }

        // 清理gameId，gameTicket
        this.model.clearGameId();
        this.model.clearGameTicket();
        this.game.viewer.reset();
        // this.game.viewer.hideAll()

        this.game.resetScene();
    },
    wxOnhide: function () {
        let _this3 = this;

        // 这个地方影响PK分享，群分享
        if (this.model.stage != 'loading' && this.model.stage != 'singleSettlementPgae' && this.model.stage != 'friendRankList') {

            _network2.default.quitGame();

            // 结束心跳
            this.gameSocket.cleanHeartBeat();

            this.gameSocket.close();
            setTimeout(function () {
                // this.handleNetworkFucked(true, '直播断开')
                // this.handleNetworkFucked()
                _this3.modeCtrl.changeMode('singleCtrl');
            }, 100);
        }
    },
    wxOnshow: function () {},
};

export default playerCtrl;
