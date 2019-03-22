'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import {ShareType} from '../service/ShareUtil';
import JumpSocketService from '../service/JumpSocketService';
import ShareUtil from '../service/ShareUtil';
import GameLog from '../shared/log/GameLog';

class GameWin4CompetitionPage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'winAndDisplay';
        const logger = GameLog.getLogger('GameWin4CompetitionPage');
        this.logger = logger;
    }

    onShow(data,cb) {
        //画页面
        console.log('GameWin4CompetitionPage onShow');
        cb && cb();
        this.game.UI.hideScore();
        this.drawPage(data);
    }

    onHide() {
        console.log('GameWin4CompetitionPage onHide');
        this.hide();
    }

    drawPage(data){
        this.showGameWin4Competition(data);
    }

    showGameWin4Competition(data){
        let self = this;
        const score = this.game.currentScore;
        const time = this.game.timeUse4Competition;
        let ps = {championshipId:this.game.championshipId,score:score,time:time};
        if (data){
            //从获奖信息页返回的
            this.exceedPeople = data.exceed;
            ps.exceed = data.exceed;
        }else{
            JumpSocketService.endGame4Compete(ps,function (err,data) {
                if(!err){
                    console.log('比赛场 结束 成功');
                    console.log(data);
                    this.logger.info(data);
                    let exceed = data.exceed;//超越人数
                    self.exceedPeople = data.exceed;
                    self._drawPassPeopleNum(exceed);
                    this.gameCtrl.queryIsNeed2ShowCongratulation({exceed:exceed});
                }else{
                    console.error('比赛场 结束 失败');
                    console.error(err);
                    this.logger.error(err);
                    self.showRankToast('结束游戏失败('+err.code+')');
                }
            }.bind(this));
        }
        ps.targetScore = this.game.championshipInfo.targetScore || 2000;
        ps.shareContent = ShareUtil.placeHolderText(ShareType.kXuanYao);
        this._drawGameWin4Competition(ps);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }
    //达到目标分数页面 —— 炫耀一下，有复活卡
    clickShareWin4Competition(sender){
        sender && sender.disable();
        const type = ShareType.kXuanYao;
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            if (this.hasShare2GetRevival){
                setTimeout(function () {
                    this.showRankToast('您已获得复活卡');
                }.bind(this),500);
                sender && sender.enable();
            }else {
                // 复活卡+1逻辑
                JumpSocketService.sharedByType(type,function (err,result) {
                    if (!err){
                        console.log('复活卡+1 成功');
                        console.log(result);
                        this.logger.info(result);
                        this.hasShare2GetRevival = true;
                        setTimeout(function () {
                            this.showRankToast(result.text || '成功获得复活卡x1');
                        }.bind(this),500);
                    } else {
                        setTimeout(function () {
                            this.showRankToast('分享成功');
                        }.bind(this),500);
                        console.error('复活卡+1 失败');
                        console.error(err);
                        this.logger.error(err);
                    }
                    sender && sender.enable();
                }.bind(this));
            }
        }.bind(this),function (res) {
            ///分享失败
            console.log(res);
            setTimeout(function () {
                this.showRankToast('分享失败');
            }.bind(this),500);
            sender && sender.enable();
        }.bind(this));
    }

    //画达到目标得分页面
    _drawGameWin4Competition(opt){
        let passNum = opt.exceed || 0;
        const time = opt.time;
        const min = Math.floor(time/60);
        const sec = time%60;
        const score = opt.targetScore || 2000;
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0,0,this.WIDTH,this.HEIGHT);
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
        //回主页
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(CanvasBase.getCanvas('btn'));
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function (sender) {
            this.gameCtrl.showSessionInfo(sender);
        }.bind(this);
        //恭喜获奖
        this._drawImageCenter('res/img/battle/gongxihuojiang.png', this._cxx(217+317/2), this._cyy(268+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+passNum+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._drawImageCenter('res/img/battle/chenggong.png', this._cxx(148+440/2), this._cyy(414+30+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        let text = '成功跳到'+score+'分，本次用时'+min+'\''+sec+'"';
        ctx.fillText(text,this._cxx(127+496/2),this._cyy(701+30+26/2));
        //炫耀
        const helpBtn = new Button(CanvasBase.getCanvas('btn'));
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(818)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/xuanyao.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            this.clickShareWin4Competition(sender);
        }.bind(this);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        if (opt.shareContent){
            ctx.fillText(opt.shareContent,this._cxx(89+571/2),this._cyy(998+26/2));
        }
        ctx.font = this._cf(13);
        ctx.fillText('比赛结束后奖金自动到账',this._cxx(210+330/2),this._cyy(1228+26/2));
        this._updatePlane('bg');
    }

    //画超过多少人
    _drawPassPeopleNum(num){
        num = num>=0 ? num : 0;
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37));
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37));
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+num+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._updatePlane('bg');
    }

    showRankToast(text,cb){
        this.gameCtrl.showRankToast(text,cb);
    }

}

export default GameWin4CompetitionPage;