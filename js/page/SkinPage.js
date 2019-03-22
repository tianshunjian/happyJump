'use strict';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import PageCtrl from '../controller/PageCtrl';

class SkinPage extends PageBase {

    constructor(game){
        console.log('SkinPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'skin';
    }

    onShow(result,cb) {
        cb && cb();
        this.drawPage(result);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    onHide() {
        console.log('SkinPage onHide');
        this.hide();
    }

    drawPage(opt){
        // 皮肤界面，待解锁部分
        console.log('SkinPage drawPage');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.strokeStyle = '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(724.1),10*this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(277),this._s(650),this._s(700),10*this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(77.1),10*this.Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        this._drawImageCenter('res/img/skin_center.png', this._cxx(375), this._cyy(274), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg', function () {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(this._cxx(395), this._cyy(472),this._s(260), this._s(350));
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(17);
            ctx.fillText('待解锁', this._cxx(528), this._cyy(780));
        }.bind(this), this.imgid['bg']);
        //横线
        ctx.strokeStyle = '#D8D8D8';
        ctx.lineWidth = 1 * this.Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(111), this._cyy(738));
        ctx.lineTo(this._cxx(339), this._cyy(738));
        ctx.moveTo(this._cxx(411), this._cyy(738));
        ctx.lineTo(this._cxx(639), this._cyy(738));
        ctx.stroke();
        ctx.closePath();
        this._drawImageCenter('res/img/choice.png', this._cxx(222), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0, 0, this.WIDTH, this.HEIGHT);

        const backBtn = new Button(CanvasBase.getCanvas('btn'));//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            PageCtrl.popToRootPage();
        }.bind(this);
        this._updatePlane('bg');
    }

}
export default SkinPage;