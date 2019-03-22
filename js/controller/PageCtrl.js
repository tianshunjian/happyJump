import CanvasBase from '../base/CanvasBase.js';
import RankList from '../base/RankList';

var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素

class  PageCtrl{

    constructor(){
        console.log('pageCtrl');
        this.instance = null;
        this.game = null;
        this._scenesStack = [];
        this.CANVASTYPE = { // 当前绘制的2D场景
            'friendRank': 0, // 好友排行榜
            'groupRank': 1,
            'gameOver': 2,
            'start': 3,
            'pk': 4,
            'lookers': 5,
            'gameOverNew': 6, //结算页显示新手引导
            'gameOverHighest': 7, // 结算页达到排行榜最高 / 历史最高
            'beginner': 8 ,//新手引导页

            'overAgain':9, //再来一次界面
            'skin':10,//皮肤界面

            'newSkin':11,
            'everydayPick':12,//天天抽红包界面
            'pickOnce':13, //抽一次
            'pickFive':14,//抽五次

            'rankLeCard':16,//乐卡排行榜
            'rankInner':17,//好友榜排行榜
            'rankGlobal':18, //全球榜

            'game':19,//游戏内，标记区分

            'prizeRecord':21,//获奖记录界面
            'doBetter':22, //再接再厉界面
            'revival':23, //立即复活界面
            'winAndDisplay':24,//达到指定得分，胜利页面
            'prizeRankLast':25,//获奖榜单，上期排行榜
            'prizeRankMoney':26,//获奖榜单，奖金榜
            'playNotice':27,//场次预告
            'congratulation':28,//恭喜获奖，炫耀一下界面
            'awardList':29,//获奖榜单详情，从恭喜获奖点击查看详情跳转的
            'sessionInfo':30,//场次预告
            'xiacizaizhan':32,//下次再战
            'netError':33,//网络错误弹窗

            'test':34,//测试页
            'test2':35,
            'testHorizontalList':100,//测试水平列表
        };
        this._touchInfo = {trackingID: -1, maxDy: 0, maxDx: 0};
        Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
    }

    getGame(game){
        this.game = game;
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new PageCtrl();
        }
        return this.instance;
    }

    /**
     * 向后返回前根场景
     */
    popToRootPage(){
        if(!this._scenesStack) return;
        let lastPage = this._scenesStack.pop().page;
        // lastPage.onHide();
        this._scenesStack = [this._scenesStack[0]];
        this._scenesStack[0].page.onShow(this._scenesStack[0].sender,function () {
            lastPage && lastPage.onHide();
        }.bind(this));//展示新界面
        this.game.gameModel.setStage(this._scenesStack[0].page.name);//设置当前栈顶界面
        this.canvasType = this._scenesStack[0].page.name;
        console.log('当前导航栈',this._scenesStack);
    }

    /**
     * 前进页面处理，加入导航栈
     * @param page 将压栈的页面
     * @param result 参数（防连击按钮）
     */
    pushPage(page,result){
        console.log('PageCtrl pushPage');
        let lastPage;
        //如果存在前一界面，需要在新界面绘制前进行隐藏
        if(this._scenesStack.length >= 1){
            lastPage = this._scenesStack[this._scenesStack. length-1].page;
        }

        let isPageIn = this.sceneStackLevel(page.name);
        if (isPageIn > -1){
            //栈中已有此界面
            this.popToAlreadyPage(isPageIn,result,lastPage);
        }else{
            //界面未入栈
            this.game.gameModel.setStage(page.name);//设置当前栈顶界面
            this._scenesStack.push({
                page:page,
                sender:result
            }); //新界面入栈
            page.onShow(result,function () {
                lastPage && lastPage.onHide();
            }.bind(this));//展示新界面
            this.canvasType = page.name;//设定当前canvasType
        }
        console.log('当前导航栈',this._scenesStack);
    }

    /**
     * 后退页面处理，恢复场景，一层页面返回时调用
     */
    popPage(sender){
        console.log('PageCtrl popPage');

        if(!this._scenesStack) return;
        let lastPage = this._scenesStack.pop().page;//界面出栈
        // lastPage.onHide();//隐藏之前的界面
        /// 显示返回后的界面
        let currSceneJS = this._scenesStack[this._scenesStack.length-1].page;
        this.game.gameModel.setStage(currSceneJS.name);
        currSceneJS.onShow(sender,function () {
            lastPage && lastPage.onHide();
        }.bind(this));
        this.canvasType = this._scenesStack[this._scenesStack.length-1].page.name;
        console.log('当前导航栈',this._scenesStack);
    }


    /**
     * 获取指定scene名字的导航栈层级
     * @param {string} sceneName -场景名字
     */
    sceneStackLevel(sceneName){
        // logger.log('sceneStackLevel sceneName = ' + sceneName);

        let locScenesStack = this._scenesStack;

        let i = locScenesStack.length-1;
        let exist = false;
        for(; i>=0; --i){
            if(locScenesStack[i].page.name === sceneName){
                exist = true;
                break;
            }
        }

        if(exist){
            return i+1;
        }

        return -1;
    }

    /**
     * 跳转回此页面当时存在的位置
     * @param level 所在层级
     * @param result 参数
     * @param lastPage 需要隐藏的前一页
     */
    popToAlreadyPage(level,result,lastPage){
        console.log('跳转回指定页面--前--的导航栈',this._scenesStack);
        this._scenesStack = this._scenesStack.slice(0,level);
        console.log('跳转回指定页面--后--的导航栈',this._scenesStack);

        let currSceneJS = this._scenesStack[this._scenesStack.length-1];
        this.game.gameModel.setStage(currSceneJS.page.name);
        currSceneJS.page.onShow(result,function () {
            lastPage && lastPage.onHide();
        }.bind(this));
        this._scenesStack[this._scenesStack.length-1].sender = result;
        this.canvasType = this._scenesStack[this._scenesStack.length-1].page.name;
    }

    /**
     *点击事件控制
     */

    doTouchStartEvent(e,canvasType) {
        if(this.canvasType == 'rankGlobal' || this.canvasType == 'prizeRankMoney'|| this.canvasType == 'prizeRankLast' || this.canvasType == 'prizeRecord' || this.canvasType == 'awardList'){
            RankList.doTouchStartEvent(e);
            return;
        }
        let pageX;
        let pageY;
        if (window.WechatGame){
            pageX = e.changedTouches[0].pageX;
            pageY = e.changedTouches[0].pageY;
        }else{
            if (window.isMobile){
                pageX = e.changedTouches[0].pageX;
                pageY = e.changedTouches[0].pageY;
            } else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
        }
        console.log('PageCtrl touchstart: {'+pageX+','+pageY+'}');
        this.startX = pageX;
        this.startY = pageY;
        if(this.canvasType == 'rankGlobal'|| this.canvasType == 'prizeRecord'|| this.canvasType == 'prizeRankLast'|| this.canvasType == 'prizeRankMoney'||this.canvasType=='awardList'||this.canvasType == 'testHorizontalList'){

            let touchInfo = this._touchInfo;
            let listener = this.scrollHandler;
            if (!listener) return;

            touchInfo.trackingID = 'touch';
            if (window.WechatGame){
                touchInfo.x = e.touches[0].pageX;
                touchInfo.y = e.touches[0].pageY;
            }else{
                if (window.isMobile){
                    touchInfo.x = e.touches[0].pageX;
                    touchInfo.y = e.touches[0].pageY;
                } else {
                    touchInfo.x = e.pageX;
                    touchInfo.y = e.pageY;
                }
            }

            touchInfo.maxDx = 0;
            touchInfo.maxDy = 0;
            touchInfo.historyX = [0];
            touchInfo.historyY = [0];
            touchInfo.historyTime = [ + new Date()];//转换成Number类型
            touchInfo.listener = listener;

            if (listener.onTouchStart) {
                listener.onTouchStart();
            }
        }
    }

    doTouchMoveEvent(e,canvasType) {

        if(this.canvasType == 'rankGlobal'|| this.canvasType == 'prizeRankMoney'|| this.canvasType == 'prizeRankLast'|| this.canvasType == 'prizeRecord' || this.canvasType == 'awardList'){
            RankList.doTouchMoveEvent(e);
            return;
        }

        let touchInfo = this._touchInfo;
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        let delta = this._findDelta(e);
        if (!delta) return;
        touchInfo.maxDy = Math.max(touchInfo.maxDy, Math.abs(delta.y));
        touchInfo.maxDx = Math.max(touchInfo.maxDx, Math.abs(delta.x));

        // This is all for our crummy velocity computation method. We really
        // should do least squares or anything at all better than just taking
        // the difference between two random samples.
        let timeStamp = +new Date();
        touchInfo.historyX.push(delta.x);
        touchInfo.historyY.push(delta.y);
        touchInfo.historyTime.push(timeStamp);
        while (touchInfo.historyTime.length > 10) {
            touchInfo.historyTime.shift();
            touchInfo.historyX.shift();
            touchInfo.historyY.shift();
        }
        if (touchInfo.listener && touchInfo.listener.onTouchMove) touchInfo.listener.onTouchMove(delta.x, delta.y, timeStamp);

    }

    doTouchEndEvent(e,canvasType) {
        if(this.canvasType == 'rankGlobal'|| this.canvasType == 'prizeRankMoney'|| this.canvasType == 'prizeRankLast'|| this.canvasType == 'prizeRecord' || this.canvasType == 'awardList'){
            RankList.doTouchEndEvent(e);
            return;
        }
        // if (!this.showState) return;
        // this.canvasType = canvasType;
        // 触摸返回按钮
        let __pageX;
        let __pageY;
        if (window.WechatGame){
            __pageX = e.changedTouches[0].pageX;
            __pageY = e.changedTouches[0].pageY;
        }else{
            if (window.isMobile){
                __pageX = e.changedTouches[0].pageX;
                __pageY = e.changedTouches[0].pageY;
            } else {
                __pageX = e.pageX;
                __pageY = e.pageY;
            }
        }
        let isClick = true;
        if ((this.canvasType == this.CANVASTYPE['friendRank'] || this.canvasType == this.CANVASTYPE['groupRank'] || this.canvasType == this.CANVASTYPE['pk'] || this.canvasType == this.CANVASTYPE['gameOver'] ||this.canvasType == this.CANVASTYPE['rankGlobal'] || this.canvasType == this.CANVASTYPE['rankLeCard']|| this.canvasType == this.CANVASTYPE['prizeRecord']||this.canvasType==this.CANVASTYPE['awardList'] || this.canvasType == this.CANVASTYPE['testHorizontalList']) && (Math.abs(pageX - this.startX) > 5 || Math.abs(pageY - this.startY) > 5)) {
            // 不认为是一次 click
            isClick = false;
        }
        const pageX = this._cxp(__pageX);
        const pageY = this._cyp(__pageY);
        const _pageX = __pageX * Dpr;
        const _pageY = __pageY * Dpr;

        if (isClick) {
            !!CanvasBase.getCanvas('btn').handleEvent && CanvasBase.getCanvas('btn').handleEvent({point:{x:_pageX,y:_pageY}});
        }
        let touchInfo = RankList._touchInfo;
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        let delta = this._findDelta(e);
        if (!delta) return;
        let listener = touchInfo.listener;
        touchInfo.trackingID = -1;
        touchInfo.listener = null;

        let sampleCount = touchInfo.historyTime.length;
        let velocity = {
            x: 0,
            y: 0
        };
        if (sampleCount > 2) {
            let idx = touchInfo.historyTime.length - 1;
            let lastTime = touchInfo.historyTime[idx];
            let lastX = touchInfo.historyX[idx];
            let lastY = touchInfo.historyY[idx];
            while (idx > 0) {
                idx--;
                let t = touchInfo.historyTime[idx];
                let dt = lastTime - t;
                if (dt > 30 && dt < 50) {
                    // Ok, go with this one.
                    velocity.x = (lastX - touchInfo.historyX[idx]) / (dt / 1000);
                    velocity.y = (lastY - touchInfo.historyY[idx]) / (dt / 1000);
                    break;
                }
            }
        }
        touchInfo.historyTime = [];
        touchInfo.historyX = [];
        touchInfo.historyY = [];

        if (listener && listener.onTouchEnd) listener.onTouchEnd(delta.x, delta.y, velocity);
    }

    /** --------工具函数---------- */

    _findDelta(e) {
        let touchInfo = this._touchInfo;
        let touches;
        if (window.WechatGame){
            touches = e.touches[0] || e.changedTouches[0];
        }else{
            if (window.isMobile){
                touches = e.touches[0] || e.changedTouches[0];
            }else{
                touches = {pageX:e.pageX,pageY:e.pageY};
            }
        }
        if (touches) return {x: touches.pageX - touchInfo.x, y: touches.pageY - touchInfo.y};
        return null;
    }

    _cxp(x) {
        // 根据坐标反推出x
        return x / W * 414;
    }

    _cyp(y) {
        // 根据坐标反推出y
        let really;
        if (H / W > 736 / 414) {
            // 某X
            // 屏幕显示区域的高度h: WIDTH*736/414, 上下留白是  (HEIGHT - h)/2
            really = (y - (H - W * 736 / 414) / 2) / W * 414;
        } else {
            really = y / H * 736;
        }
        return really;
    }

}
export  default  PageCtrl.getInstance();