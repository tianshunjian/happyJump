'use strict';

var outPage = function () {
    function outPage(game) {

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.UI = this.game.UI;
        this.name = 'viewerOut';
    }

    return outPage;
}();

outPage.prototype = {
    show: function () {
        let observeInfo = this.model.observeInfo;
        this.full2D.showLookersPage({
            type: 'out',
            headimg: observeInfo.headimg,
            nickname: observeInfo.nickName
        });
        this.UI.hideScore();
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default outPage;