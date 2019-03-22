'use strict';

var BattlePkPage = function () {
    function BattlePkPage(game) {
        // _classCallCheck(this, BattlePkPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.name = 'battlePage';
    }

    return BattlePkPage;
}();

BattlePkPage.prototype = {
    show: function (obj) {
        this.full2D.showPkPage(obj);
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default BattlePkPage;