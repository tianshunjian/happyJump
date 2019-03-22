'use strict';

var GgPage = function () {
    function GgPage(game) {
        // _classCallCheck(this, GgPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.UI = this.game.UI;
        this.name = 'viewerGG';
    }

    return GgPage;
}();

GgPage.prototype = {
    show: function () {
        // let observeInfo = this.model.observeInfo;
        // this.full2D.showLookersPage({
        //     type: 'gg',
        //     score: score,
        //     headimg: observeInfo.headimg,
        //     nickname: observeInfo.nickName
        // });
        // this.UI.hideScore();
    },

    hide: function () {
        // this.full2D.hide2D();
    }
};

export default GgPage;