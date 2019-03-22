'use strict';

import Utils from '../shared/service/Utils';
import PageBase from '../base/PageBase';
import Button from '../base/Button';
import UserService from '../service/UserService';
import * as Config from '../base/Config';
import CanvasBase from '../base/CanvasBase';
import JumpSocketService from '../service/JumpSocketService';
import RankList from '../base/RankList.js';
import PageCtrl from '../controller/PageCtrl';
import GameLog from '../shared/log/GameLog';

if (!window.WechatGame){
    //H5结束页面
    var overAgainMask = document.getElementById('over_mask');
    var rankListMyRank4H5 = document.getElementById('myRank');
    var rankListMyValue4H5 = document.getElementById('myValue');
    var rankListMyName4H5 = document.getElementById('myName');
    var rankListMyAvatar4H5 = document.getElementById('myAvatar');
    var rankList4H5 = document.getElementById('rank_list');
    var rankListScroll4H5 = document.getElementById('rank_list_bg_scroll');
}

class RankGlobalPage extends PageBase{
    constructor(game) {
        console.log('RankGlobalPage');
        super(game);
        this.game = game;
        this.gameCtrl = this.game.gameCtrl;
        this.name = 'rankGlobal';
        this.cacheRankGlobal = null;
        const logger = GameLog.getLogger('RankGlobalPage');
        this.logger = logger;
    }
    onShow(sender,cb) {
        if (!window.WechatGame){
            Utils.showLoading({mask:true});
        }
        const that = this;
        let ps = {
            game:'jumper',
            sortBy:'score',
            top:100
        };
        JumpSocketService.prizeRank(ps,function (err,result) {
            if (!window.WechatGame){
                Utils.hideLoading();
            }
            if(!err){
                cb && cb();
                that.logger.info(result);
                that.hideOverAgain4H5();// H5 隐藏结果页
                const rankList = result.rankList;
                if (rankList){
                    const sortedResult = rankList.sort(function (v1,v2) {
                        return (v1.rank - v2.rank);
                    });
                    result.rankList = sortedResult;
                }

                //排行榜中，头像和昵称与登录接口中的保持一致
                if(result.myRank && result.myRank.toString() !== '-1'){
                    for(let i = 0;i < result.rankList.length ;i++){
                        if(result.myRank == result.rankList[i].rank){
                            result.rankList[i].nickname = UserService.nickName;
                            result.rankList[i].avatarUrl = UserService.avatarUrl;
                            break;
                        }
                    }
                }
                result.myCurrentScore = that.game.currentScore;
                that.showRankGlobal(result);
                if (window.WechatGame){
                    that.gameCtrl.queryIsNeed2ShowCongratulation();
                    //关闭提现按钮更新的监听
                }
            }else {
                if (window.WechatGame){
                    that.game.UI.showToast('网络异常，请重试');
                    PageCtrl.popPage(sender);
                    that.logger.error(err);
                }else{
                    that.game.UI.showToast('请求出错，请稍后重试');
                }
                sender && sender.enable();
            }
        });
    }

    onHide() {
        console.log('RankGlobalPage  onHide');
        this.hide();
    }

    hideOverAgain4H5(){
        if (!window.WechatGame){
            overAgainMask.style.display = 'none';
        }
    }

    showRankGlobal(result){
        if (window.WechatGame){
            CanvasBase._updateClip('rankGlobal');
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
        }
    }

    _drawRankGlobal(result){
        // 绘制排行榜背景图
        console.log('_drawRankGlobal');
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
        const that = this;
        const rankList = result.rankList;
        let myRankStr = result.myRank || '-';
        let mvValueStr = result.myValue || '-';
        const myRank = this.rankChangeUnIn(myRankStr);
        const myValue = this.unInRankChange(mvValueStr);

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
        //滑动列表
        RankList.renderRankList(rankList,'rankGlobal');

        ctx.fillStyle = 'rgba(78,78,78,0.6)';
        ctx.textAlign = 'left';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1 * this.Dpr;
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
            ctx.fillText(myValue,  this.WIDTH - that._cxx(89), that._cyy(1066));
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

        const innerBtn = new Button(CanvasBase.getCanvas('btn'));//好友榜按钮
        innerBtn.origin = {x:this._cxx(400),y:this._cyy(210)};
        innerBtn.size = {width:this._s(120),height:this._s(60)};
        innerBtn.show();
        innerBtn.onClick = function () {
            !!this.gameCtrl.rankInner && this.gameCtrl.rankInner();
        }.bind(this);
        this._updatePlane('bg');
    }
}

export default RankGlobalPage;