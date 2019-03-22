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

class PrizeRankLastPage extends PageBase{
    constructor(game) {
        console.log('PrizeRankLastPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'prizeRankLast';
        this.cachePrizeRankLast = null;//榜单缓存
        const logger = GameLog.getLogger('PrizeRankLastPage');
        this.logger = logger;
    }
    onShow(sender,cb) {
        if(this.cachePrizeRankLast && (Date.now() < this.cachePrizeRankLast.dataTime)){
            this.showPrizeRankLast(this.cachePrizeRankLast.data);
            this.gameCtrl.queryIsNeed2ShowCongratulation();
        }else{
            const that = this;
            let ps = {
                game: 'jumper',
                sortBy: 'championshipJumperScore',
                top: 100
            };
            JumpSocketService.prizeRankLast(ps, function (err, result) {
                if (!err) {
                    cb && cb();
                    that.logger.info(result);
                    const rankList = result.rankList;
                    if (rankList) {
                        const sortedResult = rankList.sort(function (v1, v2) {
                            return (v1.rank - v2.rank);
                        });
                        result.rankList = sortedResult;
                    }
                    that.cachePrizeRankLast = {
                        data: result,
                        dataTime: result.endTime
                    };

                    that.showPrizeRankLast(result);
                    that.gameCtrl.queryIsNeed2ShowCongratulation();
                } else {
                    that.game.UI.showToast('网络异常，请重试');
                    sender && sender.enable();
                    PageCtrl.popPage(sender);
                    that.logger.error(err);
                }
            });
        }
    }

    showPrizeRankLast(result){
        CanvasBase._updateClip('prizeRankLast');//TODO 放置位置
        this.drawPage(result);
    }

    onHide() {
        console.log('PrizeRankLastPage onHide');
        this.hide();
    }

    drawPage(opt){
        //获奖榜单，上期排行榜
        console.log('PrizeRankLastPage drawPage');
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
            PageCtrl.popPage(sender);
            this.cachePrizeRankLast = null;//回主页时清除缓存
        }.bind(this);

        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFC600';
        ctx.font = this._cf(15);
        ctx.fillText('上期排行榜', this._cxx(230), this._cyy(228));
        ctx.fillRect(this._cxx(230),this._cyy(269),this._s(150),this._s(5));
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('奖金榜', this.WIDTH - this._cxx(230), this._cyy(228));

        const MoneyBtn = new Button(CanvasBase.getCanvas('btn'));//主页按钮
        MoneyBtn.origin = {x:this._cxx(390),y:this._cyy(215)};
        MoneyBtn.size = {width:this._s(150),height:this._s(80)};
        MoneyBtn.show();
        MoneyBtn.onClick = function () {
            //点击事件
            !!this.gameCtrl.showPrizeRankMoney && this.gameCtrl.showPrizeRankMoney();
        }.bind(this);

        if(opt.rankList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(15);
            ctx.fillText('比赛马上开始，敬请期待！', this._cxx(375), this._cyy(667));
        }else{
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.textAlign = 'center';
            ctx.fillText('上期奖金', this._cxx(230), this._cyy(334));
            ctx.fillText('获奖人数', this._cxx(521), this._cyy(334));
            let lastMoney = opt.totalBonus.toString();
            let lastPeople = opt.totalWinner.toString();

            if(parseInt(lastMoney) >= 10000){
                lastMoney = (parseInt(lastMoney)/10000).toString();//单位换成万
                if(lastMoney.length > 5){
                    lastMoney = lastMoney.substr(0,5);//太长就取前5位
                }
                let lastMoneyLength = lastMoney.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoneyLength/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoneyLength/2 + 12 +i*24), this._cyy(418));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(230-lastMoneyLength/2 + lastMoneyLength +10), this._cyy(418));
            }else{
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoney.length*24/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoney.length*24/2 + 12 +i*24), this._cyy(418));
                    }
                }
            }
            if(parseInt(lastPeople) >= 10000){
                lastPeople = (parseInt(lastPeople)/10000).toString();//单位换成万
                if(lastPeople.length > 5){
                    lastPeople = lastPeople.substr(0,5);//太长就取前5位
                }
                let lastPeopleLength = lastPeople.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeopleLength/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeopleLength/2 + 12 +i*24), this._cyy(418));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(521-lastPeopleLength/2 + lastPeopleLength +10), this._cyy(418));
            }else{
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeople.length*24/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeople.length*24/2 + 12 +i*24), this._cyy(418));
                    }
                }
            }
            //分割线
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1 * this.Dpr;
            ctx.beginPath();
            ctx.moveTo(this._cxx(93), this._cyy(492));
            ctx.lineTo(this._cxx(653), this._cyy(492));
            ctx.moveTo(this._cxx(93), this._cyy(1085));
            ctx.lineTo(this._cxx(653), this._cyy(1085));
            ctx.stroke();
            ctx.closePath();
            let myRank = opt.myRank.toString();
            let myValue = '-';
            if (opt.myValue >= 0){
                myValue = this.number2MinSec(opt.myValue);
            }
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
            ctx.textAlign = 'left';
            this._drawImageCircle(UserService.avatarUrl, this._cxx(215), this._cyy(1166), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            ctx.font = '26px Arial';
            let userName = UserService.nickName;
            if(userName.length > 8){
                userName = userName.substr(0,8)+'...';
            }
            ctx.fillText(userName, this._cxx(264), this._cyy(1166));
            ctx.textAlign = 'right';
            ctx.font = this._cf(17,true);
            if(myValue == '-'){
                ctx.fillText(myValue, this.WIDTH - this._cxx(90), this._cyy(1166));
            }else{
                let item = myValue.toString().split('').reverse().join('');
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let j = 0;
                for(let i = 0;i < item.length;i++){
                    if(item[i] != '"' && item[i] != '\''){
                        this._drawImageCenter(Config.rankNumYellow[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                    }else{
                        if(item[i] == '"'){
                            ctx.fillText('"', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), this._cyy(1166));
                        }else{
                            j += j + 1;
                            ctx.fillText('\'', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), this._cyy(1166));
                        }
                    }
                }
            }
            RankList.renderRankList(opt.rankList,'prizeRankLast');
        }
        this._updatePlane('bg');
    }

}

export default PrizeRankLastPage;