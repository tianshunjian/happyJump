'use strict';

import * as Config from '../base/Config.js';
import UserInfo from '../shared/service/UserInfo.js';
import EventEmitter from '../shared/event/events.js';

export const kUserServiceDidUpdate = 'kUserServiceDidUpdate';

class UserService extends EventEmitter{

    constructor(){
        super();
        ///当局已经获得的乐卡数
        this.todayLeCard = 0;
        //当局已经获得的五彩石数
        this.todayColorStone = 0;
    }

    get leCard(){
        return this._leCard || 0;
    }

    set leCard(l){
        if(typeof (l) != 'undefined'){
            this._leCard = l;
        }
    }

    get totalCardOneDay(){
        return this._totalCardOneDay || 0;
    }

    set totalCardOneDay(t){
        if(typeof (t) != 'undefined'){
            this._totalCardOneDay = t;
        }
    }

    get stepsByOneCard(){
        return this._stepsByOneCard || 0;
    }

    set stepsByOneCard(s){
        if(typeof (s) != 'undefined'){
            this._stepsByOneCard = s;
        }
    }

    get stepsByColorStone(){
        return this._stepsByColorStone || 0;
    }
    set stepsByColorStone(s){
        if(typeof (s) != 'undefined'){
            this._stepsByColorStone = s;
        }
    }

    get restColorStone(){
        return this._restColorStone || 0;
    }
    set restColorStone(s){
        if(typeof (s) != 'undefined'){
            this._restColorStone = s;
        }
    }

    get totalColorStone(){
        return this._totalColorStone || 0;
    }
    set totalColorStone(s){
        if(typeof (s) != 'undefined'){
            this._totalColorStone = s;
        }
    }

    //活动状态， 0 = init; 1 = finished; 2 = reception; 3 = register;
    get activityStatus(){
        return this._activityStatus || 0;
    }
    set activityStatus(s){
        if(typeof (s) != 'undefined'){
            this._activityStatus = s;
        }
    }

    get restLeCard(){
        return this._restLeCard || 0;
    }

    set restLeCard(r){
        if(typeof (r) != 'undefined'){
            this._restLeCard = r;
        }
    }

    get redPocket(){
        return this._redPocket||0;
    }

    set redPocket(r){
        if(typeof (r) != 'undefined'){
            this._redPocket = r;
        }
    }

    get historyScore(){
        return this._historyScore || 0;
    }
    set historyScore(i){
        if (typeof(i) != 'undefined'){
            this._historyScore = i;
        }
    }

    get revivalCard(){
        return this._revivalCard || 0;
    }

    set revivalCard(s){
        if (typeof (s) != 'undefined') {
            this._revivalCard = s;
        }
    }

    get restLeCardToday(){
        return this.restLeCard - this.todayLeCard;
    }

    updateTodayLeCard(num){
        if(typeof (num) != 'undefined'){
            this.todayLeCard = num;
        }
    }
    get restColorStoneToday(){
        return this.restColorStone - this.todayColorStone;
    }
    updateTodayColorStone(num){
        if(typeof (num) != 'undefined'){
            this.todayColorStone = num;
        }
    }

    //是否有未展示的中奖信息
    get haveAwardInfo(){
        return localStorage.getItem(Config.StorageKey.kHaveAwardInfo) || 0;
    }
    set haveAwardInfo(p){
        if (typeof (p)!='undefined'){
            localStorage.setItem(Config.StorageKey.kHaveAwardInfo,p);
        }
    }

    //玩普通场的局数
    get playNormalCount(){
        return localStorage.getItem(Config.StorageKey.kPlayNormalCount) || 0;
    }
    set playNormalCount(p){
        if (typeof (p)!='undefined'){
            localStorage.setItem(Config.StorageKey.kPlayNormalCount,p);
        }
    }

    //比赛场是否展示弹幕
    get showDanmu(){
        return localStorage.getItem(Config.StorageKey.kShowDanmu) || 0;
    }
    set showDanmu(s){
        localStorage.setItem(Config.StorageKey.kShowDanmu,s);
    }

    //是否第一次跳到特殊block
    get firstOnSpecialBlock(){
        return localStorage.getItem(Config.StorageKey.kFirstOnSpecialBlock) || 0;
    }
    set firstOnSpecialBlock(s){
        localStorage.setItem(Config.StorageKey.kFirstOnSpecialBlock,s);
    }

    //上一次退后台的时间
    get lastHideTime(){
        return localStorage.getItem(Config.StorageKey.kLastHideTime) || 0;
    }
    set lastHideTime(s){
        localStorage.setItem(Config.StorageKey.kLastHideTime,s);
    }

    synUserInfo(){
        console.log('UserService synUserInfo');
        this._skinInfo = UserInfo.skinInfoData;//皮肤数量，是数组
        //获取用户历史最高分
        for (let i=0;i<UserInfo.gameInfoData.length;++i){
            if (UserInfo.gameInfoData[i].id == 1){
                this.historyScore = UserInfo.gameInfoData[i].count;
                if(this.historyScore.toString() !== '-1'){
                    if (window.WechatGame){
                        //用户玩过跳一跳，存在最高分，将分数上传到好友榜
                        wx.setUserCloudStorage({
                            KVDataList:[{key:Config.openJumperScore,value:this.historyScore.toString()}]
                        });
                    }
                }
                break;
            }
        }
        //原乐卡、红包、免费次数、复活卡数
        for(let i = 0;i < UserInfo.knapsackInfoData.length;i++){
            const synInfoItem = UserInfo.knapsackInfoData[i];
            switch (synInfoItem.id){
            case 1:
                //LE_CARD
                this.leCard = synInfoItem.count;
                break;
            case 2:
                //RED_POCKET
                this.redPocket = synInfoItem.count;
                break;
            case 3:
                //GAME_2048_TICKET
                break;
            case 4:
                //GAME_JUMPER_FREELOTTERY
                this.freeLotteryNum = synInfoItem.count;
                break;
            case 5:
                //GAME_REVIVED_CARD
                this.revivalCard = synInfoItem.count;
                break;
            }
        }
        this.emit(kUserServiceDidUpdate);
    }

    get pack(){

        ///用户背包 "gameInfoData":{"leCard":4,"redPocket":0,"freeLotteryNum":0}}}
        if (!this._pack) {
            this._pack = localStorage.getItem(Config.StorageKey.kUserPack);
        }

        return this._pack || {leCard:0,redPocket:0,freeLotteryNum:0,jumperSkin:[]};
    }

    set pack(p){
        if(typeof (p) != 'undefined'){
            this._pack = Object.assign({},p);
            localStorage.setItem(Config.StorageKey.kUserPack,this._pack);
        }
    }

    set timesToGetRedPocket(t){
        if(typeof (t) != 'undefined'){
            this._timesToGetRedPocket = t;
        }
    }

    get timesToGetRedPocket(){
        return this._timesToGetRedPocket || 0;
    }

    ///获取用户昵称
    get nickName(){
        // let nickName = this.userInfo.nickName;
        let nickName;
        nickName = UserInfo.userInfoData.nickName;
        nickName = unescape(nickName);
        return nickName;
    }

    ///获取用户头像
    get avatarUrl(){
        return UserInfo.userInfoData.avatarUrl;
    }

    ///获取免费抽奖次数
    get freeLotteryNum(){
        return this._freeLotteryNum || 0;
    }

    set freeLotteryNum(f){
        if(typeof (f) != 'undefined') {
            this._freeLotteryNum = f;
        }
    }

    get openId(){
        return UserInfo.userInfoData.openId;
    }

    /**
     * 是否开启了新皮肤，通过抽奖获取的
     * @return {boolean}
     */
    hasNewSkin(){
        console.log('this._skinInfo--'+JSON.stringify(this._skinInfo));
        return (this._skinInfo && this._skinInfo.length > 0);
    }

    /***
     * jumperSkin中添加皮肤
     * @param num 皮肤编号
     */
    setNewSkin(num) {
        this._skinInfo.push(num);//存入的是新皮肤的ID
    }
    /**
     * 修改默认皮肤
     * @param [number] i | 0:默认皮肤，1:新皮肤
     */
    switchDefaultSkin(i){
        i = i || 0;
        localStorage.setItem(Config.StorageKey.kSkinIdx,i);
        // TODO 选择哪个皮肤
    }

    /**
     * 获取当前使用的皮肤
     * @return {number}  0:默认皮肤，1:新皮肤
     */
    currentSkin(){
        return localStorage.getItem(Config.StorageKey.kSkinIdx) || 0;
    }

    clearLeCards(){
        this.todayLeCard = 0;
        this.leCards = [];
    }

    clearColorStones(){
        this.todayColorStone = 0;
        this.colorStones = [];
    }

    /**
     * @param {number}step 墩子位置
     * @return {object} true:生成乐卡，false:不生成
     */
    queryLeCard(step){
        step = step + 1; //返回下一个block是否包含乐卡
        ///[0~max-1]
        const random = function (max) {
            return Math.floor(Math.random() * (max - 1));
        };

        const self = this;

        const generateOne = function (steps) {
            const r = random(steps);
            const currentMaxRangeIdx = (self.leCards.length == 0) ? 0 : self.leCards.length * steps;
            let leIdx = r + currentMaxRangeIdx;
            if (leIdx === 0) {
                leIdx = 1;  //如果第一个乐卡恰好在第0块上，则改为第1块
            }
            if (steps===1){
                leIdx = self.leCards.length+1;
            }
            self.leCards.push(leIdx);
            return leIdx;
        };

        if (!this.totalCardOneDay){
            console.error('totalCardOneDay:' + this.totalCardOneDay);
            return {flag:false};
        } else {
            if (!this.leCards){
                this.leCards = [];
            }
            console.error('leCards:' + JSON.stringify(this.leCards));
            const stepsByOneCard = this.stepsByOneCard;
            const restLeCard = this.restLeCardToday;
            // 达到乐卡上限后不再生成
            if (restLeCard < 1){
                return {flag:false};
            }

            let lastIdx = -1;
            if(this.leCards.length > 0){
                lastIdx = this.leCards[this.leCards.length - 1];
            }
            ///队列里的最后一张等于当前步
            if (lastIdx == step){
                return {flag:true,index:this.leCards.length-1};
            } else{
                const max = this.leCards.length * stepsByOneCard - 1;
                ///需要生成一张乐卡【一张都没有,或者超出了当前区域了】
                if (step > max){
                    const leIdx = generateOne(stepsByOneCard);
                    console.error('leCards:' + JSON.stringify(this.leCards));
                    const flag = step == leIdx;
                    if (flag){
                        return {flag:true,index:this.leCards.length-1};
                    } else {
                        return {flag:false};
                    }
                }else {
                    return {flag:false};
                }
            }
        }
    }

    /**
     *
     * @param {number}step 墩子位置
     * @returns {object} true:生成乐卡，false:不生成
     */
    queryColorStone(step){
        step = step + 1; //返回下一个block是否包含乐卡
        ///[0~max-1]
        const random = function (max) {
            return Math.floor(Math.random() * (max - 1));
        };

        const self = this;

        const generateOne = function (steps) {
            const r = random(steps);
            const currentMaxRangeIdx = (self.colorStones.length == 0) ? 0 : self.colorStones.length * steps;
            let leIdx = r + currentMaxRangeIdx;
            if (leIdx === 0) {
                leIdx = 1;  //如果第一个乐卡恰好在第0块上，则改为第1块
            }
            if (steps===1){
                leIdx = self.colorStones.length+1;
            }
            self.colorStones.push(leIdx);
            return leIdx;
        };

        // if (this.totalColorStone>=500){
        //     console.error('totalCardOneDay:' + this.totalCardOneDay);
        //     return {flag:false};
        // } else {
        if (!this.colorStones){
            this.colorStones = [];
        }
        console.error('colorStones:' + JSON.stringify(this.colorStones));
        const stepsByOneCard = this.stepsByColorStone;
        const restColorStoneToday = this.restColorStoneToday;
        // 达到五彩石上限后不再生成
        if (restColorStoneToday < 1){
            return {flag:false};
        }

        let lastIdx = -1;
        if(this.colorStones.length > 0){
            lastIdx = this.colorStones[this.colorStones.length - 1];
        }
        ///队列里的最后一张等于当前步
        if (lastIdx == step){
            return {flag:true,index:this.colorStones.length-1};
        } else{
            const max = this.colorStones.length * stepsByOneCard - 1;
            ///需要生成一张乐卡【一张都没有,或者超出了当前区域了】
            if (step > max){
                const leIdx = generateOne(stepsByOneCard);
                console.error('colorStones:' + JSON.stringify(this.colorStones));
                const flag = step == leIdx;
                if (flag){
                    return {flag:true,index:this.colorStones.length-1};
                } else {
                    return {flag:false};
                }
            }else {
                return {flag:false};
            }
        }
        // }
    }

    ///游客登录用户
    isTourist(){

        if(window.WechatGame){
            return false;
        }else {
            const appInfo = UserInfo._appInfo;
            if (appInfo){
                if (appInfo.identifier && appInfo.identifier.length>0){
                    return false;
                } else{
                    return true;
                }
                // return appInfo.identifier ? false : true;
            }else {
                return true;
            }
        }
    }
}

export default new UserService();
