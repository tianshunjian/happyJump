'use strict';

var SingleFriendRankPage = function () {
    function SingleFriendRankPage(game) {
        // _classCallCheck(this, SingleFriendRankPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.name = 'friendRankList';
    }

    return SingleFriendRankPage;
}();

SingleFriendRankPage.prototype = {
    show: function () {
        this.full2D.showFriendRankList({
            week_best_score: this.model.weekBestScore
        });
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default SingleFriendRankPage;