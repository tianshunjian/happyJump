'use strict';

import RankList from '../base/RankList';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';
import JumpSocketService from '../service/JumpSocketService';
import {ShareType} from '../service/ShareUtil';
import ShareUtil from '../service/ShareUtil';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

class PrizeRecordPage extends PageBase{
    constructor(game) {
        console.log('PrizeRecordPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'prizeRecord';
        const logger = GameLog.getLogger('PrizeRecordPage');
        this.logger = logger;
    }
    onShow(sender,cb) {
        const that = this;
        let ps = {
            championshipMode:'championshipJumper'
        };
        JumpSocketService.prizeRecord(ps,function (err,result) {
            if(!err){
                cb && cb();
                that.logger.info(result);
                that.showPrizeRecord(result);
                that.gameCtrl.queryIsNeed2ShowCongratulation();
            }else{
                that.game.UI.showToast('网络数据请求错误('+err.code+')',function () {
                    sender && sender.enable();
                });
                PageCtrl.popPage(sender);
                that.logger.error(err);
            }
        });
    }

    onHide() {
        console.log('PrizeRecordPage  onHide');
        this.hide();
    }

    showPrizeRecord(opt){
        CanvasBase._updateClip('prizeRecord');
        this._drawPrizeRecord(opt);
    }

    _drawPrizeRecord(opt){
        //获奖记录
        console.log('_drawPrizeRecord');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1120),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1095),10*this.Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(97.1),10*this.Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiang.png', this._cxx(375), this._cyy(155), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(CanvasBase.getCanvas('btn'));//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            PageCtrl.popPage();
        }.bind(this);
        const xuanYaoBtn = new Button(CanvasBase.getCanvas('btn'));//主页按钮
        xuanYaoBtn.origin = {x:this._cxx(240),y:this._cyy(455)};
        xuanYaoBtn.size = {width:this._s(270),height:this._s(104)};
        xuanYaoBtn.image = 'res/img/battle/xuanyaoyixiaxiao.png';
        xuanYaoBtn.show();
        xuanYaoBtn.onClick = function (sender) {
            //点击事件 TODO
            this.clickCongratulationShare(sender);
        }.bind(this);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.font = this._cf(15);
        ctx.fillText('获奖金额', this._cxx(375), this._cyy(305));
        ctx.font = this._cf(30,true);
        ctx.fillStyle = '#FFC600';
        ctx.textBaseline = 'middle';
        //总奖金数 totalBonus
        let totalBonus = opt.totalBonus.toString() || '0';
        if (parseInt(totalBonus) < 0){
            totalBonus = '0';
        }
        let bonusLength = 50+totalBonus.length*50;
        ctx.fillText('¥', this._cxx(375-bonusLength/2+25), this._cyy(389));
        for(let i = 0;i<totalBonus.length;i++){
            if(totalBonus[i] != '.'){
                let w4Num = totalBonus[i]==1 ? 25 : 50;
                this._drawImageCenter(Config.SquareNumBigYellow[totalBonus[i]],this._cxx(375-bonusLength/2 + 50 + 25 + i*50),this._cyy(389),this._s(w4Num),this._s(54),'bg',null,this.imgid['bg']);
            }else{
                ctx.fillText('.', this._cxx(375-bonusLength/2 + 50 + 25 + i*50), this._cyy(389));
            }
        }

        ctx.font = this._cf(15);
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.fillText('参赛次数', this._cxx(180), this._cyy(621));
        ctx.fillText('获奖次数', this._cxx(375), this._cyy(621));
        ctx.fillText('最佳排名', this._cxx(570), this._cyy(621));
        ctx.font = this._cf(25);
        ctx.fillStyle = '#4E4E4E';
        ctx.font = this._cf(25,true);
        const totalCount = opt.totalCount.toString()||'0';//参赛次数
        const winCount = opt.winCount.toString()||'0';//获奖次数
        let bestRanking = opt.bestRanking >0 ? opt.bestRanking.toString() : '-';//最佳排名
        for(let i = 0;i < totalCount.length;i++ ){
            let w4Num = totalCount[i]==1 ? 14 : 24;
            this._drawImageCenter(Config.SquareNumSmallBlack[totalCount[i]],this._cxx(180-totalCount.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
        }
        for(let i = 0;i < winCount.length;i++ ){
            let w4Num = winCount[i]==1 ? 14 : 24;
            this._drawImageCenter(Config.SquareNumSmallBlack[winCount[i]],this._cxx(375-winCount.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
        }
        if(bestRanking == '-'){
            ctx.fillText(bestRanking, this._cxx(570), this._cyy(691));
        }else{
            for(let i = 0;i < bestRanking.length;i++ ){
                let w4Num = bestRanking[i]==1 ? 14 : 24;
                this._drawImageCenter(Config.SquareNumSmallBlack[bestRanking[i]],this._cxx(570-bestRanking.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
            }
        }
        ctx.strokeStyle = 'rgba(78,78,78,0.6)';
        ctx.lineWidth = 1 * this.Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(93), this._cyy(763));
        ctx.lineTo(this._cxx(653), this._cyy(763));
        ctx.stroke();
        ctx.closePath();

        const historyList = opt.historyList;
        if(historyList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            ctx.font = this._cf(15);
            ctx.fillText('暂无获奖记录', this._cxx(375), this._cyy(955));
            ctx.fillText('快去参加比赛赚红包吧~', this._cxx(375), this._cyy(1003));
        }else{
            RankList.renderRankList(historyList,'prizeRecord');
        }
        this._updatePlane('bg');
    }

    clickCongratulationShare(sender){
        sender && sender.disable();
        const self = this;
        ShareUtil.shareAppMessage(ShareType.kXuanYao,function () {
            ///分享成功
            setTimeout(function () {
                self.gameCtrl.showRankToast('分享成功');
            },500);
            sender && sender.enable();
        },function (res) {
            ///分享失败
            console.log(res);
            setTimeout(function () {
                self.gameCtrl.showRankToast('分享失败');
            },500);
            sender && sender.enable();
        });
    }
}


export default PrizeRecordPage;