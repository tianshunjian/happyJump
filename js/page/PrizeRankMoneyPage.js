'use strict';

import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';
import JumpSocketService from '../service/JumpSocketService';
import RankList from '../base/RankList';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

class PrizeRankMoneyPage extends PageBase{
    constructor(game) {
        console.log('PrizeRankMoneyPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'prizeRankMoney';
        this.cachePrizeRankMoney = null;
        const logger = GameLog.getLogger('PrizeRankMoneyPage');
        this.logger = logger;
    }
    onShow(sender,cb) {

        if(this.cachePrizeRankMoney && (Date.now() < this.cachePrizeRankMoney.dataTime)){
            this.modeCtrl.showPrizeRankMoney(this.cachePrizeRankMoney.data);
            this.gameCtrl.queryIsNeed2ShowCongratulation();
        }else{
            const that = this;
            let ps = {
                game:'jumper',
                sortBy:'championshipJumperBonus',//
                top:10
            };
            JumpSocketService.prizeRank(ps,function (err,result) {
                if(!err){
                    cb && cb();
                    that.logger.info(result);
                    const rankList = result.rankList;
                    if (rankList){
                        const sortedResult = rankList.sort(function (v1,v2) {
                            return (v1.rank - v2.rank);
                        });
                        result.rankList = sortedResult;
                    }
                    that.showPrizeRankMoney(result);

                    that.cachePrizeRankMoney = {
                        data:result,
                        dataTime:result.nextRankTime
                    };
                    that.gameCtrl.queryIsNeed2ShowCongratulation();
                }else {
                    that.game.UI.showToast('网络异常，请重试');
                    sender && sender.enable();
                    PageCtrl.popPage(sender);
                    that.logger.error(err);
                }
            });
        }
    }

    onHide() {
        console.log('PrizeRankMoneyPage onHide');
        this.hide();
    }

    showPrizeRankMoney(result){
        CanvasBase._updateClip('prizeRankMoney');//TODO 放置位置
        this.drawPage(result);
    }

    drawPage(opt){
        console.log('_drawPrizeRankLast');
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
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*this.Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiangbangdan.png', this._cxx(375), this._cyy(156), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(CanvasBase.getCanvas('btn'));//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function (sender) {
            //点击事件
            !!this.gameCtrl.showSessionInfo && this.gameCtrl.showSessionInfo(sender);
            this.cachePrizeRankMoney = null;
        }.bind(this);

        const LastBtn = new Button(CanvasBase.getCanvas('btn'));//上期排行榜按钮
        LastBtn.origin = {x:this._cxx(230),y:this._cyy(215)};
        LastBtn.size = {width:this._s(150),height:this._s(80)};
        LastBtn.show();
        LastBtn.onClick = function (sender) {
            //点击事件
            !!this.gameCtrl.showPrizeRankLast && this.gameCtrl.showPrizeRankLast(sender);
        }.bind(this);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(15);
        ctx.fillText('上期排行榜', this._cxx(230), this._cyy(228));

        ctx.fillStyle = '#ffc600';
        ctx.textAlign = 'right';
        ctx.fillText('奖金榜', this.WIDTH - this._cxx(230), this._cyy(228));
        ctx.fillRect(this._cxx(429),this._cyy(269),this._s(90),this._s(5));

        if(opt.rankList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(15);
            ctx.fillText('比赛马上开始，敬请期待！', this._cxx(375), this._cyy(667));
        }else{
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1 * this.Dpr;
            ctx.beginPath();
            ctx.moveTo(this._cxx(93), this._cyy(1085));
            ctx.lineTo(this._cxx(653), this._cyy(1085));
            ctx.stroke();
            ctx.closePath();

            let myRank = opt.myRank.toString();
            let myValue = this.unInRankChange(opt.myValue);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            if(myRank == '-1'){
                myRank = '未上榜';
                ctx.font = '23px Arial';
                ctx.fillText(myRank, this._cxx(128), this._cyy(1166));
            }else{
                let item = myRank.toString();
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
                for(let i = 0 ;i < item.length;i++){
                    this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                }
            }
            this._drawImageCircle(UserService.avatarUrl, this._cxx(215), this._cyy(1166), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            ctx.font = '26px Arial';
            let userName = UserService.nickName;
            if(userName.length > 8){
                userName = userName.substr(0,8)+'...';
            }
            ctx.textAlign = 'left';
            ctx.fillText(userName, this._cxx(264), this._cyy(1166));
            ctx.textAlign = 'right';
            ctx.font = '32px Arial';
            if(myValue == '-'){
                ctx.fillText(myValue, this.WIDTH - this._cxx(90), this._cyy(1166));
            }else{
                let item = myValue.toString().split('').reverse().join('');
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let j = 0;
                for(let i = 0;i < item.length;i++){
                    if(item[i] != '.' ){
                        this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                    }else{
                        j += j + 1;
                        ctx.fillText('.', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), this._cyy(1166));
                    }
                }
                let i = item.length-1;
                let textX = 750-89-perWidth/2-i*perWidth - perInnerWidth*i - perWidth/2 - perInnerWidth - 10 + j *10;
                ctx.fillText('¥', this._cxx(textX), this._cyy(1166));
            }
            RankList.renderRankList(opt.rankList,'prizeRankMoney');
        }
        this._updatePlane('bg');
    }
}

export default PrizeRankMoneyPage;