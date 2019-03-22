'use strict';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import CanvasBase from '../base/CanvasBase';
import JumpSocketService from '../service/JumpSocketService';
import {ShareType} from '../service/ShareUtil';
import ShareUtil from '../service/ShareUtil';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

class CongratulationPage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'congratulation';
        const logger = GameLog.getLogger('CongratulationPage');
        this.logger = logger;
    }

    onShow(opt,cb) {
        //画页面
        cb && cb();
        this.awardInfo = opt;
        this.showCongratulation(opt);
    }

    onHide() {
        console.log('CongratulationPage onHide');
        this.hide();
    }

    showCongratulation(opt){
        console.log('获取 恭喜获奖 信息');
        if (opt){
            //从详情返回的，直接展示
            this.awardInfo = opt;
            this._drawCongratulation(opt);
        }
    }
    _drawCongratulation(opt){
        let cash = opt.itemCount || '0';//红包金额
        let isLastChampionship = opt.isLastChampionship;
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272),this._s(650),this._s(724),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(272),this._s(650),this._s(700),10*this.Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(270),this._s(650),this._s(77.1),10*this.Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/gongxihuojiang.png', this._cxx(217+317/2), this._cyy(217+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let originY = 380;
        this._drawImageCenter('res/img/battle/chenggong.png', this._cxx(148+440/2), this._cyy(originY+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = 'rgb(254,188,10)';
        ctx.font = this._cf(20);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        let cashStr = '￥'+cash;
        ctx.fillText(cashStr,this._cxx(375),this._cyy(682+26/2));
        let index = cashStr.indexOf('.');
        let len;
        if (index>=0){
            len = (cashStr.length-1)*24+5;
        }else{
            len = cashStr.length*24;
        }
        ctx.fillStyle = '#4e4e4e';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(17);
        ctx.fillText('恭喜获得',this._cxx(375-len/2-136/2),this._cyy(684+26/2));
        ctx.fillText('现金红包',this._cxx(375+len/2+136/2),this._cyy(684+26/2));

        //炫耀
        const helpBtn = new Button(CanvasBase.getCanvas('btn'));
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(758)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/xuanyao.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            this.clickCongratulationShare(sender);
        }.bind(this);
        if (isLastChampionship){
            //查看详情
            const stepBtn = new Button(CanvasBase.getCanvas('btn'));
            stepBtn.origin = {x:this._cxx(310), y:this._cyy(900)};
            stepBtn.size = {width:this._s(145),height:this._s(30)};
            stepBtn.show();
            stepBtn.onClick = function (sender) {
                this.clickCongratulationDetail(sender);
            }.bind(this);
            ctx.fillStyle = '#4e4e4e';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = this._cf(13);
            ctx.fillText('查看详情 >',this._cxx(311+129/2),this._cyy(906+26/2));
        }
        //关闭按钮
        const closeBtn = new Button(CanvasBase.getCanvas('btn'));
        closeBtn.origin = {x:this._cxx(335),y:this._cyy(1027)};
        closeBtn.size = {width:this._s(80),height:this._s(80)};
        closeBtn.image = 'res/img/close 2.png';
        closeBtn.show();
        closeBtn.onClick = function () {
            PageCtrl.popPage(this.awardInfo.exceedInfo);
        }.bind(this);
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
    //恭喜获奖 —— 查看详情
    clickCongratulationDetail(sender){
        sender && sender.disable();
        let that = this;
        let ps = {
            game:'jumper',
            sortBy:'championshipJumperScore',// 'RedPocket' 'LeCard'
            top:100
        };
        JumpSocketService.prizeRankLast(ps,function (err,result) {
            if(!err){
                console.log(result);
                that.logger.info(result);
                const rankList = result.rankList;
                if (rankList){
                    const sortedResult = rankList.sort(function (v1,v2) {
                        return (v1.rank - v2.rank);
                    });
                    result.rankList = sortedResult;
                }
                result.awardPageInfo = that.awardInfo;
                that.gameCtrl.clickCongratulationDetail(result);
            }else {
                console.log('err----'+JSON.stringify(err));
                that.logger.error(err);
                that.gameCtrl.showRankToast('网络数据请求错误('+err.code+')',function () {
                    sender && sender.enable();
                });
            }
        });
    }
}

export default CongratulationPage;