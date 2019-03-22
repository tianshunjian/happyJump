'use strict';

import GameSocket from './GameSocket.js';
import Utils from './Utils.js';
///服务器环境
import {ServerConfig} from './Env.js';
import {GetPlatform, PLATFORM} from './Constants.js';
import {SIGNAL} from './Constants';
import Application from '../bridge/Application';
import UserInfo from './UserInfo.js';

const server = ServerConfig();

class GameSocketConnector
{
    _prepareSocket(){
        if (!this.socket) {

            const onReceivedTrumpet = function (data) {

                // console.error(JSON.stringify(data));

                ///随机展示
                const contents = JSON.parse(data.content) || [];
                let randomIdx = 0;
                if (contents.length > 1){
                    randomIdx = parseInt(contents.length * Math.random());
                }

                const route = contents[randomIdx];
                const params = JSON.parse(data.params) || [];
                let finalParams = params;

                ///参数预处理
                let cb = this._trumpetPreprocess && this._trumpetPreprocess[route];
                if (cb){
                    for (let i = 0; i < params.length; i++) {
                        params[i] = unescape(params[i]);
                    }
                    finalParams = cb(params);
                    console.error('after ' + route + ' preprocess: ' + finalParams);
                }

                this._trumpetListener && this._trumpetListener.forEach(function (m) {
                    const config = m.config;
                    const callback = m.callback;

                    const templateObj = config[route];
                    let template = templateObj.ZH_CN;
                    ///替换占位符，构建文案
                    for (let i = 0; i < finalParams.length; i ++){
                        let p = finalParams[i];
                        p = unescape(p);
                        template = template.replace('{' + i + '}',p);
                    }

                    const msg = {};
                    msg.playCount = data.playCount;
                    msg.priority = data.priority;
                    msg.showInBattle = data.showInBattle;
                    msg.id = route;
                    msg.createTime = data.createTime;
                    msg.content = Utils.parseString(template);
                    msg.params = finalParams;
                    msg.extInfo = JSON.parse(data.detailObject) || {};
                    callback(msg);
                });

                //{"roomName":2,"priority":3,"playCount":1,"showInBattle":-1,"type":3,"content":"[\"IDS_Trumpet_Content_01\"]","params":"[\"mango%uD83D%uDE04\",0]","createTime":1529390918815,"detailObject":"{\"avatarUrl\":\"https://wx.qlogo.cn/mmopen/vi_32/6eMXNWvYk60U3v2QPGesI3Brd7iaiaNSDjVA7JdV4F5hGf3C9EwNSjv3sLBKb6cEq8w1nKPGPUoqiaaOic4TDL3gAQ/132\"}"}
            }.bind(this);

            const disconnectHandler = function () {
                this.disconnectHandler && this.disconnectHandler();
            }.bind(this);

            this.socket = new GameSocket({onReceivedTrumpet:onReceivedTrumpet,disconnectHandler:disconnectHandler});
        }
    }

    /**
     * 底层socket断开时回调，上层可触发重新登录
	 * @param callback
	 */
    setupDisconnectHandler(callback){
        this.disconnectHandler = callback;
    }

    /**
     * 监听小喇叭
     * @param config 配置信息
     * @param callback 回调
     */
    listenTrumpet(config,callback){
        const m = {config:config,callback:callback};
        if(!this._trumpetListener){
            this._trumpetListener = [];
        }
        this._trumpetListener.push(m);
    }

    removeTrumpetListener(callback){

        let idx = -1;
        const arr = this._trumpetListener;
        for (let i = 0; i < arr.length; i ++){
            const f = arr[i];
            if (f === callback){
                idx = i;
                break;
            }
        }

        if (idx != -1){
            arr.splice(idx,1);
            this._trumpetListener = arr;
        }
    }

    addTrumpetPreprocess(route,callback){

        if(!this._trumpetPreprocess){
            this._trumpetPreprocess = {};
        }

        this._trumpetPreprocess[route] = callback;
    }

    removeTrumpetPreprocess(route){

        if (!route){
            return;
        }

        if(!this._trumpetPreprocess){
            return;
        }

        let cbs = this._trumpetPreprocess[route];
        if (!cbs){
            return;
        }

        delete this._trumpetPreprocess[route];
    }

    /**
     * 重连socket，每次调用之前可以先调下，避免socket断时发送消息
     * @param [GameSocketService~connectCallback] callback 连上之后回调
     */
    login(params,callback){

        this._prepareSocket();

        params.host = server.kHost;
        params.port = server.kPort;

        this.socket.login(params,callback);
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    /**
     * 发送请求(用于请求带result结构的接口)
     * @param route
     * @param params
     * @param callback
     * @param target
     */
    request(route,params,callback,target){

        this._prepareSocket();
        this.socket.request(route,params,function (err,result) {
            if(GetPlatform() == PLATFORM.kH5){
                if(err){
                    let content = '';
                    switch (err.code){
                    case SIGNAL.REMIND_LOGIN_SOHU:
                        content = '请先登录搜狐视频账号后方能领取奖励';
                        break;
                    case SIGNAL.REMIND_LOGIN_OTHER:
                        {
                            let thirdServices = ['微信','QQ','微博','搜狐账号'];
                            content = '请先登录您绑定的'+thirdServices[parseInt(err.msg)]+'账号后方能领取奖励';
                        }
                        break;
                    case SIGNAL.REMIND_LOGIN_PHONE:
                        content = '请先登录您绑定的手机尾号为'+err.msg.slice(err.msg.length-4, err.msg.length)+'的搜狐视频账号后方能领取奖励';
                        break;
                    }
                    if(content != ''){
                        Utils.showModal({
                            title:'登录提示',
                            content:content,
                            cancelText:'暂不登录',
                            confirmText:'立即登录',
                            success:function (res) {
                                if(res.confirm){
                                    Utils.setStorageSync('bindFlag', '1');
                                    UserInfo._appInfo = undefined;
                                    Application.showAppLoginPage();
                                }
                            }
                        });
                    }
                }
            }
            if(callback){
                if (target){
                    callback.call(target,err,result);
                } else {
                    callback(err,result);
                }
            }
        });

    }

    /**
     * 发送请求(用于请求不带result结构的接口)
     * @param route
     * @param params
     * @param callback
     * @param target
     */
    requestV2(route,params,callback,target){
        this._prepareSocket();
        this.socket.requestV2(route,params,function (err,result) {
            if(GetPlatform() == PLATFORM.kH5){
                if(err){
                    let content = '';
                    switch (err.code){
                    case SIGNAL.REMIND_LOGIN_SOHU:
                        content = '请先登录搜狐视频账号后方能领取奖励';
                        break;
                    case SIGNAL.REMIND_LOGIN_OTHER:
                        {
                            let thirdServices = ['微信','QQ','微博','搜狐账号'];
                            content = '请先登录您绑定的'+thirdServices[parseInt(err.msg)]+'账号后方能领取奖励';
                        }
                        break;
                    case SIGNAL.REMIND_LOGIN_PHONE:
                        content = '请先登录您绑定的手机尾号为'+err.msg.slice(err.msg.length-4, err.msg.length)+'的搜狐视频账号后方能领取奖励';
                        break;
                    }
                    if(content != ''){
                        Utils.showModal({
                            title:'登录提示',
                            content:content,
                            cancelText:'暂不登录',
                            confirmText:'立即登录',
                            success:function (res) {
                                if(res.confirm){
                                    Utils.setStorageSync('bindFlag', '1');
                                    UserInfo._appInfo = undefined;
                                    Application.showAppLoginPage();
                                }
                            }
                        });
                    }
                }
            }
            if(callback){
                if (target){
                    callback.call(target,err,result);
                } else {
                    callback(err,result);
                }
            }
        });
    }

    /**
     * 监听服务器消息
     * @param {string} route - 消息路由
     * @param {onCallback} callback
     */
    on(route,callback){
        this._prepareSocket();
        this.socket.on(route,callback);
    }

    /**
     * 移除该路由下对应的某个监听
     * @param {string} route
     * @param {function} callback
     */
    off(route, callback) {
        this.socket && this.socket.off(route, callback);
    }

    /**
     * 是否已经登录上了
     * @return {boolean}
     */
    get isConnected(){
        if (!this.socket){
            return false;
        } else {
            return this.socket.connected();
        }
    }

}

export default new GameSocketConnector();
