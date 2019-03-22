'use strict';

import SignUtil from '../shared/service/SignUtil.js';
import SocketConnector from '../shared/service/GameSocketConnector.js';
import ROUTE from './RouteConstants.js';
import UserService from './UserService.js';
import {GameMode} from '../shared/service/Constants.js';
import {NetworkStatusChanged} from '../shared/service/NetStatusUtil.js';
import NetStatusUtil from '../shared/service/NetStatusUtil.js';
import MRUtil from '../util/MRUtil.js';
import Application from '../shared/bridge/Application';
import UserInfo from '../shared/service/UserInfo';

class SignService {

    //游戏初始化
    static _initGame(){
        return new Promise(function (resolve,reject){
            SocketConnector.request(ROUTE.GAME_INIT,{},function (err,result) {
                if(err){
                    reject(err);
                }else {
                    const gameConfigs = result.gameConfigs;
                    UserService.totalCardOneDay = gameConfigs.totalCardOneDay;
                    UserService.stepsByOneCard = gameConfigs.stepsByOneCard;
                    UserService.stepsByColorStone = gameConfigs.stepsByColorStone;
                    UserService.leCard = result.totalLeCard;
                    UserService.totalColorStone = result.totalColorStone;
                    UserService.timesToGetRedPocket = result.timesToGetRedPocket;
                    resolve();
                }
            });
        });
    }

    static _initShare(){
        return new Promise(function (resolve,reject){
            SocketConnector.requestV2(ROUTE.ShareInit,{gameMode:GameMode()},function (err,result) {
                if(err){
                    window.ShareConfigs = [];
                    reject(err);
                }else {
                    // [{"page":"2","type":2,"content":"IDS_Share_Content_21","shareCount":1,"awardList":{},"powerList":{"id":"1","type":1,"realValue":50,"level":1,"validTime":-1,"validType":1},"effectiveTime":1529488768882},{"page":"3","type":5,"content":"IDS_Share_Content_51","shareCount":1,"awardList":{},"powerList":{"id":"4","type":4,"realValue":100,"level":1,"validTime":-1,"validType":1},"effectiveTime":1529488768882},{"page":"4","type":7,"content":"IDS_Share_Content_71","shareCount":1,"awardList":{"type":1,"itemId":4,"itemType":1,"itemCount":1,"itemValidTime":-1,"id":"5"},"powerList":{},"effectiveTime":1529488768882},{"page":"5","type":9,"content":"IDS_Share_Content_91","shareCount":1,"awardList":{"type":1,"itemId":5,"itemType":1,"itemCount":1,"itemValidTime":-1,"id":"6"},"powerList":{},"effectiveTime":1529488768882}]
                    const typeList = result.typeList;
                    const config = window.BroadcastConfigs;
                    if (typeList instanceof Array){
                        typeList.forEach(function (item) {
                            const c = item.content;

                            // item.effectiveTime 冷却时间不处理
                            const templateObj = config[c];
                            if (templateObj){
                                let template = templateObj.ZH_CN;
                                ///替换占位符，构建文案
                                const params = JSON.parse(item.params) || [];
                                for (let i = 0; i < params.length; i ++){
                                    let p = params[i];
                                    p = unescape(p);
                                    template = template.replace('{' + i + '}',p);
                                }
                                item.content = template;
                            }
                        });
                        window.ShareConfigs = typeList ;
                    }else{
                        window.ShareConfigs = [];
                    }
                    console.log(JSON.stringify(typeList));
                    resolve();
                }
            });
        });
    }

    static fastSignIn(callback){

        if (this._signInCallbacks) {
            console.log('SignService fastSignIn 多次。。。。。');
            this._signInCallbacks.push(callback);
        }else {

            this._signInCallbacks = [];
            this._signInCallbacks.push(callback);

            const handler = function (err) {
                const cbs = this._signInCallbacks;
                this._signInCallbacks = undefined;

                console.log('Clean SignService fastSignIn queue。。。。。');

                cbs && cbs.forEach(function (cb) {
                    cb(err);
                });
            }.bind(this);

            SignUtil.fastLogin(function (s) {
                const err = s.error;
                if (err){
                    handler(err);
                } else {
                    //是否走了登录接口，没走登录接口直接回调给上层时，就不要去同步信息！
                    const reLogin = s.reLogin;
                    if (reLogin){
                        UserService.synUserInfo();//同步userInfo信息
                        //更新SDK里的numberId
                        Application.updateNumberId(UserInfo.numberId);
                        this._initGame()
                            .then(this._initShare)
                            .then(handler)
                            .catch(handler);
                    } else {
                        console.log('SignService not reLogin');
                        handler();
                    }
                }
            }.bind(this));
        }
    }

    /**
     * 监听网络变化，连上网自动登录；
     */
    static observerNetworkStatus(){

        SignUtil.addSignUpHandler(function () {
            MRUtil.showLoading();
            this.fastSignIn(function () {
                MRUtil.hiddenLoading();
            });
        }.bind(this));

        NetStatusUtil.on(NetworkStatusChanged,function (connected) {
            if (connected){
                console.error('NetworkStatusChange to connected,will call fastSignIn');
                this.fastSignIn(function (err) {
                    console.error('fastSignIn result:' + (err ? JSON.stringify(err):'succeed!'));
                });
            }
        }.bind(this));
    }

    static disconnect(){
        console.log('Clean SignService fastSignIn queue。。。。。');
        this._signInCallbacks = undefined;
        SignUtil.disconnect();
    }
}

export default SignService;
