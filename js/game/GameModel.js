'use strict';

var GameModel = function () {
    function GameModel(game) {
        this.game = game;
        this.mode = '';
        this.stage = '';
        this.currentScore = 0;
        this.highestScore = 0;
        this.observeInfo = {};
        this.weekBestScore = 0;
        this.startTime = Math.floor(Date.now() / 1000);
    }

    return GameModel;
}();

GameModel.prototype = {
    setMode: function (mode) {
        this.mode = mode;
        this.game.mode = mode;
    },
    setStage: function (stage) {
        this.stage = stage;
        this.game.stage = stage;
    },
    init: function () {
    },
    getServerConfig: function () {
        return {};
    },
    getMode: function () {
        return this.mode;
    },
    setScore: function (score) {
        this.currentScore = score;
        // if (score > this.highestScore) {
        //   this.saveHeighestScore(score)
        // }
    },
    saveHeighestScore: function (score) {
        let verifyData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

        if (verifyData) {
            let expire = this.getNextSunday();
            let vData = {
                ts: expire,
                data: verifyData
            };
        } else {
            let vData = '';
        }

        // _storage2.default.saveHeighestScore(score);
        // _storage2.default.saveActionData(vData);
        this.highestScore = score;
    },
    saveWeekBestScore: function () {
        let score = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        let data = {
            ts: this.getNextSunday(),
            data: score
        };
        // _storage2.default.saveWeekBestScore(data);
    },
    getActionData: function () {
        return '';//_storage2.default.getActionData();
    },
    getHighestScore: function () {
        return this.highestScore;
    },
    saveFriendsScore: function (data) {
        this.friendsScore = data;
        let formatData = {
            ts: this.getNextSunday(),
            data: data
        };
        // _storage2.default.saveFriendsScore(formatData);
    },
    getSessionId: function () {
        return '';
    },
    getPkId: function () {
        return '';
    },
    clearPkId: function () {

    },
    clearShareTicket: function () {

    },
    setGameId: function (id) {

    },

    clearGameId: function () {

    },
    clearGameTicket: function () {

    },
    setObserveInfo: function (opt) {
        this.observeInfo.headimg = opt.headimg;
        this.observeInfo.nickName = opt.nickName;
    },
    clearObserveInfo: function () {
        this.observeInfo.headimg = null;
        this.observeInfo.nickName = null;
    },
    getNextSunday: function () {
        let now = new Date();
        let day = now.getDay();
        now.setHours(0, 0, 0, 0);
        let expire = now.valueOf() + (8 - day) % 7 * 24 * 60 * 60 * 1000;
        return expire;
    },
};

export default GameModel;
