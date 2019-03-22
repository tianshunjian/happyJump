'use strict';

var SingleGameOverPage = function () {
    function SingleGameOverPage(game) {
        // _classCallCheck(this, SingleGameOverPage);

        this.game = game;
        this.model = this.game.gameModel;
        this.full2D = this.game.full2D;
        this.name = 'singleSettlementPgae';
    }

    return SingleGameOverPage;
}();

SingleGameOverPage.prototype = {
    show: function () {
        let _this = this;

        let score = this.model.currentScore;
        let highest_score = this.model.getHighestScore();
        let start_time = this.model.startTime;
        let week_best_score = this.model.weekBestScore;
        // let game_cnt = this.game.historyTimes.getTimes();
        let game_cnt = 0;
        if (!this.full2D) {
            // this.game.handleWxOnError({
            //     message: 'can not find full 2D gameOverPage',
            //     stack: ''
            // });
        }

        setTimeout(function () {
            if (_this.full2D) {
                _this.full2D.showGameOverPage({
                    score: score,
                    highest_score: highest_score,
                    start_time: start_time,
                    week_best_score: week_best_score,
                    game_cnt: game_cnt
                });
            } else {
                // wx.exitMiniProgram()
            }
        }, 0);
    },

    hide: function () {
        this.full2D.hide2D();
    }
};

export default SingleGameOverPage;