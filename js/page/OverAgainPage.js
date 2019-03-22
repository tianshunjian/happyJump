'use strict';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';
import {ShareType} from '../service/ShareUtil';
import ShareUtil from '../service/ShareUtil';
import JumpSocketService from '../service/JumpSocketService';
import Utils from '../shared/service/Utils';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

if(!window.WechatGame){
    var overAgainScore = document.getElementById('over_score');
    var overAgainMask = document.getElementById('over_mask');
    var rankList4H5 = document.getElementById('rank_list');
}

class OverAgainPage extends PageBase{
    constructor(game) {
        console.log('OverAgainPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.pageBase = this.game.pageBase;
        this.name = 'overAgain';
        const logger = GameLog.getLogger('OverAgainPage');
        this.logger = logger;
    }

    onShow(result,cb){
        const score = this.game.currentScore;
        const time = this.game.timeUse4Competition;
        let ps = {championshipId:this.game.championshipId,score:score,time:time};
        JumpSocketService.endGame(ps,function(err,data){
            if(!err){
                ///更新总乐卡数
                this.logger.info(data);
                UserService.leCard = data.totalLeCard;
                //更新总五彩石数
                UserService.totalColorStone = data.totalColorStone;
                const highScore = data.score || 0; //获取用户的最高分
                ///等于也上报，因为第一次玩没有新纪录！
                let sysInfo;
                if (window.WechatGame){
                    sysInfo = wx.getSystemInfoSync();
                }else{
                    sysInfo = {SDKVersion:'0'};
                }
                if(highScore >= score && sysInfo.SDKVersion >= '1.9.92'){
                    wx.setUserCloudStorage({
                        KVDataList:[{key:Config.openJumperScore,value:highScore.toString()}]
                    });
                }
            }
        }.bind(this));
        cb && cb();
        this.model.setScore(score);
        let historyScore = UserService.historyScore;
        if (score > historyScore){
            UserService.historyScore = score;
        }
        UserService.playNormalCount += 1;
        let hintStr = '';
        if (UserService.playNormalCount >= 3){
            hintStr = ShareUtil.placeHolderText(ShareType.kLecard);
        }
        let opt = {currentScore:score,historyScore:historyScore,hintStr:hintStr};
        this.showOverAgain(opt);
        if (window.WechatGame){
            this.gameCtrl.queryIsNeed2ShowCongratulation();
        }
    }

    showOverAgain(opt) {
        let score = this.model.currentScore;
        let leCardNum = this.game.leCardNum;

        if (window.WechatGame){
            this._drawOverAgain(opt);
        }else{
            console.log('展示H5的结果页');
            let score = opt.currentScore || 0;
            score = score.toString();
            let tmpStr = '';
            for(let i = 0 ;i < score.length;i++){
                tmpStr += '<img class="score_img" src="'+Config.ScoreOver[score[i]]+'" style="display: none;"/>';
            }
            overAgainScore.innerHTML = tmpStr;
            overAgainMask.style.display = '-webkit-flex';
            overAgainMask.style.display = '-webkit-box';
            overAgainMask.style.display = 'flex';
            this.imgLoadedNum = 0;
            let imgArr = document.getElementsByClassName('score_img');
            for (let i=0;i<imgArr.length;++i){
                let img = imgArr[i];
                img.onload = function () {
                    this.imgLoadedNum++;
                    if (this.imgLoadedNum == score.length){
                        for (let j=0;j<imgArr.length;++j){
                            let tmpImg = imgArr[j];
                            tmpImg.style.display = 'inline';
                        }
                    }
                }.bind(this);
            }
        }
        this.hideRankGlobal4H5();
    }

    hideRankGlobal4H5(){
        if (!window.WechatGame){
            rankList4H5.style.display = 'none';
        }
    }

    onHide() {
        console.log('OverAgainPage onHide');
        this.hide();
    }

    _drawOverAgain(opt){
        console.log('OverAgainPage');
        let currentScore = opt.currentScore || 0;
        let historyScore = opt.historyScore || 0;
        currentScore = currentScore<0 ? 0 : currentScore;
        historyScore = historyScore<0 ? 0 : historyScore;

        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const that = this;
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(CanvasBase.getCanvas('btn'));//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/battle/home.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            PageCtrl.popToRootPage();
        }.bind(this);

        const onceMoreBtn = new Button(CanvasBase.getCanvas('btn'));//再来一次按钮
        onceMoreBtn.origin = {x:this._cxx(108),y:this._cyy(947)};
        onceMoreBtn.size = {width:this._s(390),height:this._s(130)};
        onceMoreBtn.image = 'res/img/second/another_game.png';
        onceMoreBtn.show();
        onceMoreBtn.onClick = function () {
            !! this.gameCtrl.clickReplay && this.gameCtrl.clickReplay();
        }.bind(this);

        const shareBtn = new Button(CanvasBase.getCanvas('btn'));
        shareBtn.origin = {x:this._cxx(528),y:this._cyy(947)};
        shareBtn.size = {width:this._s(114),height:this._s(126)};
        shareBtn.image = 'res/img/second/xiang.png';
        shareBtn.show();
        shareBtn.onClick = function (sender) {
            this.clickShare4Lecard(sender);
        }.bind(this);

        //分享成功提醒
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        let hintStr = opt.hintStr || '';
        ctx.fillText(hintStr,this._cxx(375),that._cyy(1115+26/2));
        let bottomScore = historyScore;
        if (currentScore > historyScore){
            bottomScore = currentScore;
        }
        ctx.fillText('历史最高分：'+bottomScore,this._cxx(375),that._cyy(1245+26/2));

        // 新纪录，展示另外的界面
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else{
            sysInfo = {SDKVersion:'0'};
        }

        if (currentScore > historyScore && currentScore != 0){
            //区分版本展示超越好友状态
            if (sysInfo.SDKVersion >= '1.9.92'){
                //高版本新纪录结束页
                let openDataContext = CanvasBase.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = this.WIDTH;
                sharedCanvas.height = this.HEIGHT;
                CanvasBase.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    type:'overNewRecord',
                    key: Config.openJumperScore,
                    me: {
                        newScore:currentScore,
                        overY:[598,679],
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }else{
                //低版本新纪录结束页
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.strokeStyle =  'rgba(78,78,78,0.6)';
                this._roundedRectR(this._cxx(50),this._cyy(374),this._s(650),this._s(463.8),10*this.Dpr,'bg');//black background
                ctx.fill();
                this._drawImageCenter('res/img/second/jilu.png', this._cxx(375), this._cyy(400), this._s(485), this._s(196), 'bg', null, this.imgid['bg']);
                let score = currentScore.toString();
                let perWidth = 64;
                let perInnerWidth = 6;
                let lengthSum = score.length * perWidth + perInnerWidth*(score.length - 1);
                for(let i = 0 ;i < score.length;i++){
                    this._drawImageCenter(Config.ScoreOver[score[i]], this._cxx(375-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(595), this._s(perWidth), this._s(100), 'bg', null, this.imgid['bg']);
                }
                //画线
                ctx.strokeStyle = '#979797';
                ctx.lineWidth = 1 * this.Dpr;
                ctx.beginPath();
                ctx.moveTo(this._cxx(50), this._cyy(745));
                ctx.lineTo(this._cxx(700), this._cyy(745));
                ctx.stroke();
                ctx.closePath();
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = this._cf(13);
                ctx.fillText('查看全部排行榜 >',this._cxx(375),this._cyy(776+13));
            }
        }else{
            // 未超过新纪录
            ctx.font = this._cf(15);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('本局得分', this._cxx(375), that._cyy(233+26/2));
            let score = currentScore.toString();
            let perWidth = 64;
            let perInnerWidth = 6;
            let lengthSum = score.length * perWidth + perInnerWidth*(score.length - 1);
            for(let i = 0 ;i < score.length;i++){
                this._drawImageCenter(Config.ScoreOver[score[i]], this._cxx(375-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(311+100/2), this._s(perWidth), this._s(100), 'bg', null, this.imgid['bg']);
            }
            if (sysInfo.SDKVersion >= '1.9.92'){
                let openDataContext = CanvasBase.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = this.WIDTH;
                sharedCanvas.height = this.HEIGHT;
                CanvasBase.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    type:'overNormal',
                    // type:'overNewRecord',
                    key: Config.openJumperScore,
                    me: {
                        threeListY:[534,598,661,715,498,746,790],
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }else{
                //低版本
                // ctx.fillStyle = 'rgba(78,78,78,0.9)';
                // ctx.strokeStyle = 'rgba(78,78,78,0.9)';
                // this._roundedRectR(this._cxx(50),this._cyy(779),this._s(650),this._s(340),10*this.Dpr,'bg');
                // ctx.fill();
                // ctx.textBaseline = 'middle';
                // ctx.textAlign = 'center';
                // ctx.fillStyle = '#FFFFFF';
                // ctx.font = this._cf(15);
                // ctx.fillText('查看全部排行榜 >',this._cxx(375),that._cyy(810+26/2));
            }
        }
        //排行榜空button
        const rankBtn = new Button(CanvasBase.getCanvas('btn'));//排行榜部分点击按钮
        rankBtn.origin = {x:this._cxx(50),y:this._cyy(750)};
        rankBtn.size = {width:this._s(650),height:this._s(90)};
        rankBtn.show();
        rankBtn.onClick = function () {
            !! this.gameCtrl.rankInner && this.gameCtrl.rankInner();
        }.bind(this);
        this._updatePlane('bg');
    }

    //普通场结果页：分享
    clickShare4Lecard(sender){
        if (window.WechatGame){
            console.log('分享换乐卡相关');
            sender && sender.disable();
            const type = ShareType.kLecard;
            //调分享
            ShareUtil.shareAppMessage(type,function () {
                ///分享成功
                console.log('分享成功');
                if (this.hasShare2GetRevival){
                    setTimeout(function () {
                        this.showRankToast('分享成功');
                    }.bind(this),500);
                    sender && sender.enable();
                }else {
                    // 乐卡相关 逻辑
                    const socket = JumpSocketService;
                    socket.sharedByType(type,function (err,result) {
                        if (!err){
                            console.log('乐卡相关分享 成功');
                            console.log(result);
                            setTimeout(function () {
                                this.showRankToast(result.text || '乐卡相关更改成功');
                            }.bind(this),500);
                            this.hasShare2GetRevival = true;
                        } else {
                            setTimeout(function () {
                                this.showRankToast('分享成功');
                            }.bind(this),500);
                            console.error('乐卡相关分享 失败');
                            console.error(err);
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
        }else{
            console.log('H5 分享战绩');

            //显示loading
            Utils.showLoading({mask:true});

            //拼分享图片
            const score = this.game.currentScore;
            ShareUtil.shareToH5(score,function (result) {
                if (result.code == 0){
                    this.showRankToast('分享成功');
                }else if (result.code==1){
                    this.showRankToast('分享失败');
                } else if (result.code==2){
                    this.showRankToast('分享取消');
                }else if (result.code==3){
                    this.showRankToast('复制成功');
                }else if (result.code==4){
                    this.showRankToast('复制失败');
                }

                //隐藏loading
                if (result.hideLoading){
                    Utils.hideLoading();
                }
            }.bind(this));
        }
    }

    showRankToast(text,cb){
        this.gameCtrl.showRankToast(text,cb);
    }

}

export default OverAgainPage;
