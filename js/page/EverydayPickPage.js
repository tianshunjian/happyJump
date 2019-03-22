'use strict';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import CanvasBase from '../base/CanvasBase';
import {ShareType} from '../service/ShareUtil';
import ShareUtil from '../service/ShareUtil';
import GameSocketConnector from '../shared/service/GameSocketConnector';
import JumpSocketService from '../service/JumpSocketService';
import Utils from '../shared/service/Utils';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

class EveryDayPickPage extends PageBase{
    constructor(game){
        console.log('EveryDayPickPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'everydayPick';
        this._cacheImage = {};
        this.arrayLucky = [];
        const logger = GameLog.getLogger('EveryDayPickPage');
        this.logger = logger;
    }

    onShow(sender,cb) {
        //展示天天抽红包界面
        this.showPickPage(sender,cb);
    }

    onHide() {
        console.log('EveryDayPickPage onHide');
        this.arrayLucky = [];
        this.luckyX = null;
        GameSocketConnector.removeTrumpetPreprocess('IDS_Trumpet_Content_02');
        JumpSocketService.offTrumpet('IDS_Trumpet_Content_02');
        this.clearLuckyAppearTimer();
        this.clearLuckyAppearRemainTimer();
        this.clearTimeClear();
        this.hide();
    }

    showPickPage(sender,cb){
        //天天抽红包界面
        sender && sender.disable();
        const that = this;
        this.clearTimeClear();
        this.clearLuckyAppearTimer();
        this.clearLuckyAppearRemainTimer();

        const showPage = function(result){
            that.drawPage(result);
            that.addLuckyUser();//调用广播，中奖人添加到中奖队列
            that.luckyX = 0;
            that.boardLuckyUser();//中奖人绘画，入界面时先画一次
            that.clear = setInterval(function () {
                if(that.luckyX < -410){
                    that.boardLuckyUser();
                }
            }.bind(this),700);

            that.gameCtrl.queryIsNeed2ShowCongratulation();
        };

        let ps ={
            count:80
        };
        JumpSocketService.lotteryItemConfigs(ps,function (err,data) {
            if(!err){
                cb && cb();
                this.fakeLuckyData = {
                    redPocketHistory:data.redPocketHistory,
                    dataTemplate:data.dataTemplate
                };
                let result = data.result;
                that.luckyUserArray();//将添加历史广播数据
                for(let i = 0;i < result.length;i++){
                    if(result[i].type === 3){
                        that._skinIndex = i;
                        break;
                    }
                }
                showPage(result);
            }else{
                sender && sender.enable();
                that.gameCtrl.showToast('网络请求出错('+err.code+')');
                PageCtrl.popPage(sender);
            }
        }.bind(this));
    }

    drawPage(result){
        this.nine = [];
        for (let i = 0; i < result.length; i++) {
            const obj = result[i];
            const type = obj.type;
            const value = obj.value;
            let e = undefined;
            //redPocket：1  leCard：2  skin：3  nextTime:0
            if (type == 1) {
                e = {
                    img: 'res/img/red_envelopes.png',
                    imgLuck:'res/img/package.png',
                    locationX: 89,
                    locationY: 64,
                    locationTextY: 132,
                    text: value + '元红包',
                    choice: false,
                    type:1
                };
            } else if (type == 2) {
                e = {
                    img: 'res/img/card_big_luck.png',
                    imgLuck:'res/img/prize_card.png',
                    locationX: 89,
                    locationY: 64,
                    locationTextY: 132,
                    text: '乐卡×' + value,
                    choice: false,
                    type:2
                };
            } else if (type == 3) {
                const hasSkin = UserService.hasNewSkin();
                if(hasSkin){
                    e = {
                        img: 'res/img/card_big_luck.png',
                        imgLuck:'res/img/prize_card.png',
                        locationX: 89,
                        locationY: 64,
                        locationTextY: 132,
                        text: '乐卡×4',
                        choice: false,
                        type:2
                    };
                }else{
                    console.log('pack'+JSON.stringify(UserService.pack));
                    e = {
                        img: 'res/img/skin_black.png',
                        imgLuck:'res/img/skinNew.png',
                        locationX: 89,
                        locationY: 64,
                        locationTextY: 132,
                        text: '新皮肤',
                        choice: false,
                        type:3
                    };
                }
            }else if(type == 0){
                e = {
                    img : 'res/img/next_time.png',
                    imgLuck :'res/img/package_jieguo.png',
                    locationX:89,
                    locationY:89,
                    choice:false,
                    type:0,
                };
            }
            this.nine.push(e);
        }

        let freeNum =  UserService.freeLotteryNum;
        const timesToGetRedPocket = UserService.timesToGetRedPocket;
        const text = ShareUtil.placeHolderText(ShareType.kRedPack);
        this._drawPickBg(freeNum,timesToGetRedPocket,text);
        this.index = 10;
        this._drawPick();
    }

    _drawPickBg(freeNum,timesToGetRedPocket,shareText){
        // 绘制天天抽界面的背景图，不包含九宫格内的奖项
        console.log('_drawEverydayPickBg');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.strokeStyle =  '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*this.Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle =  '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*this.Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle =  '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*this.Dpr,'bg');
        ctx.fill();
        this._drawImageCenter('res/img/envelopes.png', this._cxx(375), this._cyy(158), this._s(396), this._s(94), 'bg', null, this.imgid['bg']);
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#FFFCCC';
        if(freeNum > 0){
            const pickOnceBtn = new Button(CanvasBase.getCanvas('btn'));
            pickOnceBtn.center = {x:this._cxx(223),y:this._cyy(1000)};
            pickOnceBtn.size = {width:this._s(270),height:this._s(104)};
            pickOnceBtn.image = 'res/img/luck_draw1.png';
            pickOnceBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = this._cf(13);
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.fillText('免费'+freeNum+'次', this._cxx(284), this._cyy(995));
                this._updatePlane('btn');
            }.bind(this));
            pickOnceBtn.tag = 'pickOnceBtn';
            pickOnceBtn.show();
            pickOnceBtn.onClick = function (sender) {
                this.pickCtrl(sender);
            }.bind(this);
        }else{
            const pickOnceBtn = new Button(CanvasBase.getCanvas('btn'));
            pickOnceBtn.center = {x:this._cxx(223),y:this._cyy(1000)};
            pickOnceBtn.size = {width:this._s(270),height:this._s(104)};
            pickOnceBtn.image = 'res/img/luck_draw1.png';
            pickOnceBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = this._cf(13);
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.fillText('乐卡:6', this._cxx(284), this._cyy(995));
                this._updatePlane('btn');
            }.bind(this));
            pickOnceBtn.tag = 'pickOnceBtn';
            pickOnceBtn.show();
            pickOnceBtn.onClick = function (sender) {
                this.pickCtrl(sender);
            }.bind(this);
        }
        const pickFiveBtn = new Button(CanvasBase.getCanvas('btn')); //抽五次按钮
        pickFiveBtn.center = {x:this._cxx(525),y:this._cyy(1000)};
        pickFiveBtn.size = {width:this._s(270),height:this._s(104)};
        pickFiveBtn.image = 'res/img/luck_draw5.png';
        pickFiveBtn.onDisplay(function(){
            let ctx = CanvasBase.getContext('btn');
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(13);
            ctx.fillText('乐卡:25', this._cxx(582), this._cyy(995));
            this._updatePlane('btn');
        }.bind(this));
        pickFiveBtn.tag = 'pickFiveBtn';
        pickFiveBtn.show();
        pickFiveBtn.onClick = function (sender) {
            this.showPickFive(sender);
        }.bind(this);
        const backBtn = new Button(CanvasBase.getCanvas('btn'));//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            ///返回的时候清理缓存的图片
            this._cacheImage = {};
            PageCtrl.popToRootPage();
        }.bind(this);
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.textAlign = 'left';
        ctx.font = this._cf(13);
        if (shareText){
            ctx.fillText(shareText, this._cxx(93), this._cyy(908));
        }
        const Numbers = ['一','二','三','四','五'];
        const idx = timesToGetRedPocket - 1;
        let numberStr = '五';
        if ((idx >= 0) && (idx < Numbers.length)){
            numberStr = Numbers[idx];
        }
        ctx.fillText('再抽' + numberStr + '次必得现金红包', this._cxx(98), this._cyy(1083));
        ctx.fillText('必得一个现金红包', this._cxx(422), this._cyy(1083));
        ctx.fillStyle = '#FFC600';
        ctx.textAlign = 'center';
        ctx.fillText('立即分享 >', this._cxx(580), this._cyy(908));
        const shareBtn = new Button(CanvasBase.getCanvas('btn'));//立即分享按钮
        shareBtn.center = {x:this._cxx(580),y:this._cyy(908)};
        shareBtn.size = {width:this._s(130),height:this._s(30)};
        shareBtn.show();
        shareBtn.onClick = function () {
            this.clickRedPacketsShare();
        }.bind(this);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(13);
        let leCardNum =  UserService.leCard;
        ctx.fillText('我的乐卡：'+leCardNum, this._cxx(590), this._cyy(1244));
        this._updatePlane('bg');
    }

    pickCtrl(sender){
        //抽一次控制
        if(UserService.freeLotteryNum > 0){
            // this.showPickFree(sender);
            this.showPickOnce(sender,true);
        }else{
            if(UserService.leCard > 5){
                this.showPickOnce(sender,false);
            }else{
                sender.disable();
                this.gameCtrl.showRankToast('乐卡不足，快去玩游戏吧~',function () {
                    sender && sender.enable();
                });
            }
        }
    }

    hasSkinCtrl(result){
        //是否获取皮肤
        if(UserService.hasNewSkin()){
            return;
        }else{
            for(let i = 0;i < result.length;i++){
                if(result[i] === this._skinIndex){
                    UserService.setNewSkin({id:2});
                    break;
                }
            }
        }
    }

    showPickOnce(sender,isFree){
        //抽一次结果
        sender && sender.disable();
        const fiveBtn = Button.buttonWithTag(sender.superCanvas,'pickFiveBtn');
        if(fiveBtn){
            fiveBtn.disable && fiveBtn.disable();
        }

        const that = this;
        let type = 1;
        if (isFree){
            type = 0;
        }
        const socketOnce = JumpSocketService;
        socketOnce.startLottery({
            type : type //抽奖抽一次
        },function (err,result) {
            if(!err){
                UserService.redPocket = result.redPocket;
                UserService.leCard = result.leCard;
                UserService.timesToGetRedPocket = result.timesToGetRedPocket;
                if (isFree){
                    UserService.freeLotteryNum = result.freeLotteryNum;
                }
                that.hasSkinCtrl(result.index);
                ///转盘
                that.rotateTurnTable(function () {
                    result.nine = that.nine;
                    that.gameCtrl.showPickOnce(result);
                });
            }else {
                that.gameCtrl.showRankToast(err.msg || '请稍后重试',function () {
                    sender && sender.enable();
                    fiveBtn.enable && fiveBtn.enable();
                });
            }
        });
    }

    showPickFive(sender){
        //抽五次
        const onceBtn = Button.buttonWithTag(sender.superCanvas,'pickOnceBtn');
        if(onceBtn){
            onceBtn.disable && onceBtn.disable();
        }
        sender && sender.disable();
        const that = this;

        if(UserService.leCard < 25){
            !!this.gameCtrl.showRankToast && this.gameCtrl.showRankToast('乐卡不足，快去玩游戏吧~',function () {
                sender && sender.enable();
                onceBtn.enable && onceBtn.enable();
            });
            return;
        }

        const socketFive = JumpSocketService;
        socketFive.startLottery({
            type : 2 //抽奖抽5次
        },function (err,result) {
            if(!err){
                UserService.redPocket = result.redPocket;
                UserService.leCard = result.leCard;
                that.hasSkinCtrl(result.index);
                ///转盘
                that.rotateTurnTable(function () {
                    result.nine = that.nine;
                    that.gameCtrl.showPickFive(result);
                });
            }else {
                that.gameCtrl.showRankToast(err.msg || '请稍后重试',function () {
                    sender && sender.enable();
                    onceBtn.enable && onceBtn.enable();
                });
            }
        });
    }

    ///处理天天红包页面点击 立即分享
    clickRedPacketsShare(){
        const self = this;
        const type = ShareType.kRedPack;
        ShareUtil.shareAppMessage(type,function () {
            JumpSocketService.sharedByType(type,function (err,result) {
                if (result){
                    setTimeout(function () {
                        self.showPickPage();
                        self.gameCtrl.showRankToast(result.text || '获得一次免费抽奖机会');
                    },500);

                }else{
                    setTimeout(function () {
                        self.gameCtrl.showRankToast('分享成功');
                    },500);
                }
            });
        },function (res) {
            self.logger.error(JSON.stringify(res));
            setTimeout(function () {
                self.gameCtrl.showRankToast('分享失败');
            },500);
        }.bind(this));
    }

    _drawPick(){
        // 绘制抽奖转盘的九宫格
        let ctx2 = CanvasBase.getContext('bg');
        ctx2.clearRect(this._cxx(94),this._cyy(304),this._s(562),this._s(562));
        let ctx = CanvasBase.getContext('nine');
        ctx.clearRect(this._cxx(93),this._cyy(303),this._s(564),this._s(564));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(85),this._cyy(290),this._s(575),this._s(575));
        let y = this._cyy(304);
        ctx.fillStyle = '#FFF0CF';
        let a = 0;
        const nine = this.nine;
        for(let i = 0;i < 3;i++){
            let x = this._cxx(94);
            for (let j = 0;j < 3;j++){
                //抽奖过程中随机变化背景黄色
                //抽奖结果背景展示
                if(a === this.index){
                    ctx.fillStyle = '#FFC600';
                    ctx.fillRect(x,y,this._s(178),this._s(178));//被选中的黄色背景
                    //nine[a].choice = true;
                }else{
                    ctx.fillStyle = '#FFF0CF';
                    ctx.fillRect(x,y,this._s(178),this._s(178));//正常的淡黄色背景
                    // nine[a].choice = false;
                }

                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = this._cf(13);
                ctx.fillStyle = '#4E4E4E';

                const cx = x + this._s(nine[a].locationX);
                const cy = y + this._s(nine[a].locationY);
                const src = nine[a].img;
                const self = this;
                const cacheImg = self._cacheImage[src];

                if(nine[a].type != 0){
                    if (cacheImg){
                        this._syncDrawImageCenter(cacheImg,cx,cy,this._s(72),this._s(72),'nine');
                    } else {
                        this._drawImageCenter(src,cx,cy,this._s(72),this._s(72),'nine',function (img) {
                            self._cacheImage[src] = img;
                        }, this.imgid['nine']);
                    }
                    ctx.fillText(nine[a].text, x + this._s(nine[a].locationX) , y + this._s(nine[a].locationTextY));
                }else{
                    if (cacheImg){
                        this._syncDrawImageCenter(cacheImg,cx,cy,this._s(72),this._s(72));
                    } else {
                        this._drawImageCenter(src,cx,cy,this._s(150),this._s(150),'nine',function (img) {
                            self._cacheImage[src] = img;
                        }, this.imgid['nine']);
                    }
                }
                x += this._cxx(192);
                a++;
            }
            x = this._cxx(94);
            y += this._s(192);
        }
        this._updatePlane('nine');
    }

    showLuckUser(opt){
        //画广播效果
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(this._cxx(95),this._cyy(210),this._s(580),this._s(60));
        ctx.fillStyle = '#4E4E4E';
        ctx.fillRect(this._cxx(95),this._cyy(205),this._s(580),this._s(68));
        const info = opt.info;
        if(info){
            let ctx = CanvasBase.getContext('bg');
            ctx.clearRect(this._cxx(0),this._cyy(205),this.WIDTH,this._s(55));
            ctx.fillStyle = 'rgba(0,0,0, 0.50)';
            ctx.fillRect(this._cxx(0),this._cyy(205),this.WIDTH,this._s(55));
            ctx.fillStyle = '#4E4E4E';
            ctx.fillRect(this._cxx(50),this._cyy(204),this._s(650),this._s(57));
            ctx.rect(this._cxx(55),this._cyy(204),this._s(640),this._s(57));
            //计算长度，画中奖效果背景
            let textLength = 0;
            let fontSize;
            for(let i = 0; i < info.length;i++){
                fontSize = 13;
                let itemNaN = info[i].c;
                let itemNaNLength = 0,itemSum = 0;
                for(let j = 0;j < itemNaN.length;j++){
                    let reg =  /^[a-zA-Z0-9@#%&]*$/;
                    let reg2 = /^[,.'"]*$/;
                    if(reg2.test(itemNaN[j])){
                        itemNaNLength = fontSize - 8 > 0? fontSize - 8:13-8;
                    }else if(reg.test(itemNaN[j])){
                        itemNaNLength = fontSize - 5 > 0? fontSize - 5:13-5;
                    }else{
                        itemNaNLength = fontSize;
                    }
                    itemSum += parseInt(itemNaNLength) *2;
                }
                textLength += itemSum;
            }
            ctx.strokeStyle = 'rgba(107,107,107,1)';
            ctx.fillStyle = 'rgba(107,107,107,1)';
            this._roundedRectR(this._cxx(opt.x)-this._cxx(22),this._cyy(206),this._s(textLength+44),this._s(48),15*this.Dpr,'bg');
            ctx.fill();
            let text = '';
            let historyList = 0;
            for(let i = 0; i < info.length;i++){
                text = info[i].c;
                //字体颜色
                if(info[i].style && info[i].style.c){
                    ctx.fillStyle = '#'+info[i].style.c.toString();
                }else{
                    ctx.fillStyle = '#FFFFFF';
                }

                ctx.font = this._cf(13);
                ctx.textAlign = 'left';
                ctx.fillText(text, this._cxx(opt.x + historyList), this._cyy(230));
                let itemNaN = info[i].c;
                let itemNaNLength,itemSum = 0;
                for(let j = 0;j < itemNaN.length;j++){
                    let reg =  /^[a-zA-Z0-9@#%&]*$/;
                    let reg2 = /^[,.'"]*$/;
                    if(reg2.test(itemNaN[j])){
                        itemNaNLength = fontSize - 8 > 0? fontSize - 8:13-8;
                    }else if(reg.test(itemNaN[j])){
                        itemNaNLength = fontSize - 5 > 0? fontSize - 5:13-5;
                    }else{
                        itemNaNLength = fontSize;
                    }
                    itemSum += parseInt(itemNaNLength) *2;
                }
                historyList += itemSum;
            }
            ctx.clearRect(0,this._cyy(205),this._s(70),this._s(55));
            ctx.clearRect(this._cxx(680),this._cyy(205),this._s(70),this._s(55));
            ctx.fillStyle = 'rgba(0,0,0, 0.50)';
            ctx.fillRect(0,this._cyy(205),this._s(50),this._s(55));
            ctx.fillRect(this._cxx(700),this._cyy(205),this._s(50),this._s(55));
            ctx.fillStyle = '#4e4e4e';
            ctx.fillRect(this._cxx(680),this._cyy(205),this._s(20),this._s(55));
            ctx.fillRect(this._cxx(50),this._cyy(205),this._s(20),this._s(55));
        }
        this._updatePlane('bg');
    }

    rotateTurnTable(callback){
        //抽奖时背景滚动效果
        const that = this;
        that.index = -1;
        let timeSet = setInterval(function () {
            that.index ++;
            if(that.index > 8){
                that.index = 0;
            }
            this._drawPick();
        }.bind(this),200);

        setTimeout(function () {
            clearInterval(timeSet);
            callback && callback();
        }.bind(this),2500);
    }

    //展示抽奖页中奖信息
    boardLuckyUser(){
        const that = this;
        if (this.arrayLucky && this.arrayLucky.length > 0) {
            this.clearLuckyAppearTimer();
            this.clearLuckyAppearRemainTimer();
            if(this.boardAddRealLuckUser){
                this.arrayLucky.push(this.boardAddRealLuckUser);
                this.boardAddRealLuckUser = null;
            }
            let currentLucky = this.arrayLucky.pop();
            let a = 0;
            this.luckyAppear = setInterval(function () {
                that.showLuckUser({
                    info: currentLucky,
                    x: 680 - a
                });
                that.luckyX = 680 - a;
                a = a + 3;
            }, 20);//移动位置
            this.luckyAppearRemain = setTimeout(function () {
                if(that.luckyX < -410){
                    clearInterval(that.luckyAppear);
                }
            }, 700);//清除出现的计时器
        }
    }

    addLuckyUser(){
        //添加真实广播中奖人
        const that = this;
        const route = 'IDS_Trumpet_Content_02';//红包
        GameSocketConnector.addTrumpetPreprocess(route,function (ps) {
            if ((ps instanceof Array) && (ps.length > 1)){
                let nickName = ps[0];
                nickName = unescape(nickName);
                if (nickName.length > 4){
                    const r = nickName.substring(0,3) + '...';
                    ps[0] = r;
                }
                return ps;
            }
        });

        JumpSocketService.onTrumpet(route,function(result){
            that.logger.log('广播已打开-播中奖人-'+JSON.stringify(result));
            const contents = result.content;
            if(contents) {
                that.boardAddRealLuckUser = result.content;
            }
        });
    }

    luckyUserArray(){
        if(this.fakeLuckyData){
            let route = this.fakeLuckyData.dataTemplate || '';
            let finalParams = this.fakeLuckyData.redPocketHistory || [];
            for(let i = 0;i < finalParams.length;i++){
                let item = finalParams[i];
                if (item) {
                    if ((item instanceof Array) && (item.length > 1)){
                        let nickName = item[0];
                        nickName = unescape(nickName);
                        if (nickName.length > 4){
                            const r = nickName.substring(0,3) + '...';
                            item[0] = r;
                        }
                    }
                    const templateObj = window.BroadcastConfigs[route] || '';
                    let template = templateObj.ZH_CN|| '';
                    ///替换占位符，构建文案
                    for (let i = 0; i < item.length; i ++){
                        let p = item[i];
                        p = unescape(p);
                        template = template.replace('{' + i + '}',p);
                    }
                    const msg = {};
                    msg.c = Utils.parseString(template);
                    msg.params = item;
                    this.arrayLucky.push(msg.c);
                }
            }
            this.fakeLuckyData = null;
        }
    }

    clearTimeClear(){
        if(this.clear){
            clearTimeout(this.clear);
            this.clear = null;
        }
    }

    clearLuckyAppearTimer(){
        if(this.luckyAppear){
            clearInterval(this.luckyAppear);
            console.log('clearLuckyAppearTimer');
            this.luckyAppear = null;
        }
    }

    clearLuckyAppearRemainTimer(){
        if(this.luckyAppearRemain){
            clearTimeout(this.luckyAppearRemain);
            this.luckyAppearRemain = null;
        }
    }
}


export default EveryDayPickPage;