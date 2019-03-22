'use strict';

import Button from '../base/Button';
import PageBase from '../base/PageBase';
import CanvasBase from '../base/CanvasBase';


class NextFight4CompetePage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'xiacizaizhan';
    }

    onShow(data,cb) {
        this.game.UI.hideScore();
        cb && cb();
        //画页面
        this.drawPage(data);

        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    onHide() {
        console.log('NextFight4CompetePage onHide');
        this.hide();
    }

    drawPage(data){
        this._drawNextFight();
    }

    //画下次再战页面
    _drawNextFight(){
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(474),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(454),10*this.Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('很遗憾，比赛时间到了',this._cxx(201+348/2),this._cyy(519+26/2));
        const nextBtn = new Button(CanvasBase.getCanvas('btn'));
        nextBtn.origin = {x:this._cxx(240),y:this._cyy(625)};
        nextBtn.size = {width:this._s(270),height:this._s(104)};
        nextBtn.image = 'res/img/battle/xiacizaizhan.png';
        nextBtn.show();
        nextBtn.onClick = function () {
            this.gameCtrl.clickNextFight4Competition();
        }.bind(this);
        this._updatePlane('bg');
    }

}

export default NextFight4CompetePage;