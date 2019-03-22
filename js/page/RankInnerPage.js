'use strict';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';
import PageCtrl from '../controller/PageCtrl';

class RankInnerPage extends PageBase{
    constructor(game) {
        console.log('RankInnerPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'rankInner';
    }
    onShow(result,cb) {
        CanvasBase._updateClip('rankInner');
        cb && cb();
        //进行版本判断，展示不同界面
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else {
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){
            //可以获取sharedCanvas
            this._drawRankInner();//背景

            if(UserService.openId){
                let openDataContext = CanvasBase.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = this.WIDTH;
                sharedCanvas.height = this.HEIGHT;
                CanvasBase.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    type:'friend',
                    key: Config.openJumperScore,
                    me: {
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }
        } else {
            //低版本
            this._drawRankInnerOld();
            console.log('微信版本太低');
        }
    }

    onHide() {
        console.log('RankInnerPage onHide');
        let openDataContext = wx.getOpenDataContext();//返回主页，向开放域传消息，清空缓存
        openDataContext.postMessage({
            type:'openOff',
            key: 'openOff',
        });
        this.hide();
    }

    _drawRankInner(){
        /**
         * 高版本好友榜画布,局部
         */
        console.log('_drawRankInner,high version');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*this.Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*this.Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/ranking_list.png', this._cxx(375), this._cyy(159), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(15);
        ctx.fillText('全球榜', this._cxx(305), this._cyy(243));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillStyle = '#FFC600';
        ctx.fillRect(this._cxx(400), this._cyy(269), this._s(90), this._s(5));
        ctx.fillText('好友榜', this._cxx(445), this._cyy(243));
        ctx.fillStyle = '#4E4E4E';
        ctx.textAlign = 'center';
        const globalBtn = new Button(CanvasBase.getCanvas('btn'));//全球榜按钮
        globalBtn.origin = {x:this._cxx(260),y:this._cyy(210)};
        globalBtn.size = {width:this._s(120),height:this._s(60)};
        globalBtn.show();
        globalBtn.onClick = function () {
            !!this.gameCtrl.rankGlobal && this.gameCtrl.rankGlobal();
            let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
            openDataContext.postMessage({
                type:'openOff',
                key: 'openOff',
            });
        }.bind(this);

        const backBtn = new Button(CanvasBase.getCanvas('btn'));//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            PageCtrl.popToRootPage();
            let openDataContext = wx.getOpenDataContext();//返回主页，向开放域传消息，清空缓存
            openDataContext.postMessage({
                type:'cache',
                key: 'cache',
            });
        }.bind(this);
        this._updatePlane('bg');
    }

    _drawRankInnerOld(){
        /**
         * 旧版本好友榜画布
         */
        console.log('_drawRankInnerOld');
        let ctx = CanvasBase.getContext('bg');
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*this.Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*this.Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*this.Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/ranking_list.png', this._cxx(375), this._cyy(159), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(15);
        ctx.fillText('全球榜', this._cxx(305), this._cyy(243));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillStyle = '#FFC600';
        ctx.fillRect(this._cxx(400), this._cyy(269), this._s(90), this._s(5));
        ctx.fillText('好友榜', this._cxx(445), this._cyy(243));
        ctx.fillStyle = '#4E4E4E';
        ctx.textAlign = 'center';
        ctx.font = this._cf(15);
        ctx.fillText('您的微信版本过低', this._cxx(375), this._cyy(610));
        ctx.fillText('不能获取好友榜单', this._cxx(375), this._cyy(650));

        const globalBtn = new Button(this.canvas['btn']);//全球榜按钮
        globalBtn.origin = {x:this._cxx(260),y:this._cyy(210)};
        globalBtn.size = {width:this._s(120),height:this._s(60)};
        globalBtn.show();
        globalBtn.onClick = function () {
            !!this.gameCtrl.rankGlobal && this.gameCtrl.rankGlobal();
        }.bind(this);

        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            PageCtrl.popToRootPage();
            let openDataContext = wx.getOpenDataContext();//返回主页，向开放域传消息，清空缓存
            openDataContext.postMessage({
                type:'cache',
                key: 'cache',
            });
        }.bind(this);
        this._updatePlane('bg');
    }
}

export default RankInnerPage;
