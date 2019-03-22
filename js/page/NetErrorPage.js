'use strict';

var NetErrorPage = function () {
    function NetErrorPage(game) {
        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.UI = this.game.UI;
        this.name = 'netError';
    }

    return NetErrorPage;
}();

NetErrorPage.prototype = {
    show: function () {
        this.full2D.showNetError();
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default NetErrorPage;