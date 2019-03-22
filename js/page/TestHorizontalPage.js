'use strict';

var TestHorizontalPage = function () {
    function TestHorizontalPage(game) {
        // _classCallCheck(this, RankGlobalPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.name = 'testHorizontalList';
    }

    return TestHorizontalPage;
}();

TestHorizontalPage.prototype = {
    show: function (result) {
        this.full2D.showHorizontalListPage(result);
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default TestHorizontalPage;