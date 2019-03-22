'use strict';

import {
    HELP_SHARE_REMOTE,
    REDPACKET_SHAREICON_REMOTE_SERVER,
    SHAREICON_REMOTE_SERVER,
    XUANYAO_SHARE_REMOTE
} from '../base/Config.js';
import * as GameConfig from '../base/Config';
import Application from '../shared/bridge/Application';

export const ShareType = {
    kDefault: 1,///关闭按钮旁
    kXuanYao:2,//炫耀一下
    kHelp:3,//求助好友，获得复活卡
    kRedPack: 4,///红包
    kLecard:5,//普通场结果页 —— 乐卡
    kRevivalCard:6,//场次预告页 —— 分享得乐卡
};

class ShareUtil
{
    static initShare(){
        const self = this;
        if (window.WechatGame){
            wx.onShareAppMessage(function (){
                const body = self._shareBody(ShareType.kDefault);
                console.error('onShareAppMessage:' + body.title);
                return {
                    title: body.title,
                    imageUrl: body.img,
                    query: body.query
                };
            });
            wx.showShareMenu({withShareTicket:true});
        }else{
            //TODO:
        }
    }

    static _shareBody(type){
        type = type || 0 ;
        let title = '';
        let img = '';
        let query = 'type=' + type;
        switch (type){
        case ShareType.kDefault :
        {
            const titleArr = ['跳出天际，不服来战！','我乐跳一跳，开心玩游戏~','小试身手，跳一跳更自信~'];
            const idx = Math.floor(Math.random()*3);
            title = titleArr[idx];
            img = SHAREICON_REMOTE_SERVER;
            break;
        }
        case ShareType.kRedPack :
        {
            title = '666元大红包，来玩就送~';
            img = REDPACKET_SHAREICON_REMOTE_SERVER;
            break;
        }
        case ShareType.kHelp:
        {
            title = 'SOS！！！有一个小可爱等着你来解救哦';
            img = HELP_SHARE_REMOTE;
            break;
        }
        case ShareType.kXuanYao:
        {
            title = '有人@你，快来跳一跳比赛分红包，玩者就有份哦';
            img = XUANYAO_SHARE_REMOTE;
            break;
        }
        case ShareType.kLecard:
        {
            title = '跳出天际，不服来战！';
            img = SHAREICON_REMOTE_SERVER;
            break;
        }
        case ShareType.kRevivalCard:
        {
            title = '有人@你，快来跳一跳比赛分红包，玩者就有份哦';
            img = XUANYAO_SHARE_REMOTE;
            break;
        }
        }
        return {title:title,img:img,query:query};
    }

    /**
     *
     * @param {ShareType}type
     * @param success
     * @package fail
     */
    static shareAppMessage(type,success,fail){

        const body = this._shareBody(type);

        if (window.WechatGame){
            wx.shareAppMessage({
                title:body.title,
                imageUrl:body.img,
                query:body.query,
                withShareTicket:true,
                success:function (res) {
                    const tickets = res.shareTickets;
                    console.error(JSON.stringify(res));
                    success && success(tickets);
                },
                fail:function (res) {
                    fail && fail(res);
                }
            });
        }else{
            //TODO:
        }

    }

    /**
     * 分享按钮提示文案
     * @param {ShareType}type
     */
    static placeHolderText(page){
        const typeList = window.ShareConfigs;
        if (typeList instanceof Array){
            for (let i = 0; i < typeList.length; i++){
                const item = typeList[i];
                const p = item.page;
                if (p == page){
                    return item.content;
                }
            }
        }
        return '';
    }

    static updatePlaceHolderText(page,text){
        const typeList = window.ShareConfigs;
        if (typeList instanceof Array){
            for (let i = 0; i < typeList.length; i++){
                const item = typeList[i];
                const p = item.page;
                if (p == page){
                    item.content = text;
                    break;
                }
            }
        }
    }

    /**
     * 根据得分动态的拼接分享图片
     * @param score 得分
     * @param callback 分享结果回调
     */
    static shareToH5(score,callback){

        const handler = function (shareData) {
            Application.share(shareData,callback);
        };

        // H5分享页面
        let h5ShareData = {};
        h5ShareData.title = '我乐踩方块小游戏';
        h5ShareData.description = '小试身手，跳一跳更自信~';
        h5ShareData.imageUrl = GameConfig.SHAREICON_REMOTE_SERVER;
        h5ShareData.webpageUrl = 'https://m.tv.sohu.com/static/sgame/tyt/index.html';//H5地址
        // 微信小卡片分享
        let wechatCard = {};
        wechatCard.webpageUrl = 'https://m.tv.sohu.com/static/sgame/tyt/index.html';//H5地址，用于低版本兼容
        wechatCard.appid = 'gh_bc3cad840ddc';
        wechatCard.path = '/index.html';
        wechatCard.title = '我乐踩方块';
        wechatCard.imageUrl = GameConfig.SHAREICON_REMOTE_SERVER;
        wechatCard.description = '小试身手，跳一跳更自信~';
        wechatCard.miniProgramType = 0;//(正式:0，开发:1，体验:2）

        let shareData = {};
        shareData.h5ShareData = h5ShareData;
        shareData.wechatCard = wechatCard;
        // 图片分享 {imageData:'imageData'}
        let shareImageData = {};
        shareData.shareImageData = shareImageData;

        score = score.toString();
        let len = score.length;
        let half = parseInt(len/2);
        let posArr = [];
        let perW=34,perH=48,d=2;
        if (len%2===0){
            for (let i=half-1;i>=0;--i){
                let x = 375-(perW*(i+1)+d*i+d/2.0);
                posArr.push(x);
            }
            for (let i=0;i<half;++i){
                let x = 375+(d/2.0+(perW+d)*i);
                posArr.push(x);
            }
        }else{
            for (let i=half-1;i>=0;--i){
                let x = 375-((perW+d)*(i+1)+perW/2.0);
                posArr.push(x);
            }
            posArr.push(375-perW/2.0);
            for (let i=0;i<half;++i){
                let x = 375+(perW/2.0+(perW+d)*i+d);
                posArr.push(x);
            }
        }
        let tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = 750;
        tmpCanvas.height = 1334;
        let ctx = tmpCanvas.getContext('2d');
        let bgImg = new Image();
        bgImg.src = 'res/img/H5/share/beijing.png';
        bgImg.onload = function () {
            ctx.drawImage(bgImg,0,0,750,1334);
            bgImg = null;
            let img = new Image();
            img.src = 'res/img/H5/share/shuzi.png';
            img.onload = function () {
                for (let i=0;i<posArr.length;++i){
                    ctx.drawImage(img,parseInt(score[i])*(perW+2),0,perW,perH,posArr[i],340,perW,perH);
                }
                img = null;
                shareImageData.imageData = tmpCanvas.toDataURL('image/png');
                handler(shareData);
            }.bind(this);
            img.onerror = function () {
                console.log('分享中分数图片加载失败');
                img = null;
                shareImageData.imageData = tmpCanvas.toDataURL('image/png');
                handler(shareData);
            }.bind(this);
        }.bind(this);
        bgImg.onerror = function () {
            console.log('分享背景图加载失败');
            bgImg = null;
            handler(shareData);
        }.bind(this);
    }

    /**
     * 大理寺活动分享
     * @param type - 1:求助好友，2:炫耀一下
     * @param callback 分享结果回调
     */
    static shareActivity (type, callback) {
        // H5分享页面
        let h5ShareData = {};
        h5ShareData.title = '我乐踩方块小游戏';
        h5ShareData.description = '小试身手，跳一跳更自信~';
        h5ShareData.imageUrl = GameConfig.SHAREICON_REMOTE_SERVER;
        h5ShareData.webpageUrl = 'https://m.tv.sohu.com/static/sgame/tyt/index.html';//H5地址
        // 微信小卡片分享
        let wechatCard = {};
        wechatCard.webpageUrl = 'https://m.tv.sohu.com/static/sgame/tyt/index.html';//H5地址，用于低版本兼容
        wechatCard.appid = 'gh_bc3cad840ddc';
        wechatCard.path = '/index.html';
        wechatCard.title = '我乐踩方块';
        wechatCard.imageUrl = GameConfig.SHAREICON_REMOTE_SERVER;
        wechatCard.description = '小试身手，跳一跳更自信~';
        wechatCard.miniProgramType = 0;//(正式:0，开发:1，体验:2）
        // 图片分享
        let shareImageData = {};
        shareImageData.imageData = null;
        // 分享数据
        let shareData = {};
        shareData.h5ShareData = h5ShareData;
        shareData.wechatCard = wechatCard;
        shareData.shareImageData = shareImageData;
        // 分享
        const handler = function (shareData) {
            Application.share(shareData, callback);
        };
        let tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = 750;
        tmpCanvas.height = 1334;
        let ctx = tmpCanvas.getContext('2d');
        let bgImg = new Image();
        bgImg.src = type == 1 ? 'res/img/H5/share/help.png' : 'res/img/H5/share/show.png';
        bgImg.onload = function () {
            ctx.drawImage(bgImg,0,0,750,1334);
            bgImg = null;
            shareImageData.imageData = tmpCanvas.toDataURL('image/png');
            handler(shareData);
        }.bind(this);
        bgImg.onerror = function () {
            bgImg = null;
            handler(shareData);
        }.bind(this);
    }
}

export default ShareUtil;
