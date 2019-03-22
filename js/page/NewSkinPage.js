'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import UserService from '../service/UserService';
import PageCtrl from '../controller/PageCtrl';

class NewSkinPage extends PageBase {

    constructor(game){
        console.log('NewSkinPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'newSkin';
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
        let currentSkin = UserService.currentSkin();
        this._drawSkinBg();
        if(currentSkin == 0){
            this._drawSkinDone(opt);
        }else if(currentSkin == 1){
            this._drawSkinDoneYellow(opt);
        }
    }

    _drawSkinBg(){
        //已解锁皮肤界面的背景
        console.log(' _drawSkinBg');
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
        this._drawImageCenter('res/img/skin_center.png', this._cxx(375), this._cyy(274), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
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

    _drawSkinDone(opt){
        // 绘制刚解锁皮肤的界面，选中的是默认的红色皮肤
        console.log('_drawSkinDone');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(this._cxx(92), this._cyy(460),this. _s(570), this._s(370));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(92), this._cyy(460),this._s(570),this. _s(370));
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        const oldSkinBtn = new Button(CanvasBase.getCanvas('btn'));//原始皮肤点击区域
        oldSkinBtn.origin = {x:this._cxx(95),y:this._cyy(470)};
        oldSkinBtn.size = {width:this._s(260),height:this._s(350)};
        oldSkinBtn.show();
        oldSkinBtn.onClick = function () {
            UserService.switchDefaultSkin(0);
            this._drawSkinDone();//界面置成原皮肤样式
        }.bind(this);
        const newSkinBtn = new Button(CanvasBase.getCanvas('btn'));//新皮肤点击区域
        newSkinBtn.origin = {x:this._cxx(395),y:this._cyy(470)};
        newSkinBtn.size = {width:this._s(260),height:this._s(350)};
        newSkinBtn.show();
        newSkinBtn.onClick = function () {
            //点击皮肤中心中新皮肤的区域
            UserService.switchDefaultSkin(1);
            this._drawSkinDoneYellow();//界面置成新皮肤样式
        }.bind(this);
        ctx.strokeStyle = '#D4D4D4';
        ctx.lineWidth = 2 * this.Dpr;
        this._roundedRectR(this._cxx(395),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg',null, this.imgid['bg']);
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
        this._drawImageCenter('res/img/noChoice.png', this._cxx(525), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._updatePlane('bg');
    }

    _drawSkinDoneYellow(opt){
        // 绘制解锁的新黄色皮肤
        console.log('_drawSkinDoneYellow');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(this._cxx(92), this._cyy(460), this._s(570), this._s(370));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(92), this._cyy(460),this._s(570), this._s(370));
        ctx.strokeStyle = '#D4D4D4';
        ctx.lineWidth = 2;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(395),this._cyy(470),this._s(260),this._s(350),0, 'bg');

        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg',null, this.imgid['bg']);
        const oldSkinBtn = new Button(CanvasBase.getCanvas('btn'));//原始皮肤点击区域
        oldSkinBtn.origin = {x:this._cxx(95),y:this._cyy(470)};
        oldSkinBtn.size = {width:this._s(260),height:this._s(350)};
        oldSkinBtn.show();
        oldSkinBtn.onClick = function () {
            UserService.switchDefaultSkin(0);
            this._drawSkinDone();//界面置成原皮肤样式
        }.bind(this);
        const newSkinBtn = new Button(CanvasBase.getCanvas('btn'));//新皮肤点击区域
        newSkinBtn.origin = {x:this._cxx(395),y:this._cyy(470)};
        newSkinBtn.size = {width:this._s(260),height:this._s(350)};
        newSkinBtn.show();
        newSkinBtn.onClick = function () {
            //点击皮肤中心中新皮肤的区域
            UserService.switchDefaultSkin(1);
            this._drawSkinDoneYellow();//界面置成新皮肤样式
        }.bind(this);
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
        this._drawImageCenter('res/img/choice.png', this._cxx(525), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/noChoice.png', this._cxx(222), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._updatePlane('bg');
    }

}

export default NewSkinPage;