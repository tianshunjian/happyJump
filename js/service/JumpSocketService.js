'use strict';

import GameSocketConnector from '../shared/service/GameSocketConnector.js';
import RouteConstants from './RouteConstants.js';
import EventEmitter from '../shared/event/events.js';
import UserService from './UserService.js';
import ShareUtil from './ShareUtil.js';
import SignService from './SignService.js';

class JumpSocketService extends EventEmitter {

    /**
     * 监听广播；回调收到的结构体如下：
     * {"playCount":1,"priority":3,"showInBattle":-1,"id":"IDS_Trumpet_Content_02","createTime":1529045884391,"content":"恭喜mango在我乐踩方块游戏获得乐卡x9","extInfo":{avatarUrl:'https://wx.qlogo.cn/mmopen/vi_32/6eMXNWvYk60U3v2QPGesI3Brd7iaiaNSDjVA7JdV4F5hGf3C9EwNSjv3sLBKb6cEq8w1nKPGPUoqiaaOic4TDL3gAQ/132'}}
     */
    onTrumpet(id,callback){

        if (!this._initListenTrumpet){
            this._initListenTrumpet = true;
            GameSocketConnector.listenTrumpet(window.BroadcastConfigs,function (msg) {
                console.log('received trumpet:' + JSON.stringify(msg));
                const id = msg.id;
                if (id){
                    this.emit(id,msg);
                }
            }.bind(this));
        }
        this.on(id,callback);
    }

    /**
     * 移除广播监听
     */
    offTrumpet(id,callback){
        this.off(id,callback);
    }

    _req(route,ps,cb){

        const req = new ReqCancel();
        req.callback = cb;

        const c = function (err,data) {
            req._invokeCallback(err,data);
        };

        SignService.fastSignIn(function (err) {
            if (err){
                c && c(err);
            } else {
                GameSocketConnector.request(route,ps,c);
            }
        });

        return req;
    }

    _reqV2(route,ps,cb){

        const req = new ReqCancel();
        req.callback = cb;

        const c = function (err,data) {
            req._invokeCallback(err,data);
        };

        SignService.fastSignIn(function (err) {
            if (err){
                c && c(err);
            } else {
                GameSocketConnector.requestV2(route,ps,c);
            }
        });

        return req;
    }

    //分享成功
    sharedByType(page,cb){

        console.log('page = '+page);
        console.log('window.ShareConfigs: ');
        console.log(window.ShareConfigs);
        let type = -1;
        for (let i = 0; i < window.ShareConfigs.length; i ++){
            const item = window.ShareConfigs[i];
            if (item.page == page){
                type = item.type;
                break;
            }
        }

        if (type > 0){
            this._reqV2(RouteConstants.GAME_SHARE_TYPE,{type:type},function (err,result) {

                // {"code":1,
                // "currentItem":
                //      {"isFinished":1,"finishContent":"IDS_Share_Content_08_01_01","content":"IDS_Share_Content_08_01_02","params":"[1]","awardList":[{"type":1,"itemId":5,"itemType":1,"itemCount":1,"itemValidTime":-1,"id":"6"}],
                //          "powerList":[]},
                // "nextItem":{"isFinished":0,"finishContent":"","content":"IDS_Share_Content_08_01_02","params":"[1]","awardList":[{"type":1,"itemId":5,"itemType":1,"itemCount":1,"itemValidTime":-1,"id":"6"}],"powerList":[]},"effectiveTime":-1}

                if(err){
                    cb && cb(err);

                } else {

                    const textWithID = function (id,ps) {
                        const config = window.BroadcastConfigs;
                        const templateObj = config[id];
                        if (templateObj){
                            let template = templateObj.ZH_CN;
                            ///替换占位符，构建文案
                            const params = JSON.parse(ps) || [];
                            for (let i = 0; i < params.length; i ++){
                                let p = params[i];
                                p = unescape(p);
                                template = template.replace('{' + i + '}',p);
                            }
                            return template;
                        }
                        return '';
                    };

                    const currentItem = result.currentItem;
                    const isFinished = currentItem.isFinished;
                    let toastText = '';
                    ///完成后处理权益增加
                    if (isFinished){
                        toastText = textWithID(currentItem.finishContent,currentItem.params);
                        const nextItem = result.nextItem;
                        const awardList = currentItem.awardList;
                        const powerList = currentItem.powerList;
                        awardList.forEach(function (item) {
                            const itemCount = item.itemCount;
                            switch (item.itemId){
                            // 1：乐卡；2：红包；3：2048门票；4：免费抽奖次数；5：复活卡
                            case 1:{
                                UserService.leCard += itemCount;
                                console.log('乐卡：' + UserService.leCard);
                                break;
                            }
                            case 2:{
                                UserService.redPocket += itemCount / 100.0;
                                console.log('红包：' + UserService.redPocket);
                                break;
                            }
                            case 3:{
                                break;
                            }
                            case 4:{
                                UserService.freeLotteryNum += itemCount;
                                console.log('免费抽：' + UserService.freeLotteryNum);
                                break;
                            }
                            case 5:{
                                UserService.revivalCard += itemCount;
                                console.log('复活卡：' + UserService.revivalCard);
                                break;
                            }
                            }
                        });
                        //普通场结果页 —— 分享获得乐卡特权
                        powerList.forEach(function (item) {
                            const realValue = item.realValue;
                            switch (item.id){
                            case 2:
                            case 9:
                            case 10:
                                //乐卡上限增加
                                UserService.restLecard += realValue;
                                break;
                            case 1:
                            case 8:
                                //乐卡出现概率改变
                                UserService.stepsByOneCard = realValue;
                                break;
                            }
                        });

                        const c = nextItem.content;
                        const template = textWithID(c,nextItem.params);
                        if (template) {
                            ShareUtil.updatePlaceHolderText(page,template);
                        }
                    }else {
                        const c = currentItem.content;
                        toastText = textWithID(c,currentItem.params);
                    }

                    const m = {
                        text:toastText,
                    };
                    console.log('toast:' + toastText);
                    cb && cb(undefined,m);
                }
            });
        }else {
            cb && cb({msg:'type<=0'});
        }
    }

    //使用复活卡
    useRevivalCard(ps,cb){
        return this._req(RouteConstants.GAME_USE_REVIVAL,ps,cb);
    }

    //普通场
    startGame(ps,callback){
        return this._req(RouteConstants.GAME_START,ps,callback);
    }

    endGame(ps,cb){
        return this._req(RouteConstants.GAME_END,ps,cb);
    }

    //上报乐卡
    pickLecard(ps,cb){
        return this._req(RouteConstants.GAME_PICKED_LECARD,ps,cb);
    }

    //上报五彩石
    pickColorStone(ps,cb){
        return this._req(RouteConstants.GAME_PICKED_COLORSTONE,ps,cb);
    }

    //比赛场
    registerGame4Compete(ps,cb){
        return this._req(RouteConstants.COMPETE_GAME_REGISTER,ps,cb);
    }
    startGame4Compete(ps,cb){
        return this._req(RouteConstants.COMPETE_GAME_START,ps,cb);
    }
    endGame4Compete(ps,cb){
        return this._req(RouteConstants.COMPETE_GAME_END,ps,cb);
    }

    //恭喜获奖信息
    awardInfo4Compete(ps,cb){
        return this._req(RouteConstants.CHAMPIONSHIP_AWARD,ps,cb);
    }

    // 场次预告
    sessionInfo(ps,callback){
        return this._req(RouteConstants.CHAMPION_SESSION_INIT,ps,callback);
    }
    // 场次预约
    sessionReservation(ps,callback){
        return this._req(RouteConstants.CHAMPION_RESERVATION_ID,ps,callback);
    }

    // 奖金榜/全球榜/乐卡榜
    prizeRank(ps,callback){
        return this._req(RouteConstants.GAME_ALLRANK_LIST,ps,callback);
    }

    // 获奖榜单-上期排行榜
    prizeRankLast(ps,callback){
        return this._req(RouteConstants.GAME_LASTRANK_LIST,ps,callback);
    }

    // 获奖记录
    prizeRecord(ps,callback){
        return this._req(RouteConstants.CHAMPION_AWARD_HISTORY,ps,callback);
    }

    //获取抽奖配置
    lotteryItemConfigs(ps,callback){
        return this._reqV2(RouteConstants.GAME_LOTTERY_LIST,ps,callback);
    }

    //开始抽奖
    startLottery(ps,callback){
        return this._req(RouteConstants.GAME_START_LOTTERY,ps,callback);
    }

    /**
     * 大理寺活动
     */
    initActivity(ps,callback){
        return this._req(RouteConstants.INIT_ACTIVITY,ps,callback);
    }
    acceptActivity(ps,callback){
        return this._req(RouteConstants.ACCEPT_ACTIVITY,ps,callback);
    }
    registerActivity(ps,callback){
        return this._req(RouteConstants.REGISTER_ACTIVITY,ps,callback);
    }
    acquireActivityAward(ps,callback){
        return this._req(RouteConstants.ACQUIRE_ACTIVITY_AWARD,ps,callback);
    }
    shareByTypeActivity(callback){
        let type = 12;
        for (let i = 0; i < window.ShareConfigs.length; i ++) {
            const item = window.ShareConfigs[i];
            if (item.page == '8') {
                type = item.type;
                break;
            }
        }
        this._reqV2(RouteConstants.GAME_SHARE_TYPE, {type: type}, function (err,result) {
            let count = 0;
            if (!err && result) {
                let awardList = result.currentItem.awardList || [];
                for (let i = 0; i < awardList.length; i++) {
                    if (awardList[i].itemId == 18) {
                        count = awardList[i].itemCount;
                        break;
                    }
                }
            }
            callback && callback(err, count);
        });
    }

}

export class ReqCancel {
    constructor(){
        this._callback = undefined;
    }

    set callback(c){
        this._callback = c;
    }

    get callback(){
        return this._callback;
    }

    set target(t){
        this._target = t;
    }

    get target(){
        return this._target;
    }

    cancel(){
        this.callback = undefined;
    }

    _invokeCallback(err,data){

        const callback = this.callback;

        if (callback){
            if (this.target){
                callback.call(this.target,err,data);
            } else {
                callback(err,data);
            }
        }else {
            console.error('cancel req\'s resp:'+err+data);
        }
    }
}

export default new JumpSocketService();
