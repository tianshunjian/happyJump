'use strict';

var WaitingPage = function () {
    function WaitingPage(game) {
        // _classCallCheck(this, WaitingPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.UI = this.game.UI;
        this.name = 'viewerWaiting';
    }

    return WaitingPage;
}();

WaitingPage.prototype = {
    show: function () {
        let observeInfo = this.model.observeInfo;
        this.full2D.showLookersPage({
            type: 'in',
            headimg: observeInfo.headimg,
            nickname: observeInfo.nickName
        });
        this.UI.scoreText.obj.position.x = 0;
        this.UI.scoreText.obj.position.y = 11;
        this.UI.scoreText.changeStyle({ textAlign: 'center' });
        this.UI.showScore();
    },

    hide: function () {
        this.full2D.hide2D();
        this.UI.hideScore();
        this.UI.scoreText.obj.position.y = 21;
        this.UI.scoreText.obj.position.x = -13;
        this.UI.scoreText.changeStyle({ textAlign: 'left' });
    }
};

export default WaitingPage;