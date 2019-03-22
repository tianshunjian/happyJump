'use strict';

var BattleGamePage = function () {
    function BattleGamePage(game) {
        // _classCallCheck(this, BattleGamePage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.UI = this.game.UI;
        this.viewer = this.game.viewer;
        this.name = 'game';
    }

    return BattleGamePage;
}();

BattleGamePage.prototype = {
    show: function () {
        this.UI.showScore();

        this.UI.scoreText.obj.position.y = 21;
        this.UI.scoreText.obj.position.x = -13;
        this.UI.scoreText.changeStyle({ textAlign: 'left' });
    },

    hide: function () {
        this.UI.hideScore();
    }
};

export default BattleGamePage;