'use strict';

// var GamePage = function () {
//     function GamePage(game) {
//         // _classCallCheck(this, GamePage);
//         console.log('GamePage constructor. ');
//
//         this.game = game;
//         this.model = this.game.gameModel;
//         this.full2D = this.game.full2D;
//         this.UI = this.game.UI;
//         this.viewer = this.game.viewer;
//         this.name = 'game';
//         console.log('GamePage viewer = ' + this.viewer);
//     }
//
//     return GamePage;
// }();
//
// GamePage.prototype = {
//     show: function () {
//         // this.UI.observe.visible = true
//
//         this.UI.showScore();
//         this.full2D.hideOverAgain4H5();
//
//         // let frustumSize = Config.FRUSTUMSIZE;
//         // this.UI.scoreText.obj.position.y = frustumSize/2-2;
//         // this.UI.scoreText.obj.position.x = -13;
//
//         // this.UI.scoreText.obj.position.y = 26;
//         // this.UI.scoreText.obj.position.x = -15;
//         // this.UI.scoreText.changeStyle({ textAlign: 'left' });
//         //this.viewer.open();
//     },
//
//     hide: function () {
//         //this.viewer.close();
//         this.UI.hideScore();
//     }
// };
import PageBase from '../base/PageBase';

if (!window.WechatGame){
    //H5结束页面
    var overAgainMask = document.getElementById('over_mask');}


class GamePage extends PageBase{
    constructor(game) {
        console.log('GamePage');
        super(game);
        this.game = game;
        this.UI = this.game.UI;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.pageBase = this.game.pageBase;
        this.viewer = this.game.viewer;
        this.name = 'game';
    }
    onShow(result,cb) {
        cb && cb();
        this.UI.showScore();
        this.hideOverAgain4H5();
    }

    onHide() {
        console.log('GamePage onHide');
        this.UI.hideScore();
    }

    hideOverAgain4H5(){
        if (!window.WechatGame){
            overAgainMask.style.display = 'none';
        }
    }

}

export default GamePage;
