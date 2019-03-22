'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import PageCtrl from '../controller/PageCtrl';

class PickOnce extends PageBase{
    constructor(game){
        console.log('pickOnce');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'pickOnce';
    }

    onShow(data,cb) {
        //画页面
        cb && cb();
        this.drawPage(data);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    onHide() {
        console.log('PickOnce onHide');
        this.hide();
    }

    drawPage(result){
        this._drawPop1(result);
    }

    _drawPop1 (opt) {
        //抽奖，抽一次的结果页
        const index = opt.index;
        // 绘制背景图
        console.log('_drawPop1');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(771),10 * this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(750),10  * this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(77.1),10  * this.Dpr,'bg');
        ctx.fill();
        const nine = opt.nine;
        ctx.font = this._cf(20);
        if(nine[index].type !== 0){
            this._drawImageCenter(nine[index].imgLuck, this._cxx(375), this._cyy(542), this._s(160), this._s(160), 'bg', null, this.imgid['bg']);
            ctx.textAlign = 'center';
            ctx.fillText(nine[index].text,this._cxx(375),this._cyy(680));
        }else{
            this._drawImageCenter(nine[index].imgLuck, this._cxx(375), this._cyy(542), this._s(200), this._s(200), 'bg', null, this.imgid['bg']);
        }
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0,0,this.WIDTH,this.HEIGHT);
        this._drawImageCenter('res/img/congratulations.png', this._cxx(375), this._cyy(266), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        const yesBtn = new Button(CanvasBase.getCanvas('btn'));//确定按钮
        yesBtn.center = {x:this._cxx(375),y:this._cyy(840)};
        yesBtn.size = {width:this._s(270),height:this._s(104)};
        yesBtn.image = 'res/img/determine.png';
        yesBtn.show();
        yesBtn.onClick = function () {
            // !!this.options.onShowPick &&this.options.onShowPick();
            PageCtrl.popPage();
        }.bind(this);
        const backBtn = new Button(CanvasBase.getCanvas('btn'));//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            // !!this.options.onShowPick &&this.options.onShowPick();
            PageCtrl.popPage();
        }.bind(this);
        this._updatePlane('bg');
    }
}


export default PickOnce;