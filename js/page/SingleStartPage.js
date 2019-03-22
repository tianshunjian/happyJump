'use strict';

// var SingleStartPage = function () {
//     function SingleStartPage(game) {
//         // _classCallCheck(this, SingleStartPage);
//
//         this.game = game;
//         this.model = this.game.gameModel;
//         this.full2D = this.game.full2D;
//         this.name = 'startPage';
//     }
//
//     return SingleStartPage;
// }();
//
// SingleStartPage.prototype = {
//     show: function () {
//         let _this = this;
//
//         if (!this.full2D) {
//             this.game.handleWxOnError({
//                 message: 'can not find full 2D',
//                 stack: ''
//             });
//         }
//         setTimeout(function () {
//             if (_this.full2D) {
//                 _this.full2D.showStartPage();
//             } else {
//                 // wx.exitMiniProgram()
//             }
//         }, 0);
//     },
//
//     backStartPage: function () {
//         this.full2D.backStartPage();
//     },
//     updateRealBtn:function(){
//         this.full2D.updateRealBtn();
//     },
//
//     hide: function () {
//         this.full2D.hide2D();
//     }
// };

import PageBase from '../base/PageBase';
import SignUtil from '../shared/service/SignUtil';
import Button from '../base/Button';
import UserService, {kUserServiceDidUpdate} from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';

class SingleStartPage extends PageBase{
    constructor(game){
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'startPage';
        this.full2D = this.game.full2D;
    }
    onShow(result,cb) {
        this.game.startView();
        SignUtil.showNewAuthorizedButtonIfNeed();
        this.onUpdateTixianBtn();
        cb && cb();
        this.drawPage(result);
        this.gameCtrl.showCongratulation();
    }

    onHide() {
        console.log('SingleStartPage onHide');
        this.offUpdateTixianBtn();
        this.hide();
    }
    //关闭提现按钮更新的监听
    offUpdateTixianBtn(){
        if(this.realBtnUpdate){
            UserService.off(kUserServiceDidUpdate,this.realBtnUpdate);
            this.realBtnUpdate = undefined;
        }
    }

    onUpdateTixianBtn(){
        //添加更新提现的监听
        this.realBtnUpdate = function(){
            console.log('提现按钮刷新');
            this.updateRealBtn();
        }.bind(this);
        UserService.on(kUserServiceDidUpdate,this.realBtnUpdate);
    }

    //更新提现按钮
    updateRealBtn(){
        if (this.game.stage == 'startPage'){
            this.updateRealBtnFuc();
        }
        //关闭提现按钮更新的监听
        this.offUpdateTixianBtn();
    }

    updateRealBtnFuc(){
        //提现按钮刷新
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        } else{
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){
            let ctx = CanvasBase.getContext('btn');
            ctx.clearRect(this._cxx(392),this._cyy(1118),this._s(120),this._s(160));
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(this._cxx(392),this._cyy(1118),this._s(120),this._s(160));
            const realOldBtn = Button.buttonWithTag(CanvasBase.getCanvas('btn'),'realBtn');
            if (realOldBtn){
                realOldBtn.destroy();
            }
            const realBtn = new Button(CanvasBase.getCanvas('btn'));
            realBtn.origin = {x:this._cxx(392),y:this._cyy(1118)};
            realBtn.size = {width:this._s(120),height:this._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                const redPocket = UserService.redPocket.toString();
                this.realBtnRedPocket = redPocket;
                // const redPocket = '169.45';
                if(redPocket.length > 4){
                    ctx.font = 'bold 24px Arial';
                }else{
                    ctx.font = 'bold 30px Arial';
                }
                ctx.fillStyle = '#4e4e4e';
                ctx.fillText(redPocket, this._cxx(452), this._cyy(1190));
                this._updatePlane('btn');
            }.bind(this));
            realBtn.show();
            realBtn.onClick = function (sender) {
                // !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
                this.gameCtrl.showTiXian();
            }.bind(this);
        }else{
            let ctx = CanvasBase.getContext('btn');
            ctx.clearRect(this._cxx(452.5),this._cyy(1118),this._s(120),this._s(160));
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(this._cxx(452.5),this._cyy(1118),this._s(120),this._s(160));
            const realOldBtn = Button.buttonWithTag(this.canvas['btn'],'realBtn');
            if (realOldBtn){
                realOldBtn.destroy();
            }
            const realBtn = new Button(CanvasBase.getCanvas('btn'));
            realBtn.origin = {x:this._cxx(452.5),y:this._cyy(1118)};
            realBtn.size = {width:this._s(120),height:this._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                const redPocket = UserService.redPocket.toString();
                this.realBtnRedPocket = redPocket;
                // const redPocket = '169.45';
                if(redPocket.length > 4){
                    ctx.font = 'bold 24px Arial';
                }else{
                    ctx.font = 'bold 30px Arial';
                }
                ctx.fillStyle = '#4e4e4e';
                ctx.fillText(redPocket, this._cxx(512.5), this._cyy(1190));
                this._updatePlane('btn');
            }.bind(this));
            realBtn.show();
            realBtn.onClick = function (sender) {
                // !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
                this.gameCtrl.showTiXian();
            }.bind(this);
        }
        this._updatePlane('btn');
    }

    drawPage(){
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        this._drawImageCenter('res/img/wolecaifangkuai.png', this._cxx(375), this._cyy(218), this._s(500), this._s(116), 'bg', null, this.imgid['bg']);
        let ctx1 = CanvasBase.getContext('btn');
        ctx1.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        const that = this;

        //无尽模式按钮
        const startBtn = new Button(CanvasBase.getCanvas('btn'));
        startBtn.center = {x:that._cxx(375),y:that._cyy(407)};
        startBtn.size = {width:that._s(390),height:that._s(130)};
        startBtn.image = 'res/img/battle/start.png';
        startBtn.show();
        startBtn.onClick = function (sender) {
            this.game._startGame(this.gameCtrl.clickStart.bind(this.gameCtrl),sender);
        }.bind(this);

        //参赛赢钱按钮
        const joinBtn = new Button(CanvasBase.getCanvas('btn'));
        joinBtn.center = {x:that._cxx(375),y:that._cyy(577)};
        joinBtn.size = {width:that._s(390),height:that._s(130)};
        joinBtn.image = 'res/img/battle/fight_against.png';
        joinBtn.onDisplay(function(){
            this._drawImageCenter('res/img/second/bonus4.png', this._cxx(200), this._cyy(531), this._s(100), this._s(100), 'btn', null, this.imgid['btn']);
            this._updatePlane('btn');
        }.bind(this));
        joinBtn.show();
        joinBtn.onClick = function (sender) {
            this.game._startGame(this.gameCtrl.showSessionInfo.bind(this.gameCtrl),sender);
        }.bind(this);

        let sysInfo ;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else{
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){

            //天天抽红包按钮
            const pickBtn = new Button(CanvasBase.getCanvas('btn'));
            pickBtn.origin = {x:that._cxx(82),y:that._cyy(1118)};
            pickBtn.size = {width:that._s(120),height:that._s(160)};
            pickBtn.image = 'res/img/battle/red_easy.png';
            pickBtn.show();
            pickBtn.onClick = function (sender) {
                this.game._login(this.gameCtrl.showPickPage.bind(this.gameCtrl),sender);
            }.bind(this);

            //皮肤中心按钮
            const skinBtn = new Button(CanvasBase.getCanvas('btn'));
            skinBtn.origin = {x:that._cxx(235),y:that._cyy(1118)};
            skinBtn.size = {width:that._s(120),height:that._s(160)};
            skinBtn.image = 'res/img/battle/skin.png';
            skinBtn.show();
            skinBtn.onClick = function (sender) {
                // 点击首页的皮肤按钮
                this.game._login(this.gameCtrl.clickSkin.bind(this.gameCtrl),sender);
            }.bind(this);

            //提现按钮
            const realBtn = new Button(CanvasBase.getCanvas('btn'));
            realBtn.origin = {x:that._cxx(392),y:that._cyy(1118)};
            realBtn.size = {width:that._s(120),height:that._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                const redPocket = UserService.redPocket.toString();
                if(redPocket.length > 7){
                    ctx.font = 'bold 18px Arial';
                } else if(redPocket.length > 4){
                    ctx.font = 'bold 24px Arial';
                }else{
                    ctx.font = 'bold 30px Arial';
                }
                ctx.fillStyle = '#4e4e4e';
                ctx.fillText(redPocket, this._cxx(452), this._cyy(1190));
                this._updatePlane('btn');
            }.bind(this));
            realBtn.show();
            realBtn.onClick = function (sender) {
                !!this.gameCtrl.showTiXian && this.gameCtrl.showTiXian(sender);
            }.bind(this);

            //更多游戏按钮
            const moreGame = new Button(CanvasBase.getCanvas('btn'));
            moreGame.origin = {x:that._cxx(548),y:that._cyy(1118)};
            moreGame.size = {width:that._s(120),height:that._s(160)};
            moreGame.image = 'res/img/second/gengduoyouxi.png';
            moreGame.show();
            moreGame.onClick = function (sender) {
                // 点击首页的更多游戏按钮
                !!this.gameCtrl.showMoreGame && this.gameCtrl.showMoreGame(sender);
            }.bind(this);

            //排行榜空按钮
            const rankBtn = new Button(CanvasBase.getCanvas('btn'));
            rankBtn.origin = {x:that._cxx(50),y:that._cyy(974)};
            rankBtn.size = {width:that._s(600),height:that._s(90)};
            rankBtn.show();
            rankBtn.onClick = function (sender) {
                // 点击首页的排行榜按钮
                this.game._login(this.gameCtrl.rankInner.bind(this.gameCtrl),sender);
            }.bind(this);

            if (UserService.openId){
                let openDataContext = CanvasBase.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = this.WIDTH;
                sharedCanvas.height = this.HEIGHT;
                CanvasBase.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    type:'start',
                    key: Config.openJumperScore,
                    me: {
                        threeListY:[760,826,895,936,726,974,1018],
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }

        }else{
            //排行榜按钮
            const rankBtn = new Button(CanvasBase.getCanvas('btn'));
            rankBtn.origin = {x:that._cxx(40),y:that._cyy(1118)};
            rankBtn.size = {width:that._s(120),height:that._s(160)};
            rankBtn.image = 'res/img/battle/ranking_iist.png';
            rankBtn.show();
            rankBtn.onClick = function (sender) {
                // 点击首页的排行榜按钮
                this.game._login(this.gameCtrl.rankInner.bind(this.gameCtrl),sender);
            }.bind(this);

            //天天抽红包按钮
            const pickBtn = new Button(CanvasBase.getCanvas('btn'));
            pickBtn.origin = {x:that._cxx(177.5),y:that._cyy(1118)};
            pickBtn.size = {width:that._s(120),height:that._s(160)};
            pickBtn.image = 'res/img/battle/red_easy.png';
            pickBtn.show();
            pickBtn.onClick = function (sender) {
                this.game._login(this.gameCtrl.showPickPage.bind(this.gameCtrl),sender);
            }.bind(this);

            //皮肤中心按钮
            const skinBtn = new Button(CanvasBase.getCanvas('btn'));
            skinBtn.origin = {x:that._cxx(315),y:that._cyy(1118)};
            skinBtn.size = {width:that._s(120),height:that._s(160)};
            skinBtn.image = 'res/img/battle/skin.png';
            skinBtn.show();
            skinBtn.onClick = function (sender) {
                // 点击首页的皮肤按钮
                this.game._login(this.gameCtrl.clickSkin.bind(this.gameCtrl),sender);
            }.bind(this);

            //提现按钮
            const realBtn = new Button(CanvasBase.getCanvas('btn'));
            realBtn.origin = {x:that._cxx(452.5),y:that._cyy(1118)};
            realBtn.size = {width:that._s(120),height:that._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = CanvasBase.getContext('btn');
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                const redPocket = UserService.redPocket.toString();
                if(redPocket.length > 7){
                    ctx.font = 'bold 18px Arial';
                } else if(redPocket.length > 4){
                    ctx.font = 'bold 24px Arial';
                }else{
                    ctx.font = 'bold 30px Arial';
                }
                ctx.fillStyle = '#4e4e4e';
                ctx.fillText(redPocket, this._cxx(512.5), this._cyy(1190));
                this._updatePlane('btn');
            }.bind(this));
            realBtn.show();
            realBtn.onClick = function (sender) {
                !!this.gameCtrl.showTiXian && this.gameCtrl.showTiXian(sender);
            }.bind(this);

            //更多游戏按钮
            const moreGame = new Button(CanvasBase.getCanvas('btn'));
            moreGame.origin = {x:that._cxx(590),y:that._cyy(1118)};
            moreGame.size = {width:that._s(120),height:that._s(160)};
            moreGame.image = 'res/img/second/gengduoyouxi.png';
            moreGame.show();
            moreGame.onClick = function (sender) {
                // 点击首页的更多游戏按钮
                !!this.gameCtrl.showMoreGame && this.gameCtrl.showMoreGame(sender);
            }.bind(this);
        }
        this._updatePlane('bg');
    }
}

export default SingleStartPage;