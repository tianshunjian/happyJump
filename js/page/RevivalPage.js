'use strict';

import Button from '../base/Button';
import PageBase from '../base/PageBase';
import CanvasBase from '../base/CanvasBase';
import UserService from '../service/UserService';
import JumpSocketService from '../service/JumpSocketService';
import GameLog from '../shared/log/GameLog';

class RevivalPage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'revival';
        const logger = GameLog.getLogger('RevivalPage');
        this.logger = logger;
    }

    onShow(data,cb) {
        //画页面
        cb && cb();
        this.game.UI.hideScore();
        this.drawPage(data);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    onHide() {
        console.log('RevivalPage onHide');
        this.hide();
    }

    drawPage(data){
        this._drawRevival4Competition();
    }

    //画复活页面
    _drawRevival4Competition(){
        const revivalCount = UserService.revivalCard || 0;//获取复活卡数量
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
        this._drawImageCenter('res/img/battle/fuhuo.png', this._cxx(375), this._cyy(449), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        //使用复活卡
        const goBtn = new Button(CanvasBase.getCanvas('btn'));
        goBtn.center = {x:this._cxx(161+428/2),y:this._cyy(551+126/2)};
        goBtn.size = {width:this._s(428),height:this._s(126)};
        goBtn.onDisplay(function(){
            console.log('画剩余多少张');
            let ctx2 = CanvasBase.getContext('btn');
            ctx2.textBaseline = 'middle';
            ctx2.textAlign = 'center';
            ctx2.font = this._cf(13);
            ctx2.fillStyle = '#4e4e4e';
            ctx2.fillText('剩余'+revivalCount+'张', this._cxx(426+105/2), this._cyy(596+26/2));
            this._updatePlane('btn');
        }.bind(this));
        goBtn.image = 'res/img/battle/fuhuokaanniu.png';
        goBtn.show();
        goBtn.onClick = function (sender) {
            this.clickRevival4Competition(sender);
        }.bind(this);

        //点击跳过
        const stepBtn = new Button(CanvasBase.getCanvas('btn'));
        stepBtn.origin = {x:this._cxx(290), y:this._cyy(700)};
        stepBtn.size = {width:this._s(145),height:this._s(45)};
        stepBtn.show();
        stepBtn.onClick = function () {
            this.gameCtrl.clickStepOver4Competition();
        }.bind(this);

        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(16);
        ctx.fillText('点击跳过 >',this._cxx(301+120/2),this._cyy(709+26/2));
        this._updatePlane('bg');
    }

    //点击使用复活
    clickRevival4Competition(sender){
        sender && sender.disable();
        //复活卡减 1
        const ps = {championshipMode:'championshipJumper'};
        JumpSocketService.useRevivalCard(ps,function (err,result) {
            if (!err){
                console.log('使用复活卡成功');
                this.logger.info(result);
                UserService.revivalCard = result.restRevivedCard;
                this.gameCtrl.clickRevival4Competition();
            }else{
                console.error('使用复活卡失败');
                setTimeout(function () {
                    this.showRankToast('使用复活卡失败');
                }.bind(this),500);
                sender && sender.enable();
                this.logger.error(err);
            }
        }.bind(this));
    }

    showRankToast(text,cb){
        this.gameCtrl.showRankToast(text,cb);
    }

}

export default RevivalPage;