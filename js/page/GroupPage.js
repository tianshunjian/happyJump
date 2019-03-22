'use strict';

var GroupPage = function () {
    function GroupPage(game) {
        // _classCallCheck(this, GroupPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.name = 'groupRankList';
    }

    return GroupPage;
}();

GroupPage.prototype = {
    show: function (list, myUserInfo) {
        this.full2D.showGroupRankList(list, myUserInfo);
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default GroupPage;