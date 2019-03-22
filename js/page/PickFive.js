'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import PageCtrl from '../controller/PageCtrl';

class PickFive extends PageBase{
    constructor(game){
        console.log('pickFive');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'pickFive';
    }

    onShow(data,cb) {
        //画页面
        cb && cb();
        this.drawPage(data);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    onHide() {
        console.log('pickFive onHide');
        this.hide();
    }

    drawPage(result){
        this._drawPop5(result);
    }

    _drawPop5(opt) {
        // 绘制中奖结果，五个奖项的
        const index5 = opt.index;
        console.log('Rank _drawPop5');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#3D3D3D';
        ctx.strokeStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(771),10 * this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(750),10  * this.Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#3D3D3D';
        ctx.strokeStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(77.1),10  * this.Dpr,'bg');
        ctx.fill();
        ctx.font = this._cf(15);
        ctx.fillStyle = '#3D3D3D';

        let nine = opt.nine;
        let hasShowSkin = false;
        const pos4Image = [{x:180,y:460},{x:375,y:460},{x:580,y:460},{x:275,y:683},{x:475,y:683}];
        const pos4Text = [{x:180,y:571},{x:375,y:571},{x:580,y:571},{x:275,y:794},{x:475,y:794}];
        for (let i=0;i<index5.length;++i){
            if (hasShowSkin){
                if (nine[index5[i]].type==3){
                    nine[index5[i]].text = '乐卡x4';
                    nine[index5[i]].imgLuck = 'res/img/prize_card.png';
                    nine[index5[i]].img = 'res/img/card_big_luck.png';
                }
            }
            this._drawImageCenter(nine[index5[i]].imgLuck, this._cxx(pos4Image[i].x), this._cyy(pos4Image[i].y), this._s(160), this._s(160), 'bg', null, this.imgid['bg']);
            ctx.textAlign = 'center';
            if(nine[index5[i]].type !== 0){
                ctx.fillText(nine[index5[i]].text,this._cxx(pos4Text[i].x),this._cyy(pos4Text[i].y));
            }
            if (nine[index5[i]].type==3){
                hasShowSkin = true;
            }
        }
        ctx.textAlign = 'center';
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        this._drawImageCenter('res/img/congratulations.png', this._cxx(375), this._cyy(266), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);

        const yesBtn = new Button(CanvasBase.getCanvas('btn'));//确定按钮
        yesBtn.center = {x:this._cxx(375),y:this._cyy(910)};
        yesBtn.size = {width:this._s(270),height:this._s(104)};
        yesBtn.image = 'res/img/determine.png';
        yesBtn.show();
        yesBtn.onClick = function () {
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

export default PickFive;