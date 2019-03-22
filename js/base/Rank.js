/* eslint-disable */
'use strict';

import * as Config from './Config.js';
import * as THREE from '../libs/three/three.min.js';
import UserService , {kUserServiceDidUpdate}from '../service/UserService.js';
import Button from './Button.js';
import ScrollHandler from './ScrollHandler.js';
import SignUtil from '../shared/service/SignUtil.js';
import ShareUtil from '../service/ShareUtil.js';
import {ShareType} from '../service/ShareUtil.js';
import Utils from '../shared/service/Utils';
import * as Animation from '../base/TweenAnimation.js';
import Application from '../shared/bridge/Application.js';

var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var HEIGHT = H * Dpr; // 设备像素
var WIDTH = W * Dpr; // 设备像素

console.log('Dpr: '+Dpr);

//var this.planList = ['btn', 'bg', 'list1', 'list2'];
//console.log("Rank this.planList = " + this.planList);
var CANVASTYPE = { // 当前绘制的2D场景
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

    'testHorizontalList':100,//测试水平列表
};

var _config = Config;
var frustumSizeHeight = _config.FRUSTUMSIZE; // 动画的尺寸单位坐标高度
var frustumSizeWidth = WIDTH / HEIGHT * frustumSizeHeight; // 动画的尺寸单位坐标高度
var DEBUG = false;
var showDebugImg = false;

var ListLineHeight = 60;
var ListLineHeight4PrizeRecord = 90;

//水平列表item宽度
var ListColumnWidth = 90;

var family = 'num_Regular';//wx.loadFont('res/fonts/num.ttf');//fixme fonts & audio not ready
//抽奖配置图片和文字
var index = 10;

if (!window.WechatGame){
    //H5结束页面
    var overAgainMask = document.getElementById('over_mask');
    var overAgainRestartButton = document.getElementById('over_restart');
    var overAgainRank = document.getElementById('over_rank');
    var overAgainShare = document.getElementById('over_share');
    var overAgainScore = document.getElementById('over_score');
    // var overAgainBackButton = document.getElementById('over_back');
    //H5排行榜页面
    var rankList4H5 = document.getElementById('rank_list');
    var rankListScroll4H5 = document.getElementById('rank_list_bg_scroll');
    var rankListMyRank4H5 = document.getElementById('myRank');
    var rankListMyValue4H5 = document.getElementById('myValue');
    var rankListMyName4H5 = document.getElementById('myName');
    var rankListMyAvatar4H5 = document.getElementById('myAvatar');
    var rankListBack4H5 = document.getElementById('rank_list_back');
    //H5大理寺活动页面
    var letterMask = document.getElementById('letter_mask');
    var letterButton = document.getElementById('letter_button');
    var activityBanner = document.getElementById('activity_banner');
    var activityBannerScore = document.getElementById('activity_banner_score');
    var activityScore = document.getElementById('activity_score');
    var activityButton = document.getElementById('activity_button');
    var activityMask = document.getElementById('activity_mask');
    var activityCloseButton = document.getElementById('activity_close_button');
    var activityShareButton = document.getElementById('activity_share_button');
    var countPoor = document.getElementById('activity_dialog_count');
    var activityLis = document.getElementsByClassName('activity_cat_word-li');
    //领取Vip
    var vipCont = document.getElementById('get-vip-cont');
    var getVipBtn = document.getElementById('gv-btn');
    var vipShowOffBtn = document.getElementById('gv-showoff-btn');
    var getVipCloseBtn = document.getElementById('gv-close-btn');
    var countRich = document.getElementById('gv-count');
    var getVipLis = document.getElementsByClassName('gv-dialog-li');
    //恭喜领到VIP
    var congratulation = document.getElementById('congratulation');
    var confirmCong = document.getElementById('cong-btn');
    //立即使用
    var useVipCont = document.getElementById('use-vip-cont');
    var useVipBtn = document.getElementById('uv-btn');
    var closeUseVip = document.getElementById('uv-close-btn');
    var useShowoffBtn = document.getElementById('uv-showoff-btn');
    var useVipLis = document.getElementsByClassName('uv-dialog-li');
    //激活码页面
    var code = document.getElementById('code');
    var closeCodeBtn = document.getElementById('cd-close-btn');
    var codeArea = document.getElementById('number');

    // if (!window.WechatGame){
    // console.log('Rank 中 非微信小游戏');
    // //复制
    // const ClipboardJS = require('../../web/libs/clipboard.min.js');
    // let clipboard = new ClipboardJS('#cd-copy-btn');
    // clipboard.on('success', function(e) {
    //     Utils.showToast({title:'复制成功',icon:'none'});
    // });
    // clipboard.on('error', function(e) {
    //     Utils.showToast({title:'复制失败，请手动复制',icon:'none'});
    // });
    // }
}

//Rank maybe just full2D!!
var Rank = function () {
    console.log('in Rank now');

    function Rank(options) {
        // _classCallCheck(this, Rank);

        console.log('new Rank full2D');
        // this.planList = ['btn', 'bg', 'list1', 'list2'];
        this.planList = ['btn','list1', 'list2','list3', 'list4', 'bg', 'nine'];
        this.texture = {};
        this.material = {};
        this.geometry = {};
        this._cacheImage = {};
        this.obj = {};
        this.canvas = {};
        this.context = {};
        this._touchInfo = {trackingID: -1, maxDy: 0, maxDx: 0};
        this.options = Object.assign({}, {}, options); //将源对象复制到目标对象
        this.imgid = {
            'btn': 0,
            'bg': 0,
            'list1': 0,
            'list2': 0,
            'list3':0,
            'list4':0,
            'nine':0,
            'startOrderList':0,
        };

        // 相关回调
        // --- 好友排行榜：
        this.options.onGroupShare = options.onGroupShare; // 群分享的时候的回调
        this.options.friendRankReturn = options.friendRankReturn; // 好友排行榜返回上一层， 点击右上角X的回调

        this.options.onRankLeCard = options.onRankLeCard; //乐卡排行榜点击界面
        this.options.onRankGlobal = options.onRankGlobal; //全球榜
        this.options.onRankInner = options.onRankInner; //好友榜
        // --- 群排行榜
        this.options.groupPlayGame = options.groupPlayGame; // 我也来玩一局的回调

        // --- 结算页：
        this.options.onClickRank = options.onClickRank; // 点击排行榜的回调
        this.options.onClickReplay = options.onClickReplay; // 点击在玩一局的回调, 排行榜再晚一局的回调
        this.options.onClickShare = options.onClickShare; // 点击分享挑战的回调

        this.options.showOverAgain = options.showOverAgain; //游戏结束界面

        // --- 首页：
        // 点击开始游戏回调
        this.options.onClickStart = options.onClickStart; //点击开始按钮进入游戏
        this.options.onShowFriendRank = options.onShowFriendRank; // 点击排行榜的回调

        this.options.toBackStartPage = options.toBackStartPage;//返回首页逻辑
        this.options.onClickTiXian = options.onClickTiXian;//首页提现界面

        //皮肤界面：
        this.options.onClickSkin = options.onClickSkin; //首页点击皮肤商城按钮


        //抽奖界面：
        this.options.onShowPick = options.onShowPick;//点击展示天天抽红包界面
        this.options.pickFiveTimes = options.pickFiveTimes;//点击抽5次，展示抽5次结果界面
        this.options.pickCtrl = options.pickCtrl;//抽一次控制

        // --- 挑战页：
        this.options.onBattlePlay = options.onBattlePlay; // 玩一局， pk 表示当前分数是pk的， '' 表示当前只是自己玩一局

        // --- 围观页：
        this.options.onLookersStart = options.onLookersStart; // 围观页面，开启新的一局

        this.options.showRankToast = options.showRankToast;

        //参赛模式界面
        this.options.onClickPrizeRecord = options.onClickPrizeRecord;//获奖记录
        this.options.onClickPrizeRankLast = options.onClickPrizeRankLast;//获奖，上期排行榜
        this.options.onClickPrizeRankMoney = options.onClickPrizeRankMoney;//获奖，上期排行榜
        //场次预告
        this.options.onChampionReservation = options.onChampionReservation;//预约场次

        //复活页面
        this.options.onClickRevival4Competition = options.onClickRevival4Competition;
        this.options.onClickStepOver4Competition = options.onClickStepOver4Competition;
        //再接再厉页面
        this.options.onClickGameAgain4Competition = options.onClickGameAgain4Competition;
        this.options.onClickHelp4Competition = options.onClickHelp4Competition;

        // 裁剪区域的大小 - 好友/群排行榜
        this.p0 = new THREE.Vector3(0, 0, 11);
        this.p1 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(154) / HEIGHT) * frustumSizeHeight, 11);
        this.p2 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(154) / HEIGHT), 11);
        this.p3 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(200) / HEIGHT), 11);
        this.p4 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(200) / HEIGHT), 11);

        // 裁剪区域大小 - 挑战
        this.p5 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(205) / HEIGHT) * frustumSizeHeight, 11);
        this.p6 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(205) / HEIGHT), 11);
        this.p7 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(104) / HEIGHT), 11);
        this.p8 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(104) / HEIGHT), 11);

        // 裁剪区域大小 - 获奖纪录
        this.centerP = new THREE.Vector3(0,frustumSizeHeight * ((0.5 - this._cy(425)/HEIGHT)-(0.5 - this._cy(50) / HEIGHT))/2,11);
        this.p9 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(425) / HEIGHT) * frustumSizeHeight, 11);
        this.p10 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(425) / HEIGHT), 11);
        this.p11 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(50) / HEIGHT), 11);
        this.p12 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(50) / HEIGHT), 11);

        // 裁剪区域大小 - 获奖榜单，上期排行榜
        this.p13 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(280) / HEIGHT) * frustumSizeHeight, 11);
        this.p14 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(280) / HEIGHT), 11);
        this.p15 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(150) / HEIGHT), 11);
        this.p16 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(150) / HEIGHT), 11);

        // 裁剪区域大小 - 获奖榜单，奖金榜
        this.p17 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(165) / HEIGHT) * frustumSizeHeight, 11);
        this.p18 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(165) / HEIGHT), 11);
        this.p19 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(150) / HEIGHT), 11);
        this.p20 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(150) / HEIGHT), 11);

        // 裁剪区域大小 - 上期排行榜详情——从恭喜获奖进入
        this.p21 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), (0.5 - this._cy(240) / HEIGHT) * frustumSizeHeight, 11);
        this.p22 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), frustumSizeHeight * (0.5 - this._cy(240) / HEIGHT), 11);
        this.p23 = new THREE.Vector3(frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(190) / HEIGHT), 11);
        this.p24 = new THREE.Vector3(-frustumSizeWidth * (0.5 - this._cx(30) / WIDTH), -frustumSizeHeight * (0.5 - this._cy(190) / HEIGHT), 11);

        // DEBUG 的时候多加一层
        if (DEBUG) {
            this.planList = ['sample', 'btn', 'bg', 'list1', 'list2'];
        }

        if (!window.WechatGame){
            overAgainRestartButton.addEventListener('click',this.restartGame4H5.bind(this));
            // overAgainBackButton.addEventListener('click',this.clickBack4H5.bind(this));
            overAgainRank.addEventListener('click',this.clickRank4H5.bind(this));
            overAgainShare.addEventListener('click',this.clickShare4H5.bind(this));
            rankListBack4H5.addEventListener('click',this.back2OverAgain4H5.bind(this));

            letterButton.addEventListener('click',this.letterButtonClicked.bind(this));
            activityButton.addEventListener('click',this.activityButtonClicked.bind(this));
            activityCloseButton.addEventListener('click',this.activityCloseButtonClicked.bind(this));
            activityShareButton.addEventListener('click',this.activityShareButtonClicked.bind(this));

            getVipCloseBtn.addEventListener('click', this.closeGetVip.bind(this));  //关闭领取VIP弹框
            vipShowOffBtn.addEventListener('click', this.vipShowOff.bind(this));    //炫耀一下VIP
            getVipBtn.addEventListener('click', this.getVip.bind(this));    //获取VIP
            confirmCong.addEventListener('click', this.goToUseVip.bind(this));  //点击确定领取VIP，跳转到立即使用弹框
            closeUseVip.addEventListener('click', this.UseVipClose.bind(this)); //关闭立即使用
            useVipBtn.addEventListener('click', this.goToVipCode.bind(this));   //前往激活码弹框
            closeCodeBtn.addEventListener('click', this.closeCode.bind(this));  //关闭激活码弹框
            useShowoffBtn.addEventListener('click', this.vipShowOff.bind(this));    //立即使用vip页面的炫耀
            
            //复制
            const ClipboardJS = require('../../web/libs/clipboard.min.js');
            let clipboard = new ClipboardJS('#cd-copy-btn');
            clipboard.on('success', function(e) {
                Utils.showToast({title:'复制成功',icon:'none'});
            });
            clipboard.on('error', function(e) {
                Utils.showToast({title:'复制失败，请手动复制',icon:'none'});
            });
        }

    }

    return Rank;
}();

Rank.prototype = {

    // H5结果页 —— 按钮响应事件
    restartGame4H5:function(){
        overAgainRank.disabled = 'disabled';
        overAgainShare.disabled = 'disabled';
        overAgainRestartButton.disabled = 'disabled';
        // overAgainBackButton.disabled = 'disabled';
        this.options.onClickReplay && this.options.onClickReplay();
        setTimeout(function () {
            overAgainRank.disabled = '';
            overAgainShare.disabled = '';
            overAgainRestartButton.disabled = '';
            // overAgainBackButton.disabled = '';
        },1500);
    },
    clickBack4H5:function(){
        console.log('点击了返回按钮');
        this.options.onClickBack4H5 && this.options.onClickBack4H5();
    },
    clickRank4H5:function(){
        console.log('点击排行榜');
        overAgainRank.disabled = 'disabled';
        overAgainShare.disabled = 'disabled';
        overAgainRestartButton.disabled = 'disabled';
        // overAgainBackButton.disabled = 'disabled';
        this.options.onClickRank4H5 && this.options.onClickRank4H5();
        setTimeout(function () {
            overAgainRank.disabled = '';
            overAgainShare.disabled = '';
            overAgainRestartButton.disabled = '';
            // overAgainBackButton.disabled = '';
        },1500);
    },
    clickShare4H5:function(){
        console.log('点击分享');
        overAgainRank.disabled = 'disabled';
        overAgainShare.disabled = 'disabled';
        overAgainRestartButton.disabled = 'disabled';
        // overAgainBackButton.disabled = 'disabled';
        this.options.onClickShare4Lecard && this.options.onClickShare4Lecard();
        setTimeout(function () {
            overAgainRank.disabled = '';
            overAgainShare.disabled = '';
            overAgainRestartButton.disabled = '';
            // overAgainBackButton.disabled = '';
        },1500);

    },
    //H5排行榜页返回
    back2OverAgain4H5:function(){
        console.log('返回');
        this.options.showOverAgain && this.options.showOverAgain();

    },
    // H5 隐藏结果页
    hideOverAgain4H5:function(){
        if (!window.WechatGame){
            overAgainMask.style.display = 'none';
        }
    },
    // H5 隐藏排行榜页
    hideRankGlobal4H5:function(){
        if (!window.WechatGame){
            rankList4H5.style.display = 'none';
        }
    },

    ///销毁所有自定义的按钮！
    _destroyAllButtons:function(){
        let ctx = this.context['btn'];
        if (ctx){
            ctx.clearRect(0,0,WIDTH,HEIGHT);
        }
        Button.destroyAllButtons(this.canvas['btn']);
    },

    ///隐藏开放数据域
    _hiddenShareCanvas:function(){
        let openDataContext = this.openDataContext();
        if (openDataContext){
            let sharedCanvas = openDataContext.canvas;
            if (sharedCanvas.mrObj){
                sharedCanvas.mrObj.visible = false;
                this.options.camera.remove(sharedCanvas.mrObj);
                sharedCanvas.mrObj.geometry.dispose();
                sharedCanvas.mrObj.material.map.dispose();
                sharedCanvas.mrObj.material.dispose();
                sharedCanvas.mrTexture = undefined;
                sharedCanvas.mrObj = undefined;
            }
        }
    },

    // update:function(){
    //     let openDataContext = this.openDataContext();
    //     if (openDataContext) {
    //         let sharedCanvas = openDataContext.canvas;
    //         if (sharedCanvas.mrObj){
    //             sharedCanvas.mrTexture.needsUpdate = true;
    //         }
    //     }
    // },

    backStartPage:function(){
        //回到首页
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['start'];
        this._createPlane();
        this._drawStart();
    },

    // ----------------- show/hide 方法 -----------------

    showFriendRankList: function (opt) {
        //微信原本的代码
        this.hide2D();
        this.showState = true;
        opt = opt || {};
        this.canvasType = CANVASTYPE['friendRank']; // 当前绘制的2D场景
        this.myUserInfo = //_storage2.default.getMyUserInfo() ||
            {}; // 更新用户信息
        this.myUserInfo.week_best_score = opt.week_best_score || 0;
        this._createPlane();
        this._updateClip();
        // this._drawRankListBg(); // 背景绘制
        // this.renderRankList();//原参数: _storage2.default.getFriendsScore()
        this._drawRank(opt);
    },

    showGroupRankList: function (list, myUserInfo) {
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['groupRank'];
        this.myUserInfo = myUserInfo || {
            headimg: '',
            nickname: '',
            week_best_score: 0,
            grade: 1
        };
        this._createPlane();
        this._updateClip();
        this.renderRankList(list);
        this._drawRankListBg(); // 背景绘制
    },

    showGameOverPage: function (opt) {
        //微信原来的代码，我们的结束页用的showOverAgain
        console.log('Rank showGameOverPage opt = ' + JSON.stringify(opt));
        this.hide2D();
        // Report.frameReport('xxxxx', 60);
        this.showState = true;
        /*opt = {
    score : 1100, // 当局分数
    highest_score : 90, // 历史最高分
    start_time : 2511922923, // 起始时间的秒级时间戳
    week_best_score : 0, // 本周最高分
    game_cnt : 5
}*/
        opt = opt || {};
        this.opt = opt || this.opt;

        this._createPlane();

        // 找出那个排行 -
        this.myUserInfo = //_storage2.default.getMyUserInfo() ||
            {
                headimg: '', nickname: '', week_best_score: 0, score_info: [{score: 0}] // 更新用户信息
            };
        this.myUserInfo.last_week_best_score = opt.week_best_score;
        this.myUserInfo.week_best_score = Math.max(opt.week_best_score, opt.score) || 0;
        let friendRankList = //_storage2.default.getFriendsScore() ||
            [];
        friendRankList.push(this.myUserInfo); // 把自己的最高分放进去
        let rank_list = this._rerank(friendRankList);
        this.sotedRankList = rank_list;
        // console.log('vicky 拿到的结算页的数据： ')
        // console.log(opt)
        // console.log(this.myUserInfo)
        // console.log(friendRankList)
        this.myidx = rank_list.findIndex(this._findSelfIndex.bind(this)) + 1; // 找到自己的index
        // 超越了多少人
        if (opt.score >= opt.highest_score || opt.score >= this.myUserInfo.last_week_best_score) {
            // 达到历史最高分 或者 本周最高分， 计算 超越的人数
            let userInfo = //_storage2.default.getMyUserInfo() ||
                {
                    headimg: '',
                    nickname: '',
                    week_best_score: 0,
                    score_info: [{score: 0}]
                };
            userInfo.week_best_score = opt.score;
            let friendRank1 = //_storage2.default.getFriendsScore() ||
                [];
            this.changlleList = [];
            for (let j = 0; j < friendRank1.length; j++) {
                if (friendRank1[j].week_best_score < opt.score && friendRank1[j].week_best_score > this.myUserInfo.last_week_best_score) {
                    // 显示新超越的人数，
                    this.changlleList.push(friendRank1[j]);
                }
            }
        }
        // console.log(' 超越好友数：', this.changlleList)
        // 新手指引，走普通结算
        /*if(opt.score < 5 && opt.game_cnt < 5){
   this.canvasType = CANVASTYPE['gameOver']
   this._drawGameOver();
} else */
        if (opt.score > opt.highest_score) {
            // 历史最高分
            this.canvasType = CANVASTYPE['gameOverHighest'];
            this.opt.type = 'history';
            this.opt.msg = '历史最高分';
            this._drawGameOverHighest(this.opt, 'history');
        } else if (rank_list.length > 1 && opt.score >= rank_list[0].week_best_score) {
            // 达到排行榜冠军
            this.canvasType = CANVASTYPE['gameOverHighest'];
            this.opt.type = 'rank';
            this._drawGameOverHighest(this.opt, 'rank');
        } else if (opt.score > this.myUserInfo.last_week_best_score) {
            // 本周最高分
            this.canvasType = CANVASTYPE['gameOverHighest'];
            this.opt.type = 'history';
            this.opt.msg = '本周最高分';
            this._drawGameOverHighest(this.opt, 'history');
        } else {
            // 普通结算
            this.canvasType = CANVASTYPE['gameOver'];
            //  this._drawGameOver();
            this._drawOverAgain(opt);
        }
    },

    //全球榜展示
    showRankGlobal: function (result) {
        if (window.WechatGame){
            this.hide2D();
            this.showState = true;
            this.canvasType = CANVASTYPE['rankGlobal']; // 当前绘制的2D场景
            this._createPlane();
            this._updateClip();
            // this._drawRankBg();
            this._drawRankGlobal(result);
        }else{
            let myRank = result.myRank;
            let currentScore = Math.max(result.myValue,result.myCurrentScore);
            let myValue = currentScore<0 ? '-':currentScore;
            if (myRank<0 || myRank>100){
                myRank = '未上榜';
                rankListMyRank4H5.classList.add('myRank_not_num');
            }else{
                rankListMyRank4H5.classList.remove('myRank_not_num');
            }

            let myName = UserService.nickName || '乐哈哈';
            myName = unescape(myName);
            // if(myName.length > 8){
            //     myName = myName.substr(0,8)+'...';
            // }
            rankListMyRank4H5.innerText = myRank;
            rankListMyName4H5.innerText = myName;
            rankListMyValue4H5.innerText = myValue;

            let myAvatar = UserService.avatarUrl || 'res/img/default_ava.png';
            let k=myAvatar.indexOf('http'), m=myAvatar.indexOf('https');
            if (m<0){
                if (k==0){
                    myAvatar = myAvatar.replace('http','https');
                }
            }

            rankListMyAvatar4H5.src = myAvatar;
            rankListMyAvatar4H5.onerror = function () {
                rankListMyAvatar4H5.src = 'res/img/default_ava.png';
            };

            let tmpStr = '';
            const rankList = result.rankList || [];
            let r,v;
            for (let i=0;i<rankList.length;++i){
                const obj = rankList[i];
                const rank = obj.rank;
                let nickName = obj.nickname || '乐哈哈';
                nickName = unescape(nickName);
                // if(nickName.length > 8){
                //     nickName = nickName.substr(0,8) + '...';
                // }
                let avatarUrl = obj.avatarUrl || 'res/img/default_ava.png';
                let j=avatarUrl.indexOf('http'), n=avatarUrl.indexOf('https');
                if (n<0){
                    if (j==0){
                        avatarUrl = avatarUrl.replace('http','https');
                    }
                }
                let value = obj.value;

                if (i<3){
                    r = 'rank_list_rank_top3';
                } else if (i>=3 && i<6){
                    r = 'rank_list_rank_top456';
                } else{
                    r = 'rank_list_rank';
                }
                if (i<3){
                    v = 'rank_list_value_top3';
                } else{
                    v = 'rank_list_value';
                }
                tmpStr += '<div class="rank_list_userInfo">\n' +
                    '                    <div class="rank_list_pre_three">\n' +
                    '                        <div class="'+r+'">\n' +rank+
                    '                            \n' +
                    '                        </div>\n' +
                    '                        <img class="rank_list_avatar" src="'+avatarUrl+'" onerror="javascript:this.src=\'res/img/default_ava.png\'" />\n' +
                    '                        <div class="rank_list_name">\n' +nickName+
                    '                            \n' +
                    '                        </div>\n' +
                    '                    </div>\n' +
                    '                    <div class="'+v+'">\n' +value+
                    '                        \n' +
                    '                    </div>\n' +
                    '                </div>';
            }
            if (tmpStr==''){
                // tmpStr = result.errMsg;
                tmpStr += '<div id="rank_list_nodata">\n'+
                    '<div id=\'rank_list_nodata_msg\'>\n' +'暂无排行榜数据'+
                    '</div>'+
                    '\n               </div>';
            }
            rankListScroll4H5.innerHTML = tmpStr;
            rankList4H5.style.display = '-webkit-flex';
            rankList4H5.style.display = '-webkit-box';
            rankList4H5.style.display = 'flex';
            // 列表中img添加错误重试
            // let imgArr = document.getElementsByClassName('rank_list_avatar');
            // for (let i=0;i<imgArr.length;++i){
            //     let img = imgArr[i];
            //     img.tag = new Date().getTime();
            //     img.retryTime = 10;
            //     img.onerror = function (img) {
            //         return function () {
            //             if (img.retryTime >= 0){
            //                 if (img.retryTime == 0){
            //                     console.error('use default img : ');
            //                     img.src = 'res/img/default_ava.png';
            //                 } else {
            //                     console.error('retry : ' );
            //                     setTimeout(function () {
            //                         img.src = img.src;
            //                     },100);
            //                 }
            //                 img.retryTime--;
            //             }
            //         }
            //     }(img)
            // }
        }
    },


    openDataContext(){
        if (window.WechatGame){
            if (!wx.getOpenDataContext){
                return undefined;
            }
            let ctx = this._openDataContext;
            if (!ctx){
                ctx = wx.getOpenDataContext();
                this._openDataContext = ctx;
            }
            return ctx;
        }else {
            return undefined;
        }
    },

    showRankInner: function () {
        //微高版本好友榜
        console.log('Rank_showRankInner');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['rankInner']; // 当前绘制的2D场景
        this._createPlane();
        this._updateClip();
        //进行版本判断，展示不同界面
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else {
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){
            //可以获取sharedCanvas
            console.log('可以获取sharedCanvas');
            this._drawRankInner();//背景

            if(UserService.openId){
                let openDataContext = this.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = WIDTH;
                sharedCanvas.height = HEIGHT;
                this.openDisplay(sharedCanvas);
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
    },

    openDisplay:function(sharedCanvas){
        const mrTexture = new THREE.Texture(sharedCanvas);

        const material = new THREE.MeshBasicMaterial({
            map: mrTexture,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(frustumSizeWidth, frustumSizeHeight);
        const mrObj = new THREE.Mesh(geometry, material);
        mrObj.position.y = 0; // 上下
        mrObj.position.x = 0; // 左右
        mrObj.position.z = 11.2;
        material.map.minFilter = THREE.LinearFilter;

        sharedCanvas.mrTexture = mrTexture;
        sharedCanvas.mrObj = mrObj;
        sharedCanvas.mrObj.visible = true;
        this.options.camera.add(sharedCanvas.mrObj);
    },

    //展示网络错误页面
    showNetError:function(){
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['netError'];
        this._createPlane();
        this._drawNetError();
        this._updatePlane('bg');
    },
    //展示复活页面
    showRevival4Competition:function(){
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['revival'];
        this._createPlane();
        this._drawRevival4Competition();
        this._updatePlane('bg');
    },
    //展示 再接再厉 页面
    showDoBetter4Competition:function(opt){
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['doBetter'];
        this._createPlane();
        this._drawDoBetter4Competition(opt);
        this._updatePlane('bg');
    },
    //展示达到制定分数页面
    showGameWin4Competition:function(opt){
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['winAndDisplay'];
        this._createPlane();
        this._drawGameWin4Competition(opt);
        this._updatePlane('bg');
    },
    //恭喜获奖页面
    showCongratulation:function(opt){
        console.log('Rank showCongratulation');
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['congratulation'];
        this._createPlane();
        this._drawCongratulation(opt);
        this._updatePlane('bg');
    },
    //下次再战页面
    showNextFight:function(){
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['xiacizaizhan'];
        this._createPlane();
        this._drawNextFight();
        this._updatePlane('bg');
    },

    //普通场 —— 游戏结束页
    showOverAgainPage:function(opt){
        console.log('Rank showOverAgainPage');
        if (window.WechatGame){
            this.hide2D();
            if(DEBUG) return;
            this.showState = true;
            this.canvasType = CANVASTYPE['overAgain'];
            opt = opt || {};
            this.opt = opt || this.opt;
            this._createPlane();
            this.myUserInfo = //_storage2.default.getMyUserInfo() ||
                {
                    headimg: '', nickname: '', week_best_score: 0, score_info: [{score: 0}] // 更新用户信息
                };
            this._drawOverAgain(opt);
        }else{
            console.log('展示H5的结果页');
            let score = opt.currentScore || 0;
            score = score.toString();
            let tmpStr = '';
            for(let i = 0 ;i < score.length;i++){
                tmpStr += '<img class="score_img" src="'+Config.ScoreOver[score[i]]+'" style="display: none;"/>';
            }
            overAgainScore.innerHTML = tmpStr;
            overAgainMask.style.display = '-webkit-flex';
            overAgainMask.style.display = '-webkit-box';
            overAgainMask.style.display = 'flex';
            this.imgLoadedNum = 0;
            let imgArr = document.getElementsByClassName('score_img');
            for (let i=0;i<imgArr.length;++i){
                let img = imgArr[i];
                img.onload = function () {
                    this.imgLoadedNum++;
                    if (this.imgLoadedNum == score.length){
                        for (let j=0;j<imgArr.length;++j){
                            let tmpImg = imgArr[j];
                            tmpImg.style.display = 'inline';
                        }
                    }
                }.bind(this);
            }
        }
    },

    showStartPage: function (opt) {
        console.log('Rank showStartPage');
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['start'];
        this._createPlane();
        this._drawStart(opt);
    },

    showSkinPage: function (opt) {
        //皮肤未解锁页面
        console.log('Rank showSkinPage');
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this._createPlane();
        this._drawSkin(opt);
        this.canvasType = CANVASTYPE['skin'];
    },

    showNewSkinPage:function (opt) {
        //已经解锁新皮肤，展示两个皮肤选择的界面
        console.log('Rank showNewSkinPage');
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['newSkin'];
        this._createPlane();
        let currentSkin = UserService.currentSkin();
        this._drawSkinBg();
        if(currentSkin == 0){
            this._drawSkinDone(opt);
        }else if(currentSkin == 1){
            this._drawSkinDoneYellow(opt);
        }
    },

    showEverydayPick:function (result) {
        //展示天天抽红包界面
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
        this.hide2D();
        if (DEBUG) return;
        this.showState = true;
        this.canvasType = CANVASTYPE['everydayPick'];
        this._createPlane();
        let freeNum =  UserService.freeLotteryNum;
        const timesToGetRedPocket = UserService.timesToGetRedPocket;
        const text = ShareUtil.placeHolderText(ShareType.kRedPack);
        this._drawPickBg(freeNum,timesToGetRedPocket,text);
        this.index = 10;
        this._drawPick();
    },

    showPickOnce:function (result) {
        //抽一次结果页
        console.log('Rank_showPickOnce');
        const obj = result;
        const index = obj.index[0];
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['pickOnce'];
        this._createPlane();
        this._drawPop1({index:index});
    },

    showPickFive:function (result) {
        //抽五次结果页
        console.log('Rank_showPickFive');
        const obj = result;
        const index = obj.index;
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['pickFive'];
        this._createPlane();
        this._drawPop5({index:index});
    },

    //test水平列表
    showHorizontalListPage:function(opt){
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['testHorizontalList'];
        this._createPlane();
        // this._updateClip();
        this._drawHorizontalListPage(opt);
    },

    //获奖记录
    showPrizeRecord:function (opt) {
        //我的红包界面
        console.log('Rank showPrizeRecord');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['prizeRecord'];
        this._createPlane();
        this._updateClip();
        this._drawPrizeRecord(opt);
    },
    //上期排行榜
    showPrizeRankLast:function (opt) {
        //上期排行榜
        console.log('Rank showPrizeRankLast');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['prizeRankLast'];
        this._createPlane();
        this._updateClip();
        this._drawPrizeRankLast(opt);
    },
    //奖金榜
    showPrizeRankMoney:function (opt) {
        //我的红包界面
        console.log('Rank showPrizeRankMoney');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['prizeRankMoney'];
        this._createPlane();
        this._updateClip();
        this._drawPrizeRankMoney(opt);
    },

    //上期排行榜详情
    showLastAwardList:function(opt){
        console.log('Rank showLastAwardList');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['awardList'];
        this._createPlane();
        this._updateClip();
        this._drawLastAwardlist(opt);
    },

    //场次预告界面
    showSessionInfo:function (opt) {
        console.log('Rank showSessionInfo');
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['sessionInfo'];
        this._createPlane();
        // this._updateClip();
        if(opt.netBreakUp && opt.netBreakUp == 'yes'){
            this._drawSessionInfoBg('yes');
        }else if(opt.info.championshipList.length == 0){
            this._drawSessionInfoBg();
        }else{
            this._drawSessionInfo(opt);
        }
    },

    showPkPage: function (opt) {
        this.hide2D();
        // console.log('vicky 拿到的pk数据')
        // console.log(opt)
        this.showState = true;
        opt = opt || {};
        this.data = opt.data;
        this.canvasType = CANVASTYPE['pk'];
        this._createPlane();
        this._updateClip();
        this.myidx = this.data.pkListInfo.findIndex(this._findPartner) + 1;
        this.myUserInfo = this.data.pkListInfo[this.myidx - 1] ;//|| _storage2.default.getMyUserInfo();
        this.renderRankList(this.data.pkListInfo);
        this._drawPKListBg();
    },

    showLookersPage: function (opt) {
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['lookers'];
        this._createPlane();
        this._drawLookers(opt);
    },

    showBeginnerPage: function () {
        this.hide2D();
        this.showState = true;
        this.canvasType = CANVASTYPE['beginner'];
        this._createPlane();
        this._drawBeginner();
    },

    hide2D: function () {
        if (window.WechatGame){
            console.log('Rank hide2D');
            if (DEBUG) return;
            this._destroyAllButtons();
            this._hiddenShareCanvas();
            this.showState = false;
            for (let i = 0; i < this.planList.length; i++) {
                if (!this.obj[this.planList[i]]) continue;
                this.obj[this.planList[i]].visible = false;
                // this.options.camera.remove(this.obj[this.planList[i]]);
            }
            wx.triggerGC();
        }
    },

    hide2DGradually: function () {
        if (DEBUG) return;
        let that = this;
        for (let i = 0; i < this.planList.length; i++) {
            if (!this.obj[this.planList[i]]) continue;
            _animation.customAnimation.to(this.material[this.planList[i]], 1, {
                opacity: 0, onComplete: function (i) {
                    return function () {
                        that.material[this.planList[i]].opacity = 1;
                        that.obj[this.planList[i]].visible = false;
                        that.showState = false;
                        // that.options.camera.remove(that.obj[this.planList[i]]);
                    };
                }(i)
            });
        }
    },

    // ----------------- 滑动事件处理 -----------------
    _findDelta: function (e) {
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
    },

    doTouchStartEvent: function (e) {
        // console.log('Rank doTouchStartEvent e = ' + JSON.stringify(e));//e = [object MouseEvent]
        if (!this.showState) {
            console.log('doTouchStart_return');
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
        console.log('Rank touchstart: {'+pageX+','+pageY+'}');
        this.startX = pageX;
        this.startY = pageY;
        if (this.canvasType == CANVASTYPE['friendRank'] || this.canvasType == CANVASTYPE['groupRank'] || this.canvasType == CANVASTYPE['pk']) {
            // var touchInfo = this._touchInfo;
            // var listener = this.scrollHandler;
            // if (!listener) return;
            //
            // touchInfo.trackingID = 'touch';
            // touchInfo.x = e.touches[0].pageX;
            // touchInfo.y = e.touches[0].pageY;
            //
            // touchInfo.maxDx = 0;
            // touchInfo.maxDy = 0;
            // touchInfo.historyX = [0];
            // touchInfo.historyY = [0];
            // touchInfo.historyTime = [ + new Date()];
            // touchInfo.listener = listener;
            //
            // if (listener.onTouchStart) {
            //     listener.onTouchStart();
            // }
        } else if(this.canvasType == CANVASTYPE['rankGlobal']|| this.canvasType == CANVASTYPE['prizeRecord']|| this.canvasType == CANVASTYPE['prizeRankLast']|| this.canvasType == CANVASTYPE['prizeRankMoney']||this.canvasType==CANVASTYPE['awardList']||this.canvasType == CANVASTYPE['testHorizontalList']){

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
    },

    doTouchMoveEvent: function (e) {
        if (!this.showState) return;
        if (this.canvasType == CANVASTYPE['friendRank'] || this.canvasType == CANVASTYPE['groupRank'] || this.canvasType == CANVASTYPE['pk']) {
            // var touchInfo = this._touchInfo;
            // if (touchInfo.trackingID == -1) return;
            // e.preventDefault();
            // var delta = this._findDelta(e);
            // if (!delta) return;
            // touchInfo.maxDy = Math.max(touchInfo.maxDy, Math.abs(delta.y));
            // touchInfo.maxDx = Math.max(touchInfo.maxDx, Math.abs(delta.x));
            //
            // // This is all for our crummy velocity computation method. We really
            // // should do least squares or anything at all better than just taking
            // // the difference between two random samples.
            // var timeStamp = +new Date();
            // touchInfo.historyX.push(delta.x);
            // touchInfo.historyY.push(delta.y);
            // touchInfo.historyTime.push(timeStamp);
            // while (touchInfo.historyTime.length > 10) {
            //     touchInfo.historyTime.shift();
            //     touchInfo.historyX.shift();
            //     touchInfo.historyY.shift();
            // }
            // if (touchInfo.listener && touchInfo.listener.onTouchMove) touchInfo.listener.onTouchMove(delta.x, delta.y, timeStamp);
        }else if(this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['prizeRecord']|| this.canvasType == CANVASTYPE['prizeRankLast']|| this.canvasType == CANVASTYPE['prizeRankMoney']||this.canvasType==CANVASTYPE['awardList']||this.canvasType == CANVASTYPE['testHorizontalList']){
            console.log('doTouchMoveEvent');
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
    },

    doTouchEndEvent: function (e) {
        console.log('Rank doTouchEndEvent');
        if (!this.showState) return;

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
        console.log('Rank touchstart: {'+__pageX+','+__pageY+'}');
        let isClick = true;
        if ((this.canvasType == CANVASTYPE['friendRank'] || this.canvasType == CANVASTYPE['groupRank'] || this.canvasType == CANVASTYPE['pk'] || this.canvasType == CANVASTYPE['gameOver'] ||this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['rankLeCard']|| this.canvasType == CANVASTYPE['prizeRecord']||this.canvasType==CANVASTYPE['awardList'] || this.canvasType == CANVASTYPE['testHorizontalList']) && (Math.abs(pageX - this.startX) > 5 || Math.abs(pageY - this.startY) > 5)) {
            // 不认为是一次 click
            isClick = false;
        }
        const pageX = this._cxp(__pageX);
        const pageY = this._cyp(__pageY);
        const _pageX = __pageX * Dpr;
        const _pageY = __pageY * Dpr;

        if (isClick) {
            // if (this.canvasType == CANVASTYPE['groupRank']) {
            //     if (pageX > 134 && pageX < 283 && pageY > 640 && pageY < 727) {
            //         this.hide2D(); !! this.options.groupPlayGame && this.options.groupPlayGame();
            //         return;
            //     }
            // }
            if (this.canvasType == CANVASTYPE['friendRank']) {
                if (pageX > 120 && pageX < 300 && pageY > 640 && pageY < 720) {
                    // console.log('查看群排行');
                    !! this.options.onGroupShare && this.options.onGroupShare();
                    return;
                //} else if (pageX > 330 && pageX < 408 && pageY > 100 && pageY < 200) {
                } else if (pageX > 27 && pageX < 72 && pageY > 664 && pageY < 708.5) {
                    if ( this.opt) {
                        this.hide2D();
                        this.showState = true;
                        // this.canvasType = CANVASTYPE['gameOver'];
                        this.canvasType = CANVASTYPE['overAgain'];
                        this._drawOverAgain();
                    } else { //!! this.options.friendRankReturn && this.options.friendRankReturn('');
                        this.hide2D();
                        this.showState = true;
                        // this.canvasType = CANVASTYPE['gameOver'];
                        this.canvasType = CANVASTYPE['start'];
                        this._drawStart();
                    }
                    return;
                }
            }

            if(this.canvasType == CANVASTYPE['rankGlobal']){
                //全球榜界面点击处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['netError']) {
                //网络错误点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['rankInner']) {
                //好友榜界面点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['prizeRecord']) {
                //获奖记录页
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['prizeRankLast']) {
                //获奖榜单-上期排行榜
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['prizeRankMoney']) {
                //获奖榜单- 奖金榜
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['sessionInfo']) {
                //获奖榜单-场次预告
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['awardList']) {
                //上期排行榜详情
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['xiacizaizhan']) {
                //下次再战
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['revival']){
                ///复活页面点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['doBetter']){
                ///再接再厉页面点击事件处理 congratulation
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['winAndDisplay']){
                ///胜利页面点击事件处理 winAndDisplay
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['congratulation']){
                ///恭喜获奖页面点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['winAndDisplay']){
                ///恭喜获奖页面点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['overAgain']){
                //游戏结束画面点击处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['skin']){
                //未解锁皮肤界面点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if(this.canvasType == CANVASTYPE['newSkin']){
                //已经解锁皮肤，获得新皮肤之后的界面，点击事件处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['start']) {
                console.log('首页点击处理');
                if (this.canvas['btn'].handleEvent) {
                    console.log('可以处理handleEvent');
                }else{
                    console.log('不能处理');
                }
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['everydayPick']){
                //天天抽
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['pickOnce']){
                //抽一次界面点击处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['pickFive']){
                //抽五次界面点击处理
                this.canvas['btn'].handleEvent && this.canvas['btn'].handleEvent({point:{x:_pageX,y:_pageY}});
            }
            if (this.canvasType == CANVASTYPE['pk']) {
                if (pageX > 110 && pageX < 310 && pageY > 650 && pageY < 730) {
                    // console.log('不挑战 直接开始');
                    !! this.options.onBattlePlay && this.options.onBattlePlay(''); // 自己玩一局
                    return;
                }
                if (this.data.organizerInfo.left_time > 0 && this.data.organizerInfo.is_self == 0 && pageX > 140 && pageX < 280 && pageY > 325 && pageY < 405) {
                    // console.log('挑战按钮');
                    !! this.options.onBattlePlay && this.options.onBattlePlay('pk'); // 再次挑战
                    return;
                }
            }
            if (this.canvasType == CANVASTYPE['lookers']) {
                if (pageX > 130 && pageX < 280 && pageY > 650 && pageY < 720) { !! this.options.onLookersStart && this.options.onLookersStart();
                }
                return;
            }
        }
        let touchInfo = this._touchInfo;
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        let delta = this._findDelta(e);
        if (!delta) return;
        let listener = touchInfo.listener;
        touchInfo.trackingID = -1;
        touchInfo.listener = null;

        // Compute velocity in the most atrocious way. Walk backwards until we find a sample that's 30ms away from
        // our initial sample. If the samples are too distant (nothing between 30 and 50ms away then blow it off
        // and declare zero velocity. Same if there are no samples.
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
    },

    updatePosition: function (scrollY) {
        let viewS; // 好友/ 群排行
        if (scrollY > 0) {
            // 表头下拉效果
            scrollY = 0;
        }
        let listlength = 10 * this._cwh(ListLineHeight) / HEIGHT * frustumSizeHeight; // list length 在 fust 下的尺寸
        let listlength1 = 10 * this._cwh(ListLineHeight);

        if (this.canvasType == CANVASTYPE['friendRank'] || this.canvasType == CANVASTYPE['groupRank']) {
            // 736/2 - 448/2
            viewS = -(this._cy(143) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight; //这个坐标计算好像有点问题，设计稿是143
        }
        if (this.canvasType == CANVASTYPE['pk']) {
            viewS = -(this._cy(437) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }

        if (this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['rankLeCard']) {
            //排行榜详细坐标位置280
            viewS = -(this._cyy(300) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.canvasType == CANVASTYPE['prizeRankLast']) {
            //获奖榜单上期排行榜坐标位置505
            viewS = -(this._cyy(515) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.canvasType == CANVASTYPE['prizeRankMoney']) {
            //获奖榜单奖金榜坐标位置290
            viewS = -(this._cyy(300) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.canvasType == CANVASTYPE['awardList']){
            viewS = -(this._cyy(430) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.canvasType == CANVASTYPE['prizeRecord']) {
            // 获奖记录坐标位置 ListLineHeight4PrizeRecord
            let listNum = 7;
            listlength = listNum * this._cwh(ListLineHeight4PrizeRecord)/ HEIGHT * frustumSizeHeight;
            listlength1 = listNum * this._cwh(ListLineHeight4PrizeRecord);
            viewS = -(this._cyy(770) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
            // 滑到第几屏的list
            let n = Math.floor((viewS - frustumSizeHeight * scrollY / H) / listlength);
            if (this.lastN != n && this.lastN - n < 0) {
                // 下移
                if (n % 2 == 0) {
                    this._drawRecordList((n + 1) * listNum, 'list2');
                } else {
                    this._drawRecordList((n + 1) * listNum, 'list1');
                }
            } else if (this.lastN != n && this.lastN - n > 0) {
                // 上移
                let x = n;
                if (x == -1) x = 1;
                if (n % 2 == 0) {
                    this._drawRecordList(n * listNum, 'list1');
                } else {
                    this._drawRecordList(x * listNum, 'list2');
                }
            }

            if (n % 2 == 0) {
                this.obj['list1'].position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
                this.obj['list2'].position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
            } else {
                this.obj['list2'].position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
                this.obj['list1'].position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
            }
            this.lastN = n;
            this.lastScrollY = scrollY;
            return;
        }

        //水平列表
        if (this.canvasType == CANVASTYPE['testHorizontalList']) {
            // 获奖记录坐标位置 ListLineHeight4PrizeRecord
            let listNum = 7;
            listlength = listNum * this._cwh(ListColumnWidth)/ WIDTH * frustumSizeWidth;
            listlength1 = listNum * this._cwh(ListColumnWidth);
            viewS = (this._cx(0)+listlength1/2 - WIDTH/2) / WIDTH * frustumSizeWidth;
            // 滑到第几屏的list
            let n = Math.abs(Math.floor((viewS + frustumSizeWidth * scrollY / W) / listlength));
            n -= 1;
            if (this.lastN != n && this.lastN - n < 0) {
                // 下移
                if (n % 2 == 0) {
                    this._drawHorizontalList((n + 1) * listNum, 'list4');
                } else {
                    this._drawHorizontalList((n + 1) * listNum, 'list3');
                }
            } else if (this.lastN != n && this.lastN - n > 0) {
                // 上移
                let x = n;
                if (x == -1) x = 1;
                if (n % 2 == 0) {
                    this._drawHorizontalList(n * listNum, 'list3');
                } else {
                    this._drawHorizontalList(x * listNum, 'list4');
                }
            }

            if (n % 2 == 0) {
                this.obj['list3'].position.x = viewS + frustumSizeWidth * scrollY / W + n * listlength;
                this.obj['list4'].position.x = viewS + frustumSizeWidth * scrollY / W + (n + 1) * listlength;
            } else {
                this.obj['list4'].position.x = viewS + frustumSizeWidth * scrollY / W + n * listlength;
                this.obj['list3'].position.x = viewS + frustumSizeWidth * scrollY / W + (n + 1) * listlength;
            }
            this.lastN = n;
            this.lastScrollY = scrollY;
            return;
        }

        // 滑到第几屏的list
        let n = Math.floor((viewS - frustumSizeHeight * scrollY / H) / listlength);
        if (this.lastN != n && this.lastN - n < 0) {
            // 下移
            if (n % 2 == 0) {
                this._drawMyList((n + 1) * 10, 'list2');
            } else {
                this._drawMyList((n + 1) * 10, 'list1');
            }
        } else if (this.lastN != n && this.lastN - n > 0) {
            // 上移
            let x = n;
            if (x == -1) x = 1;
            if (n % 2 == 0) {
                this._drawMyList(n * 10, 'list1');
            } else {
                this._drawMyList(x * 10, 'list2');
            }
        }

        if (n % 2 == 0) {
            this.obj['list1'].position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
            this.obj['list2'].position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
        } else {
            this.obj['list2'].position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
            this.obj['list1'].position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
        }
        this.lastN = n;
        this.lastScrollY = scrollY;
    },

    // ----------------- 列表绘制 -----------------
    // _drawList: function (offset, type) {
    //     var _this = this;
    //
    //     if (type == 'list1') {
    //         // 两个list互不干扰，只在一个list显示时候++
    //         this.imgid['list1']++;
    //     } else if (type == 'list2') {
    //         this.imgid['list2']++;
    //     }
    //
    //     var limit = 10;
    //     var list = this.sotedRankList.slice(offset, offset + limit);
    //     // 绘制列表 从 m 开始到 n 结束的列表
    //     var ctx = this.context[type];
    //     ctx.clearRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight));
    //
    //     ctx.fillStyle = 'rgba(0,0,0,0.9)';
    //     if (this.canvasType == CANVASTYPE['pk']) {
    //         ctx.fillStyle = 'white';
    //     }
    //     ctx.textBaseline = "middle";
    //     ctx.fillRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight)); //list 底色为白色
    //
    //     if (offset != 0 && list.length == 0) {
    //         // 最后面列表结束显示白色屏幕就可以，不显示
    //         this._updatePlane(type);
    //         return;
    //     }
    //     if (offset < 0) {
    //         // 这种情况下不要更新列表
    //         return;
    //     }
    //
    //     var len = list.length;
    //
    //     var _loop = function _loop() {
    //         if (_this.canvasType != CANVASTYPE['pk']) {
    //             if (i % 2 == 1) {
    //                 ctx.fillStyle = 'rgba(255,255,255, 0.03)';
    //                 ctx.fillRect(0, i * _this._cwh(ListLineHeight), _this._cwh(414), _this._cwh(ListLineHeight));
    //             }
    //         }
    //
    //         // 写一个大的数字
    //         var y = (i + 0.5) * _this._cwh(ListLineHeight); // 每一行中间的y值
    //         ctx.textAlign = "center";
    //         n = i + 1 + offset;
    //
    //         if (n == 1) {
    //             ctx.fillStyle = 'rgb(250,126,0)';
    //         } else if (n == 2) {
    //             ctx.fillStyle = 'rgb(254,193,30)';
    //         } else if (n == 3) {
    //             ctx.fillStyle = 'rgb(251,212,19)';
    //         } else {
    //             ctx.fillStyle = '#aaa';
    //         }
    //         ctx.font = "italic bold " + _this._cf(17);
    //         ctx.fillText(n, _this._cx(58.5), y);
    //
    //         // 绘制头像
    //         var that = _this;
    //
    //         var g = list[i].grade || 0;
    //         _this._drawImageRound(list[i].headimg, _this._cx(107), y, _this._cwh(34), _this._cwh(34), type, function () {
    //             if (that.canvasType == CANVASTYPE['pk']) {
    //                 that._drawImageCenter('res/img/ava_lookers.png', that._cx(107), y, that._cwh(37), that._cwh(37), type, null, that.imgid[type]);
    //             } else that._drawImageCenter('res/img/ava_rank.png', that._cx(107), y, that._cwh(47), that._cwh(47), type, null, that.imgid[type]);
    //         }, _this.imgid[type], true);
    //         //that._cx(107)
    //
    //         if (_this.canvasType == CANVASTYPE['pk']) {
    //             // 写名字
    //             ctx.textAlign = "left";
    //             ctx.fillStyle = '#000';
    //             ctx.font = 'bold ' + _this._cf(17);
    //             ctx.fillText(_this._cname(list[i].nickname, 16), _this._cx(144), y - _this._cwh(10));
    //
    //             if (list[i].score_info[0].score > _this.data.organizerInfo.score_info[0].score) {
    //                 ctx.font = _this._cf(12);
    //                 ctx.fillStyle = '#FC4814';
    //                 ctx.fillText('挑战成功', _this._cx(144), y + _this._cwh(12));
    //                 ctx.fillStyle = '#000';
    //             } else {
    //                 ctx.font = _this._cf(12);
    //                 ctx.fillStyle = '#888';
    //                 ctx.fillText('挑战失败', _this._cx(144), y + _this._cwh(12));
    //             }
    //
    //             ctx.textAlign = "right";
    //             ctx.font = _this._cf(22, true);
    //             ctx.fillText(list[i].score_info[0].score || 0, _this._cx(364), y);
    //         } else {
    //             // 写名字
    //             ctx.textAlign = "left";
    //             ctx.fillStyle = '#FFFFFF';
    //             ctx.font = _this._cf(17);
    //             list[i].nickname = list[i].nickname || '';
    //             ctx.fillText(_this._cname(list[i].nickname, 16), _this._cx(144), y);
    //
    //             // 写分数
    //             ctx.textAlign = "right";
    //             ctx.font = _this._cf(22, true);
    //             ctx.fillText(list[i].week_best_score || 0, _this._cx(364), y);
    //         }
    //     };
    //
    //     for (var i = 0; i < len; i++) {
    //         var n;
    //
    //         _loop();
    //     }
    //
    //     if (len == 0) {
    //         // 没有任何数据
    //         ctx.textAlign = "center";
    //         ctx.fillStyle = '#ccc';
    //         ctx.font = this._cf(14);
    //         if (this.canvasType == CANVASTYPE['pk']) {
    //             ctx.fillText('暂无人应战', this._cx(207), this._cwh(100));
    //         } else {
    //             ctx.fillText('暂无排行数据', this._cx(207), this._cy(429));
    //         }
    //     }
    //     this._updatePlane(type);
    // },

    renderRankList: function (res) {
        if (this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['rankLeCard']) {
            this.sotedRankList = res; // 存下来，滑动的时候用到
        } else if(this.canvasType == CANVASTYPE['prizeRecord'] ||this.canvasType == CANVASTYPE['prizeRankLast']||this.canvasType == CANVASTYPE['prizeRankMoney']){
            this.sotedRankList = res; // 存下来，滑动的时候用到
        }else if (this.canvasType == CANVASTYPE['awardList']){
            //上期获奖详情
            this.sotedRankList = res;
        } else{
            this.sotedRankList = res; // 存下来，滑动的时候用到
        }
        let innerHeight = (this.sotedRankList.length+1) * this._cwh(ListLineHeight) / Dpr;
        let outterOffsetHeight;

        if (this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['rankLeCard']) {
            outterOffsetHeight = this._cwh(445) / Dpr;
        }
        if(this.canvasType == CANVASTYPE['prizeRecord']){
            outterOffsetHeight = this._s(480)/ Dpr;
            innerHeight = (this.sotedRankList.length ) * this._cwh(ListLineHeight4PrizeRecord)/ Dpr;
        }
        if(this.canvasType == CANVASTYPE['prizeRankLast']){
            outterOffsetHeight = this._s(590)/ Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }
        if(this.canvasType == CANVASTYPE['prizeRankMoney']){
            outterOffsetHeight = this._s(805) / Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }
        if(this.canvasType == CANVASTYPE['awardList']){
            outterOffsetHeight = this._s(590)/ Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }

        let direction = 'y';
        //水平列表
        if (this.canvasType == CANVASTYPE['testHorizontalList']){
            direction = 'x';
            outterOffsetHeight = W;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListColumnWidth) / Dpr;
        }
        this.scrollHandler = new ScrollHandler({
            direction:direction,
            innerOffsetHeight: innerHeight, // 个数 * 每一行的高度百分比 * 总高度
            outterOffsetHeight: outterOffsetHeight,
            updatePosition: this.updatePosition.bind(this)
        });
        if(this.canvasType == CANVASTYPE['prizeRecord']){
            let listNum = 7;
            this._drawRecordList(0, 'list1');
            this._drawRecordList(listNum, 'list2');
            return;
        }else if(this.canvasType == CANVASTYPE['prizeRankLast']){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
            return;
        }else if(this.canvasType == CANVASTYPE['prizeRankMoney']){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
            return;
        }else if (this.canvasType == CANVASTYPE['awardList']){
            //上期排行榜详情
            this._drawMyList(0, 'list1');
            this._drawMyList(10, 'list2');
        }else if(this.canvasType == CANVASTYPE['rankGlobal'] || this.canvasType == CANVASTYPE['rankLeCard']){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
        }else if (this.canvasType == CANVASTYPE['testHorizontalList']){
            this._drawHorizontalList(0,'list3');
            this._drawHorizontalList(7,'list4');
        }

    },

    // ----------------- 背景绘制 -----------------
    _drawPKListBg: function () {
        // 绘制背景图
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.8)';
        ctx.fillRect(0, 0, (WIDTH - this._cwh(354)) / 2, HEIGHT); // 左
        ctx.fillRect(this._cx(384), 0, (WIDTH - this._cwh(354)) / 2, HEIGHT); // 右

        ctx.fillRect(this._cx(30), 0, this._cwh(354), this._cy(110)); // 上
        ctx.fillRect(this._cx(30), this._cy(632), this._cwh(354), this._cy(144)); // 下

        // 显示擂主分数
        // 列表背景
        ctx.fillStyle = 'rgb(250,250,250)';
        ctx.fillRect(this._cx(31), this._cy(103), this._cwh(354), this._cwh(335));

        ctx.lineWidth = 2 * Dpr;
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cx(30), this._cy(102), this._cwh(354), this._cwh(530), 1 * Dpr, 'bg');

        ctx.textBaseline = 'middle';
        // 绘制头像
        let that = this;

        if (this.data.gg_score == undefined) {
            // 显示擂主信息
            this._drawImageCenter(this.data.organizerInfo.headimg, this._cx(207), this._cy(158), this._cwh(50), this._cwh(50), 'bg', null, this.imgid['bg']);
            // 写名字
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.font = this._cf(14);
            ctx.fillText(this.data.organizerInfo.nickname, this._cx(207), this._cy(195));
            ctx.fillText('擂主得分', this._cx(207), this._cy(242));
            // 一条线
            ctx.lineWidth = 0.5 * Dpr;
            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.beginPath();
            ctx.moveTo(this._cx(160), this._cy(217));
            ctx.lineTo(this._cx(254), this._cy(217));
            ctx.closePath();
            ctx.stroke();

            // 小方块
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(this._cx(162), this._cy(239), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(162), this._cy(244), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(241), this._cy(239), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(241), this._cy(244), this._cwh(9), this._cwh(3));

            // 写分数
            ctx.fillStyle = '#000';
            ctx.font = this._cf(66, true);
            ctx.fillText(this.data.organizerInfo.score_info[0].score, this._cx(207), this._cy(298));
        } else {
            // 显示挑战结果
            let suc_src = void 0,
                suc_word = void 0,
                c1 = void 0,
                c2 = void 0;
            if (this.data.gg_score > this.data.organizerInfo.score_info[0].score) {
                // 挑战成功
                suc_src = 'res/img/suc.png';
                suc_word = '挑战成功';
                c1 = 'rgba(0,0,0,1)';
                c2 = 'rgba(0,0,0,0.3)';
                // 烟花
                this._drawImageCenter('res/img/flower_small.png', this._cx(207), this._cy(175), this._cwh(140), this._cwh(53), 'bg', null, this.imgid['bg']);
            } else {
                // 挑战失败
                suc_src = 'res/img/fail.png';
                suc_word = '挑战失败';
                c1 = 'rgba(0,0,0,0.3)';
                c2 = 'rgba(0,0,0,1)';
            }

            // 顶部icon
            this._drawImageCenter(suc_src, this._cx(207), this._cy(135), this._cwh(20), this._cwh(15), 'bg', null, this.imgid['bg']);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#000';
            ctx.font = 'bold ' + this._cf(30);
            ctx.fillText(suc_word, this._cx(207), this._cy(178));

            // 头像
            this._drawImageCenter(this.myUserInfo.headimg, this._cx(158), this._cy(289), this._cwh(26), this._cwh(26), 'bg', null, this.imgid['bg']);
            this._drawImageCenter(this.data.organizerInfo.headimg, this._cx(260), this._cy(289), this._cwh(26), this._cwh(26), 'bg', null, this.imgid['bg']);
            // 名字
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.font = this._cf(11);
            ctx.fillText(this._cname(this.myUserInfo.nickname, 16), this._cx(158), this._cy(318));
            ctx.fillText(this._cname(this.data.organizerInfo.nickname, 16), this._cx(260), this._cy(318));

            // 分数
            ctx.fillStyle = c1;
            ctx.font = this._cf(44, true);
            if (this.data.gg_score > 999) {
                ctx.textAlign = 'right';
                ctx.fillText(this.data.gg_score, this._cx(190), this._cy(253));
            } else {
                ctx.textAlign = 'center';
                ctx.fillText(this.data.gg_score, this._cx(158), this._cy(253));
            }

            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.3)';

            ctx.fillRect(this._cx(202), this._cy(242), this._cwh(10), this._cwh(4));

            ctx.fillStyle = c2;
            ctx.font = this._cf(44, true);
            if (this.data.organizerInfo.score_info[0].score > 999) {
                ctx.textAlign = 'left';
                ctx.fillText(this.data.organizerInfo.score_info[0].score, this._cx(231), this._cy(253));
            } else {
                ctx.textAlign = 'center';
                ctx.fillText(this.data.organizerInfo.score_info[0].score, this._cx(260), this._cy(253));
            }
        }

        // 列表有一条分界线
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this._cx(30), this._cy(437));
        ctx.lineTo(this._cx(384), this._cy(437));
        ctx.stroke();
        ctx.closePath();

        // 挑战btn
        let msg = '挑战';
        if (this.data.organizerInfo.left_time > 0 && this.data.organizerInfo.is_self == 0) {
            // 剩余时间 > 0 并且不是擂主，就可以挑战
            if (this.myidx > 0) {
                // 有名次的一定是 [1, ~)
                msg = '再次挑战';
            }
            this._drawImageCenter('res/img/btn_bg_g.png', this._cx(207), this._cy(368), this._cwh(130), this._cwh(63), 'bg', function () {
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = that._cf(14);
                ctx.fillText(msg, that._cx(207), that._cy(368));
                that._updatePlane('bg');
            }, this.imgid['bg']);
            // 显示有效时间
            ctx.font = this._cf(12);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#000';
            ctx.fillText('有效时间至', this._cx(223), this._cy(403.5));
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fc4814';
            var nt = +new Date();
            var lt = nt + this.data.organizerInfo.left_time * 1000;
            nt = new Date(lt);
            var ho = nt.getHours();
            ho = ho < 10 ? '0' + ho : ho;
            var m = nt.getMinutes();
            m = m < 10 ? '0' + m : m;
            ctx.fillText(ho + ':' + m, this._cx(225), this._cy(403.5));
        } else if (this.data.organizerInfo.left_time == 0 && this.data.organizerInfo.is_self == 0) {
            // 没有剩余时间并且不是擂主， 显示失效
            this._drawImageCenter('res/img/btn_bg_h.png', this._cx(207), this._cy(368), this._cwh(130), this._cwh(63), 'bg', function () {
                ctx.font = that._cf(14);
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillText('挑战结束', that._cx(207), that._cy(368));
                that._updatePlane('bg');
            }, this.imgid['bg']);
            ctx.font = this._cf(14);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#888';
            ctx.fillText('已失效', this._cx(207), this._cy(403.5));
        } else if (this.data.organizerInfo.left_time > 0 && this.data.organizerInfo.is_self == 1) {
            // 有剩余时间，是擂主，擂主看到失效时间
            ctx.font = this._cf(14);
            ctx.textAlign = 'right';
            ctx.fillStyle = '#888';
            ctx.fillText('有效时间至', this._cx(223), this._cy(369));
            ctx.textAlign = 'left';
            ctx.fillStyle = '#2c9f67';
            let nt = +new Date();
            let lt = nt + this.data.organizerInfo.left_time * 1000;
            nt = new Date(lt);
            let ho = nt.getHours();
            ho = ho < 10 ? '0' + ho : ho;
            let m = nt.getMinutes();
            m = m < 10 ? '0' + m : m;
            ctx.fillText(ho + ':' + m, this._cx(225), this._cy(369));
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(17);
        ctx.fillText('不挑战，直接开始', this._cx(199), this._cy(688));
        this._drawImageCenter('res/img/r_arr.png', this._cx(280), this._cy(688), this._cwh(6.5), this._cwh(12.5), 'bg', null, this.imgid['bg']);

        this._updatePlane('bg');
    },

    _drawRankListBg: function () {
        // 绘制背景图
        console.log('Rank _drawRankListBg');
        this.imgid['bg']++; // 从另一个bg场景，到这一个bg场景，为了不渲染上一个bg场景的图片，这里应该++
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.8)';
        ctx.fillRect(0, 0, (WIDTH - this._cwh(354)) / 2, HEIGHT); // 左
        ctx.fillRect(this._cx(384), 0, (WIDTH - this._cwh(354)) / 2, HEIGHT); // 右

        ctx.fillRect(this._cx(30), 0, this._cwh(354), this._cy(110)); // 上
        ctx.fillRect(this._cx(30), this._cy(592), this._cwh(354), this._cy(144)); // 下
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        // 列表里面的半透明的蒙层
        /*var grd=ctx.createLinearGradient(this._cx(30), this._cy(185), this._cx(30), this._cy(191)); // xyxy
grd.addColorStop(0, "rgba(0,0,0, 0.04)");
grd.addColorStop(1,"rgba(255,255,255, 0.1)");
ctx.fillStyle=grd;
ctx.fillRect(this._cx(30), this._cy(185), this._cx(354), this._cx(6)); // xy wh*/

        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(this._cx(30), this._cy(110), this._cwh(354), this._cwh(33));

        // 列表有一条分界线
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cx(30), this._cy(143));
        ctx.lineTo(this._cx(384), this._cy(143));
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold ' + this._cf(12);
        ctx.textAlign = 'left';
        ctx.fillText('每周一凌晨刷新', this._cx(54), this._cy(126.5));

        ctx.lineWidth = 1 * Dpr;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this._roundedRectR(this._cx(30), this._cy(110), this._cwh(354), this._cwh(482), 1 * Dpr, 'bg');

        this._updatePlane('bg');

        if (this.canvasType == CANVASTYPE['groupRank']) {
            const that = this;
            ctx.font = that._cf(17);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('玩一局', that._cx(207), that._cy(680));
            this._drawImageCenter('res/img/r_arr.png', this._cx(244), this._cy(680), this._cwh(6.6), this._cwh(10), 'bg', null, this.imgid['bg']);
        }
        if (this.canvasType == CANVASTYPE['friendRank']) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(17);
            ctx.textAlign = 'left';
            ctx.fillText('查看群排行', this._cx(177), this._cy(674));
            this._drawImageCenter('res/img/r_arr.png', this._cx(270), this._cy(674), this._cwh(6.6), this._cwh(10), 'bg', null, this.imgid['bg']);
            this._drawImageCenter('res/img/rank.png', this._cx(154), this._cy(674), this._cwh(22), this._cwh(22), 'bg', null, this.imgid['bg']);
            this._drawImageCenter('res/img/close.png', this._cx(375), this._cy(114), this._cwh(48), this._cwh(48), 'bg', null, this.imgid['bg']);
        }
    },

    //画超过多少人
    _drawPassPeopleNum:function(num){
        num = num>=0 ? num : 0;
        let ctx = this.context['bg'];
        ctx.clearRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37));
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37));
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+num+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._updatePlane('bg');
    },
    //置灰再来一局button
    disableGameAgain4Competition:function(){
        let ctx = this.context['bg'];
        let ctx1 = this.context['btn'];
        ctx.clearRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        ctx1.clearRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(this._cxx(180),this._cyy(818),this._s(390),this._s(130));
        this._drawImageCenter('res/img/battle/another_huise.png', this._cxx(180+390/2), this._cyy(818+130/2), this._s(390), this._s(130), 'bg', null, this.imgid['bg']);
        let againBtn = Button.buttonWithTag(this.canvas['btn'],'againBtn4DoBetter');
        if (againBtn){
            againBtn.destroy();
        }
        this._updatePlane('bg');
        this._updatePlane('btn');
    },
    //画再接再厉页面
    _drawDoBetter4Competition:function(opt){
        let passNum = opt.exceed || 0;
        const score = opt.targetScore-opt.score;
        const endTime = opt.endTime;
        const registerEndTime = opt.registerEndTime;
        let ctx = this.context['bg'];
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0,0,WIDTH,HEIGHT);
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(0,0,WIDTH,HEIGHT);
        //回主页
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function (sender) {
            // !! this.options.toBackStartPage && this.options.toBackStartPage();
            !!this.options.onClickSessionInfo && this.options.onClickSessionInfo(sender);
        }.bind(this);
        //再接再厉
        this._drawImageCenter('res/img/battle/zaijiezaili.png', this._cxx(217+317/2), this._cyy(268+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+passNum+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._drawImageCenter('res/img/battle/zaijiedetu.png', this._cxx(155+440/2), this._cyy(407+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('您离获奖只差'+score+'分，继续努力吧！',this._cxx(141+469/2),this._cyy(732+26/2));
        const againBtn = new Button(this.canvas['btn']);
        againBtn.origin = {x:this._cxx(180),y:this._cyy(818)};
        againBtn.size = {width:this._s(390),height:this._s(130)};
        againBtn.tag = 'againBtn4DoBetter';
        const nowTime = new Date().getTime();
        if (registerEndTime > nowTime){
            againBtn.image = 'res/img/battle/another_game.png';
        }else{
            againBtn.image = 'res/img/battle/another_huise.png';
        }
        againBtn.show();
        againBtn.onClick = function (sender) {
            !! this.options.onClickGameAgain4Competition && this.options.onClickGameAgain4Competition(sender);
        }.bind(this);
        const helpBtn = new Button(this.canvas['btn']);
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(978)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/qiuzhuhaoyou.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            !! this.options.onClickHelp4Competition && this.options.onClickHelp4Competition(sender);
        }.bind(this);

        if(opt.shareContent){
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(13);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(opt.shareContent,this._cxx(46+661/2),this._cyy(1159+26/2));
        }
    },

    //画复活页面
    _drawRevival4Competition: function(){
        const revivalCount = UserService.revivalCard || 0;//获取复活卡数量
        let ctx = this.context['bg'];
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0,0,WIDTH,HEIGHT);
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(0,0,WIDTH,HEIGHT);
        this._drawImageCenter('res/img/battle/fuhuo.png', this._cxx(375), this._cyy(449), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        //使用复活卡
        const goBtn = new Button(this.canvas['btn']);
        goBtn.center = {x:this._cxx(161+428/2),y:this._cyy(551+126/2)};
        goBtn.size = {width:this._s(428),height:this._s(126)};
        goBtn.onDisplay(function(){
            console.log('画剩余多少张');
            let ctx2 = this.context['btn'];
            ctx2.textBaseline = 'middle';
            ctx2.textAlign = 'center';
            ctx2.font = this._cf(13);
            ctx2.fillStyle = '#4e4e4e';
            ctx2.fillText('剩余'+revivalCount+'张', this._cxx(426+105/2), this._cyy(596+26/2));
            this._updatePlane('btn');
        }.bind(this));
        goBtn.image = 'res/img/battle/fuhuokaanniu.png';
        goBtn.show();
        goBtn.onClick = function (sender) {
            !! this.options.onClickRevival4Competition && this.options.onClickRevival4Competition(sender);
        }.bind(this);

        //点击跳过
        const stepBtn = new Button(this.canvas['btn']);
        stepBtn.origin = {x:this._cxx(290), y:this._cyy(700)};
        stepBtn.size = {width:this._s(145),height:this._s(45)};
        stepBtn.show();
        stepBtn.onClick = function () {
            !! this.options.onClickStepOver4Competition && this.options.onClickStepOver4Competition();
        }.bind(this);

        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(16);
        ctx.fillText('点击跳过 >',this._cxx(301+120/2),this._cyy(709+26/2));
    },

    //画达到目标得分页面
    _drawGameWin4Competition:function(opt){
        let passNum = opt.exceed || 0;
        const time = opt.time;
        const min = Math.floor(time/60);
        const sec = time%60;
        const score = opt.targetScore || 2000;
        let ctx = this.context['bg'];
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0,0,WIDTH,HEIGHT);
        ctx.fillStyle = 'rgba(106,182,163,1.0)';
        ctx.fillRect(0,0,WIDTH,HEIGHT);
        //回主页
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function (sender) {
            // !! this.options.toBackStartPage && this.options.toBackStartPage();
            !!this.options.onClickSessionInfo && this.options.onClickSessionInfo(sender);
        }.bind(this);
        //恭喜获奖
        this._drawImageCenter('res/img/battle/gongxihuojiang.png', this._cxx(217+317/2), this._cyy(268+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#ffc600';
        ctx.strokeStyle = '#ffc600';
        this._hemiCircleAndRect(this._cxx(235),this._cyy(378),this._s(280),this._s(37),this._s(37/2),'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('超过'+passNum+'%的用户',this._cxx(282+187/2),this._cyy(384+26/2));
        this._drawImageCenter('res/img/battle/chenggong.png', this._cxx(148+440/2), this._cyy(414+30+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        let text = '成功跳到'+score+'分，本次用时'+min+'\''+sec+'"';
        ctx.fillText(text,this._cxx(127+496/2),this._cyy(701+30+26/2));
        //炫耀
        const helpBtn = new Button(this.canvas['btn']);
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(818)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/xuanyao.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            !! this.options.onClickShareWin4Competition && this.options.onClickShareWin4Competition(sender);
        }.bind(this);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        if (opt.shareContent){
            ctx.fillText(opt.shareContent,this._cxx(89+571/2),this._cyy(998+26/2));
        }
        ctx.font = this._cf(13);
        ctx.fillText('比赛结束后奖金自动到账',this._cxx(210+330/2),this._cyy(1228+26/2));
    },
    //画恭喜获奖页面
    _drawCongratulation:function(opt){
        let rank = opt.ranking;//排名
        let cash = opt.itemCount;//红包金额
        let isLastChampionship = opt.isLastChampionship;
        let ctx = this.context['bg'];
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272),this._s(650),this._s(724),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(272),this._s(650),this._s(700),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(270),this._s(650),this._s(77.1),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/gongxihuojiang.png', this._cxx(217+317/2), this._cyy(217+94/2), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let originY = 380;
        this._drawImageCenter('res/img/battle/chenggong.png', this._cxx(148+440/2), this._cyy(originY+260/2), this._s(440), this._s(260), 'bg', null, this.imgid['bg']);
        ctx.fillStyle = 'rgb(254,188,10)';
        ctx.font = this._cf(20);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        let cashStr = '￥'+cash;
        ctx.fillText(cashStr,this._cxx(375),this._cyy(682+26/2));
        let index = cashStr.indexOf('.');
        let len;
        if (index>=0){
            len = (cashStr.length-1)*24+5;
        }else{
            len = cashStr.length*24;
        }
        ctx.fillStyle = '#4e4e4e';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(17);
        ctx.fillText('恭喜获得',this._cxx(375-len/2-136/2),this._cyy(684+26/2));
        ctx.fillText('现金红包',this._cxx(375+len/2+136/2),this._cyy(684+26/2));

        //炫耀
        const helpBtn = new Button(this.canvas['btn']);
        helpBtn.origin = {x:this._cxx(180),y:this._cyy(758)};
        helpBtn.size = {width:this._s(390),height:this._s(130)};
        helpBtn.image = 'res/img/battle/xuanyao.png';
        helpBtn.show();
        helpBtn.onClick = function (sender) {
            !! this.options.onClickCongratulationShare && this.options.onClickCongratulationShare(sender);
        }.bind(this);
        if (isLastChampionship){
            //查看详情
            const stepBtn = new Button(this.canvas['btn']);
            stepBtn.origin = {x:this._cxx(310), y:this._cyy(900)};
            stepBtn.size = {width:this._s(145),height:this._s(30)};
            stepBtn.show();
            stepBtn.onClick = function (sender) {
                !! this.options.onClickCongratulationDetail && this.options.onClickCongratulationDetail(sender);
            }.bind(this);
            ctx.fillStyle = '#4e4e4e';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = this._cf(13);
            ctx.fillText('查看详情 >',this._cxx(311+129/2),this._cyy(906+26/2));
        }
        //关闭按钮
        const closeBtn = new Button(this.canvas['btn']);
        closeBtn.origin = {x:this._cxx(335),y:this._cyy(1027)};
        closeBtn.size = {width:this._s(80),height:this._s(80)};
        closeBtn.image = 'res/img/close 2.png';
        closeBtn.show();
        closeBtn.onClick = function () {
            !! this.options.onClickCongratulationClose && this.options.onClickCongratulationClose();
        }.bind(this);
    },

    //画网络错误页面
    _drawNetError:function(){
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(474),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(454),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('网络连接失败',this._cxx(375),this._cyy(508+48/2));
        //重试
        const nextBtn = new Button(this.canvas['btn']);
        nextBtn.origin = {x:this._cxx(385),y:this._cyy(645)};
        nextBtn.size = {width:this._s(270),height:this._s(104)};
        nextBtn.image = 'res/img/second/chongshi.png';
        nextBtn.show();
        nextBtn.onClick = function () {
            !! this.options.onClickTryAgain4Net && this.options.onClickTryAgain4Net();
        }.bind(this);
        //退出
        const exitBtn = new Button(this.canvas['btn']);
        exitBtn.origin = {x:this._cxx(95),y:this._cyy(645)};
        exitBtn.size = {width:this._s(270),height:this._s(104)};
        exitBtn.image = 'res/img/second/tuichu.png';
        exitBtn.show();
        exitBtn.onClick = function () {
            !! this.options.onClickExitGame4Net && this.options.onClickExitGame4Net();
        }.bind(this);
    },

    //画下次再战页面
    _drawNextFight:function(){
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(474),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(385),this._s(650),this._s(454),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.font = this._cf(17);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText('很遗憾，比赛时间到了',this._cxx(201+348/2),this._cyy(519+26/2));
        const nextBtn = new Button(this.canvas['btn']);
        nextBtn.origin = {x:this._cxx(240),y:this._cyy(625)};
        nextBtn.size = {width:this._s(270),height:this._s(104)};
        nextBtn.image = 'res/img/battle/xiacizaizhan.png';
        nextBtn.show();
        nextBtn.onClick = function () {
            !! this.options.onClickNextFight4Competition && this.options.onClickNextFight4Competition();
        }.bind(this);
    },

    //游戏结束页面
    _drawOverAgain:function(opt){
        console.log('Rank_drawOverAgain');
        let currentScore = opt.currentScore || 0;
        let historyScore = opt.historyScore || 0;
        currentScore = currentScore<0 ? 0 : currentScore;
        historyScore = historyScore<0 ? 0 : historyScore;

        let ctx = this.context['bg'];
        ctx.clearRect(0,0,WIDTH,HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        const that = this;

        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/battle/home.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);

        const onceMoreBtn = new Button(this.canvas['btn']);//再来一次按钮
        onceMoreBtn.origin = {x:this._cxx(108),y:this._cyy(947)};
        onceMoreBtn.size = {width:this._s(390),height:this._s(130)};
        onceMoreBtn.image = 'res/img/second/another_game.png';
        onceMoreBtn.show();
        onceMoreBtn.onClick = function () {
            !! this.options.onClickReplay && this.options.onClickReplay();
        }.bind(this);

        const shareBtn = new Button(this.canvas['btn']);
        shareBtn.origin = {x:this._cxx(528),y:this._cyy(947)};
        shareBtn.size = {width:this._s(114),height:this._s(126)};
        shareBtn.image = 'res/img/second/xiang.png';
        shareBtn.show();
        shareBtn.onClick = function (sender) {
            !! this.options.onClickShare4Lecard && this.options.onClickShare4Lecard(sender);
        }.bind(this);

        //分享成功提醒
        ctx.font = this._cf(13);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        let hintStr = opt.hintStr || '';
        ctx.fillText(hintStr,this._cxx(375),that._cyy(1115+26/2));
        let bottomScore = historyScore;
        if (currentScore > historyScore){
            bottomScore = currentScore;
        }
        ctx.fillText('历史最高分：'+bottomScore,this._cxx(375),that._cyy(1245+26/2));

        // 新纪录，展示另外的界面
        let sysInfo;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else{
            sysInfo = {SDKVersion:'0'};
        }

        if (currentScore > historyScore && currentScore != 0){
            //区分版本展示超越好友状态
            if (sysInfo.SDKVersion >= '1.9.92'){
                //高版本新纪录结束页
                let openDataContext = this.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = WIDTH;
                sharedCanvas.height = HEIGHT;
                this.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    type:'overNewRecord',
                    key: Config.openJumperScore,
                    me: {
                        newScore:currentScore,
                        overY:[598,679],
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }else{
                //低版本新纪录结束页
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.strokeStyle =  'rgba(78,78,78,0.6)';
                this._roundedRectR(this._cxx(50),this._cyy(374),this._s(650),this._s(463.8),10*Dpr,'bg');//black background
                ctx.fill();
                this._drawImageCenter('res/img/second/jilu.png', this._cxx(375), this._cyy(400), this._s(485), this._s(196), 'bg', null, this.imgid['bg']);
                let score = currentScore.toString();
                let perWidth = 64;
                let perInnerWidth = 6;
                let lengthSum = score.length * perWidth + perInnerWidth*(score.length - 1);
                for(let i = 0 ;i < score.length;i++){
                    this._drawImageCenter(Config.ScoreOver[score[i]], this._cxx(375-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(595), this._s(perWidth), this._s(100), 'bg', null, this.imgid['bg']);
                }
                //画线
                ctx.strokeStyle = '#979797';
                ctx.lineWidth = 1 * Dpr;
                ctx.beginPath();
                ctx.moveTo(this._cxx(50), this._cyy(745));
                ctx.lineTo(this._cxx(700), this._cyy(745));
                ctx.stroke();
                ctx.closePath();
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = this._cf(13);
                ctx.fillText('查看全部排行榜 >',this._cxx(375),this._cyy(776+13));
            }
        }else{
            // 未超过新纪录
            ctx.font = this._cf(15);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('本局得分', this._cxx(375), that._cyy(233+26/2));
            let score = currentScore.toString();
            let perWidth = 64;
            let perInnerWidth = 6;
            let lengthSum = score.length * perWidth + perInnerWidth*(score.length - 1);
            for(let i = 0 ;i < score.length;i++){
                this._drawImageCenter(Config.ScoreOver[score[i]], this._cxx(375-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(311+100/2), this._s(perWidth), this._s(100), 'bg', null, this.imgid['bg']);
            }
            if (sysInfo.SDKVersion >= '1.9.92'){
                let openDataContext = this.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = WIDTH;
                sharedCanvas.height = HEIGHT;
                this.openDisplay(sharedCanvas);
                openDataContext.postMessage({
                    //TODO 应为 overNormal
                    type:'overNormal',
                    // type:'overNewRecord',
                    key: Config.openJumperScore,
                    me: {
                        // newScore:currentScore,//TODO 去掉
                        threeListY:[534,598,661,715,498,746,790],
                        // overY:[598,679],//TODO 去掉
                        openId:UserService.openId.toString(),
                        nickname:UserService.nickName,
                        avatar:UserService.avatarUrl
                    }
                });
            }else{
                //低版本
                // ctx.fillStyle = 'rgba(78,78,78,0.9)';
                // ctx.strokeStyle = 'rgba(78,78,78,0.9)';
                // this._roundedRectR(this._cxx(50),this._cyy(779),this._s(650),this._s(340),10*Dpr,'bg');
                // ctx.fill();
                // ctx.textBaseline = 'middle';
                // ctx.textAlign = 'center';
                // ctx.fillStyle = '#FFFFFF';
                // ctx.font = this._cf(15);
                // ctx.fillText('查看全部排行榜 >',this._cxx(375),that._cyy(810+26/2));
            }
        }
        //排行榜空button
        const rankBtn = new Button(this.canvas['btn']);//排行榜部分点击按钮
        rankBtn.origin = {x:this._cxx(50),y:this._cyy(750)};
        rankBtn.size = {width:this._s(650),height:this._s(90)};
        rankBtn.show();
        rankBtn.onClick = function () {
            !! this.options.onRankInnerFirst && this.options.onRankInnerFirst();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawStart: function () {
        //绘制首页
        console.log('Rank _drawStart');
        SignUtil.showNewAuthorizedButtonIfNeed();
        this._drawHomePage();
    },

    //画首页
    _drawHomePage:function(){
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        this._drawImageCenter('res/img/wolecaifangkuai.png', this._cxx(375), this._cyy(218), this._s(500), this._s(116), 'bg', null, this.imgid['bg']);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx2 = this.context['nine'];
        ctx2.clearRect(0, 0, WIDTH, HEIGHT);
        const that = this;

        //无尽模式按钮
        const startBtn = new Button(that.canvas['btn']);
        startBtn.center = {x:that._cxx(375),y:that._cyy(407)};
        startBtn.size = {width:that._s(390),height:that._s(130)};
        startBtn.image = 'res/img/battle/start.png';
        startBtn.show();
        startBtn.onClick = function (sender) {
            !!this.options.onClickStartFirst && this.options.onClickStartFirst(sender);
        }.bind(this);

        //参赛赢钱按钮
        const joinBtn = new Button(that.canvas['btn']);
        joinBtn.center = {x:that._cxx(375),y:that._cyy(577)};
        joinBtn.size = {width:that._s(390),height:that._s(130)};
        joinBtn.image = 'res/img/battle/fight_against.png';
        joinBtn.onDisplay(function(){
            if(this.canvasType == CANVASTYPE['start']){
                this._drawImageCenter('res/img/second/bonus4.png', this._cxx(200), this._cyy(531), this._s(100), this._s(100), 'btn', null, this.imgid['btn']);
                this._updatePlane('btn');
            }
        }.bind(this));
        joinBtn.show();
        joinBtn.onClick = function (sender) {
            !!that.options.onClickSessionInfo && that.options.onClickSessionInfo(sender);
        };

        let sysInfo ;
        if (window.WechatGame){
            sysInfo = wx.getSystemInfoSync();
        }else{
            sysInfo = {SDKVersion:'0'};
        }
        if (sysInfo.SDKVersion >= '1.9.92'){

            //天天抽红包按钮
            const pickBtn = new Button(that.canvas['btn']);
            pickBtn.origin = {x:that._cxx(82),y:that._cyy(1118)};
            pickBtn.size = {width:that._s(120),height:that._s(160)};
            pickBtn.image = 'res/img/battle/red_easy.png';
            pickBtn.show();
            pickBtn.onClick = function (sender) {
                !! that.options.onShowPickFirst && that.options.onShowPickFirst(sender);
            }.bind(this);

            //皮肤中心按钮
            const skinBtn = new Button(that.canvas['btn']);
            skinBtn.origin = {x:that._cxx(235),y:that._cyy(1118)};
            skinBtn.size = {width:that._s(120),height:that._s(160)};
            skinBtn.image = 'res/img/battle/skin.png';
            skinBtn.show();
            skinBtn.onClick = function (sender) {
                // 点击首页的皮肤按钮
                !! that.options.onClickSkinFirst && that.options.onClickSkinFirst(sender);
            }.bind(this);

            //提现按钮
            const realBtn = new Button(that.canvas['btn']);
            realBtn.origin = {x:that._cxx(392),y:that._cyy(1118)};
            realBtn.size = {width:that._s(120),height:that._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = this.context['btn'];
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
                !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
            }.bind(this);

            //更多游戏按钮
            const moreGame = new Button(that.canvas['btn']);
            moreGame.origin = {x:that._cxx(548),y:that._cyy(1118)};
            moreGame.size = {width:that._s(120),height:that._s(160)};
            moreGame.image = 'res/img/second/gengduoyouxi.png';
            moreGame.show();
            moreGame.onClick = function (sender) {
                // 点击首页的更多游戏按钮
                !!this.options.onClickMoreGame && this.options.onClickMoreGame(sender);
            }.bind(this);

            //排行榜空按钮
            const rankBtn = new Button(that.canvas['btn']);
            rankBtn.origin = {x:that._cxx(50),y:that._cyy(974)};
            rankBtn.size = {width:that._s(600),height:that._s(90)};
            rankBtn.show();
            rankBtn.onClick = function (sender) {
                // 点击首页的排行榜按钮
                !!that.options.onRankInnerFirst && that.options.onRankInnerFirst(sender);
            }.bind(this);

            if (UserService.openId){
                let openDataContext = this.openDataContext();//开放域
                let sharedCanvas = openDataContext.canvas;
                sharedCanvas.width = WIDTH;
                sharedCanvas.height = HEIGHT;
                this.openDisplay(sharedCanvas);
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
            const rankBtn = new Button(that.canvas['btn']);
            rankBtn.origin = {x:that._cxx(40),y:that._cyy(1118)};
            rankBtn.size = {width:that._s(120),height:that._s(160)};
            rankBtn.image = 'res/img/battle/ranking_iist.png';
            rankBtn.show();
            rankBtn.onClick = function (sender) {
                // 点击首页的排行榜按钮
                !!that.options.onRankInnerFirst && that.options.onRankInnerFirst(sender);
            }.bind(this);

            //天天抽红包按钮
            const pickBtn = new Button(that.canvas['btn']);
            pickBtn.origin = {x:that._cxx(177.5),y:that._cyy(1118)};
            pickBtn.size = {width:that._s(120),height:that._s(160)};
            pickBtn.image = 'res/img/battle/red_easy.png';
            pickBtn.show();
            pickBtn.onClick = function (sender) {
                !! that.options.onShowPickFirst && that.options.onShowPickFirst(sender);
            }.bind(this);

            //皮肤中心按钮
            const skinBtn = new Button(that.canvas['btn']);
            skinBtn.origin = {x:that._cxx(315),y:that._cyy(1118)};
            skinBtn.size = {width:that._s(120),height:that._s(160)};
            skinBtn.image = 'res/img/battle/skin.png';
            skinBtn.show();
            skinBtn.onClick = function (sender) {
                // 点击首页的皮肤按钮
                !! that.options.onClickSkinFirst && that.options.onClickSkinFirst(sender);
            }.bind(this);

            //提现按钮
            const realBtn = new Button(that.canvas['btn']);
            realBtn.origin = {x:that._cxx(452.5),y:that._cyy(1118)};
            realBtn.size = {width:that._s(120),height:that._s(160)};
            realBtn.image = 'res/img/battle/tixiannew.png';
            realBtn.tag = 'realBtn';
            realBtn.onDisplay(function(){
                let ctx = this.context['btn'];
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
                !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
            }.bind(this);

            //更多游戏按钮
            const moreGame = new Button(that.canvas['btn']);
            moreGame.origin = {x:that._cxx(590),y:that._cyy(1118)};
            moreGame.size = {width:that._s(120),height:that._s(160)};
            moreGame.image = 'res/img/second/gengduoyouxi.png';
            moreGame.show();
            moreGame.onClick = function (sender) {
                // 点击首页的更多游戏按钮
                !!this.options.onClickMoreGame && this.options.onClickMoreGame(sender);
            }.bind(this);
        }
        this._updatePlane('bg');
    },

    updateRealBtn:function(){
        //提现按钮刷新
        if(this.canvasType == CANVASTYPE['start']){
            let sysInfo;
            if (window.WechatGame){
                sysInfo = wx.getSystemInfoSync();
            } else{
                sysInfo = {SDKVersion:'0'};
            }
            if (sysInfo.SDKVersion >= '1.9.92'){
                let ctx = this.context['btn'];
                ctx.clearRect(this._cxx(392),this._cyy(1118),this._s(120),this._s(160));
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(this._cxx(392),this._cyy(1118),this._s(120),this._s(160));
                const realOldBtn = Button.buttonWithTag(this.canvas['btn'],'realBtn');
                if (realOldBtn){
                    realOldBtn.destroy();
                }
                const realBtn = new Button(this.canvas['btn']);
                realBtn.origin = {x:this._cxx(392),y:this._cyy(1118)};
                realBtn.size = {width:this._s(120),height:this._s(160)};
                realBtn.image = 'res/img/battle/tixiannew.png';
                realBtn.tag = 'realBtn';
                realBtn.onDisplay(function(){
                    let ctx = this.context['btn'];
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
                    !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
                }.bind(this);
            }else{
                let ctx = this.context['btn'];
                ctx.clearRect(this._cxx(452.5),this._cyy(1118),this._s(120),this._s(160));
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(this._cxx(452.5),this._cyy(1118),this._s(120),this._s(160));
                const realOldBtn = Button.buttonWithTag(this.canvas['btn'],'realBtn');
                if (realOldBtn){
                    realOldBtn.destroy();
                }
                const realBtn = new Button(this.canvas['btn']);
                realBtn.origin = {x:this._cxx(452.5),y:this._cyy(1118)};
                realBtn.size = {width:this._s(120),height:this._s(160)};
                realBtn.image = 'res/img/battle/tixiannew.png';
                realBtn.tag = 'realBtn';
                realBtn.onDisplay(function(){
                    let ctx = this.context['btn'];
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
                    !!this.options.onClickTiXian && this.options.onClickTiXian(sender);
                }.bind(this);
            }
            this._updatePlane('btn');
        }
        let that = this;
        if(this.realBtnUpdate){
            UserService.off(kUserServiceDidUpdate,that.realBtnUpdate);
            this.realBtnUpdate = undefined;
        }
    },

    _drawPop5:function (opt) {
        // 绘制中奖结果，五个奖项的
        const index5 = opt.index;
        console.log('Rank _drawPop5');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#3D3D3D';
        ctx.strokeStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(771),10 * Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(750),10  * Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#3D3D3D';
        ctx.strokeStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(77.1),10  * Dpr,'bg');
        ctx.fill();
        ctx.font = this._cf(15);
        ctx.fillStyle = '#3D3D3D';

        let nine = this.nine;
        let hasShowSkin = false;
        const pos4Image = [{x:180,y:460},{x:375,y:460},{x:580,y:460},{x:275,y:683},{x:475,y:683}];
        const pos4Text = [{x:180,y:571},{x:375,y:571},{x:580,y:571},{x:275,y:794},{x:475,y:794}];
        for (let i=0;i<5;++i){
            if (hasShowSkin){
                if (nine[index5[i]].type==3){
                    nine[index5[i]].text = '乐卡x4';
                    nine[index5[i]].imgLuck = 'res/img/prize_card.png';
                    nine[index5[i]].img = 'res/img/card_big_luck.png';
                }
            }
            this._drawImageCenter(nine[index5[i]].imgLuck, this._cxx(pos4Image[i].x), this._cyy(pos4Image[i].y), this._s(160), this._s(160), 'bg', null, this.imgid['bg']);
            ctx.textAlign = 'center';
            if(nine[index5[i]].type !== 0){
                ctx.fillText(nine[index5[i]].text,this._cxx(pos4Text[i].x),this._cyy(pos4Text[i].y));
            }
            if (nine[index5[i]].type==3){
                hasShowSkin = true;
            }
        }
        ctx.textAlign = 'center';
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        this._drawImageCenter('res/img/congratulations.png', this._cxx(375), this._cyy(266), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);

        const yesBtn = new Button(this.canvas['btn']);//确定按钮
        yesBtn.center = {x:this._cxx(375),y:this._cyy(910)};
        yesBtn.size = {width:this._s(270),height:this._s(104)};
        yesBtn.image = 'res/img/determine.png';
        yesBtn.show();
        yesBtn.onClick = function () {
            !!this.options.onShowPick &&this.options.onShowPick();
        }.bind(this);

        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.onShowPick &&this.options.onShowPick();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawPop1:function (opt) {
        //抽奖，抽一次的结果页
        const index = opt.index;
        // 绘制背景图
        console.log('Rank _drawPop1');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(771),10 * Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(750),10  * Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#3D3D3D';
        this._roundedRectR(this._cxx(50),this._cyy(262),this._s(650),this._s(77.1),10  * Dpr,'bg');
        ctx.fill();
        const nine = this.nine;
        ctx.font = this._cf(20);
        if(nine[index].type !== 0){
            this._drawImageCenter(nine[index].imgLuck, this._cxx(375), this._cyy(542), this._s(160), this._s(160), 'bg', null, this.imgid['bg']);
            ctx.textAlign = 'center';
            ctx.fillText(nine[index].text,this._cxx(375),this._cyy(680));
        }else{
            this._drawImageCenter(nine[index].imgLuck, this._cxx(375), this._cyy(542), this._s(200), this._s(200), 'bg', null, this.imgid['bg']);
        }
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0,0,WIDTH,HEIGHT);
        this._drawImageCenter('res/img/congratulations.png', this._cxx(375), this._cyy(266), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        const yesBtn = new Button(this.canvas['btn']);//确定按钮
        yesBtn.center = {x:this._cxx(375),y:this._cyy(840)};
        yesBtn.size = {width:this._s(270),height:this._s(104)};
        yesBtn.image = 'res/img/determine.png';
        yesBtn.show();
        yesBtn.onClick = function () {
            !!this.options.onShowPick &&this.options.onShowPick();
        }.bind(this);
        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.onShowPick &&this.options.onShowPick();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawSkinBg:function(){
        //已解锁皮肤界面的背景
        //cancle start button top
        console.log('Rank _drawSkinBg');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(724.1),10*Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(277),this._s(650),this._s(700),10*Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(77.1),10*Dpr,'bg');
        ctx.fill();
        this._drawImageCenter('res/img/skin_center.png', this._cxx(375), this._cyy(274), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawSkinDone:function(opt){
        // 绘制刚解锁皮肤的界面，选中的是默认的红色皮肤
        //cancle start button top
        console.log('Rank _drawSkinDone');
        let ctx = this.context['bg'];
        ctx.clearRect(this._cxx(92), this._cyy(460),this. _s(570), this._s(370));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(92), this._cyy(460),this._s(570),this. _s(370));
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        const oldSkinBtn = new Button(this.canvas['btn']);//原始皮肤点击区域
        oldSkinBtn.origin = {x:this._cxx(95),y:this._cyy(470)};
        oldSkinBtn.size = {width:this._s(260),height:this._s(350)};
        oldSkinBtn.show();
        oldSkinBtn.onClick = function () {
            UserService.switchDefaultSkin(0);
            this._drawSkinDone();//界面置成原皮肤样式
        }.bind(this);
        const newSkinBtn = new Button(this.canvas['btn']);//新皮肤点击区域
        newSkinBtn.origin = {x:this._cxx(395),y:this._cyy(470)};
        newSkinBtn.size = {width:this._s(260),height:this._s(350)};
        newSkinBtn.show();
        newSkinBtn.onClick = function () {
            //点击皮肤中心中新皮肤的区域
            UserService.switchDefaultSkin(1);
            this._drawSkinDoneYellow();//界面置成新皮肤样式
        }.bind(this);
        ctx.strokeStyle = '#D4D4D4';
        ctx.lineWidth = 2;
        this._roundedRectR(this._cxx(395),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg',null, this.imgid['bg']);
        //横线
        ctx.strokeStyle = '#D8D8D8';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(111), this._cyy(738));
        ctx.lineTo(this._cxx(339), this._cyy(738));
        ctx.moveTo(this._cxx(411), this._cyy(738));
        ctx.lineTo(this._cxx(639), this._cyy(738));
        ctx.stroke();
        ctx.closePath();
        this._drawImageCenter('res/img/choice.png', this._cxx(222), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/noChoice.png', this._cxx(525), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._updatePlane('bg');
    },

    _drawSkinDoneYellow:function(opt){
        // 绘制解锁的新黄色皮肤
        console.log('Rank _drawSkinDoneYellow');
        let ctx = this.context['bg'];
        ctx.clearRect(this._cxx(92), this._cyy(460), this._s(570), this._s(370));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(92), this._cyy(460),this._s(570), this._s(370));
        ctx.strokeStyle = '#D4D4D4';
        ctx.lineWidth = 2;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(395),this._cyy(470),this._s(260),this._s(350),0, 'bg');

        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg',null, this.imgid['bg']);
        const oldSkinBtn = new Button(this.canvas['btn']);//原始皮肤点击区域
        oldSkinBtn.origin = {x:this._cxx(95),y:this._cyy(470)};
        oldSkinBtn.size = {width:this._s(260),height:this._s(350)};
        oldSkinBtn.show();
        oldSkinBtn.onClick = function () {
            UserService.switchDefaultSkin(0);
            this._drawSkinDone();//界面置成原皮肤样式
        }.bind(this);
        const newSkinBtn = new Button(this.canvas['btn']);//新皮肤点击区域
        newSkinBtn.origin = {x:this._cxx(395),y:this._cyy(470)};
        newSkinBtn.size = {width:this._s(260),height:this._s(350)};
        newSkinBtn.show();
        newSkinBtn.onClick = function () {
            //点击皮肤中心中新皮肤的区域
            UserService.switchDefaultSkin(1);
            this._drawSkinDoneYellow();//界面置成新皮肤样式
        }.bind(this);
        //横线
        ctx.strokeStyle = '#D8D8D8';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(111), this._cyy(738));
        ctx.lineTo(this._cxx(339), this._cyy(738));
        ctx.moveTo(this._cxx(411), this._cyy(738));
        ctx.lineTo(this._cxx(639), this._cyy(738));
        ctx.stroke();
        ctx.closePath();
        this._drawImageCenter('res/img/choice.png', this._cxx(525), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/noChoice.png', this._cxx(222), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        this._updatePlane('bg');
    },

    _drawSkin:function(opt){
        // 皮肤界面，待解锁部分
        //cancle start button top
        console.log('Rank _drawSkin');
        opt = opt || {};
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(724.1),10*Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(277),this._s(650),this._s(700),10*Dpr,'bg');
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(272.9),this._s(650),this._s(77.1),10*Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle = '#FFC600';
        ctx.lineWidth = 6;
        this._roundedRectR(this._cxx(95),this._cyy(470),this._s(260),this._s(350),0, 'bg');
        this._drawImageCenter('res/img/skin_center.png', this._cxx(375), this._cyy(274), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_1.png', this._cxx(220), this._cyy(618), this._s(260), this._s(260), 'bg', null, this.imgid['bg']);
        this._drawImageCenter('res/img/hu_2.png', this._cxx(526), this._cyy(618), this._s(260), this._s(260), 'bg', function () {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(this._cxx(395), this._cyy(472),this._s(260), this._s(350));
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(17);
            ctx.fillText('待解锁', this._cxx(528), this._cyy(780));
        }.bind(this), this.imgid['bg']);
        //横线
        ctx.strokeStyle = '#D8D8D8';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(111), this._cyy(738));
        ctx.lineTo(this._cxx(339), this._cyy(738));
        ctx.moveTo(this._cxx(411), this._cyy(738));
        ctx.lineTo(this._cxx(639), this._cyy(738));
        ctx.stroke();
        ctx.closePath();
        this._drawImageCenter('res/img/choice.png', this._cxx(222), this._cyy(776), this._s(54), this._s(40), 'bg', null, this.imgid['bg']);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);

        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawPickBg:function(freeNum,timesToGetRedPocket,shareText){
        // 绘制天天抽界面的背景图，不包含九宫格内的奖项
        console.log('Rank _drawEverydayPick');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle =  '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle =  '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');
        ctx.fill();
        ctx.strokeStyle =  '#4e4e4e';
        ctx.fillStyle = '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');
        ctx.fill();
        this._drawImageCenter('res/img/envelopes.png', this._cxx(375), this._cyy(158), this._s(396), this._s(94), 'bg', null, this.imgid['bg']);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#FFFCCC';
        if(freeNum > 0){
            const pickOnceBtn = new Button(this.canvas['btn']);
            pickOnceBtn.center = {x:this._cxx(223),y:this._cyy(1000)};
            pickOnceBtn.size = {width:this._s(270),height:this._s(104)};
            pickOnceBtn.image = 'res/img/luck_draw1.png';
            pickOnceBtn.onDisplay(function(){
                let ctx = this.context['btn'];
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
                console.log('pickOnce');
                !!this.options.pickCtrl && this.options.pickCtrl(sender);
            }.bind(this);
        }else{
            const pickOnceBtn = new Button(this.canvas['btn']);
            pickOnceBtn.center = {x:this._cxx(223),y:this._cyy(1000)};
            pickOnceBtn.size = {width:this._s(270),height:this._s(104)};
            pickOnceBtn.image = 'res/img/luck_draw1.png';
            pickOnceBtn.onDisplay(function(){
                console.log('开始画ondisplay');
                let ctx = this.context['btn'];
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
                console.log('pickOnce');
                !!this.options.pickCtrl && this.options.pickCtrl(sender);
            }.bind(this);
        }
        const pickFiveBtn = new Button(this.canvas['btn']); //抽五次按钮
        pickFiveBtn.center = {x:this._cxx(525),y:this._cyy(1000)};
        pickFiveBtn.size = {width:this._s(270),height:this._s(104)};
        pickFiveBtn.image = 'res/img/luck_draw5.png';
        pickFiveBtn.onDisplay(function(){
            let ctx = this.context['btn'];
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
            if(UserService.leCard < 25){
                sender.disable();
                !!this.options.showRankToast && this.options.showRankToast('乐卡不足，快去玩游戏吧~',function () {
                    sender.enable();
                });
            }else{
                !!this.options.pickFiveTimes && this.options.pickFiveTimes(sender);
            }
        }.bind(this);
        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            ///返回的时候清理缓存的图片
            this._cacheImage = {};
            !!this.options.toBackStartPage && this.options.toBackStartPage();
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
        const shareBtn = new Button(this.canvas['btn']);//立即分享按钮
        shareBtn.center = {x:this._cxx(580),y:this._cyy(908)};
        shareBtn.size = {width:this._s(130),height:this._s(30)};
        shareBtn.show();
        shareBtn.onClick = function () {
            !!this.options.clickRedPacketsShare && this.options.clickRedPacketsShare();
        }.bind(this);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(13);
        let leCardNum =  UserService.leCard;
        ctx.fillText('我的乐卡：'+leCardNum, this._cxx(590), this._cyy(1244));
        this._updatePlane('bg');
    },

    _drawPick:function(opt){
        // 绘制抽奖转盘的九宫格
        console.log('Rank _drawPick');
        let ctx2 = this.context['bg'];
        ctx2.clearRect(this._cxx(94),this._cyy(304),this._s(562),this._s(562));
        let ctx = this.context['nine'];
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
    },

    _drawLuckyUser:function(opt){
        //画广播效果
        // console.log('Rank_drawLucky');
        let ctx = this.context['bg'];
        ctx.clearRect(this._cxx(95),this._cyy(210),this._s(580),this._s(60));
        ctx.fillStyle = '#4E4E4E';
        ctx.fillRect(this._cxx(95),this._cyy(205),this._s(580),this._s(68));
        const info = opt.info;
        if(info){
            let ctx = this.context['bg'];
            ctx.clearRect(this._cxx(0),this._cyy(205),WIDTH,this._s(55));
            ctx.fillStyle = 'rgba(0,0,0, 0.50)';
            ctx.fillRect(this._cxx(0),this._cyy(205),WIDTH,this._s(55));
            ctx.fillStyle = '#4E4E4E';
            ctx.fillRect(this._cxx(50),this._cyy(204),this._s(650),this._s(57));
            ctx.rect(this._cxx(55),this._cyy(204),this._s(640),this._s(57));
            //计算长度，画中奖效果背景
            let textLength = 0;
            let item,fontSize;
            for(let i = 0; i < info.length;i++){
                item = info[i].c;
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
            this._roundedRectR(this._cxx(opt.x)-this._cxx(22),this._cyy(206),this._s(textLength+44),this._s(48),15*Dpr,'bg');
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
                let fontSize1 = 1;
                ctx.font = this._cf(13);
                fontSize1 = 13;
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
        // ctx.restore();
        this._updatePlane('bg');
    },

    rotateTurnTable:function(callback){
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
    },

    //仿照原_drawList写的
    _drawMyList:function(offset,type){
        if (this.canvasType!=CANVASTYPE['rankGlobal'] && this.canvasType!=CANVASTYPE['prizeRankLast'] && this.canvasType!=CANVASTYPE['prizeRankMoney'] && this.canvasType!=CANVASTYPE['awardList']){
            return;
        }
        const _this = this;

        if (type == 'list1') {
            // 两个list互不干扰，只在一个list显示时候++
            this.imgid['list1']++;
        } else if (type == 'list2') {
            this.imgid['list2']++;
        }

        let limit = 10;
        let list = this.sotedRankList.slice(offset, offset + limit);

        // 绘制列表 从 m 开始到 n 结束的列表
        let ctx = this.context[type];
        ctx.clearRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight));

        ctx.fillStyle = 'rgba(255,255,255,1.0)';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight)); //list 底色为白色

        if (offset != 0 && list.length == 0) {
            // 最后面列表结束显示白色屏幕就可以，不显示
            this._updatePlane(type);
            return;
        }
        if (offset < 0) {
            // 这种情况下不要更新列表
            return;
        }

        let len = list.length;

        var _loop = function _loop(i) {
            // 写一个大的数字
            let y = (i + 0.5) * _this._cwh(ListLineHeight); // 每一行中间的y值
            ctx.textAlign = 'center';

            //获取数据
            const obj = list[i];
            const rank = obj.rank;
            let nickName = obj.nickname;
            nickName = unescape(nickName);
            if(nickName.length > 8){
                nickName = nickName.substr(0,8) + '...';
            }
            const avatarUrl = obj.avatarUrl;
            let value = obj.value;

            n = i + 1 + offset;

            let x = _this._cxx(128);
            let perWidth = 20;
            let perHeight = 24;
            let perInnerWidth = 0;
            let item = rank.toString();
            let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
            if (rank < 4){
                ctx.fillStyle = '#FFC600';
                ctx.textAlign = 'center';
                ctx.font = '32px Arial';
                // ctx.fillText(rank, x, y);
                for(let i = 0 ;i < item.length;i++){
                    _this._drawImageCenter(Config.rankNumYellow[item[i]], _this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                }
                ctx.textAlign = 'right';
                if (_this.canvasType == CANVASTYPE['prizeRankMoney']){
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '.' ){
                            _this._drawImageCenter(Config.rankNumYellow[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            j += j + 1;
                            ctx.fillText('.', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y);
                        }
                    }
                    let i = item.length-1;
                    let textX = 750-89-perWidth/2-i*perWidth - perInnerWidth*i - perWidth/2 - perInnerWidth - 10 + j *10;
                    ctx.fillText('¥', _this._cxx(textX), y);
                    j = 0;
                }else if (_this.canvasType==CANVASTYPE['prizeRankLast'] || _this.canvasType==CANVASTYPE['awardList']){
                    value = _this.number2MinSec(value);
                    // ctx.fillText(value, WIDTH - _this._cxx(89), y);
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '"' && item[i] != '\''){
                            _this._drawImageCenter(Config.rankNumYellow[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            if(item[i] == '"'){
                                ctx.fillText('"', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), y);
                            }else{
                                j += j + 1;
                                ctx.fillText('\'', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), y);
                            }
                        }
                    }
                    j = 0;
                }else{
                    let item = value.toString().split('').reverse().join('');
                    for(let i = 0;i < item.length;i++){
                        _this._drawImageCenter(Config.rankNumYellow[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                    }
                }
            }else if(rank > 3 && rank < 7){
                ctx.fillStyle = 'rgba(78,78,78,0.6)';
                ctx.textAlign = 'center';
                ctx.font = '32px Arial';
                // ctx.fillText(rank, x, y);
                for(let i = 0 ;i < item.length;i++){
                    _this._drawImageCenter(Config.rankNumGrey[item[i]-4], _this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                }
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4e4e4e';
                if (_this.canvasType == CANVASTYPE['prizeRankMoney']){
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '.' ){
                            _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            j += j + 1;
                            ctx.fillText('.', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y);
                        }
                    }
                    let i = item.length-1;
                    let textX = 750-89-perWidth/2-i*perWidth - perInnerWidth*i - perWidth/2 - perInnerWidth - 10 + j *10;
                    ctx.fillText('¥', _this._cxx(textX), y);
                    j = 0;
                }else if (_this.canvasType==CANVASTYPE['prizeRankLast'] || _this.canvasType==CANVASTYPE['awardList']){
                    value = _this.number2MinSec(value);
                    // ctx.fillText(value, WIDTH - _this._cxx(89), y);
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '"' && item[i] != '\''){
                            _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            if(item[i] == '"'){
                                ctx.fillText('"', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), y);
                            }else{
                                j += j + 1;
                                ctx.fillText('\'', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), y);
                            }
                        }
                    }
                    j = 0;
                }else{
                    let item = value.toString().split('').reverse().join('');
                    for(let i = 0;i < item.length;i++){
                        _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                    }
                }
            }else{
                ctx.fillStyle = '#4e4e4e';
                ctx.textAlign = 'center';
                ctx.font = '32px Arial';
                // ctx.fillText(rank, x, y);
                for(let i = 0 ;i < item.length;i++){
                    _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                }
                ctx.textAlign = 'right';
                if (_this.canvasType == CANVASTYPE['prizeRankMoney']){
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '.' ){
                            _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            j += j + 1;
                            ctx.fillText('.', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), y);
                        }
                    }
                    let i = item.length-1;
                    let textX = 750-89-perWidth/2-i*perWidth - perInnerWidth*i - perWidth/2 - perInnerWidth - 10 + j *10;
                    ctx.fillText('¥', _this._cxx(textX), y);
                    j = 0;
                }else if (_this.canvasType==CANVASTYPE['prizeRankLast'] || _this.canvasType==CANVASTYPE['awardList']){
                    value = _this.number2MinSec(value);
                    // ctx.fillText(value, WIDTH - _this._cxx(89), y);
                    // ctx.fillText(value, WIDTH - _this._cxx(89), y);
                    let item = value.toString().split('').reverse().join('');
                    let j = 0;
                    for(let i = 0;i < item.length;i++){
                        if(item[i] != '"' && item[i] != '\''){
                            _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                        }else{
                            if(item[i] == '"'){
                                ctx.fillText('"', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), y);
                            }else{
                                j += j + 1;
                                ctx.fillText('\'', _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), y);
                            }
                        }
                    }
                    j = 0;
                }else{
                    let item = value.toString().split('').reverse().join('');
                    for(let i = 0;i < item.length;i++){
                        _this._drawImageCenter(Config.rankNumBlack[item[i]], _this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i), y, _this._s(perWidth), _this._s(perHeight), type, null, _this.imgid[type]);
                    }
                }
            }

            _this._drawImageCircle(avatarUrl, _this._cxx(215), y, _this._s(60), _this._s(60), type, null, _this.imgid[type],false,'res/img/ava.png');

            // 写名字
            ctx.fillStyle = '#4E4E4E';
            ctx.font = '26px Arial';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(nickName, _this._cxx(264), y);

        };

        for (let i = 0; i < len; i++) {
            var n;

            if(_this.canvasType == CANVASTYPE['prizeRankLast']||_this.canvasType == CANVASTYPE['prizeRankMoney']||_this.canvasType == CANVASTYPE['rankGlobal']||_this.canvasType == CANVASTYPE['rankLeCard']||_this.canvasType == CANVASTYPE['awardList']){
                _loop(i);
            }

        }

        if (len == 0) {
            // 没有任何数据
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(14);
            ctx.fillText('暂无排行数据', this._cxx(375), this._cyy(350));
        }
        if (this.canvasType!=CANVASTYPE['rankGlobal'] && this.canvasType!=CANVASTYPE['prizeRankLast'] && this.canvasType!=CANVASTYPE['prizeRankMoney']  && this.canvasType!=CANVASTYPE['awardList']){
            return;
        }
        this._updatePlane(type);
    },

    _drawRecordList:function(offset,type){
        //获奖记录列表内容
        if(this.canvasType!=CANVASTYPE['prizeRecord']){
            return;
        }
        const _this = this;
        if (type == 'list1') {
            // 两个list互不干扰，只在一个list显示时候++
            this.imgid['list1']++;
        } else if (type == 'list2') {
            this.imgid['list2']++;
        }

        let limit = 7;
        let list = this.sotedRankList.slice(offset, offset + limit);

        // let lineH = ListLineHeight;
        let lineH = ListLineHeight4PrizeRecord;
        // 绘制列表 从 m 开始到 n 结束的列表
        let ctx = this.context[type];
        ctx.clearRect(0, 0, WIDTH, limit * lineH);
        ctx.fillStyle = 'rgba(255,255,255,1.0)';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0, 0, WIDTH, limit * this._cwh(lineH)); //list 底色为白色

        if (offset != 0 && list.length == 0) {
            // 最后面列表结束显示白色屏幕就可以，不显示
            this._updatePlane(type);
            return;
        }
        if (offset < 0) {
            // 这种情况下不要更新列表
            return;
        }

        let len = list.length;

        var _loop = function _loop(i) {
            // 写一个大的数字
            let y = (i + 0.5) * _this._cwh(lineH); // 每一行中间的y值
            let bottomY = (i + 1) * _this._cwh(lineH)-1;
            ctx.textAlign = 'center';

            //获取数据
            const obj = list[i];
            const timestamp = obj.time;
            const time = _this.formatDateTime(timestamp,3);
            let prize = window.BroadcastConfigs[obj.prize].ZH_CN || '奖金0';
            const title = window.BroadcastConfigs[obj.title].ZH_CN || '';
            const awardType = obj.awardType;
            const itemId = obj.itemId;
            const itemCount = obj.itemCount;
            if (prize>=10000){
                prize = prize/10000 + '万';
            }

            n = i + 1 + offset;

            let x = _this._cxx(94);

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4E4E4E';
            ctx.font = _this._cf(15);
            ctx.fillText(time+ '场 '+prize, x,y-_this._s(15));
            ctx.fillText(title, x, y + _this._s(15));
            ctx.fillStyle = '#ffc600';
            ctx.font = _this._cf(15);
            ctx.textAlign = 'right';
            if(awardType == 1 && itemId == 2){
                ctx.fillText('¥'+itemCount, WIDTH -_this._cxx(110), y);
            }else{
                //其他奖项类型待写
                ctx.fillText('其他奖项', WIDTH -_this._cxx(110), y);
            }
            ctx.strokeStyle = 'rgba(78,78,78,0.6)';
            ctx.lineWidth = 1 * Dpr;
            ctx.beginPath();
            ctx.moveTo(_this._cxx(93), bottomY);
            ctx.lineTo(_this._cxx(653), bottomY);
            ctx.stroke();
            ctx.closePath();
        };

        for (let i = 0; i < len; i++) {
            var n;

            _loop(i);
        }

        if (len == 0) {
            // 没有任何数据
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ccc';
            ctx.font = this._cf(14);
            ctx.fillText('暂无排行数据', this._cx(207), this._cy(429));
        }
        if(this.canvasType!=CANVASTYPE['prizeRecord']){
            return;
        }
        this._updatePlane(type);
    },

    //画水平列表
    _drawHorizontalList:function(offset,type){
        //获奖记录列表内容
        if(this.canvasType!=CANVASTYPE['testHorizontalList']){
            return;
        }
        const _this = this;
        if (type == 'list3') {
            // 两个list互不干扰，只在一个list显示时候++
            this.imgid['list3']++;
        } else if (type == 'list4') {
            this.imgid['list4']++;
        }

        let limit = 7;
        let list = this.sotedRankList.slice(offset, offset + limit);

        let lineH = ListColumnWidth;
        // 绘制列表 从 m 开始到 n 结束的列表
        let ctx = this.context[type];
        ctx.clearRect(0, 0, limit * this._cwh(lineH), HEIGHT);
        ctx.fillStyle = 'rgba(255,255,255,1.0)';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0, 0, limit * this._cwh(lineH),HEIGHT); //list 底色为白色

        if (offset != 0 && list.length == 0) {
            // 最后面列表结束显示白色屏幕就可以，不显示
            this._updatePlane(type);
            return;
        }
        if (offset < 0) {
            // 这种情况下不要更新列表
            return;
        }

        let len = list.length;

        var _loop = function _loop(i) {
            // 写一个大的数字
            let x = (i + 0.5) * _this._cwh(lineH); // 每一行中间的x值
            ctx.textAlign = 'center';
            
            n = i + 1 + offset;

            let y = _this._cyy(200);

            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            ctx.font = _this._cf(15);
            ctx.fillText('第'+n+'项', x,y);
        };

        for (let i = 0; i < len; i++) {
            var n;
            _loop(i);
        }

        if (len == 0) {
            // 没有任何数据
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ccc';
            ctx.font = this._cf(14);
            ctx.fillText('暂无排行数据', this._cx(207), this._cy(429));
        }
        if(this.canvasType!=CANVASTYPE['testHorizontalList']){
            return;
        }
        this._updatePlane(type);
    },

    // _drawRank:function(result){
    //     // 绘制排行榜背景图
    //     console.log('Rank _drawRank');
    //     var ctx = this.context['bg'];
    //     ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //     ctx.fillStyle = 'rgba(0,0,0, 0.50)';
    //     ctx.fillRect(0, 0, WIDTH, HEIGHT);
    //     ctx.fillStyle = '#4e4e4e';
    //     ctx.strokeStyle =  '#4e4e4e';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');//black background
    //     ctx.fill();
    //     ctx.fillStyle = '#FFFFFF';
    //     ctx.strokeStyle =  '#FFFFFF';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');//white background
    //     ctx.fill();
    //     ctx.fillStyle = '#4e4e4e';
    //     ctx.strokeStyle =  '#4e4e4e';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
    //     ctx.fill();
    //     this._drawImageCenter('res/img/ranking_list.png', this._cxx(375), this._cyy(159), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
    //     var ctx1 = this.context['btn'];
    //     ctx1.clearRect(0, 0, WIDTH, HEIGHT);
    //     var that = this;
    //    // this._drawImageCenter('res/img/back.png', that._cxx(90), that._cyy(1244), that._cxx(80), that._cyy(80), 'btn', null, this.imgid['btn']);
    //     const rankList = result.rankList;
    //     const myRank = this.unInRankChange(result.myRank);
    //     const myValue = this.unInRankChange(result.myValue);
    //
    //     if( this.canvasType == CANVASTYPE['rankGlobal']) {
    //         /**全球榜画布
    //          */
    //         ctx.textBaseline = 'middle';
    //         ctx.textAlign = 'center';
    //         ctx.fillStyle = '#FFC600';
    //         ctx.font = that._cf(15);
    //         ctx.fillText('全球榜', this._cxx(250), this._cyy(243));
    //         ctx.fillStyle = '#FFC600';
    //         ctx.fillRect(this._cxx(205), this._cyy(269), this._s(90), this._s(5));
    //         ctx.fillStyle = '#FFFFFF';
    //         ctx.fillText('好友榜', this._cxx(375), this._cyy(243));
    //         ctx.fillText('乐卡', this._cxx(480), this._cyy(243));
    //         ctx.fillStyle = 'rgba(78,78,78,0.6)';
    //         ctx.textAlign = 'left';
    //         ctx.textAlign = 'center';
    //         var that = this;
    //         //滑动列表
    //         this.renderRankList(rankList);
    //
    //         ctx.strokeStyle = 'rgba(78,78,78,0.6)';
    //         ctx.lineWidth = 1 * Dpr;
    //         ctx.beginPath();
    //         ctx.moveTo(that._cxx(93), that._cyy(985));
    //         ctx.lineTo(that._cxx(653), that._cyy(985));
    //         ctx.stroke();
    //         ctx.closePath();
    //         ctx.font = '34px Arial'
    //         ctx.fillStyle = 'rgba(78,78,78,1)';
    //         ctx.textAlign = 'left';
    //         ctx.fillText(myRank, that._cxx(94), that._cyy(1066));
    //         ctx.textAlign = 'right';
    //         ctx.fillText(myValue,  WIDTH - that._cxx(89), that._cyy(1066));
    //         that._drawImageCircle(UserService.avatarUrl, that._cxx(181), that._cyy(1066), that._s(60), that._s(60), 'bg', null, that.imgid['bg']);
    //         ctx.font = '26px Arial'
    //         ctx.fillStyle = '#4E4E4E';
    //         ctx.textAlign = 'left';
    //         var userName = UserService.nickName;
    //         if(userName.length > 8){
    //             userName = userName.substr(0,8)+'...';
    //         }
    //         ctx.fillText(userName, that._cxx(244), that._cyy(1066));
    //
    //         const leCardBtn = new Button(this.canvas['btn']);//乐卡榜按钮
    //         leCardBtn.origin = {x:this._cxx(430),y:this._cyy(210)};
    //         leCardBtn.size = {width:this._s(100),height:this._s(60)};
    //         leCardBtn.show();
    //         leCardBtn.onClick = function () {
    //             !!this.options.onRankLeCard && this.options.onRankLeCard();
    //         }.bind(this);
    //
    //         const innerBtn = new Button(this.canvas['btn']);//好友榜按钮
    //         innerBtn.origin = {x:this._cxx(325),y:this._cyy(210)};
    //         innerBtn.size = {width:this._s(100),height:this._s(60)};
    //         innerBtn.show();
    //         innerBtn.onClick = function () {
    //             !!this.options.onRankInner && this.options.onRankInner();
    //         }.bind(this);
    //
    //     }else if(this.canvasType == CANVASTYPE['rankLeCard']){
    //         /**
    //          * 乐卡榜画布
    //          */
    //         ctx.textBaseline = 'middle';
    //         ctx.textAlign = 'center';
    //         ctx.fillStyle = '#FFFFFF';
    //         ctx.font = this._cf(15);
    //         ctx.fillText('全球榜', this._cxx(250), this._cyy(243));
    //         ctx.fillStyle = '#FFFFFF';
    //         ctx.fillText('好友榜', this._cxx(375), this._cyy(243));
    //         ctx.fillStyle = '#FFC600';
    //         ctx.fillRect(this._cxx(435), this._cyy(269), this._s(90), this._s(5));
    //         ctx.fillText('乐卡', this._cxx(480), this._cyy(243));
    //         ctx.fillStyle = 'rgba(78,78,78,0.6)';
    //         ctx.textAlign = 'center';
    //
    //         //滑动列表
    //         this.renderRankList(rankList);
    //
    //         ctx.strokeStyle = 'rgba(78,78,78,0.6)';
    //         ctx.lineWidth = 1 * Dpr;
    //         ctx.beginPath();
    //         ctx.moveTo(that._cxx(93), that._cyy(985));
    //         ctx.lineTo(that._cxx(653), that._cyy(985));
    //         ctx.stroke();
    //         ctx.closePath();
    //         ctx.font = that._cf(17);
    //         ctx.fillStyle = 'rgba(78,78,78,1)';
    //         ctx.textAlign = 'left';
    //         ctx.fillText(myRank, that._cxx(94), that._cyy(1066));
    //         ctx.textAlign = 'right';
    //         ctx.fillText(myValue,  WIDTH - that._cxx(89), that._cyy(1066));
    //         that._drawImageCircle(UserService.avatarUrl, that._cxx(181), that._cyy(1066), that._s(60), that._s(60), 'bg', null, that.imgid['bg']);
    //         ctx.font = that._cf(15);
    //         ctx.fillStyle = '#4E4E4E';
    //         ctx.textAlign = 'left';
    //         var userName = UserService.nickName;
    //         if(userName.length > 8){
    //             userName = userName.substr(0,8)+'...';
    //         }
    //         ctx.fillText(userName, that._cxx(244), that._cyy(1066));
    //
    //         const globalBtn = new Button(this.canvas['btn']);//全球榜按钮
    //         globalBtn.origin = {x:this._cxx(210),y:this._cyy(210)};
    //         globalBtn.size = {width:this._s(100),height:this._s(60)};
    //         globalBtn.show();
    //         globalBtn.onClick = function () {
    //             !!this.options.onRankGlobal && this.options.onRankGlobal();
    //         }.bind(this);
    //
    //         const innerBtn = new Button(this.canvas['btn']);//好友榜按钮
    //         innerBtn.origin = {x:this._cxx(325),y:this._cyy(210)};
    //         innerBtn.size = {width:this._s(100),height:this._s(60)};
    //         innerBtn.show();
    //         innerBtn.onClick = function () {
    //             !!this.options.onRankInner && this.options.onRankInner();
    //         }.bind(this);
    //
    //     }
    //
    //     const backBtn = new Button(this.canvas['btn']);//返回按钮
    //     backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
    //     backBtn.size = {width:this._s(80),height:this._s(80)};
    //     backBtn.image = 'res/img/back.png';
    //     backBtn.show();
    //     backBtn.onClick = function () {
    //         !!this.options.toBackStartPage && this.options.toBackStartPage();
    //     }.bind(this);
    //     this._updatePlane('bg');
    // },

    _drawRankInnerOld:function(){
        /**
         * 旧版本好友榜画布
         */
        console.log('Rank _drawRankInnerOld');
        let ctx = this.context['bg'];

        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
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
            !!this.options.onRankGlobal && this.options.onRankGlobal();
        }.bind(this);

        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawRankGlobal:function(result){
        // 绘制排行榜背景图
        console.log('Rank _drawRankGlobal');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/ranking_list.png', this._cxx(375), this._cyy(159), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);

        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);
        const that = this;
        const rankList = result.rankList;
        const myRank = this.rankChangeUnIn(result.myRank);
        const myValue = this.unInRankChange(result.myValue);

        /**全球榜画布
         */
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFC600';
        ctx.font = that._cf(15);
        ctx.fillText('全球榜', this._cxx(305), this._cyy(243));
        ctx.fillStyle = '#FFC600';
        ctx.fillRect(this._cxx(260), this._cyy(269), this._s(90), this._s(5));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('好友榜', this._cxx(445), this._cyy(243));
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.textAlign = 'left';
        ctx.textAlign = 'center';
        //滑动列表
        this.renderRankList(rankList);

        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(that._cxx(93), that._cyy(985));
        ctx.lineTo(that._cxx(653), that._cyy(985));
        ctx.stroke();
        ctx.closePath();
        if(myRank == '未上榜'){
            ctx.font = '23px Arial';
            ctx.fillStyle = 'rgba(78,78,78,1)';
            ctx.textAlign = 'center';
            ctx.fillText(myRank, that._cxx(128), that._cyy(1066));
        }else{
            let item = myRank.toString();
            let perWidth = 20;
            let perHeight = 24;
            let perInnerWidth = 1;
            let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
            for(let i = 0 ;i < item.length;i++){
                this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(1066), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
            }
        }
        if(myValue.toString() == '-'){
            ctx.font = '32px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(myValue,  WIDTH - that._cxx(89), that._cyy(1066));
        }else{
            let item = myValue.toString().split('').reverse().join('');
            let perWidth = 20;
            let perHeight = 24;
            let perInnerWidth = 1;
            for(let i = 0;i < item.length;i++){
                this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i), this._cyy(1066), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
            }
        }
        that._drawImageCircle(UserService.avatarUrl, that._cxx(215), that._cyy(1066), that._s(60), that._s(60), 'bg', null, that.imgid['bg']);
        ctx.font = '26px Arial';
        ctx.fillStyle = '#4E4E4E';
        ctx.textAlign = 'left';
        let userName = UserService.nickName;
        if(userName.length > 8){
            userName = userName.substr(0,8)+'...';
        }
        ctx.fillText(userName, that._cxx(264), that._cyy(1066));

        const innerBtn = new Button(this.canvas['btn']);//好友榜按钮
        innerBtn.origin = {x:this._cxx(400),y:this._cyy(210)};
        innerBtn.size = {width:this._s(120),height:this._s(60)};
        innerBtn.show();
        innerBtn.onClick = function () {
            !!this.options.onRankInner && this.options.onRankInner();
        }.bind(this);
        this._updatePlane('bg');
    },

    _drawRankInner:function(){
        /**
         * 高版本好友榜画布,局部
         */
        console.log('Rank _drawRankInner');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
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
        const globalBtn = new Button(this.canvas['btn']);//全球榜按钮
        globalBtn.origin = {x:this._cxx(260),y:this._cyy(210)};
        globalBtn.size = {width:this._s(120),height:this._s(60)};
        globalBtn.show();
        globalBtn.onClick = function () {
            !!this.options.onRankGlobal && this.options.onRankGlobal();
            let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
            openDataContext.postMessage({
                type:'openOff',
                key: 'openOff',
            });
        }.bind(this);


        const backBtn = new Button(this.canvas['btn']);//返回按钮
        backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
        backBtn.size = {width:this._s(80),height:this._s(80)};
        backBtn.image = 'res/img/back.png';
        backBtn.show();
        backBtn.onClick = function () {
            !!this.options.toBackStartPage && this.options.toBackStartPage();
            let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
            openDataContext.postMessage({
                type:'openOff',
                key: 'openOff',
            });
        }.bind(this);
        this._updatePlane('bg');
    },

    // _drawRankInner:function(){
    //     /**
    //      * 高版本好友榜画布,new
    //      */
    //     console.log('Rank _drawRankInner');
    //     var ctx = this.context['bg'];
    //     ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //     ctx.fillStyle = 'rgba(0,0,0, 0.50)';
    //     ctx.fillRect(0, 0, WIDTH, HEIGHT);
    //     ctx.fillStyle = '#4e4e4e';
    //     ctx.strokeStyle =  '#4e4e4e';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1023),10*Dpr,'bg');//black background
    //     ctx.fill();
    //     ctx.fillStyle = '#FFFFFF';
    //     ctx.strokeStyle =  '#FFFFFF';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(1003),10*Dpr,'bg');//white background
    //     ctx.fill();
    //     ctx.fillStyle = '#4e4e4e';
    //     ctx.strokeStyle =  '#4e4e4e';
    //     this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
    //     ctx.fill();
    //     this._drawImageCenter('res/img/ranking_list.png', this._cxx(375), this._cyy(159), this._s(309), this._s(94), 'bg', null, this.imgid['bg']);
    //     var ctx1 = this.context['btn'];
    //     ctx1.clearRect(0, 0, WIDTH, HEIGHT);
    //     ctx.textBaseline = 'middle';
    //     ctx.textAlign = 'center';
    //     ctx.fillStyle = '#FFFFFF';
    //     ctx.font = this._cf(15);
    //     ctx.fillText('全球榜', this._cxx(250), this._cyy(243));
    //     ctx.fillText('乐卡', this._cxx(480), this._cyy(243));
    //     ctx.fillStyle = '#FFFFFF';
    //     ctx.fillStyle = '#FFC600';
    //     ctx.fillRect(this._cxx(330), this._cyy(269), this._s(90), this._s(5));
    //     ctx.fillText('好友榜', this._cxx(375), this._cyy(243));
    //     ctx.fillStyle = '#4E4E4E';
    //     ctx.textAlign = 'center';
    //     const globalBtn = new Button(this.canvas['btn']);//全球榜按钮
    //     globalBtn.origin = {x:this._cxx(210),y:this._cyy(210)};
    //     globalBtn.size = {width:this._s(100),height:this._s(60)};
    //     globalBtn.show();
    //     globalBtn.onClick = function () {
    //         !!this.options.onRankGlobal && this.options.onRankGlobal();
    //         let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
    //         openDataContext.postMessage({
    //             type:'openOff',
    //             key: 'openOff',
    //         });
    //     }.bind(this);
    //
    //     const leCardBtn = new Button(this.canvas['btn']);//乐卡榜按钮
    //     leCardBtn.origin = {x:this._cxx(430),y:this._cyy(210)};
    //     leCardBtn.size = {width:this._s(100),height:this._s(60)};
    //     leCardBtn.show();
    //     leCardBtn.onClick = function () {
    //         !!this.options.onRankLeCard && this.options.onRankLeCard();
    //         let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
    //         openDataContext.postMessage({
    //             type:'openOff',
    //             key: 'openOff',
    //         });
    //     }.bind(this);
    //
    //     const backBtn = new Button(this.canvas['btn']);//返回按钮
    //     backBtn.center = {x:this._cxx(90),y:this._cyy(1244)};
    //     backBtn.size = {width:this._s(80),height:this._s(80)};
    //     backBtn.image = 'res/img/back.png';
    //     backBtn.show();
    //     backBtn.onClick = function () {
    //         !!this.options.toBackStartPage && this.options.toBackStartPage();
    //         let openDataContext = wx.getOpenDataContext();//关掉开放域点击事件
    //         openDataContext.postMessage({
    //             type:'openOff',
    //             key: 'openOff',
    //         });
    //     }.bind(this);
    //     this._updatePlane('bg');
    // },

    //画水平列表页
    _drawHorizontalListPage:function(opt){
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        const rankList = opt.rankList;
        this.renderRankList(rankList);
        this._updatePlane('bg');
    },

    /**
     *  参赛模式界面
     */
    _drawPrizeRecord:function(opt){
        //获奖记录
        console.log('Rank _drawPrizeRecord');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1120),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1095),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(97.1),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiang.png', this._cxx(375), this._cyy(155), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            !!this.options.onClickSessionInfo && this.options.onClickSessionInfo();
        }.bind(this);
        const xuanYaoBtn = new Button(this.canvas['btn']);//主页按钮
        xuanYaoBtn.origin = {x:this._cxx(240),y:this._cyy(455)};
        xuanYaoBtn.size = {width:this._s(270),height:this._s(104)};
        xuanYaoBtn.image = 'res/img/battle/xuanyaoyixiaxiao.png';
        xuanYaoBtn.show();
        xuanYaoBtn.onClick = function () {
            //点击事件
            !! this.options.onClickCongratulationShare && this.options.onClickCongratulationShare();
        }.bind(this);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.font = this._cf(15);
        ctx.fillText('获奖金额', this._cxx(375), this._cyy(305));
        ctx.font = this._cf(30,true);
        ctx.fillStyle = '#FFC600';
        ctx.textBaseline = 'middle';
        //总奖金数 totalBonus
        let totalBonus = opt.totalBonus.toString() || '0';
        if (totalBonus<0){
            totalBonus = '0';
        }
        // ctx.fillText('¥'+totalBonus, this._cxx(375), this._cyy(389));

        // totalBonus = '123.79'
        let bonusLength = 50+totalBonus.length*50;
        ctx.fillText('¥', this._cxx(375-bonusLength/2+25), this._cyy(389));
        for(let i = 0;i<totalBonus.length;i++){
            if(totalBonus[i] != '.'){
                let w4Num = totalBonus[i]==1 ? 25 : 50;
                this._drawImageCenter(Config.SquareNumBigYellow[totalBonus[i]],this._cxx(375-bonusLength/2 + 50 + 25 + i*50),this._cyy(389),this._s(w4Num),this._s(54),'bg',null,this.imgid['bg']);
            }else{
                ctx.fillText('.', this._cxx(375-bonusLength/2 + 50 + 25 + i*50), this._cyy(389));
            }
        }

        ctx.font = this._cf(15);
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.fillText('参赛次数', this._cxx(180), this._cyy(621));
        ctx.fillText('获奖次数', this._cxx(375), this._cyy(621));
        ctx.fillText('最佳排名', this._cxx(570), this._cyy(621));
        ctx.font = this._cf(25);
        ctx.fillStyle = '#4E4E4E';
        ctx.font = this._cf(25,true);
        const totalCount = opt.totalCount.toString()||'0';//参赛次数
        const winCount = opt.winCount.toString()||'0';//获奖次数
        let bestRanking = opt.bestRanking >0 ? opt.bestRanking.toString() : '-';//最佳排名
        // ctx.fillText(totalCount, this._cxx(180), this._cyy(691));
        // ctx.fillText(winCount, this._cxx(375), this._cyy(691));
        // ctx.fillText(bestRanking, this._cxx(570), this._cyy(691));
        for(let i = 0;i < totalCount.length;i++ ){
            let w4Num = totalCount[i]==1 ? 14 : 24;
            this._drawImageCenter(Config.SquareNumSmallBlack[totalCount[i]],this._cxx(180-totalCount.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
        }
        for(let i = 0;i < winCount.length;i++ ){
            let w4Num = winCount[i]==1 ? 14 : 24;
            this._drawImageCenter(Config.SquareNumSmallBlack[winCount[i]],this._cxx(375-winCount.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
        }
        if(bestRanking == '-'){
            ctx.fillText(bestRanking, this._cxx(570), this._cyy(691));
        }else{
            for(let i = 0;i < bestRanking.length;i++ ){
                let w4Num = bestRanking[i]==1 ? 14 : 24;
                this._drawImageCenter(Config.SquareNumSmallBlack[bestRanking[i]],this._cxx(570-bestRanking.length*24/2+13 +i*24),this._cyy(691),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
            }
        }
        ctx.strokeStyle = 'rgba(78,78,78,0.6)';
        ctx.lineWidth = 1 * Dpr;
        ctx.beginPath();
        ctx.moveTo(this._cxx(93), this._cyy(763));
        ctx.lineTo(this._cxx(653), this._cyy(763));
        ctx.stroke();
        ctx.closePath();

        const historyList = opt.historyList;
        if(historyList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            ctx.font = this._cf(15);
            ctx.fillText('暂无获奖记录', this._cxx(375), this._cyy(955));
            ctx.fillText('快去参加比赛赚红包吧~', this._cxx(375), this._cyy(1003));
        }else{
            this.renderRankList(historyList);
        }
        this._updatePlane('bg');
    },

    _drawPrizeRankLast:function(opt){
        //获奖榜单，上期排行榜
        console.log('Rank _drawPrizeRankLast');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1120),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1095),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiangbangdan.png', this._cxx(375), this._cyy(156), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            !!this.options.onClickSessionInfo && this.options.onClickSessionInfo();
        }.bind(this);

        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFC600';
        ctx.font = this._cf(15);
        ctx.fillText('上期排行榜', this._cxx(230), this._cyy(228));
        ctx.fillRect(this._cxx(230),this._cyy(269),this._s(150),this._s(5));
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('奖金榜', WIDTH - this._cxx(230), this._cyy(228));

        const MoneyBtn = new Button(this.canvas['btn']);//主页按钮
        MoneyBtn.origin = {x:this._cxx(390),y:this._cyy(215)};
        MoneyBtn.size = {width:this._s(150),height:this._s(80)};
        MoneyBtn.show();
        MoneyBtn.onClick = function () {
            //点击事件
            !!this.options.onClickPrizeRankMoney && this.options.onClickPrizeRankMoney();
        }.bind(this);

        if(opt.rankList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(15);
            ctx.fillText('比赛马上开始，敬请期待！', this._cxx(375), this._cyy(667));
        }else{
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.textAlign = 'center';
            ctx.fillText('上期奖金', this._cxx(230), this._cyy(334));
            ctx.fillText('获奖人数', this._cxx(521), this._cyy(334));
            let lastMoney = opt.totalBonus.toString();
            let lastPeople = opt.totalWinner.toString();

            if(parseInt(lastMoney) >= 10000){
                lastMoney = (parseInt(lastMoney)/10000).toString();//单位换成万
                if(lastMoney.length > 5){
                    lastMoney = lastMoney.substr(0,5);//太长就取前5位
                }
                let lastMoneyLength = lastMoney.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoneyLength/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoneyLength/2 + 12 +i*24), this._cyy(418));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(230-lastMoneyLength/2 + lastMoneyLength +10), this._cyy(418));
            }else{
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoney.length*24/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoney.length*24/2 + 12 +i*24), this._cyy(418));
                    }
                }
            }
            if(parseInt(lastPeople) >= 10000){
                lastPeople = (parseInt(lastPeople)/10000).toString();//单位换成万
                if(lastPeople.length > 5){
                    lastPeople = lastPeople.substr(0,5);//太长就取前5位
                }
                let lastPeopleLength = lastPeople.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeopleLength/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeopleLength/2 + 12 +i*24), this._cyy(418));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(521-lastPeopleLength/2 + lastPeopleLength +10), this._cyy(418));
            }else{
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeople.length*24/2 + 12 +i*24),this._cyy(418),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeople.length*24/2 + 12 +i*24), this._cyy(418));
                    }
                }
            }
            //分割线
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1 * Dpr;
            ctx.beginPath();
            ctx.moveTo(this._cxx(93), this._cyy(492));
            ctx.lineTo(this._cxx(653), this._cyy(492));
            ctx.moveTo(this._cxx(93), this._cyy(1085));
            ctx.lineTo(this._cxx(653), this._cyy(1085));
            ctx.stroke();
            ctx.closePath();
            let myRank = opt.myRank.toString();
            let myValue = '-';
            if (opt.myValue >= 0){
                myValue = this.number2MinSec(opt.myValue);
            }
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            if(myRank == '-1'){
                myRank = '未上榜';
                ctx.font = '23px Arial';
                ctx.fillText(myRank, this._cxx(128), this._cyy(1166));
            }else{
                let item = myRank.toString();
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
                for(let i = 0 ;i < item.length;i++){
                    this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                }
            }
            ctx.textAlign = 'left';
            this._drawImageCircle(UserService.avatarUrl, this._cxx(215), this._cyy(1166), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            ctx.font = '26px Arial';
            let userName = UserService.nickName;
            if(userName.length > 8){
                userName = userName.substr(0,8)+'...';
            }
            ctx.fillText(userName, this._cxx(264), this._cyy(1166));
            ctx.textAlign = 'right';
            ctx.font = this._cf(17,true);
            // ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1166));
            if(myValue == '-'){
                ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1166));
            }else{
                let item = myValue.toString().split('').reverse().join('');
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let j = 0;
                for(let i = 0;i < item.length;i++){
                    if(item[i] != '"' && item[i] != '\''){
                        this._drawImageCenter(Config.rankNumYellow[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                    }else{
                        if(item[i] == '"'){
                            ctx.fillText('"', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), this._cyy(1166));
                        }else{
                            j += j + 1;
                            ctx.fillText('\'', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), this._cyy(1166));
                        }
                    }
                }
                j = 0;
            }

            this.renderRankList(opt.rankList);
        }
        this._updatePlane('bg');
    },

    _drawPrizeRankMoney:function(opt){
        //获奖记录,奖金榜
        console.log('Rank _drawPrizeRankLast');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1120),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1095),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(120),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiangbangdan.png', this._cxx(375), this._cyy(156), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            !!this.options.onClickSessionInfo && this.options.onClickSessionInfo();
        }.bind(this);
        const LastBtn = new Button(this.canvas['btn']);//上期排行榜按钮
        LastBtn.origin = {x:this._cxx(230),y:this._cyy(215)};
        LastBtn.size = {width:this._s(150),height:this._s(80)};
        LastBtn.show();
        LastBtn.onClick = function () {
            //点击事件
            !!this.options.onClickPrizeRankLast && this.options.onClickPrizeRankLast();
        }.bind(this);
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this._cf(15);
        ctx.fillText('上期排行榜', this._cxx(230), this._cyy(228));

        ctx.fillStyle = '#ffc600';
        ctx.textAlign = 'right';
        ctx.fillText('奖金榜', WIDTH - this._cxx(230), this._cyy(228));
        ctx.fillRect(this._cxx(429),this._cyy(269),this._s(90),this._s(5));
        if(opt.rankList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(15);
            ctx.fillText('比赛马上开始，敬请期待！', this._cxx(375), this._cyy(667));
        }else{
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1 * Dpr;
            ctx.beginPath();
            ctx.moveTo(this._cxx(93), this._cyy(1085));
            ctx.lineTo(this._cxx(653), this._cyy(1085));
            ctx.stroke();
            ctx.closePath();

            let myRank = opt.myRank.toString();
            let myValue = this.unInRankChange(opt.myValue);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#4E4E4E';
            if(myRank == '-1'){
                myRank = '未上榜';
                ctx.font = '23px Arial';
                ctx.fillText(myRank, this._cxx(128), this._cyy(1166));
            }else{
                let item = myRank.toString();
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
                for(let i = 0 ;i < item.length;i++){
                    this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                }
            }
            this._drawImageCircle(UserService.avatarUrl, this._cxx(215), this._cyy(1166), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            ctx.font = '26px Arial';
            let userName = UserService.nickName;
            if(userName.length > 8){
                userName = userName.substr(0,8)+'...';
            }
            ctx.textAlign = 'left';
            ctx.fillText(userName, this._cxx(264), this._cyy(1166));
            ctx.textAlign = 'right';
            ctx.font = '32px Arial';
            if(myValue == '-'){
                ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1166));
            }else{
                let item = myValue.toString().split('').reverse().join('');
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let j = 0;
                for(let i = 0;i < item.length;i++){
                    if(item[i] != '.' ){
                        this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), this._cyy(1166), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                    }else{
                        j += j + 1;
                        ctx.fillText('.', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j * 10), this._cyy(1166));
                    }
                }
                let i = item.length-1;
                let textX = 750-89-perWidth/2-i*perWidth - perInnerWidth*i - perWidth/2 - perInnerWidth - 10 + j *10;
                ctx.fillText('¥', this._cxx(textX), this._cyy(1166));
                j = 0;
            }
            this.renderRankList(opt.rankList);
        }
        this._updatePlane('bg');
    },

    //上期排行榜详情
    _drawLastAwardlist:function(opt){
        console.log('Rank _drawLastAwardlist');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(1003),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#FFFFFF';
        this._roundedRectR(this._cxx(50),this._cyy(155),this._s(650),this._s(983),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(154),this._s(650),this._s(77),10*Dpr,'bg');//black_title background
        ctx.fill();
        this._drawImageCenter('res/img/battle/huojiangbangdan.png', this._cxx(375), this._cyy(156), this._s(317), this._s(94), 'bg', null, this.imgid['bg']);
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/back.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            // !!this.options.toBackStartPage && this.options.toBackStartPage();
            !!this.options.onClickCongratulationDetailBack && this.options.onClickCongratulationDetailBack();
        }.bind(this);

        if(opt.rankList.length == 0){
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = this._cf(15);
            ctx.fillText('比赛马上开始，敬请期待！', this._cxx(375), this._cyy(667));
        }else{
            //有记录
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = this._cf(15);
            ctx.fillText('上期奖金', this._cxx(170+120/2), this._cyy(283+30/2));
            ctx.fillText('获奖人数', this._cxx(461+120/2), this._cyy(283+30/2));

            let lastMoney = opt.totalBonus.toString();
            let lastPeople = opt.totalWinner.toString();
            if(parseInt(lastMoney) >= 10000){
                lastMoney = (parseInt(lastMoney)/10000).toString();//单位换成万
                if(lastMoney.length > 5){
                    lastMoney = lastMoney.substr(0,5);//太长就取前5位
                }
                let lastMoneyLength = lastMoney.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                // ctx.fillText(lastMoney, this._cxx(230-lastMoneyLength/2 + lastMoney.length*50/2), this._cyy(418));
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoneyLength/2 + 12 +i*24),this._cyy(348+26/2),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoneyLength/2 + 12 +i*24), this._cyy(348+26/2));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(230-lastMoneyLength/2 + lastMoneyLength +10), this._cyy(348+26/2));
            }else{
                for(let i = 0;i < lastMoney.length;i++){
                    if(lastMoney[i] !== '.'){
                        let w4Num = lastMoney[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastMoney[i]],this._cxx(230-lastMoney.length*24/2 + 12 +i*24),this._cyy(348+26/2),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastMoney[i], this._cxx(230-lastMoney.length*24/2 + 12 +i*24), this._cyy(348+26/2));
                    }
                }
            }
            if(parseInt(lastPeople) >= 10000){
                lastPeople = (parseInt(lastPeople)/10000).toString();//单位换成万
                if(lastPeople.length > 5){
                    lastPeople = lastPeople.substr(0,5);//太长就取前5位
                }
                let lastPeopleLength = lastPeople.length *24 + 30;
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFC600';
                ctx.font = this._cf(25);
                // ctx.fillText(lastPeople, this._cxx(521-lastPeopleLength/2 + lastPeople.length*50/2), this._cyy(418));
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeopleLength/2 + 12 +i*24),this._cyy(348+26/2),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeopleLength/2 + 12 +i*24), this._cyy(348+26/2));
                    }
                }
                ctx.fillStyle = '#4E4E4E';
                ctx.font = this._cf(15);
                ctx.fillText('万', this._cxx(521-lastPeopleLength/2 + lastPeopleLength +10), this._cyy(348+26/2));
            }else{
                // ctx.textBaseline = 'middle';
                // ctx.fillStyle = '#FFC600';
                // ctx.font = this._cf(25);
                // ctx.fillText(lastPeople, this._cxx(521), this._cyy(418));
                for(let i = 0;i < lastPeople.length;i++){
                    if(lastPeople[i] !== '.'){
                        let w4Num = lastPeople[i]==1 ? 14 : 24;
                        this._drawImageCenter(Config.SquareNumSmallYellow[lastPeople[i]],this._cxx(521-lastPeople.length*24/2 + 12 +i*24),this._cyy(348+26/2),this._s(w4Num),this._s(30),'bg',null,this.imgid['bg']);
                    }else{
                        ctx.fillText(lastPeople[i], this._cxx(521-lastPeople.length*24/2 + 12 +i*24), this._cyy(348+26/2));
                    }
                }
            }

            //分割线
            ctx.strokeStyle = 'rgba(78,78,78,0.6)';
            ctx.lineWidth = 1 * Dpr;
            ctx.beginPath();
            ctx.moveTo(this._cxx(93), this._cyy(421));
            ctx.lineTo(this._cxx(653), this._cyy(421));
            ctx.moveTo(this._cxx(93), this._cyy(1004));
            ctx.lineTo(this._cxx(653), this._cyy(1004));
            ctx.stroke();
            ctx.closePath();
            let myRank = this.unInRankChange(opt.myRank);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4E4E4E';
            // ctx.font = '32px Arial'
            // ctx.fillText(myRank, this._cxx(94), this._cyy(1072));
            //自己的头像
            // let myAva = UserService.avatarUrl;
            // this._drawImageCircle(myAva, this._cxx(181), this._cyy(1072), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            // ctx.font = '26px Arial'
            // let userName = UserService.nickName;
            // if(userName.length > 8){
            //     userName = userName.substr(0,8)+'...';
            // }
            // ctx.fillText(userName, this._cxx(244), this._cyy(1072));
            // ctx.textAlign = 'right';
            // ctx.font = this._cf(17,true);
            let myValue = opt.myValue<0 ? '-' : this.number2MinSec(opt.myValue);
            // ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1070));

            myRank = '2';
            myValue = '11\'22"';
            if(myRank == '-1'){
                myRank = '未上榜';
                ctx.font = '23px Arial';
                ctx.fillText(myRank, this._cxx(128), this._cyy(1072));
            }else{
                let item = myRank.toString();
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
                for(let i = 0 ;i < item.length;i++){
                    this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(122-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), this._cyy(1072), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                }
            }
            ctx.textAlign = 'left';
            this._drawImageCircle(UserService.avatarUrl, this._cxx(215), this._cyy(1072), this._s(60), this._s(60), 'bg', null, this.imgid['bg']);
            ctx.font = '26px Arial';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4E4E4E';
            let userName = UserService.nickName;
            if(userName.length > 8){
                userName = userName.substr(0,8)+'...';
            }
            ctx.fillText(userName, this._cxx(264), this._cyy(1072));
            ctx.textAlign = 'right';
            ctx.font = this._cf(17,true);
            // ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1166));
            if(myValue == '-'){
                ctx.fillStyle = '#4E4E4E';
                ctx.fillText(myValue, WIDTH - this._cxx(90), this._cyy(1072));
            }else{
                let item = myValue.toString().split('').reverse().join('');
                let perWidth = 20;
                let perHeight = 24;
                let perInnerWidth = 1;
                let j = 0;
                for(let i = 0;i < item.length;i++){
                    if(item[i] != '"' && item[i] != '\''){
                        this._drawImageCenter(Config.rankNumBlack[item[i]], this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i +j*10), this._cyy(1072), this._s(perWidth), this._s(perHeight), 'bg', null, this.imgid['bg']);
                    }else{
                        ctx.fillStyle = '#4E4E4E';
                        if(item[i] == '"'){
                            ctx.fillText('"', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i ), this._cyy(1072));
                        }else{
                            j += j + 1;
                            ctx.fillText('\'', this._cxx(750-89-perWidth/2-i*perWidth - perInnerWidth*i + j*10), this._cyy(1072));
                        }
                    }
                }
                j = 0;
            }
            this.renderRankList(opt.rankList);
        }
        this._updatePlane('bg');
    },

    // 更新复活卡数量
    updateRevivalCardNum:function(){
        let ctx = this.context['btn'];
        ctx.clearRect(this._cxx(41),this._cyy(1209),this._s(213),this._s(70));
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this._cxx(41),this._cyy(1209),this._s(213),this._s(70));
        const realOldBtn = Button.buttonWithTag(this.canvas['btn'],'revivalBtn');
        if (realOldBtn){
            realOldBtn.destroy();
        }
        const revivalBtn = new Button(this.canvas['btn']);
        revivalBtn.origin = {x:this._cxx(41),y:this._cyy(1209)};
        revivalBtn.size = {width:this._s(213),height:this._s(70)};
        revivalBtn.image = 'res/img/battle/fuhuoka.png';
        revivalBtn.tag = 'revivalBtn';
        revivalBtn.onDisplay(function(){
            let ctx = this.context['btn'];
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.font = this._cf(15);
            ctx.fillStyle = '#4E4E4E';
            ctx.fillText(UserService.revivalCard, this._cxx(200), this._cyy(1243));//TODO 复活卡张数
            this._updatePlane('btn');
        }.bind(this));
        revivalBtn.show();
        revivalBtn.onClick = function (sender) {
            !!this.options.onClickRevivalCardShare && this.options.onClickRevivalCardShare(sender);
        }.bind(this);
        this._updatePlane('btn');
    },

    _drawSessionInfoBg:function(opt){
        console.log('Rank _drawSessionInfoBg');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(140),this._s(650),this._s(1030),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(52),this._cyy(140),this._s(646),this._s(1010),10*Dpr,'bg');//white background
        ctx.fill();

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(15);
        ctx.fillStyle = '#4E4E4E';
        if(opt){
            ctx.fillText('网络有误，请重新刷新进入界面', this._cxx(375), this._cyy(600));
        }else{
            ctx.fillText('暂无场次安排，敬请期待', this._cxx(375), this._cyy(600));
        }

        //--以上为不更改的背景
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/battle/home.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);

        // this._drawImageCenter('res/img/battle/fuhuoka.png', this._cxx(147), this._cyy(1244), this._s(213), this._s(70), 'bg', function(){
        //     var ctx = this.context['bg'];
        //     ctx.textBaseline = 'middle';
        //     ctx.textAlign = 'left';
        //     ctx.font = this._cf(15);
        //     ctx.fillStyle = '#4E4E4E';
        //     ctx.fillText(UserService.revivalCard, this._cxx(200), this._cyy(1243));//TODO 复活卡张数
        //     this._updatePlane('bg');
        // }.bind(this), this.imgid['bg']);

        //复活卡按钮
        const revivalBtn = new Button(this.canvas['btn']);//获奖榜单按钮
        revivalBtn.origin = {x:this._cxx(41),y:this._cyy(1209)};
        revivalBtn.size = {width:this._s(213),height:this._s(70)};
        revivalBtn.tag = 'revivalBtn';
        revivalBtn.image = 'res/img/battle/fuhuoka.png';
        revivalBtn.onDisplay(function () {
            let ctx = this.context['btn'];
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
            !!this.options.onClickRevivalCardShare && this.options.onClickRevivalCardShare(sender);
        }.bind(this);

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(11);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('点击分享后+1',this._cxx(82+133/2),this._cyy(1300));

        const prizeRankBtn = new Button(this.canvas['btn']);//获奖榜单按钮
        prizeRankBtn.origin = {x:this._cxx(269),y:this._cyy(1209)};
        prizeRankBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRankBtn.image = 'res/img/battle/huojiangdangdan.png';
        prizeRankBtn.show();
        prizeRankBtn.onClick = function (sender) {
            //点击事件
            !!this.options.onClickPrizeRankLast && this.options.onClickPrizeRankLast(sender);
        }.bind(this);

        const prizeRecordBtn = new Button(this.canvas['btn']);//获奖记录按钮
        prizeRecordBtn.origin = {x:this._cxx(497),y:this._cyy(1209)};
        prizeRecordBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRecordBtn.image = 'res/img/battle/jilu.png';
        prizeRecordBtn.show();
        prizeRecordBtn.onClick = function (sender) {
            //点击事件
            !!this.options.onClickPrizeRecord && this.options.onClickPrizeRecord(sender);
        }.bind(this);
        //--以上为不更改的按钮
        this._updatePlane('bg');
    },

    //场次预告
    _drawSessionInfo:function(opt){
        console.log('Rank _drawSessionInfo');
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        let ctx1 = this.context['btn'];
        ctx1.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.50)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(50),this._cyy(140),this._s(650),this._s(1030),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(52),this._cyy(140),this._s(646),this._s(1010),10*Dpr,'bg');//white background
        ctx.fill();
        ctx.fillStyle = '#4e4e4e';
        ctx.strokeStyle =  '#4e4e4e';
        this._roundedRectR(this._cxx(94),this._cyy(810),this._s(562),this._s(60),10*Dpr,'bg');//black background
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = this._cf(17);
        ctx.fillText('场次预告', this._cxx(375), this._cyy(840));
        //--以上为不更改的背景
        let Xy = this._cyy(41);
        if (window.isIPhoneX){
            Xy = 65;
        }
        const homeBtn = new Button(this.canvas['btn']);//主页按钮
        homeBtn.origin = {x:this._cxx(41),y:Xy};
        homeBtn.size = {width:this._s(80),height:this._s(80)};
        homeBtn.image = 'res/img/battle/home.png';
        homeBtn.show();
        homeBtn.onClick = function () {
            //点击事件
            !!this.options.toBackStartPage && this.options.toBackStartPage();
        }.bind(this);
        // this._drawImageCenter('res/img/battle/fuhuoka.png', this._cxx(147), this._cyy(1244), this._s(213), this._s(70), 'bg', function(){
        //     var ctx = this.context['bg'];
        //     ctx.textBaseline = 'middle';
        //     ctx.textAlign = 'left';
        //     ctx.font = this._cf(15);
        //     ctx.fillStyle = '#4E4E4E';
        //     ctx.fillText(UserService.revivalCard, this._cxx(200), this._cyy(1243));//TODO 复活卡张数
        //     this._updatePlane('bg');
        // }.bind(this), this.imgid['bg']);

        //复活卡按钮
        const revivalBtn = new Button(this.canvas['btn']);//获奖榜单按钮
        revivalBtn.origin = {x:this._cxx(41),y:this._cyy(1209)};
        revivalBtn.size = {width:this._s(213),height:this._s(70)};
        revivalBtn.tag = 'revivalBtn';
        revivalBtn.image = 'res/img/battle/fuhuoka.png';
        revivalBtn.onDisplay(function () {
            let ctx = this.context['btn'];
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
            !!this.options.onClickRevivalCardShare && this.options.onClickRevivalCardShare(sender);
        }.bind(this);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(11);
        ctx.fillText('点击分享后+1',this._cxx(82+133/2),this._cyy(1300));

        const prizeRankBtn = new Button(this.canvas['btn']);//获奖榜单按钮
        prizeRankBtn.origin = {x:this._cxx(269),y:this._cyy(1209)};
        prizeRankBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRankBtn.image = 'res/img/battle/huojiangdangdan.png';
        prizeRankBtn.show();
        prizeRankBtn.onClick = function (sender) {
            //点击事件
            !!this.options.onClickPrizeRankLast && this.options.onClickPrizeRankLast(sender);
        }.bind(this);

        const prizeRecordBtn = new Button(this.canvas['btn']);//获奖记录按钮
        prizeRecordBtn.origin = {x:this._cxx(497),y:this._cyy(1209)};
        prizeRecordBtn.size = {width:this._s(213),height:this._s(70)};
        prizeRecordBtn.image = 'res/img/battle/jilu.png';
        prizeRecordBtn.show();
        prizeRecordBtn.onClick = function (sender) {
            //点击事件
            !!this.options.onClickPrizeRecord && this.options.onClickPrizeRecord(sender);
        }.bind(this);
        //--以上为不更改的按钮

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
        console.log('prizeTitle-length--'+prizeTitle.length);
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
                const preBtn = new Button(this.canvas['btn']);
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
                    !!this.options.onChampionReservation && this.options.onChampionReservation(sender,sender.btnInfo);
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
                const newBtn = new Button(this.canvas['btn']);
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
                    !!this.options.onClickStartGame4Competition && this.options.onClickStartGame4Competition(sender,sender.championshipInfo);
                }.bind(this);
                peopleTitle = '';
                // }
            }
            break;
        case 'jinxingzhong':
            /**
                 * 立即开始显示
                 */
            {
                color = '#ffc600';
                colorText = '#4e4e4e';
                textWord = '进行中';
                Timetitle = '距游戏结束还剩';

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
                const kaishiBtn = new Button(this.canvas['btn']);
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
                    !!this.options.onClickStartGame4Competition && this.options.onClickStartGame4Competition(sender, sender.championshipInfo);
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
            console.log('i---'+i);
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
                bookBtn[i] = new Button(this.canvas['btn']);
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
                    !!this.options.onChampionReservation && this.options.onChampionReservation(sender,sender.btnInfo);
                }.bind(this);

            }else{
                this._drawImageCenter('res/img/battle/make_appointment_already.png', this._cxx(x[i]), this._cyy(y[z[3]]), this._s(130), this._s(54), 'bg', null, this.imgid['bg']);
            }
        }
        this._updatePlane('bg');
    },

    // 场次预告倒计时时间
    _drawSessionRemainTime:function(opt){
        if(this.canvasType == CANVASTYPE['sessionInfo'] && opt.showPage == 'jijiangkaishi'){
            if(this.sessionTimeOld && this.sessionTimeOld != opt.optSessionTime){
                this.sessionTimeOld = opt.optSessionTime;
                let ctx = this.context['bg'];
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
    },

    //画预约人数
    _drawReservationNum:function(opt){
        console.log('Rank _drawReservationNum');
        let ctx = this.context['bg'];
        ctx.clearRect(this._cxx(100),this._cyy(705),this._s(550),this._s(40));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this._cxx(100),this._cyy(705),this._s(550),this._s(40));
        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(13);
        ctx.fillText(opt, this._cxx(375), this._cyy(723));
        this._updatePlane('bg');
    },

    //画已经预约button
    _drawAlreadyBookBtn:function(opt){
        const btnX = opt.btnX;
        const btnY = opt.btnY;
        const bigX = opt.bigX;
        const bigY = opt.bigY;
        const tag = opt.tag;
        const listLength = opt.listLength;
        const prePeopleNum = opt.preNum;
        let ctx = this.context['bg'];
        let ctx1 = this.context['btn'];
        if(tag == 0 || tag == 'preBtn'){
            ctx.clearRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            ctx1.clearRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this._cxx(177-65),this._cyy(1075-27),this._s(130),this._s(54));
            this._drawImageCenter('res/img/battle/make_appointment_already.png',this._cxx(177-65+130/2),this._cyy(1075-27+54/2),this._s(130),this._s(54),'bg',null,this.imgid['bg']);
            const smallBtn = Button.buttonWithTag(this.canvas['btn'],0);
            if (smallBtn){
                smallBtn.destroy();
            }
            ctx.clearRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            ctx1.clearRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(this._cxx(375-135),this._cyy(640-52),this._s(270),this._s(104));
            this._drawImageCenter('res/img/battle/yjingyuyue.png', this._cxx(375), this._cyy(640), this._s(270), this._s(104), 'bg', null, this.imgid['bg']);

            const preBtn = Button.buttonWithTag(this.canvas['btn'],'preBtn');
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
            const outBtn = Button.buttonWithTag(this.canvas['btn'],tag);
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
    },

    //时间确定，场次时间与当前时间比较，确定天数
    timeDefine:function(server){
        const championStartTime = this.formatDateTime(server);
        const timeCurrent = this.formatDateTime(Date.now());
        let day;
        if(championStartTime.day == timeCurrent.day){
            day = '今天';
        }else if((parseInt(championStartTime.day) - parseInt(timeCurrent.day)) == 1){
            day = '明天';
        }else{
            day = championStartTime.month+'-'+championStartTime.day;
        }
        return day;
    },

    _drawLookers: function (opt) {
        // 绘制背景图
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // 绘制头像
        let that = this;

        let score = opt.score || 0;
        let name = opt.nickname || '';
        ctx.textAlign = 'center';

        ctx.textBaseline = 'middle';
        if (opt.type == 'in') {
            this._drawImageRound(opt.headimg, this._cx(207), this._cy(91), this._cx(50), this._cx(50), 'bg', function () {
                that._drawImageCenter('res/img/ava_lookers.png', that._cx(207), that._cy(91), that._cx(53), that._cx(53), 'bg', null, that.imgid['bg']);
            }, this.imgid['bg'], true);
            ctx.font = this._cf(17);
            ctx.fillStyle = 'black';
            ctx.fillText(name + ' 正在游戏中', this._cx(207), this._cy(144));
        } else if (opt.type == 'gg') {
            ctx.fillStyle = 'rgba(0,0,0, 0.4)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            this._drawImageRound(opt.headimg, this._cx(207), this._cy(91), this._cwh(50), this._cwh(50), 'bg', function () {
                that._drawImageCenter('res/img/ava_lookers.png', that._cx(207), that._cy(91), that._cwh(53), that._cwh(53), 'bg', null, that.imgid['bg']);
            }, this.imgid['bg'], true);
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'white';
            ctx.font = this._cf(17);
            ctx.fillText(name + ' 游戏已结束', this._cx(207), this._cy(144));
            ctx.lineWidth = 0.5 * Dpr;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(this._cx(157), this._cy(176));
            ctx.lineTo(this._cx(257), this._cy(176));
            ctx.closePath();
            ctx.stroke();
            ctx.font = this._cf(14);
            ctx.fillText('游戏得分', this._cx(207), this._cy(207));
            // 小方块
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(this._cx(156), this._cy(203), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(156), this._cy(209), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(243), this._cy(203), this._cwh(9), this._cwh(3));
            ctx.fillRect(this._cx(243), this._cy(209), this._cwh(9), this._cwh(3));
            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(80, true);
            ctx.fillText(score || 0, this._cx(212), this._cy(267));
        } else if (opt.type == 'out') {
            ctx.fillStyle = 'rgba(0,0,0, 0.4)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            this._drawImageRound(opt.headimg, this._cx(207), this._cy(221), this._cwh(50), this._cwh(50), 'bg', function () {
                that._drawImageCenter('res/img/ava_lookers.png', that._cx(207), that._cy(221), that._cwh(53), that._cwh(53), 'bg', null, that.imgid['bg']);
            }, this.imgid['bg'], true);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = this._cf(17);
            ctx.fillText(name + ' 游戏已结束', this._cx(207), this._cy(278));
        }

        this._drawImageCenter('res/img/btn_iplay.png', this._cx(207), this._cy(663), this._cwh(131), this._cwh(54), 'bg', null, this.imgid['bg']);

        this._updatePlane('bg');
    },

    _drawGameOverHighest: function (opt, type) {
        this.imgid['bg']++;
        opt.score = opt.score || 0;

        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = 'rgba(0,0,0, 0.8)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // 避免一次触发了超越，一次没有触发超越，显示了上一次的头像
        let ctx1 = this.context['btn'];
        ctx1.clearRect(this._cx(30), this._cy(448), this._cwh(354), this._cwh(55));

        // 历史最高分
        ctx.font = this._cf(14);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('历史最高分：' + Math.max(opt.highest_score, opt.score), this._cx(207), this._cy(703));

        // 历史最高分 / 本周最高分 / 各种称号
        if (type == 'history') {
            if (this.changlleList.length == 0) {
                // 没有超越好友
                ctx.lineWidth = 2 * Dpr;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this._roundedRectR(this._cx(30), this._cy(104), this._cwh(354), this._cwh(371), 4 * Dpr, 'bg');
                ctx.fill();
                // 分享
                this._drawImageCenter('res/img/pure_share.png', this._cx(207), this._cy(440), this._cwh(18), this._cwh(24), 'bg', null, this.imgid['bg']);
            } else {
                // 有超越的好友
                ctx.lineWidth = 2 * Dpr;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this._roundedRectR(this._cx(30), this._cy(104), this._cwh(354), this._cwh(401), 4 * Dpr, 'bg');
                ctx.fill();
                // 线
                ctx.lineWidth = 0.5 * Dpr;
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath();
                ctx.moveTo(this._cx(127), this._cy(406));
                ctx.lineTo(this._cx(287), this._cy(406));
                ctx.stroke();
                ctx.closePath();

                ctx.font = this._cf(14);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText('排名新超越' + this.changlleList.length + '位好友', this._cx(207), this._cy(429));

                // 好友头像
                this.changlleListStart = 0;
                this._reDrawChangeAva(0);

                // 分享
                this._drawImageCenter('res/img/pure_share.png', this._cx(207), this._cy(368), this._cwh(18), this._cwh(24), 'bg', null, this.imgid['bg']);
            }
            // 开始一坨称号的表演
            let other_msg = '';
            let color = '';
            let w = 80;
            if (this.opt.msg == '历史最高分') {
                if (this.opt.highest_score < 100 && this.opt.score >= 100) {
                    // 第一次达到100分
                    other_msg = '初窥门径';
                    color = '#509FC9';
                }
                if (this.opt.highest_score < 500 && this.opt.score >= 500) {
                    other_msg = '耐得寂寞';
                    color = '#E67600';
                }
                if (this.opt.highest_score < 1000 && this.opt.score >= 1000) {
                    other_msg = '登堂入室';
                    color = '#009D5E';
                }
                if (this.opt.highest_score < 2000 && this.opt.score >= 2000) {
                    other_msg = '无聊大师';
                    color = '#7A0096';
                }
                if (this.opt.highest_score < 3000 && this.opt.score >= 3000) {
                    other_msg = '一指禅';
                    color = '#555555';
                }
                if (this.opt.highest_score < 5000 && this.opt.score >= 5000) {
                    other_msg = '立地成佛';
                    color = '#AC8742';
                }
                // 结束一坨称号的表演
            }
            if (other_msg) {
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1 * Dpr;

                // ctx.fillRect( this._cx(163), this._cy(154), this._cx(88), this._cx(26) );
                this._roundedRectR(this._cx(207 - w / 2), this._cy(154), this._cwh(w), this._cwh(26), 2 * Dpr, 'bg');
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold ' + this._cf(14);
                ctx.fillText(other_msg, this._cx(207), this._cy(167));
            } else this._drawImageCenter('res/img/new.png', this._cx(207), this._cy(167), this._cwh(58), this._cwh(26), 'bg', null, this.imgid['bg']);

            ctx.font = this._cf(14);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.textBaseline = 'middle';

            ctx.fillText(this.opt.msg || '本周最高分', this._cx(207), this._cy(224));

            ctx.font = this._cf(86, true);
            ctx.fillStyle = '#00c777';
            ctx.fillText(opt.score, this._cx(207), this._cy(292.5));
        }

        // 排行榜最高分
        if (type == 'rank') {
            this._drawImageCenter('res/img/new.png', this._cx(207), this._cy(167), this._cwh(58), this._cwh(26), 'bg', null, this.imgid['bg']);

            ctx.lineWidth = 2 * Dpr;
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this._roundedRectR(this._cx(30), this._cy(104), this._cwh(354), this._cwh(371), 4 * Dpr, 'bg');
            ctx.fill();

            let that = this;
            this._drawImageRound(this.myUserInfo.headimg, this._cx(207), this._cy(291), this._cwh(56), this._cwh(56), 'bg', function () {
                that._drawImageCenter('res/img/gold.png', that._cx(207), that._cy(253), that._cwh(40), that._cwh(40), 'bg', null, that.imgid['bg']);
            }, this.imgid['bg']);

            ctx.font = this._cf(14);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.textBaseline = 'middle';
            ctx.fillText('排行榜冠军', this._cx(207), this._cy(224));

            ctx.font = this._cf(40, true);
            ctx.fillStyle = '#00c777';
            ctx.fillText(opt.score, this._cx(207), this._cy(349));

            // 分享
            this._drawImageCenter('res/img/pure_share.png', this._cx(207), this._cy(415), this._cwh(18), this._cwh(24), 'bg', null, this.imgid['bg']);
        }

        // title的小方块
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(this._cx(155), this._cy(218.5), this._cwh(9), this._cwh(3));
        ctx.fillRect(this._cx(155), this._cy(224.5), this._cwh(9), this._cwh(3));
        ctx.fillRect(this._cx(248), this._cy(218.5), this._cwh(9), this._cwh(3));
        ctx.fillRect(this._cx(248), this._cy(224.5), this._cwh(9), this._cwh(3));

        // 关闭 - 回到正常结算页
        this._drawImageCenter('res/img/close.png', this._cx(375), this._cy(112), this._cwh(43), this._cwh(43), 'bg', null, this.imgid['bg']);

        // 头像会改变层级，所以要在头像之后显示
        ctx1.clearRect(this._cx(91), this._cy(547), this._cwh(232), this._cwh(94));
        this._drawImageCenter('res/img/replay.png', this._cx(207), this._cy(607), this._cwh(212), this._cwh(84), 'btn', null, this.imgid['btn']);

        // 礼花
        this._drawImageCenter('res/img/flower.png', this._cx(207), this._cy(290), this._cwh(260), this._cwh(141), 'bg', null, this.imgid['bg']);

        this._updatePlane('bg');
    },

    _reDrawChangeAva: function (pos) {
        let _this3 = this;

        this.imgid['btn']++; // 避免上一次的头像显示在这里
        if (this.changlleListStart + pos * 5 < 0 || this.changlleListStart + pos * 5 >= this.changlleList.length) {
            return;
        }
        this.changlleListStart = this.changlleListStart + pos * 5;

        let show_ava_list = this.changlleList.slice(this.changlleListStart, this.changlleListStart + 5);
        let n = show_ava_list.length,
            w = 32,
            p = 10;
        let startx = 207 - (n * 32 + (n - 1) * 10) / 2;

        let ctx = this.context['btn'];
        ctx.clearRect(this._cx(30), this._cy(448), this._cwh(354), this._cwh(55));

        var _loop2 = function _loop2(i) {
            let x0 = _this3._cx(startx + w / 2 + i * (w + p));
            that = _this3;

            _this3._drawImageRound(show_ava_list[i].headimg, x0, _this3._cy(469), _this3._cwh(w), _this3._cwh(w), 'btn', function () {
                that._drawImageCenter('res/img/ava_rank.png', x0, that._cy(469), that._cwh(w + 14), that._cwh(w + 14), 'btn', null, that.imgid['btn']);
            }, _this3.imgid['btn'], true);
        };

        for (let i = 0; i < n; i++) {
            var that;

            _loop2(i);
        }

        // 是否显示左右箭头
        if (this.changlleList.length > 5 && this.changlleListStart + 5 < Math.floor(this.changlleList.length / 5) * 5) {
            this._drawImageCenter('res/img/r_arr1.png', this._cx(339), this._cy(469), this._cwh(6), this._cwh(8), 'btn', null, this.imgid['btn']);
        }
        if (this.changlleList.length > 5 && this.changlleListStart != 0) {
            this._drawImageCenter('res/img/l_arr.png', this._cx(69), this._cy(469), this._cwh(6), this._cwh(8), 'btn', null, this.imgid['btn']);
        }
    },

    _drawBeginner: function () {
        let ctx = this.context['bg'];
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(this._cx(103), this._cy(134), this._cwh(206), this._cwh(115));

        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = this._cf(17);
        ctx.fillText('长按屏幕并释放', this._cx(207), this._cy(172));

        ctx.textAlign = 'left';
        ctx.fillText('控制', this._cx(149), this._cy(213));

        ctx.textAlign = 'right';
        ctx.fillText('向前跳', this._cx(265), this._cy(213));

        this._drawImageCenter('res/img/i.png', this._cx(198), this._cy(211), this._cwh(13.2), this._cwh(35.6), 'bg', null, this.imgid['bg']);

        this._updatePlane('bg');
    },

    // ----------------- 画布创建与更新 -----------------
    _createPlane: function () {
        console.log('Rank _createPlane');
        // 创建画布
        if (this.canvas['bg']) return;
        //console.log("Rank _createPlane  this.planList = " + this.planList);
        for (let i = 0; i < this.planList.length; i++) {
            //console.log('Rank _createPlane this.planList[i] = ' + this.planList[i]);
            const canvas = document.createElement('canvas');//创建canvas元素，canvas仅为图形的容器
            this.canvas[this.planList[i]] = canvas;
            this.context[this.planList[i]] = this.canvas[this.planList[i]].getContext('2d');
            //通过getContext方法返回对像，该对象提供再画布上绘图的方法和属性
            //画图的各种方法都是在getContext('2d')上的,包括各种矩形、圆形等
            if (this.planList[i] == 'list3' || this.planList[i] == 'list4') {
                this.canvas[this.planList[i]].width = 7 * this._cwh(ListColumnWidth);
            }else{
                this.canvas[this.planList[i]].width = WIDTH;
            }

            if (this.planList[i] == 'list1' || this.planList[i] == 'list2') {
                // 高度是10倍的列表高度
                this.canvas[this.planList[i]].height = 10 * this._cwh(ListLineHeight);
            } else {
                this.canvas[this.planList[i]].height = HEIGHT;
            }

            const mrTexture = new THREE.Texture(this.canvas[this.planList[i]]);

            this.material[this.planList[i]] = new THREE.MeshBasicMaterial({
                map: mrTexture,
                transparent: true
            });

            this.texture[this.planList[i]] = mrTexture;
            // if(this.texture.uuid){
            //     this.texture[this.planList[i]].uuid = this.texture.uuid;
            // }else{
            //     this.texture.uuid = this.texture[this.planList[i]].uuid;
            // }
            // console.log('uuid---'+this.texture[this.planList[i]].uuid);
            if (this.planList[i] == 'list1' || this.planList[i] == 'list2') {
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(frustumSizeWidth, 10 * this._cwh(ListLineHeight) / HEIGHT * frustumSizeHeight);
            } else if (this.planList[i] == 'list3' || this.planList[i] == 'list4'){
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(7 * this._cwh(ListColumnWidth) / WIDTH * frustumSizeWidth, frustumSizeHeight);
            } else {
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(frustumSizeWidth, frustumSizeHeight);
            }
            const mrObj = new THREE.Mesh(this.geometry[this.planList[i]], this.material[this.planList[i]]);
            mrObj.position.y = 0; // 上下
            mrObj.position.x = 0; // 左右
            mrObj.position.z = 11 - i * 0.001; // 前后 -1 - scrollBar , -2 background, -3 list 1, -4 list 2
            this.obj[this.planList[i]] = mrObj;
            this.material[this.planList[i]].map.minFilter = THREE.LinearFilter;
            this.options.camera.add(mrObj);

            const self = this;
            canvas.mrTexture = mrTexture;
            canvas.mrObj = mrObj;
            canvas.onUpdate(function (canvas) {
                canvas.mrTexture.needsUpdate = true;
                canvas.mrObj.visible = true;
                // self.options.camera.add(canvas.mrObj);
            });
        }

        if (DEBUG && showDebugImg) {
            let ctx = this.context['sample'];
            ctx.globalAlpha = 0.4;
            let that = this;
            setTimeout(function () {
                that._drawImageCenter('res/img/sample.png', that._cx(207), that._cy(368), that._cwh(414), that._cwh(736), 'sample', null, that.imgid);
            }, 2000);
        }
    },

    _updatePlane: function (type) {
        // console.log('Rank _updatePlane');
        // 画布更新
        if (!this.showState) {
            return;
        }

        if (this.canvasType == CANVASTYPE['gameOver'] && type != 'bg' && type != 'btn' && type != 'sample') {
            return;
        }
        if (this.canvasType == CANVASTYPE['start'] && type != 'bg' && type != 'btn' && type != 'sample' && type != 'startOrderList') {
            return;
        }
        this.texture[type].needsUpdate = true;
        this.obj[type].visible = true;
        // this.options.camera.add(this.obj[type]);
    },

    // _updateClip: function () {
    //     // 更新切面位置
    //     let cp0 = this.p0.clone();
    //     let cp1 = this.p1.clone();
    //     let cp2 = this.p2.clone();
    //     let cp3 = this.p3.clone();
    //     let cp4 = this.p4.clone();
    //     if (this.canvasType == CANVASTYPE['pk']) {
    //         cp1 = this.p5.clone();
    //         cp2 = this.p6.clone();
    //         cp3 = this.p7.clone();
    //         cp4 = this.p8.clone();
    //     }
    //     if(this.canvasType == CANVASTYPE['prizeRecord']) {
    //         cp0 = this.centerP.clone();
    //         cp1 = this.p9.clone();
    //         cp2 = this.p10.clone();
    //         cp3 = this.p11.clone();
    //         cp4 = this.p12.clone();
    //     }
    //     if(this.canvasType == CANVASTYPE['prizeRankLast']) {
    //         cp1 = this.p13.clone();
    //         cp2 = this.p14.clone();
    //         cp3 = this.p15.clone();
    //         cp4 = this.p16.clone();
    //     }
    //     if(this.canvasType == CANVASTYPE['prizeRankMoney']) {
    //         cp1 = this.p17.clone();
    //         cp2 = this.p18.clone();
    //         cp3 = this.p19.clone();
    //         cp4 = this.p20.clone();
    //     }
    //     if(this.canvasType == CANVASTYPE['awardList']) {
    //         cp1 = this.p21.clone();
    //         cp2 = this.p22.clone();
    //         cp3 = this.p23.clone();
    //         cp4 = this.p24.clone();
    //     }
    //
    //     this.options.camera.updateMatrixWorld();
    //     let matrixWorld = this.options.camera.matrixWorld;
    //
    //     cp0.applyMatrix4(matrixWorld);
    //     cp1.applyMatrix4(matrixWorld);
    //     cp2.applyMatrix4(matrixWorld);
    //     cp3.applyMatrix4(matrixWorld);
    //     cp4.applyMatrix4(matrixWorld);
    //
    //     let triangle = new THREE.Triangle(cp2, cp1);
    //     let cutA = triangle.plane();
    //     this._negatePlane(cutA, cp0.clone());
    //
    //     triangle = new THREE.Triangle(cp3, cp2);
    //     let cutB = triangle.plane();
    //     this._negatePlane(cutB, cp0.clone());
    //
    //     triangle = new THREE.Triangle(cp4, cp3);
    //     let cutC = triangle.plane();
    //     this._negatePlane(cutC, cp0.clone());
    //
    //     triangle = new THREE.Triangle(cp1, cp4);
    //     let cutD = triangle.plane();
    //     this._negatePlane(cutD, cp0.clone());
    //
    //     this.material['list1'].clippingPlanes = [cutA, cutB, cutC, cutD];
    //     this.material['list1'].needsUpdate = true;
    //     this.material['list2'].clippingPlanes = [cutA, cutB, cutC, cutD];
    //     this.material['list2'].needsUpdate = true;
    //
    //     // 更新切面位置结束
    // },

    // ----------------- 工具函数 -----------------

    formatDateTime:function (inputTime,type) {
        let date = new Date(inputTime);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        let timeObject = {
            year:y,
            month:m,
            day:d,
            hour:h,
            minute:minute,
            second:second
        };
        if(type == 2){
            return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
        }else if(type == 3){
            m = date.getMonth() + 1;
            d = date.getDate();
            h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            return m+'月'+d+'日'+' '+h+':'+minute;
        }
        else{
            return timeObject;
        }

    },
    unInRankChange:function(opt){
        if(opt.toString() === '-1'){
            opt = '-';
        }
        return opt;
    },
    rankChangeUnIn:function(opt){
        if(opt.toString() === '-1'){
            opt = '未上榜';
        }
        if(parseInt(opt) > 100){
            opt = '未上榜';
        }
        return opt;
    },

    number2MinSec:function(num){
        if (num<0){
            return '0\'0"';
        }
        let min = Math.floor(num/60);
        let sec = Math.floor(num%60);
        return min+'\''+sec+'"';
    },

    _cname: function (x, namelen) {
        namelen = namelen || 16;
        x = x || '';
        let len = x.replace(/[^\x00-\xff]/g, '**').length;
        if (len > namelen) {
            x = this._sliceName(x, namelen) + '...';
        }
        return x;
    },

    _sliceName: function (x, namelen) {
        x = x || '';
        let len = x.replace(/[^\x00-\xff]/g, '**').length;
        if (len > namelen) {
            x = x.substring(0, x.length - 1);
            x = this._sliceName(x, namelen);
        }
        return x;
    },

    _cwh: function (x) {
        let realx = x * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realx = x * H / 736;
        }
        return realx * Dpr;
    },

    _s: function (x) {
        let cxX =( x / Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    },

    _cx: function (x) {
        // change x
        // x 为 在 414*736 屏幕下的，标准像素的 x ，即为设计图的x的px值
        // realx 表示在当前屏幕下，应该得到的x值，这里所有屏幕画布将按照x轴缩放
        let realx = x * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realx = x * H / 736 + (W - H * 414 / 736) / 2;
        }
        return realx * Dpr;
    },

    _cxx:function(x){
        //按照实际尺寸，换算成414*736
        let cxX =( x / Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    },
    getPageX:function(a){
        let x = a * 414 / 750;
        return x;
    },
    getPageY:function(b){
        let y = b * 736 / 1334;
        return y;
    },

    _cy: function (y) {
        // change y
        // y 位在 414*736 屏幕下的，标准像素的y，即为设计图的y的px值
        // realy表示在当前屏幕下，应该得到的y值，如果屏幕的长宽值特别大（某X，某note8），那么就上下留白
        let really;
        if (H / W > 736 / 414) {
            // 某X
            // 屏幕显示区域的高度h: WIDTH*736/414, 上下留白是  (HEIGHT - h)/2
            really = y * W / 414 + (H - W * 736 / 414) / 2;
        } else {
            really = y * H / 736;
        }
        return really * Dpr;
    },

    _cyy:function(y){
        let cyY = y * 736 / 1334;
        let realY = this._cy(cyY);
        return realY;
    },

    _cf: function (size, is_num) {
        // font size
        let realf = size * Dpr * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realf = size * Dpr * H / 736;
        }
        if (!!is_num && !!family) return realf + ('px ' + family); else return realf + 'px Helvetica';//px Helvetica
    },

    _cxp: function (x) {
        // 根据坐标反推出x
        return x / W * 414;
    },

    _cyp: function (y) {
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
    },

    _negatePlane: function (plane, point) {
        if (!plane || !point) {
            return;
        }
        let distance = plane.distanceToPoint(point);
        if (distance < 0) {
            plane.negate();
        }
    },

    _loadImg: function(src, x, y, width, height, type, cb, imgid, errImg){
        let img = new Image();
        const that = this;
        const tag = new Date().getTime();
        img._tag = tag;
        img._retryTimes = 10;


        if(!src || src == 'null' || src.length == 0){
            src = errImg || 'res/img/ava.png';
        }


        img.onload = function () {
            if ((img._tag == tag) && (that.imgid[type] == imgid)) {
                !!cb && cb(img);
            }
            img = null;//TODO 图片加载后置空
        };
        img.onerror = function () {
            if (img._retryTimes >= 0){
                if (img._retryTimes == 0){
                    if(errImg){
                        console.error('use default img : ' + errImg);
                        img.src = errImg;
                    } else {
                        !!cb && cb();
                    }
                } else {
                    console.error('retry : ' + src);
                    setTimeout(function () {
                        img.src = src;
                    },100);
                }
                img._retryTimes --;
            } else {
                !!cb && cb();
            }
        };
        img.src = src;
    },

    _syncDrawImageCenter: function (img, x, y, width, height, type) {
        this.context[type].drawImage(img, x - width / 2, y - height / 2, width, height);
    },

    _drawImageCenter: function (src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        console.log('Rank _drawImageCenter');
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片

        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        this._loadImg(src, x, y, width, height, type, function (img) {
            if (img){
                that.context[type].drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            !!cb && cb(img);
            if (!noupdate){
                that._updatePlane(type); // 更新画布
            }
        }, imgid, errImg);
    },

    _drawImageRound: function (src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片
        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        let ctx = this.context[type];

        this._loadImg(src, x, y, width, height, type, function (img) {

            ctx.save();
            that._roundedRectR(x - width / 2, y - height / 2, width, height, 2, type);
            ctx.clip();
            if (img) {
                ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            ctx.closePath();
            ctx.restore();
            !!cb && cb();
            if (!noupdate) that._updatePlane(type); // 更新画布
        }, imgid,errImg);
    },

    _drawImageCircle: function (src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片
        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        let ctx = this.context[type];

        this._loadImg(src, x, y, width, height, type, function (img) {

            if(that.canvasType == CANVASTYPE['rankGlobal'] || that.canvasType == CANVASTYPE['rankLeCard']|| that.canvasType == CANVASTYPE['prizeRankLast']|| that.canvasType == CANVASTYPE['prizeRankMoney']|| that.canvasType == CANVASTYPE['awardList']){
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0)';
                that._circleRectR(x - width / 2, y - height / 2, width, height, 2, type);
                ctx.clip();
                if (img) {
                    ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
                }
                ctx.closePath();
                ctx.restore();
                !!cb && cb();
                if (!noupdate) that._updatePlane(type); // 更新画布
            }
        }, imgid,errImg);
    },

    _rerank: function (array) {
        // 排行榜重新排序
        let i = 0,
            len = array.length,
            j,
            d;
        for (; i < len; i++) {
            for (j = 0; j < len; j++) {
                if (array[i].week_best_score > array[j].week_best_score) {
                    d = array[j];
                    array[j] = array[i];
                    array[i] = d;
                }
            }
        }
        return array;
    },

    _findSelfIndex: function (element, index, array) {
        // 从排行列表中找出自己的排名
        return element.nickname === this.myUserInfo.nickname;
    },

    _findPartner: function (element, index, array) {
        // 从排行列表中找出自己的排名
        return element.is_self === 1;
    },

    _hemiCircleAndRect:function(x,y,width,height,radius,type){
        let ctx = this.context[type];
        ctx.beginPath();
        ctx.arc(x+radius,y+radius,radius,0.5*Math.PI,1.5*Math.PI);
        ctx.lineTo(x+width-radius,y);
        ctx.arc(x+width-radius,y+radius,radius,-0.5*Math.PI,0.5*Math.PI);
        ctx.lineTo(x+radius,y+2*radius);
    },

    _roundedRectR: function (x, y, width, height, radius, type) {
        let ctx = this.context[type];
        ctx.beginPath();
        ctx.moveTo(x, y + radius - 1);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y); // 终点
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
        ctx.closePath();
    },

    _circleRectR: function (x, y, width, height, radius, type) {
        let ctx = this.context[type];
        ctx.beginPath();
        ctx.arc(x+width/2.0,y+height/2.0,Math.min(width,height)/2.0,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();
    },

    explode: function (x, y, idx) {
        if (!this.particles[idx]) {
            let colors = [0x00B6F1, 0x1800FF, 0xFF0000, 0xFEFF00, 0x00FF00];
            this.materials = [];
            let geometry = new THREE.PlaneGeometry(0.4, 0.4);
            for (let i = 0; i < colors.length; ++i) {
                this.materials.push(new THREE.MeshBasicMaterial({color: colors[i], transparent: true}));
            }
            this.particles[idx] = [];
            for (let i = 0; i < 25; ++i) {
                let particle = new THREE.Mesh(geometry, this.materials[i % colors.length]);
                // particle.position.set(0, 0, 9.9);
                this.options.camera.add(particle);
                this.particles[idx].push(particle);
            }
        }
        let t1 = 0.35;
        let t2 = 0.35;

        for (let i = 0; i < this.particles[idx].length; ++i) {
            let x0 = x,
                y0 = y;
            this.particles[idx][i].position.set(x0, y0, 9.9);

            // 快速 随机左右散开，占 2/3
            let x1 = (1 - 2 * Math.random()) * 5 + x0;
            let y1 = (1 - 2 * Math.random()) * 5 + y0;

            let x11 = x0 + (x1 - x0) * 0.95;
            let y11 = y0 + (y1 - y0) * 0.95;

            _animation.customAnimation.to(this.particles[idx][i].position, t1, {
                x: x11,
                y: y11
            });

            _animation.customAnimation.to(this.particles[idx][i].position, t2, {
                x: x1,
                y: y1,
                delay: t1
            });
        }
        /*for (var i = 0; i < this.materials.length; ++i) {
   this.materials[i].opacity = 1;
   customAnimation.to(this.materials[i], t2, { opacity: 0, delay: t1});
}*/
    },

    // showFinger: function () {
    //     let _this4 = this;
    //
    //     return;
    //     if (!this.hand) {
    //         this.hand = new THREE.Mesh(new THREE.PlaneGeometry(2, 3.4), new THREE.MeshBasicMaterial({
    //             map: _config.loader.load('res/img/hand.png'),
    //             transparent: true
    //         }));
    //         this.hand.position.set(11, -8, 9.9);
    //         this.circle = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 30), new THREE.MeshBasicMaterial({
    //             color: 0x888888,
    //             transparent: true
    //         }));
    //         this.circle.position.set(10.5, -6.8, 9.9);
    //     }
    //     this.options.camera.add(this.hand);
    //     this.options.camera.add(this.circle);
    //     _animation.customAnimation.to(this.circle.material, 0.1, {opacity: 1});
    //     _animation.customAnimation.to(this.circle.scale, 0.3, {x: 1.5, y: 1.5, z: 1.5});
    //     _animation.customAnimation.to(this.circle.material, 0.1, {opacity: 0, delay: 1.3});
    //
    //     _animation.customAnimation.to(this.hand.scale, 0.5, {x: 1, y: 1, delay: 1});
    //     _animation.customAnimation.to(this.hand.scale, 0.5, {x: 1.5, y: 1.5, delay: 2});
    //
    //     this.fingerTimer = setTimeout(function () {
    //         _this4.showFinger();
    //         _this4.circle.scale.set(1, 1, 1);
    //     }, 3000);
    // },

    clearFinger: function () {
        if (this.fingerTimer) {
            clearTimeout(this.fingerTimer);
            this.fingerTimer = null;
        }
        this.opts.camera.remove(this.hand);
    },

    //展示“来自茹小岚的一封信”
    showLetterPage: function (callback) {
        this.acceptActivityCallback = callback;
        letterMask.style.display = 'flex';
        letterMask.style.display = '-webkit-flex';
    },

    //信上的按钮点击事件
    letterButtonClicked: function () {
        this.acceptActivityCallback && this.acceptActivityCallback();
        letterMask.style.display = 'none';
        Application.ccReport({
            id:1003,
            memo:{'from':'H5'}
        });
    },

    //展示大理寺活动运营位
    showActivityBanner: function (demandValue, myValue, didGetVip) {
        this.demandValue = demandValue;
        this.myValue = myValue;
        this.didGetVip = didGetVip;
        if (!didGetVip) {
            let scoreImgs = activityScore.querySelectorAll('.activity_score_img');
            for (let i = 0; i < scoreImgs.length; i++) {
                let img = scoreImgs[i];
                img.parentNode.removeChild(img);
            }
            let score = myValue < demandValue ? String(myValue) : String(demandValue);
            let tmpStr = '';
            for(let i = 0; i < score.length; i++) {
                tmpStr += '<img class="activity_score_img" src="'+Config.ScoreOver[score[i]]+'" />';
            }
            activityScore.innerHTML = tmpStr;
            activityBannerScore.style.display = 'flex';
            activityBannerScore.style.display = '-webkit-flex';
        } else {
            activityBannerScore.style.display = 'none';
            activityButton.style.top = 25 + 'px';
        }
        activityBanner.style.display = 'flex';
        activityBanner.style.display = '-webkit-flex';
    },

    //大理寺活动按钮点击事件
    activityButtonClicked: function () {
        if (this.didGetVip) {  //领取过vip，直接展示立即使用页面
            this.options.getVipCode(function (redeemCode) {
                codeArea.value = redeemCode;
                useVipCont.style.display = 'block';
                this.getVipDialogAnimate(useVipLis);
            }.bind(this));
        } else {  //没领取过vip
            if (this.myValue >= this.demandValue) {  //五彩石够了，展示立即领取页面
                activityMask.style.display = 'none';
                vipCont.style.display = 'block';
                countRich.innerHTML = '五彩石' + this.demandValue + '/' + this.demandValue;
                this.getVipDialogAnimate(getVipLis);
            } else {  //五彩石不够，展示活动页面
                vipCont.style.display = 'none';
                activityMask.style.display = 'flex';
                activityMask.style.display = '-webkit-flex';
                countPoor.innerHTML = '五彩石' + this.myValue + '/' + this.demandValue;
                this.getVipDialogAnimate(activityLis);
            }
        }
    },

    getVipDialogAnimate:function(lis){ //猫 对话框 动画
        let nowIndex = 0;
        for(let i=0;i<lis.length;i++){
            if(!lis[i].classList.contains('hidden')){
                nowIndex = i;
                break;
            }
        }
        this.gvAnimationNum = setInterval(function () {
            (0, Animation.TweenAnimation)(1, 0, 500, 'Linear', function (value, complete) {
                lis[nowIndex].style.opacity = value+'';
                if (complete) {
                    lis[nowIndex].classList.add('hidden');
                    nowIndex = (nowIndex + 1) % lis.length;
                    lis[nowIndex].classList.remove('hidden');
                    (0, Animation.TweenAnimation)(0, 1, 500, 'Linear', function (value, complete) {
                        lis[nowIndex].style.opacity = value+'';
                    });
                }
            });
        }, 5000);
        console.log('开始对话框滚动');
    },
    stopVipDialogAnimate:function(){    //停止猫对话框
        clearInterval(this.gvAnimationNum);
        console.log('停止对话框滚动');
    },

    //大理寺活动页面上返回按钮点击事件
    activityCloseButtonClicked: function () {
        activityMask.style.display = 'none';
        this.stopVipDialogAnimate();
    },

    //大理寺活动页面上分享按钮点击事件
    activityShareButtonClicked: function () {
        this.options.activityShare();
    },

    //大理寺，关闭领取vip窗口
    closeGetVip:function(){
        vipCont.style.display = 'none';
        this.stopVipDialogAnimate();
    },
    //大理寺，炫耀一下VIP
    vipShowOff:function () {
        this.options.vipShowOff();
    },
    //大理寺，领VIP
    getVip:function () {
        console.log('领取vip');
        this.options.getVipCode(function (redeemCode) {
            vipCont.style.display = 'none';
            congratulation.style.display = 'block';
            this.stopVipDialogAnimate();
            codeArea.value = redeemCode;
        }.bind(this));
    },
    //大理寺，跳转到使用VIP弹框
    goToUseVip:function(){
        console.log('确定');
        congratulation.style.display = 'none';
        useVipCont.style.display = 'block';
        this.getVipDialogAnimate(useVipLis);
    },
    //大理寺，关闭立即使用VIP
    UseVipClose:function(){
        useVipCont.style.display = 'none';
        this.stopVipDialogAnimate();
    },
    //大理寺，前往激活码弹框
    goToVipCode:function(){
        useVipCont.style.display = 'none';
        this.stopVipDialogAnimate();
        code.style.display = 'block';
    },
    //大理寺，关闭激活码弹框
    closeCode:function(){
        code.style.display = 'none';
    }

};

export default Rank;
/* eslint-enable */