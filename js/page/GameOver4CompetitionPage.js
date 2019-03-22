'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import {ShareType} from '../service/ShareUtil';
import JumpSocketService from '../service/JumpSocketService';
import ShareUtil from '../service/ShareUtil';
import GameLog from '../shared/log/GameLog';

class GameOver4CompetitionPage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.name = 'doBetter';
        const logger = GameLog.getLogger('GameOver4CompetitionPage');
        this.logger = logger;
    }

    onShow(data,cb) {
        //画页面
        cb && cb();
        this.game.UI.hideScore();
        this.drawPage(data);
    }

    onHide() {
        console.log('GameOver4CompetitionPage onHide');
        this.clearZaijiezailiTimer();
        this.hide();
    }

    drawPage(data){
        this.showGameOver4Competition(data);
    }

    // 再接再厉页面
    showGameOver4Competition(data){
        //游戏结束页
        const self = this;
        console.log('得分:'+this.game.currentScore);
        const score = this.game.currentScore;
        const time = this.game.timeUse4Competition;
        let ps = {championshipId:this.game.championshipId,score:score,time:time};
        if (data){
            //从获奖信息页返回的
            this.exceedPeople = data.exceed;
            ps.exceed = data.exceed;
        } else{
            //从游戏直接跳过来的
            JumpSocketService.endGame4Compete(ps,function (err,data) {
                let exceed = 0;
                if(!err){
                    console.log('比赛场 结束 成功');
                    console.log(data);
                    this.logger.info(data);
                    exceed = data.exceed;//超越人数
                    self.exceedPeople = data.exceed;
                    self._drawPassPeopleNum(exceed);
                    this.gameCtrl.queryIsNeed2ShowCongratulation({exceed:exceed});
                }else{
                    console.error('比赛场 结束 失败');
                    console.error(err);
                    this.logger.error(err);
                }
            }.bind(this));
        }
        this.model.setScore(score);
        ps.targetScore = this.game.championshipInfo.targetScore || 20;
        ps.registerEndTime = this.game.championshipInfo.registerEndTime || 0;
        ps.endTime = this.game.championshipInfo.championshipEndTime || 0;
        ps.shareContent = ShareUtil.placeHolderText(ShareType.kHelp);
        this._drawDoBetter4Competition(ps);
        this.clearZaijiezailiTimer();
        this.zaijiezailiTimer = setInterval(function () {
            let nowTime = new Date().getTime();
            let registerEndTime = this.game.championshipInfo.registerEndTime;
            if (nowTime >= registerEndTime){
                //置灰再来一局button
                this.disableGameAgain4Competition();
                this.clearZaijiezailiTimer();
            }
        }.bind(this),1000);
        this.gameCtrl.queryIsNeed2ShowCongratulation();
    }

    //画再接再厉页面
    _drawDoBetter4Competition(opt){
        let passNum = opt.exceed || 0;
        const score = opt.targetScore-opt.score;
        const registerEndTime = opt.registerEndTime;
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
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
        //再接再厉
        this._drawImageCenter('res/img/battle/zaijiezaili.png', this._cxx(217+317/2), this._cyy(268+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+passNum+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._drawImageCenter('res/img/battle/zaijiedetu.png', this._cxx(155+440/2), this._cyy(407+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('您离获奖只差'+score+'分，继续努力吧！',this._cxx(141+469/2),this._cyy(732+26/2));
        const againBtn = new Button(CanvasBase.getCanvas('btn'));
        againBtn.origin = {x:this._cxx(180),y:this._cyy(818)};
        againBtn.size = {width:this._s(390),height:this._s(130)};
        againBtn.tag = 'againBtn4DoBetter';
        const nowTime = new Date().getTime();
        if (registerEndTime > nowTime){
            againBtn.image = 'res/img/battle/another_game.png';
        }else{
            againBtn.image = 'res/img/battle/another_huise.png';
        }
        againBtn.show();
        againBtn.onClick = function (sender) {
            this.gameCtrl.clickGameAgain4Competition(sender);
        }.bind(this);
        const helpBtn = new Button(CanvasBase.getCanvas('btn'));
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(978)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/qiuzhuhaoyou.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            this.clickHelp4Competition(sender);
        }.bind(this);

        if(opt.shareContent){
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(13);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(opt.shareContent,this._cxx(46+661/2),this._cyy(1159+26/2));
        }
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
    //置灰再来一局button
    disableGameAgain4Competition(){
        let ctx = CanvasBase.getContext('bg');
        let ctx1 = CanvasBase.getContext('btn');
        ctx.clearRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        ctx1.clearRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        this._drawImageCenter('res/img/battle/another_huise.png', this._cxx(180+390/2), this._cyy(818+130/2), this._s(390), this._s(130), 'bg', null, this.imgid['bg']);
        let againBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),'againBtn4DoBetter');
        if (againBtn){
            againBtn.destroy();
        }
        this._updatePlane('bg');
        this._updatePlane('btn');
    }

    clickHelp4Competition(sender){
        sender && sender.disable();
        const type = ShareType.kHelp;
        //调分享
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            if (this.hasShare2GetRevival){
                setTimeout(function () {
                    this.showRankToast('您已获得复活卡');
                }.bind(this),500);
                sender && sender.enable();
            }else {
                // 复活卡+1 逻辑
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

    showRankToast(text,cb){
        this.gameCtrl.showRankToast(text,cb);
    }

    clearZaijiezailiTimer(){
        if (this.zaijiezailiTimer){
            clearInterval(this.zaijiezailiTimer);
            this.zaijiezailiTimer = null;
        }
    }

}

export default GameOver4CompetitionPage;