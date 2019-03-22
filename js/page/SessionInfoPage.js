'use strict';

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

class SessionInfoPage extends PageBase{
    constructor(game){
        console.log('SessionInfoPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.model = this.game.gameModel;
        this.pageBase = this.game.pageBase;
        this.name = 'sessionInfo';
        const logger = GameLog.getLogger('SessionInfoPage');
        this.logger = logger;
    }

    onShow(opt,cb) {
        this.showSessionInfo(opt,cb);
    }


    onHide() {
        console.log('SessionInfoPage onHide');
        if (this.sessionReMainTimer){
            clearInterval(this.sessionReMainTimer);
            this.sessionReMainTimer = null;
        }

        this.hide();
    }

    showSessionInfo(sender,cb){
        sender && sender.disable();
        const that = this;
        let ps = {
            displayCount:4,//需要展示的场次个数
            championshipMode :'championshipJumper'
        };
        JumpSocketService.sessionInfo(ps,function (err,result) {
            //关闭提现按钮更新的监听
            if(!err){
                cb && cb();
                UserService.revivalCard = result.restRevivedCard;
                let timeDiffer = Date.now() - result.currentTime;
                if(!result.championshipList || result.championshipList.length == 0){
                    //返回数据没有此字段,或长度为零
                    that._drawSessionInfo({info:result});
                }else{
                    let showPage,inBanTime;//所在情况、是否在禁止分钟内
                    const championList = result.championshipList;//场次列表
                    //---查看开始和结束时间
                    let start = new Array();
                    let regisstart = new Array();
                    for(let i = 0;i<championList.length;i++){
                        const startTime = championList[i].championshipStartTime;
                        const endTime = championList[i].championshipEndTime;
                        const regisStartTime = championList[i].registerStartTime;
                        const regisEndTime = championList[i].registerEndTime;
                        start[i] = {start:that.formatDateTime(startTime),end:that.formatDateTime(endTime)};
                        console.log(JSON.stringify(start[i])+i);
                        that.logger.info(JSON.stringify(start[i])+i);
                        regisstart[i] = {regisstart:that.formatDateTime(regisStartTime),regisEnd:that.formatDateTime(regisEndTime)};
                        console.log(JSON.stringify(regisstart[i])+i);
                        that.logger.info(JSON.stringify(regisstart[i])+i);
                    }
                    //-----结束
                    const currentSession = championList[0];//当前、最近场次

                    // ---------测试时间区间-----------
                    // var testStartDate = new Date('2018-06-26 9:10:00');
                    // var testRegisterEndDate = new Date('2018-06-26 14:05:10');
                    // var testEndDate = new Date('2018-06-26 14:10:10');
                    // var testStartTime = Date.parse(testStartDate);
                    // var testRegisterTime = Date.parse(testRegisterEndDate);
                    // var testEndTime = Date.parse(testEndDate);
                    // currentSession.championshipStartTime = testStartTime;
                    // currentSession.registerEndTime = testRegisterTime;
                    // currentSession.championshipEndTime = testEndTime;
                    // ------------

                    let registerEndTime = currentSession.registerEndTime;//最近场次注册结束时间
                    let sessionStartTime = currentSession.championshipStartTime;//最近场次开始时间
                    let sessionEndTime = currentSession.championshipEndTime;//最近场次游戏结束时间
                    let currentTime = Date.now() - timeDiffer;

                    let optSessionTime,sessionTime;//optSessionTime时间差，换算小时用、sessionTime基准时间，传给界面倒计时进行计算
                    let banTime = sessionEndTime - registerEndTime;
                    inBanTime = 'no';
                    if(currentTime < sessionStartTime){
                        //即将开始，立即预约/已预约
                        showPage = 'jijiangkaishi';
                        optSessionTime = sessionStartTime - currentTime;
                        sessionTime = sessionStartTime;
                        inBanTime = 'no';
                        console.log('showSessionInfo-开始前预约');
                    }else if(currentTime <= sessionEndTime){
                        //时间在场次时间内
                        console.log('showSessionInfo-在场次时间内');
                        if(currentSession.isFinished == 0){
                            if(currentTime < registerEndTime){
                                //未获奖，大于5分钟
                                showPage = 'jinxingzhong';
                                inBanTime = 'no';
                            }else{
                                //未获奖，小于5分钟
                                showPage = 'jinxingzhong';
                                inBanTime = 'yes';
                            }
                        }else{
                            if(currentTime < registerEndTime){
                                //已获奖，大于5分钟
                                showPage = 'yihuojiang';
                                inBanTime = 'no';
                            }else{
                                //已获奖，小于5分钟
                                showPage = 'yihuojiang';
                                inBanTime = 'yes';
                            }
                        }
                        optSessionTime = sessionEndTime - currentTime;
                        sessionTime = sessionEndTime;
                    }else{
                        that.game.UI.showToast('场次信息出错，请重新请求');
                        console.log('场次信息出错，请重新请求');
                        that.logger.error('场次信息出错，请重新请求');
                    }

                    //页面倒计时，画的时候展示一次
                    let hour,minute,second,time;
                    hour = parseInt(optSessionTime/3600000);
                    if(hour < 10){
                        hour = '0' + hour;
                    }
                    minute = parseInt(optSessionTime % 3600000 / 60000);
                    if(minute < 10){
                        minute = '0' + minute;
                    }
                    second = parseInt(optSessionTime % 3600000 % 60000 /1000);
                    if(second < 10){
                        second = '0' + second;
                    }
                    if(hour >= 1){ //区分1小时展示情况
                        time = hour + ':' + minute;
                    }else{
                        time = minute + ':' + second;
                    }

                    if (showPage == 'jinxingzhong') {
                        time = '比赛进行中...';
                    }

                    let banTimeTitle = '比赛结束前'+ parseInt(banTime/60000)+'分钟禁止进入游戏';
                    console.log('比赛结束前'+ parseInt(banTime/60000)+'分钟禁止进入游戏');

                    let opt ={ //需传到前端进行展示的界面参数
                        info:result,
                        showPage:showPage,
                        inBanTime:inBanTime,
                        banTimeTitle:banTimeTitle,
                        time:time,
                        timeDiffer:timeDiffer
                    };
                    that.showSessionTime({sessionTime:sessionTime,showPage:showPage,result:result,banTime:banTime,timeDiffer:timeDiffer,inBanTime:inBanTime,});
                    that._drawSessionInfo(opt);
                    that.gameCtrl.queryIsNeed2ShowCongratulation();
                }
            }else {
                sender && sender.enable();
                that.game.UI.showToast('网络异常，请重试');
                let opt ={ //需传到前端进行展示的界面参数
                    netBreakUp:'yes'
                };
                cb && cb();
                that._drawSessionInfo(opt);
                that.logger.error(err);
            }
        });
    }

    showSessionTime(opt){
        console.log('场次预告页倒计时');
        const that = this;
        let sessionTime = opt.sessionTime;//基准比较时间
        let curr,differTime,hour,minute,second;
        let freshMark = true; //5分钟时，刷新一次的标记

        let registerEndTime = opt.result.championshipList[0].registerEndTime;
        this.sessionReMainTimer = setInterval(function () {
            curr = Date.now() - opt.timeDiffer;
            differTime = sessionTime - curr;
            let banTemp = opt.banTime > 0 ? opt.banTime : 0;
            let bantimeMinute = parseInt(banTemp / 60000).toString();
            let bantimeSecond = parseInt(banTemp % 60000 / 1000).toString();

            hour = parseInt(differTime/3600000);
            minute = parseInt(differTime % 3600000 / 60000);
            second = parseInt(differTime % 3600000 % 60000 /1000);
            minute =  minute < 0 ? 0 : minute;
            second =  second < 0 ? 0 : second;
            if(hour < 10){
                hour = '0' + hour;
            }
            if(minute < 10){
                minute = '0' + minute;
            }
            if(second < 10){
                second = '0' + second;
            }

            let changeTime;
            if(hour >= 1){ //区分1小时展示情况
                changeTime = hour + ':' + minute;
            }else{
                changeTime = minute + ':' + second;
            }

            if(opt.showPage == 'jijiangkaishi'){
                console.log('即将开始界面画倒计时');
                that._drawSessionRemainTime({optSessionTime:changeTime,showPage:opt.showPage,reservationNum:opt.result.reservationCount,playNum:opt.result.playerCount});
            }

            if(curr >= sessionTime){
                console.log('00:00,重新调取接口，注意是否有准确返回的场次数据');
                that.showSessionInfo();
            }else{
                let banTimeTitle = '比赛结束前'+ parseInt(bantimeMinute)+'分钟禁止进入游戏';
                if(((curr >= registerEndTime) && freshMark && opt.inBanTime == 'no') || opt.banTime <= 0){
                    //到置灰时间内
                    console.log('到置灰时间内');
                    switch (opt.showPage){
                    case 'jinxingzhong':
                        that._drawSessionInfo({
                            info:opt.result,
                            showPage:'jinxingzhong',
                            inBanTime:'yes',
                            banTimeTitle:banTimeTitle,
                            time:'比赛进行中...',
                        });
                        console.log('到禁止时间，立即参赛界面');
                        break;
                    case 'yihuojiang':
                        that._drawSessionInfo({
                            info:opt.result,
                            showPage:'yihuojiang',
                            inBanTime:'yes',
                            banTimeTitle:banTimeTitle,
                            time:'比赛进行中...',
                        });
                        console.log('到禁止时间，已获奖');
                        break;
                    default:
                        console.log('到禁止时间，其他情况，这时注意是不是正常的预约界面');
                        break;
                    }
                    freshMark = false;
                }
            }
        },1000);
    }

    _drawAlreadyBookBtn(opt){
        const btnX = opt.btnX;
        const btnY = opt.btnY;
        const bigX = opt.bigX;
        const bigY = opt.bigY;
        const tag = opt.tag;
        const listLength = opt.listLength;
        const prePeopleNum = opt.preNum;
        let ctx = CanvasBase.getContext('bg');
        let ctx1 = CanvasBase.getContext('btn');
        if(tag == 0 || tag == 'preBtn'){
            ctx.clearRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            ctx1.clearRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            this._drawImageCenter('res/img/battle/make_appointment_already.png',this._cxx(177-65+130/2),this._cyy(1075-27+54/2),this._s(130),this._s(54),'bg',null,this.imgid['bg']);
            const smallBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),0);
            if (smallBtn){
                smallBtn.destroy();
            }
            ctx.clearRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            ctx1.clearRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            this._drawImageCenter('res/img/battle/yjingyuyue.png', this._cxx(375), this._cyy(640), this._s(270), this._s(104), 'bg', null, this.imgid['bg']);

            const preBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),'preBtn');
            if (preBtn){
                preBtn.destroy();
            }
            let preNum = parseInt(prePeopleNum)+1;
            this._drawReservationNum('已有'+preNum+'人预约');
        }else{
            ctx.clearRect(this._cxx(btnX),this._cyy(btnY),this._s(bigX),this._s(bigY));
            ctx1.clearRect(this._cxx(btnX),this._cyy(btnY),this._s(bigX),this._s(bigY));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this._cxx(btnX),this._cyy(btnY),this._s(bigX),this._s(bigY));
            const outBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),tag);
            if (outBtn){
                outBtn.destroy();
                console.log('按钮已经销毁');
            }
            this._drawImageCenter('res/img/battle/make_appointment_already.png',this._cxx(btnX+bigX/2),this._cyy(btnY+bigY/2),this._s(bigX),this._s(bigY),'bg',function(){
                console.log('已经点击底部预约');
            },this.imgid['bg']);
        }
        this._updatePlane('bg');
        this._updatePlane('btn');
    }

    _drawReservationNum(opt){
        console.log(' _drawReservationNum');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(this._cxx(100),this._cyy(705),this._s(550),this._s(40));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(100),this._cyy(705),this._s(550),this._s(40));
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(13);
        ctx.fillText(opt, this._cxx(375), this._cyy(723));
        this._updatePlane('bg');
    }

    // 更新复活卡数量
    updateRevivalCardNum(){
        let ctx = CanvasBase.getContext('btn');
        ctx.clearRect(this._cxx(41),this._cyy(1209),this._s(213),this._s(70));
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this._cxx(41),this._cyy(1209),this._s(213),this._s(70));
        const realOldBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),'revivalBtn');
        if (realOldBtn){
            realOldBtn.destroy();
        }
        const revivalBtn = new Button(CanvasBase.getCanvas('btn'));
        revivalBtn.origin = {x:this._cxx(41),y:this._cyy(1209)};
        revivalBtn.size = {width:this._s(213),height:this._s(70)};
        revivalBtn.image = 'res/img/battle/fuhuoka.png';
        revivalBtn.tag = 'revivalBtn';
        revivalBtn.onDisplay(function(){
            let ctx = CanvasBase.getContext('btn');
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.font = this._cf(15);
            ctx.fillStyle = '#4E4E4E';
            ctx.fillText(UserService.revivalCard, this._cxx(200), this._cyy(1243));//TODO 复活卡张数
            this._updatePlane('btn');
        }.bind(this));
        revivalBtn.show();
        revivalBtn.onClick = function (sender) {
            this.clickRevivalCardShare(sender);
        }.bind(this);
        this._updatePlane('btn');
    }

    // 场次预告倒计时时间
    _drawSessionRemainTime(opt){
        if(opt.showPage == 'jijiangkaishi'){
            if(this.sessionTimeOld && this.sessionTimeOld != opt.optSessionTime){
                this.sessionTimeOld = opt.optSessionTime;
                let ctx = CanvasBase.getContext('bg');
                ctx.clearRect(this._cxx(150),this._cyy(480),this._s(450),this._s(90));
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this._cxx(145),this._cyy(476),this._s(460),this._s(95));
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(40);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                let imgX = [295,345,405,455];
                let timeNum = opt.optSessionTime.substr(0,2)+opt.optSessionTime.substr(3,2);
                for(let i = 0;i < 4;i++){
                    let w4Num = timeNum[i]==1 ? 25 : 45;
                    this._drawImageCenter(Config.SquareNumBigBlack[timeNum[i]], this._cxx(imgX[i]), this._cyy(516), this._s(w4Num), this._s(57), 'bg', null, this.imgid['bg']);
                }
                ctx.fillText(':', this._cxx(375), this._cyy(516));
                // ctx.fillText(opt.optSessionTime.toString(), this._cxx(375), this._cyy(516));
            }
            this._updatePlane('bg');
        }
    }

    _drawSessionInfo(opt){
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(140),this._s(650),this._s(1030),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(52),this._cyy(140),this._s(646),this._s(1010),10*this.Dpr,'bg');//white background
        ctx.fill();
        //--以上为不更改的背景
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
            //点击事件
            PageCtrl.popToRootPage();
        }.bind(this);

        //复活卡按钮
        const revivalBtn = new Button(CanvasBase.getCanvas('btn'));//获奖榜单按钮
        revivalBtn.origin = {x:this._cxx(41),y:this._cyy(1209)};
        revivalBtn.size = {width:this._s(213),height:this._s(70)};
        revivalBtn.tag = 'revivalBtn';
        revivalBtn.image = 'res/img/battle/fuhuoka.png';
        revivalBtn.onDisplay(function () {
            let ctx = CanvasBase.getContext('btn');
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.font = this._cf(15);
            ctx.fillStyle = '#4E4E4E';
            ctx.fillText(UserService.revivalCard, this._cxx(200), this._cyy(1243));//TODO 复活卡张数
            this._updatePlane('btn');
        }.bind(this));
        revivalBtn.show();
        revivalBtn.onClick = function (sender) {
            //点击事件
            this.clickRevivalCardShare(sender);
        }.bind(this);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(11);
        ctx.fillText('点击分享后+1',this._cxx(82+133/2),this._cyy(1300));

        const prizeRankBtn = new Button(CanvasBase.getCanvas('btn'));//获奖榜单按钮
        prizeRankBtn.origin = {x:this._cxx(269),y:this._cyy(1209)};
        prizeRankBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRankBtn.image = 'res/img/battle/huojiangdangdan.png';
        prizeRankBtn.show();
        prizeRankBtn.onClick = function (sender) {
            //点击事件
            !!this.gameCtrl.showPrizeRankLast && this.gameCtrl.showPrizeRankLast(sender);
        }.bind(this);

        const prizeRecordBtn = new Button(CanvasBase.getCanvas('btn'));//获奖记录按钮
        prizeRecordBtn.origin = {x:this._cxx(497),y:this._cyy(1209)};
        prizeRecordBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRecordBtn.image = 'res/img/battle/jilu.png';
        prizeRecordBtn.show();
        prizeRecordBtn.onClick = function (sender) {
            //点击事件
            !!this.gameCtrl.showPrizeRecord && this.gameCtrl.showPrizeRecord(sender);
        }.bind(this);
        //--以上为不更改的按钮

        if(opt.netBreakUp && opt.netBreakUp == 'yes'){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = this._cf(15);
            ctx.fillStyle = '#4E4E4E';
            ctx.fillText('网络有误，请重新刷新进入界面', this._cxx(375), this._cyy(600));
        }else if(opt.info.championshipList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = this._cf(15);
            ctx.fillStyle = '#4E4E4E';
            ctx.fillText('暂无场次安排，敬请期待', this._cxx(375), this._cyy(600));
        }else{
            ctx.fillStyle = '#4e4e4e';
            ctx.strokeStyle =  '#4e4e4e';
            this._roundedRectR(this._cxx(94),this._cyy(810),this._s(562),this._s(60),10*this.Dpr,'bg');//black background
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = this._cf(17);
            ctx.fillText('场次预告', this._cxx(375), this._cyy(840));

            const prePeopleNum = opt.info.reservationCount;//预约人数
            let playPeopleNum = opt.info.playerCount;//正在比赛人数
            let color, colorText,textWord, Timetitle, peopleTitle;//填充色，文字色，文字内容，距离游戏还剩，多少人参加
            const currentChampionID = opt.info.championshipList[0].championshipId;//当前场次ID
            console.log('championID'+currentChampionID);

            //title
            //奖金1000
            let prizeTitle = window.BroadcastConfigs[opt.info.championshipList[0].prize].ZH_CN.toString()||'奖金1000';
            //限时跳到200分
            let prizeTitle2 = window.BroadcastConfigs[opt.info.championshipList[0].title].ZH_CN.toString()||'限时跳到1000分';
            let num= prizeTitle.replace(/[^0-9]/ig,'');//奖金数
            let num2= prizeTitle2.replace(/[^0-9]/ig,'');//目标分数
            num2 = opt.info.championshipList[0].targetScore || 0;
            console.log('奖金num：'+num);
            console.log('分数num2：'+num2);

            let startTime = opt.info.championshipList[0].championshipStartTime;
            let endTime = opt.info.championshipList[0].championshipEndTime;
            let betweenTime = endTime - startTime;
            let sec = Math.floor(betweenTime/1000);
            let hour = Math.floor(sec/3600);
            let min = Math.floor((sec-hour*3600)/60);
            console.log('小时：'+hour);
            console.log('分钟：'+min);
            let limitTime = hour>0 ? hour+'小时' : min+'分钟';

            let topTitle = '元奖金赛';
            let topTitle2 = limitTime+'跳到'+num2+'分,平分当场奖金';

            let prizeLength = (prizeTitle.length - num.length)*26 + num.length*13;
            let prizeLength2 = (prizeTitle2.length - num2.length)*26 + num2.length*13;

            let lengthSum = prizeLength+prizeLength2+6;
            ctx.fillStyle = '#ffc600';
            ctx.font = this._cf(40);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            let numLength;
            if(num.length > 4){
                num = num.substr(0,num.length-4);
                numLength = num.length*34+210;
                this._drawImageCenter('res/img/battle/wanyuanjiangjinsai.png',this._cxx(375-numLength/2 + num.length*35+110),this._cyy(230),this._s(210),this._s(48),'bg',null,this.imgid['bg']);
            }else{
                numLength = num.length*34+170;
                this._drawImageCenter('res/img/battle/yuanjiangjinsai.png',this._cxx(375-numLength/2 + num.length*35+90),this._cyy(230),this._s(170),this._s(48),'bg',null,this.imgid['bg']);
            }
            for(let i = 0;i < num.length;i++){
                this._drawImageCenter(Config.PrizeNum[num[i]],this._cxx(375-numLength/2 + 17 + i*35),this._cyy(230),this._s(34),this._s(48),'bg',null,this.imgid['bg']);
            }

            ctx.fillStyle = '#4e4e4e';
            ctx.font = 'bold 50px Arial';
            ctx.textAlign = 'left';
            ctx.font = this._cf(15);
            ctx.textAlign = 'center';
            ctx.fillText(topTitle2,this._cxx(375),this._cyy(295));

            this._drawImageCenter('res/img/battle/qian_copy.png', this._cxx(113), this._cyy(257), this._s(80), this._s(80), 'bg', null, this.imgid['bg']);
            this._drawImageCenter('res/img/battle/qian.png', this._cxx(650), this._cyy(216), this._s(100), this._s(100), 'bg', null, this.imgid['bg']);
            let bookMark;
            //不同场景展示不同UI
            console.log('opt.inBanTime '+opt.inBanTime);
            console.log('opt.showPage '+opt.showPage);
            switch (opt.showPage){
            case 'jijiangkaishi':
                /**
                     * 即将开始，立即预约/已经预约显示
                     */
                color = '#ffc600';
                colorText = '#4e4e4e';
                textWord = '即将开始';
                Timetitle = '距游戏开始还剩';
                peopleTitle = '已有'+prePeopleNum+'人预约';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#4e4e4e';
                ctx.font = this._cf(15);
                ctx.fillText(Timetitle, this._cxx(375), this._cyy(429));
                // 立即预约按钮
                if(opt.info.championshipList[0].reservationStatus){
                    // 已经预约
                    // reservationStatus默认0，未预约
                    bookMark = true;
                    this._drawImageCenter('res/img/battle/yjingyuyue.png', this._cxx(375), this._cyy(640), this._s(270), this._s(104), 'bg', null, this.imgid['bg']);
                }else{
                    bookMark = false;
                    const preBtn = new Button(CanvasBase.getCanvas('btn'));
                    preBtn.center = {x:this._cxx(375),y:this._cyy(640)};
                    preBtn.size = {width:this._s(270),height:this._s(104)};
                    preBtn.image = 'res/img/battle/appointment.png';
                    preBtn.show();
                    preBtn.tag = 'preBtn';
                    preBtn.btnInfo = {
                        sessionId:currentChampionID,
                        listLength:opt.info.championshipList.length,
                        btnX:375-135,
                        btnY:640-52,
                        bigX:270,
                        bigY:104,
                        img:'res/img/battle/yjingyuyue.png',
                        tag:'preBtn',
                        preNum:prePeopleNum,
                    };
                    preBtn.onClick = function (sender) {
                        //TODO 预约信息上传
                        this.championReservation(sender,sender.btnInfo);
                    }.bind(this);
                }
                break;
            case 'yihuojiang':
                /**
                     * 创造新纪录显示
                     */
                {
                    this._drawImageCenter('res/img/battle/chenggongtu2.png', this._cxx(275+200/2), this._cyy(350+215/2), this._s(200), this._s(215), 'bg', null, this.imgid['bg']);
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#4e4e4e';
                    ctx.font = this._cf(13);
                    let bestScore = opt.info.bestScore || 0;//最佳时间
                    let bestMin = Math.floor(bestScore/60);
                    let bestSec = Math.floor(bestScore%60);
                    let useTime = '用时'+bestMin+'\''+bestSec+'"';
                    ctx.fillText(useTime, this._cxx(375), this._cyy(565+26/2));
                    const newBtn = new Button(CanvasBase.getCanvas('btn'));
                    newBtn.center = {x:this._cxx(375),y:this._cyy(625+104/2)};
                    newBtn.size = {width:this._s(270),height:this._s(104)};
                    if(opt.inBanTime == 'yes'){
                        newBtn.image = 'res/img/battle/chuangzao_huid.png';
                    }else{
                        newBtn.image = 'res/img/battle/chuangzao.png';
                    }
                    newBtn.show();
                    newBtn.championshipInfo = opt.info.championshipList[0];//TODO:改成应该进入的比赛场信息
                    newBtn.onClick = function (sender) {
                    //TODO 点击事件，已经获奖，再次进入比赛
                        !!this.gameCtrl.clickStartGame4Competition && this.gameCtrl.clickStartGame4Competition(sender,sender.championshipInfo);
                    }.bind(this);
                    peopleTitle = '';
                // }
                }
                break;
            case 'jinxingzhong':
                /**
                     * 立即开始显示
                     */
                color = '#ffc600';
                colorText = '#4e4e4e';
                textWord = '进行中';
                Timetitle = '距游戏结束还剩';
                {
                    let end4Stander = this.formatDateTime(endTime);
                    let end4Hour = parseInt(end4Stander.hour);
                    let end4Minute = parseInt(end4Stander.minute);
                    console.log('结束小时数：' + end4Hour);
                    console.log('结束分钟数：' + end4Minute);
                    peopleTitle = '截止到' + end4Hour + '点';
                    if (end4Minute > 0) {
                        peopleTitle += '' + end4Minute + '分';
                    }
                    peopleTitle += '比赛结束';

                    //立即开始按钮
                    // if(opt.inBanTime == 'yes'){
                    //     //立即开始的置灰图片
                    //     this._drawImageCenter('res/img/battle/kaishihuise.png', this._cxx(375), this._cyy(640), this._s(270), this._s(104), 'bg', null, this.imgid['bg']);
                    //     peopleTitle = opt.banTimeTitle;
                    // }else{
                    const kaishiBtn = new Button(CanvasBase.getCanvas('btn'));
                    kaishiBtn.center = {x: this._cxx(375), y: this._cyy(640)};
                    kaishiBtn.size = {width: this._s(270), height: this._s(104)};
                    if (opt.inBanTime == 'yes') {
                    //立即开始的置灰图片
                        kaishiBtn.image = 'res/img/battle/cansaihuise.png';
                    // this._drawImageCenter('res/img/battle/kaishihuise.png', this._cxx(375), this._cyy(640), this._s(270), this._s(104), 'bg', null, this.imgid['bg']);
                    } else {
                        kaishiBtn.image = 'res/img/battle/cansai.png';
                    }
                    kaishiBtn.show();
                    kaishiBtn.championshipInfo = opt.info.championshipList[0];//TODO:改成应该进入的比赛场信息
                    kaishiBtn.onClick = function (sender) {
                    //进入比赛，立即开始
                        !!this.gameCtrl.clickStartGame4Competition && this.gameCtrl.clickStartGame4Competition(sender, sender.championshipInfo);
                    }.bind(this);
                // peopleTitle = '有'+ playPeopleNum +'人正在比赛中';
                // }
                }
                break;
            }

            //比赛人数
            if (opt.showPage != 'yihuojiang') {
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = this._cf(13);
                ctx.fillText(peopleTitle, this._cxx(375), this._cyy(723));
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(40);
                let tmpY=516;
                if (opt.showPage=='jinxingzhong'){
                    ctx.font = this._cf(25);
                    tmpY = 460;
                }
                if(opt.showPage == 'jijiangkaishi'){
                    this.sessionTimeOld = opt.time;
                    console.log('opt.time=' + opt.time);
                    let imgX = [295,345,405,455];
                    let timeNum = opt.time.substr(0,2)+opt.time.substr(3,2);
                    for(let i = 0;i < 4;i++){
                        let w4Num = timeNum[i]==1 ? 25 : 45;
                        this._drawImageCenter(Config.SquareNumBigBlack[timeNum[i]], this._cxx(imgX[i]), this._cyy(tmpY), this._s(w4Num), this._s(57), 'bg', null, this.imgid['bg']);
                    }
                    ctx.fillText(':', this._cxx(375), this._cyy(tmpY));
                }else{
                    ctx.fillText(opt.time.toString(), this._cxx(375), this._cyy(tmpY));
                }
            }

            /**
             * 预告场次情况  居中坐标：x:177,375,571 // y:914,966,1008,1075,
             */

            const championshipList = opt.info.championshipList;//场次列表
            let day ,sessionTime,sessionMoney;
            // let x = [0,177,375,571];
            // let y = [0,914,966,1008,1075];
            let bookBtn = new Array();
            let i,Ilength,x,y,z;
            if(opt.showPage == 'jijiangkaishi'){
                i = 0;
                if(championshipList.length > 3){
                    Ilength = 3;
                }else{
                    Ilength = championshipList.length;
                }
                x = [177,375,571];
                y = [914,966,1008,1075];
                z = [0,2,1,3];
            }else{
                i = 1;
                Ilength = championshipList.length;
                x = [0,177,375,571];
                y = [0,914,966,1008,1075];
                z = [1,3,2,4];
            }
            for(i;i < Ilength; i++){ //预告中展示2-4场，当前场为0场
                const startTime = championshipList[i].championshipStartTime;//每局开始时间
                const ruguTime = this.formatDateTime(startTime);//时间戳转成标准时间
                day = this.timeDefine(startTime);//和当前时间进行比较，确定日期
                sessionTime = ruguTime.hour+':'+ruguTime.minute;//确定时间
                sessionMoney = window.BroadcastConfigs[championshipList[i].prize].ZH_CN||'1000';
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = this._cf(13);
                ctx.fillText(day, this._cxx(x[i]), this._cyy(y[z[0]]));
                ctx.fillStyle = '#4e4e4e';
                ctx.fillText(sessionMoney, this._cxx(x[i]), this._cyy(y[z[1]]));
                ctx.font = this._cf(20);
                ctx.fillText(':', this._cxx(x[i]), this._cyy(y[z[2]]));
                sessionTime = sessionTime.substr(0,2)+sessionTime.substr(3,2);
                //场次时间替换图片
                let timeX = [x[i]-55+12.5,x[i]-17.5,x[i]+17.5,x[i]+42.5];
                for(let i = 0;i < 4;i++){
                    let w4Num = sessionTime[i]==1 ? 14 : 24;
                    this._drawImageCenter(Config.SquareNumSmallBlack[sessionTime[i]],this._cxx(timeX[i]),this._cyy(y[z[2]]),this._s(w4Num),this._s(27),'bg',null,this.imgid['bg']);
                }
                if(!championshipList[i].reservationStatus){
                    bookBtn[i] = new Button(CanvasBase.getCanvas('btn'));
                    bookBtn[i].center = {x:this._cxx(x[i]),y:this._cyy(y[z[3]])};
                    bookBtn[i].size = {width:this._s(130),height:this._s(54)};
                    bookBtn[i].image = 'res/img/battle/make_appointment.png';
                    bookBtn[i].tag = bookBtn[i].toString();
                    bookBtn[i].show();
                    bookBtn[i].tag = i;
                    bookBtn[i].btnInfo = {
                        sessionId:championshipList[i].championshipId,
                        listLength:championshipList.length,
                        btnX:x[i]-65,
                        btnY:y[z[3]]-27,
                        bigX:130,
                        bigY:54,
                        img:'res/img/battle/make_appointment_already.png',
                        tag:i,
                        preNum:prePeopleNum,
                    };
                    bookBtn[i].onClick = function (sender) {
                        //TODO 预约场次
                        this.championReservation(sender,sender.btnInfo);
                    }.bind(this);
                }else{
                    this._drawImageCenter('res/img/battle/make_appointment_already.png', this._cxx(x[i]), this._cyy(y[z[3]]), this._s(130), this._s(54), 'bg', null, this.imgid['bg']);
                }
            }
        }
        this._updatePlane('bg');
    }

    championReservation(sender,btnInfo){
        sender && sender.disable();
        const sessionId = btnInfo.sessionId;
        const that = this;
        let ps = {
            championshipId:sessionId
        };
        JumpSocketService.sessionReservation(ps,function (err,result) {
            if(!err){
                that._drawAlreadyBookBtn(btnInfo);
            }else {
                sender && sender.enable();
            }
        });
    }


    //预告页 —— 复活卡 点击分享
    clickRevivalCardShare(sender){
        sender && sender.disable();
        const type = ShareType.kRevivalCard;
        //调分享
        ShareUtil.shareAppMessage(type,function () {
            ///分享成功
            // 复活卡+1 逻辑
            console.log('分享成功');
            JumpSocketService.sharedByType(type,function (err,result) {
                if (!err){
                    console.log('复活卡+1 成功');
                    console.log(result);
                    //更新预告页
                    this.updateRevivalCardNum();
                } else {
                    console.error('复活卡+1 失败');
                    console.error(err);
                }
                sender && sender.enable();
            }.bind(this));
        }.bind(this),function (res) {
            ///分享失败
            console.log('分享失败');
            console.log(res);
            sender && sender.enable();
        }.bind(this));
    }

}


export default SessionInfoPage;