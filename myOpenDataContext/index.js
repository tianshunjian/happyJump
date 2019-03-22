import ScrollHandler from './ScrollHandler';

// 设备屏幕宽高
let width = wx.getSystemInfoSync().screenWidth;
let height = wx.getSystemInfoSync().screenHeight;

// 设备屏幕宽高
let W = width;
let H = height;
let Dpr = wx.getSystemInfoSync().pixelRatio>2? 2 : wx.getSystemInfoSync().pixelRatio;
const WIDTH = W * Dpr;
const HEIGHT = H * Dpr;

// 排行榜绘制状态
let rankingStatus = false;

let _touchInfo = {trackingID: -1, maxDy: 0, maxDx: 0};
let ListLineHeight = 60; //行高
let sotedRankList; //数据列表

let currentScene = '';//设定当前场景，控制绘图

let openCache = {}; //好友榜缓存
let openOn = false; //开放域点击事件开关

//结果页的艺术字路径
const ScoreOver = [
    'res/img/number/0.png',
    'res/img/number/1.png',
    'res/img/number/2.png',
    'res/img/number/3.png',
    'res/img/number/4.png',
    'res/img/number/5.png',
    'res/img/number/6.png',
    'res/img/number/7.png',
    'res/img/number/8.png',
    'res/img/number/9.png'
];
//排行榜数字：0~9，黑色
const rankNumBlack = [
    'res/img/number/rankNumBlack/0.png',
    'res/img/number/rankNumBlack/1.png',
    'res/img/number/rankNumBlack/2.png',
    'res/img/number/rankNumBlack/3.png',
    'res/img/number/rankNumBlack/4.png',
    'res/img/number/rankNumBlack/5.png',
    'res/img/number/rankNumBlack/6.png',
    'res/img/number/rankNumBlack/7.png',
    'res/img/number/rankNumBlack/8.png',
    'res/img/number/rankNumBlack/9.png'
];
//排行榜数字：0~9，黄色
const rankNumYellow = [
    'res/img/number/rankNumYellow/0.png',
    'res/img/number/rankNumYellow/1.png',
    'res/img/number/rankNumYellow/2.png',
    'res/img/number/rankNumYellow/3.png',
    'res/img/number/rankNumYellow/4.png',
    'res/img/number/rankNumYellow/5.png',
    'res/img/number/rankNumYellow/6.png',
    'res/img/number/rankNumYellow/7.png',
    'res/img/number/rankNumYellow/8.png',
    'res/img/number/rankNumYellow/9.png'
];
//排行榜数字：0~9，灰色
const rankNumGrey = [
    'res/img/number/rankNumGrey/4.png',
    'res/img/number/rankNumGrey/5.png',
    'res/img/number/rankNumGrey/6.png',
];

let sharedCanvas,cvs,itemCanvas,ctx; //低版本不支持参数的声明

var sysInfo = wx.getSystemInfoSync();
if (sysInfo.SDKVersion >= '1.9.92'){
    //版本判断，高版本展示开放域
    /**
     * 微信文档规定：sharedCanvas 的宽高只能在主域设置
     */
    console.log('进入开放域');

    // 子域Canvas
    sharedCanvas = wx.getSharedCanvas();
    cvs = sharedCanvas.getContext('2d');

    // 排行榜详细
    itemCanvas = wx.createCanvas();
    ctx = itemCanvas.getContext('2d');

}else{
    console.log('版本低，不支持sharedcanvas');
}


/**
 * 好友榜初始化外框，cvs,画分割线
 */
function initFrame(type) {

    // 还原画布状态
    cvs.restore();//返回之前保存的设置

    // 保存画布状态
    cvs.save();//保存上下文状态，只保存绘图上下文的设置和变换，不会保存绘图上下文的内容

    // 清除画布
    cvs.clearRect(0, 0, WIDTH, HEIGHT);
    cvs.strokeStyle = 'rgba(78,78,78,0.6)';
    cvs.lineWidth = 1 * Dpr;
    cvs.beginPath();
    cvs.moveTo(_cxx(93), _cyy(985));
    cvs.lineTo(_cxx(653), _cyy(985));
    cvs.stroke();
    cvs.closePath();
}

function overFriendRank(scene,opt,threeListY,me) {
    // 还原画布状态
    // console.log('首页局部开放域绘画');
    cvs.restore();//返回之前保存的设置
    // 保存画布状态
    cvs.save();//保存上下文状态，只保存绘图上下文的设置和变换，不会保存绘图上下文的内容
    cvs.clearRect(0, 0, WIDTH, HEIGHT);
    switch (scene){
    case 'overNewRecord':
        // console.log('overFriendRank--overNewRecord');
        {
            let overNum = 0;
            if (opt && opt.length > 0) {
            //超过好友展示的界面
                cvs.fillStyle = 'rgba(78,78,78,0.9)';
                cvs.strokeStyle = 'rgba(78,78,78,0.9)';
                _roundedRectR(_cxx(50), _cyy(257), _s(650), _s(584), 10 * Dpr, cvs);
                cvs.fill();
                let score = me.newScore.toString();
                let perWidth = 64;
                let perInnerWidth = 6;
                var lengthSum = score.length * perWidth + perInnerWidth * (score.length - 1);
                for (let i = 0; i < score.length; i++) {
                    drawImageCenter(ScoreOver[score[i]], _cxx(375 - lengthSum / 2 + perWidth / 2 + i * perWidth + perInnerWidth * i - perWidth / 2), _cyy(407), _s(perWidth), _s(100));
                }
                cvs.strokeStyle = 'rgba(255,255,255,0.2)';
                cvs.lineWidth = 1 * Dpr;
                cvs.beginPath();
                cvs.moveTo(_cxx(50), _cyy(745));
                cvs.lineTo(_cxx(700), _cyy(745));
                cvs.stroke();
                cvs.closePath();
                cvs.textBaseline = 'middle';
                cvs.textAlign = 'center';
                cvs.fillStyle = '#fff';
                cvs.font = '28px Arial';
                cvs.fillText('查看全部排行榜 >', _cxx(375), _cyy(776 + 13));
                let x;
                switch (opt.length) {
                case 1:
                    x = [375 - 40];
                    break;
                case 2:
                    x = [275, 395];
                    break;
                case 3:
                    x = [215, 335, 455];
                    break;
                case 4:
                    x = [157, 274, 394, 514];
                    break;
                default:
                    x = [110, 230, 350, 470];
                    cvs.fillStyle = 'rgba(153,153,153,1)';
                    cvs.textAlign = 'left';
                    cvs.textBaseline = 'middle';
                    cvs.font = '80px Arial';
                    cvs.fillText('...', _cxx(590), _cyy(threeListY[1] - 40));
                    break;
                }
                overNum = opt.length.toString();
                if (opt.length > 4) {
                    opt.length = 4;
                }
                for (let i = 0; i < opt.length; i++) {
                    drawCircleImage(opt[i].avatarUrl, _cxx(x[i]), _cyy(threeListY[1] - 20 - 40), _s(80), _s(80), cvs);
                }
                cvs.fillStyle = 'rgba(255,255,255,0.6)';
                cvs.textAlign = 'center';
                cvs.textBaseline = 'middle';
                cvs.textBaseline = 'middle';
                cvs.font = '28px Arial';
                cvs.fillText('新排名超越' + overNum + '位好友', _cxx(375), _cyy(threeListY[0] - 13));
                drawImageCenter('res/img/second/jilu.png', _cxx(375 - 485 / 2), _cyy(187), _s(485), _s(196));
            } else {
            //没有超过好友展示的界面
                cvs.fillStyle = 'rgba(78,78,78,0.9)';
                cvs.strokeStyle = 'rgba(78,78,78,0.9)';
                _roundedRectR(_cxx(50), _cyy(374), _s(650), _s(463.8), 10 * Dpr, cvs);
                cvs.fill();
                drawImageCenter('res/img/second/jilu.png', _cxx(375 - 485 / 2), _cyy(400 - 196 / 2), _s(485), _s(196));
                let score = me.newScore.toString();
                let perWidth = 64;
                let perInnerWidth = 6;
                let lengthSum = score.length * perWidth + perInnerWidth * (score.length - 1);
                for (let i = 0; i < score.length; i++) {
                    drawImageCenter(ScoreOver[score[i]], _cxx(375 - lengthSum / 2 + perWidth / 2 + i * perWidth + perInnerWidth * i - perWidth / 2), _cyy(595 - 50), _s(perWidth), _s(100));
                }
                //画线
                cvs.strokeStyle = 'rgba(255,255,255,0.2)';
                cvs.lineWidth = 1 * Dpr;
                cvs.beginPath();
                cvs.moveTo(_cxx(50), _cyy(745));
                cvs.lineTo(_cxx(700), _cyy(745));
                cvs.stroke();
                cvs.closePath();
                cvs.textBaseline = 'middle';
                cvs.textAlign = 'center';
                cvs.fillStyle = '#fff';
                cvs.font = '26px Arial';
                cvs.fillText('查看全部排行榜 >', _cxx(375), _cyy(776 + 13));
            }
        }
        break;
    default:
        // console.log('overFriendRank--default');
        if(opt){
            let sharedCanvas = wx.getSharedCanvas();
            let cvs = sharedCanvas.getContext('2d');
            let x = [160,375,590];
            if(scene == 'start'){
                threeListY = [760,826,895,936,726,974,1018];
            }else if(scene == 'overNormal'){
                threeListY = [534,598,670,715,498,746,790];
            }
            let y = threeListY;
            cvs.clearRect(0, 0, WIDTH, HEIGHT);
            cvs.fillStyle = 'rgba(78,78,78,0.9)';
            cvs.strokeStyle =  'rgba(78,78,78,0.9)';
            _roundedRectR(_cxx(50),_cyy(y[4]),_s(650),_s(340),13*Dpr,cvs);
            cvs.fill();
            cvs.fillStyle = 'rgba(97,97,97,0.9)';
            cvs.fillRect(_cxx(268),_cyy(y[4]),_s(214),_s(248));
            cvs.strokeStyle = 'rgba(255,255,255,0.2)';
            cvs.lineWidth = 1 * Dpr;
            cvs.beginPath();
            cvs.moveTo(_cxx(48), _cyy(y[5]));
            cvs.lineTo(_cxx(698), _cyy(y[5]));
            cvs.stroke();
            cvs.closePath();
            cvs.fillStyle = '#fff';
            cvs.textAlign = 'center';
            cvs.textBaseline = 'middle';
            cvs.font = '26px Arial';
            cvs.fillText('查看全部排行榜  >',_cxx(375),_cyy(y[6]));

            for(let i = 0;i < 3;i++){
                if(opt[i]){
                    console.log('opt---threeList--'+ JSON.stringify(opt[i]));
                    if(i == 1){
                        cvs.fillStyle = '#ffc600';
                    }else{
                        cvs.fillStyle = 'rgba(255,255,255,0.6)';
                    }
                    cvs.textAlign = 'center';
                    cvs.textBaseline = 'middle';
                    cvs.font = '26px Arial';
                    if(opt[i].ranking == '-'){
                        cvs.fillText(opt[i].ranking,_cxx(x[i]),_cyy(y[0]));
                    }else{
                        cvs.fillText(opt[i].ranking+1,_cxx(x[i]),_cyy(y[0]));
                    }

                    if(opt[i].nickName.length>5){
                        opt[i].nickName = opt[i].nickName.substr(0,5)+'...';
                    }
                    drawCircleImage(opt[i].avatarUrl,_cxx(x[i]-40),_cyy(y[1]-40),_s(80),_s(80),cvs);
                    cvs.font = '26px Arial';
                    cvs.fillStyle = 'rgba(255,255,255,0.6)';
                    cvs.fillText(opt[i].nickName,_cxx(x[i]),_cyy(y[2]));
                    cvs.fillStyle = '#fff';
                    cvs.fillText(opt[i].score,_cxx(x[i]),_cyy(y[3]));
                }
            }
        }
        break;
    }
}

/**
 * 初始化排行榜详细，6项，设置itemCanvas宽高，ctx
 */
function initRankingItems(items) {
    // 最少绘制6个详细项
    let length = items && items.length > 6 ? items.length : 6;

    // 每项高度
    let itemHeight = _cwh(ListLineHeight) ;

    // 设置排行榜详细的宽高 基于外框绘制

    //这两行注掉，否则好友榜展示会引起游戏中2d图片加载异常
    itemCanvas.width = _cxx(570);
    itemCanvas.height = itemHeight * length;

    // 清除画布
    ctx.clearRect(0, 0, _cxx(645), _s(670));
    if (items) {
        // 绘制详细内容
        if(items.length == 0){
            ctx.fillStyle = 'rgba(78,78,78,0.6)';
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('暂无好友数据', _cxx(275), _cxx(375));
        }else{
            items.map((item, index) => {
                drawRankingNum(index+1, index * itemHeight);
                drawHead(item['avatarUrl'], index * itemHeight);
                drawNickName(item['nickName'], index * itemHeight);
                drawScore(item['score'], index * itemHeight);
            });
        }

        // 绘制排行榜详细到子域
        drawRankingItems(0);

        // 排行榜绘制完成
        rankingStatus = true;
    } else {
        console.error('未找到排行榜数据');
    }
}

/**
 * 画圆形头像，ctx
 */
function drawCircleImage(src,x,y,w,h,ctx,callback,scene) {

    if(!src || src == 'null' || src.length == 0){
        src = 'res/img/ava.png';
    }

    let img = wx.createImage();
    img.src = src;
    img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0)';
        ctx.arc(x+w/2.0,y+h/2.0,Math.min(w,h)/2.0,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();
        if(scene){
            if(scene != 'friend'){
                return;
            }
        }
        ctx.drawImage(img, x, y,w,h);
        ctx.closePath();
        ctx.restore();
        callback && callback();
    };
}

/**
 * 初始化自己的排行,cvs
 */
function initOwnRanking(me,own) {

    // 名次
    let rankingNum = '未上榜';
    let src = me.avatar;
    let nickname = me.nickname;
    let score = '-';
    if (own){
        rankingNum = own['ranking'] + 1;
        src = own['avatarUrl'];
        nickname = own['nickName'];
        score = own['score'];
        if(score < 0){
            score = '-' ;
        }
        if(rankingNum <= 0){
            rankingNum = '未上榜';
        }
    }

    // 名次从0开始
    cvs.fillStyle = '#4e4e4e';

    if(rankingNum == '未上榜'){
        cvs.font = '23px Arial';
        cvs.fillStyle = 'rgba(78,78,78,1)';
        cvs.textAlign = 'center';
        cvs.fillText(rankingNum, _cxx(128), _cyy(1080));
    }else{
        let item = rankingNum.toString();
        let perWidth = 20;
        let perHeight = 24;
        let perInnerWidth = 1;
        let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
        for(let i = 0 ;i < item.length;i++){
            drawImageCenter(rankNumBlack[item[i]], _cxx(110-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), _cyy(1055), _s(perWidth), _s(perHeight));
        }
    }
    // 头像
    drawCircleImage(src, _cxx(180), _cyy(1037),_s(60),_s(60),cvs,null,'friend');

    // 昵称
    cvs.fillStyle = '#4e4e4e';
    cvs.font = '26px Arial';
    cvs.textAlign = 'left';
    if(nickname.length > 8){
        nickname = nickname.substr(0,8)+'...';
    }
    cvs.fillText(nickname, _cxx(255), _cyy(1076));

    // 分数
    if(score.toString() == '-'){
        cvs.fillStyle = '#4e4e4e';
        cvs.font = '32px Arial';
        cvs.textAlign = 'right';
        cvs.fillText(score, WIDTH - _cxx(89), _cyy(1080));
    }else{
        let item = score.toString().split('').reverse().join('');
        let perWidth = 20;
        let perHeight = 24;
        let perInnerWidth = 1;
        for(let i = 0;i < item.length;i++){
            drawImageCenter(rankNumBlack[item[i]], _cxx(750-100-perWidth/2-i*perWidth - perInnerWidth*i), _cyy(1055), _s(perWidth), _s(perHeight));
        }
    }
}

/**
 * 绘制名次,ctx
 */
function drawRankingNum(num, y) {
    let item = num.toString();
    let perWidth = 20;
    let perHeight = 24;
    let perInnerWidth = 1;
    let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
    if(num < 4){
        for(let i = 0 ;i < item.length;i++){
            drawImageCenter1(rankNumYellow[parseInt(item[i])], _cxx(15-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y+35, _s(perWidth), _s(perHeight));
        }
    }else if(num > 3 && num < 7){
        for(let i = 0 ;i < item.length;i++){
            drawImageCenter1(rankNumGrey[parseInt(item[i])-4], _cxx(15-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y+35, _s(perWidth), _s(perHeight));
        }
    }else{
        for(let i = 0 ;i < item.length;i++){
            drawImageCenter1(rankNumBlack[parseInt(item[i])], _cxx(15-lengthSum/2+perWidth/2+i*perWidth + perInnerWidth*i), y+35, _s(perWidth), _s(perHeight));
        }
    }
}

/**
 * 绘制头像,ctx,调用drawRankingItems(0)
 */
function drawHead(url, y) {

    drawCircleImage(url, _cxx(85), y + 17, _s(60), _s(60),ctx,function () {
        drawRankingItems(0);
    });
}

/**
 * 绘制昵称，ctx
 */
function drawNickName(nickName, y) {
    ctx.fillStyle = '#4e4e4e';
    ctx.font = '26px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(nickName, _cxx(171), y + 60);
}

/**
 * 绘制分数，ctx
 */
function drawScore(score, y) {
    let indexForScore = y /_s(108);
    let item = indexForScore.toString();
    let perWidth = 20;
    let perHeight = 24;
    let perInnerWidth = 1;
    let lengthSum = item.length * perWidth + perInnerWidth*(item.length - 1);
    if(indexForScore < 3){
        let item = score.toString().split('').reverse().join('');
        for(let i = 0;i < item.length;i++){
            drawImageCenter1(rankNumYellow[item[i]], _cxx(558-perWidth/2-i*perWidth - perInnerWidth*i), y+35, _s(perWidth), _s(perHeight));
        }
    }else{
        let item = score.toString().split('').reverse().join('');
        for(let i = 0;i < item.length;i++){
            drawImageCenter1(rankNumBlack[item[i]], _cxx(558-perWidth/2-i*perWidth - perInnerWidth*i), y+35, _s(perWidth), _s(perHeight));
        }
    }
}

/**
 * 绘制排行榜详细,切割图片，绘图，cvs
 */
function drawRankingItems(y) {
    // 清除画布
    if(currentScene != 'friend'){
        return;
    }
    cvs.clearRect(_cxx(50), _cyy(277), _cxx(650), _s(685));
    cvs.fillStyle = '#fff';
    cvs.fillRect(_cxx(50), _cyy(277), _cxx(650), _s(695));
    // 绘制到子域
    cvs.drawImage(itemCanvas, 0, y, _cxx(570),_s(650), _cxx(94), _cyy(307), _cxx(570), _s(653));
}

let gameData;
/**
 * 获取好友排行榜
 */
function getFriendRanking(key, me, scene) {
    // 初始化外框
    //好友榜绘画，判断缓存
    if(scene == 'friend'){
        initFrame(1);
        if(JSON.stringify(openCache) != '{}'){
            initRankingItems(openCache.cacheData);
            renderRankList(openCache.cacheData);
            initOwnRanking(openCache.cacheMe,openCache.cacheOwn);
            console.log('开放域数据走缓存');
            return;
        }
    }

    // 获取好友数据
    wx.getFriendCloudStorage({
        keyList: [key],
        success: result => {
            // console.log('好友榜数据--'+JSON.stringify(result));
            if (result['data'].length !== 0) {
                gameData = groupGameData(result['data'], key, me.openId, me, scene);
                switch (scene){
                case 'friend':
                    openCache = {
                        cacheData:gameData['ranking'],
                        cacheMe:me,
                        cacheOwn:gameData['own']
                    };
                    initRankingItems(gameData['ranking']);
                    renderRankList(gameData['ranking']);
                    initOwnRanking(me,gameData['own']);
                    break;
                case 'start':
                    overFriendRank('start',gameData['threeList'],me.threeListY,me);
                    break;
                case 'overNewRecord':
                    overFriendRank('overNewRecord',gameData['overNewRecord'],me.overY,me);
                    break;
                case 'overNormal':
                    overFriendRank('overNormal',gameData['threeList'],me.threeListY);
                    break;
                }

            } else {
                console.error('无数据记录');
            }
        },
        fail:function () {
            console.log('好友榜数据获取失败');
        }
    });
}


/**
 * 分组游戏数据
 */
function groupGameData(data, key, openId,me,scene) {
    let gameData = {}, array = [];
    // console.log('data+'+JSON.stringify(data));
    //将数据存入数组
    for(let i = 0;i < data.length;i++){
        if(data[i]['KVDataList'].length !== 0){
            //分数大于0的，存入数组
            if(data[i].KVDataList[0].value > 0){
                array.push({
                    openId: data[i].openid,
                    avatarUrl: data[i].avatarUrl,
                    nickName: data[i].nickname.length < 9 ? data[i].nickname : data[i].nickname.substr(0, 8)+'...',
                    score: data[i].KVDataList[0].value
                });
            }
        }
    }

    if(array.length > 0 ){

        //排序
        let compare = function (prop) {
            return function (obj1, obj2) {
                let val1 = obj1[prop];
                let val2 = obj2[prop];
                if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                    val1 = Number(val1);
                    val2 = Number(val2);
                }
                if (val1 > val2) {
                    return -1;
                } else if (val1 < val2) {
                    return 1;
                } else {
                    return 0;
                }
            };
        };
        array.sort(compare('score'));
        gameData['ranking'] = array;

        let lastRank = null;
        let ownRank = null;
        let nextRank = null;

        // 获取自己的排名
        for (let i = 0; i < array.length; i++) {
            let item = array[i];
            if (item['openId'] === openId) {
                item['ranking'] = i;
                gameData['own'] = item;
                ownRank = item;
                break;
            }
        }

        //用于首页和结束页的好友榜局部列表，自己排名，前后好友排名
        if(scene == 'start' || scene == 'overNormal'){
            if(ownRank && ownRank.openId){
                //自己有数据，且非0
                if(array.length > 1){
                    if(ownRank.ranking == 0){
                        //第一名
                        nextRank = array[ownRank.ranking+1];
                        nextRank['ranking'] = ownRank.ranking+1;
                    }else if(ownRank.ranking == array.length-1){
                        //最后一名
                        lastRank = array[ownRank.ranking-1];
                        lastRank['ranking'] = ownRank.ranking-1;
                    }else{
                        //中间
                        lastRank = array[ownRank.ranking-1];
                        lastRank['ranking'] = ownRank.ranking-1;
                        nextRank = array[ownRank.ranking+1];
                        nextRank['ranking'] = ownRank.ranking+1;
                    }
                }
                gameData['threeList'] = [lastRank,ownRank,nextRank];
            }else{
                //自己分数为0，未上榜
                // ownRank = {score:0,ranking:'-',nickName:me.nickname,avatarUrl:me.avatar};
                gameData['threeList'] = null;
            }
        }

        if(scene == 'overNewRecord'){
            let catchUpFriendArray = [];
            if(gameData['own']){
                for(let i = 0; i < array.length;i++){
                    if(parseInt(array[i].score) < parseInt(gameData['own'].score)){
                        catchUpFriendArray.push(array[i]);
                    }
                }
            }
            console.log('catchUpFriendArray'+JSON.stringify(catchUpFriendArray));
            gameData['overNewRecord'] = catchUpFriendArray;
        }

    }else{
        gameData['ranking'] = array;
        gameData['own'] = {score:-1,ranking:-1,nickName:me.nickname,avatarUrl:me.avatar};
        gameData['threeList'] = null ;
        gameData['overNewRecord'] = null;
    }

    return gameData;
}



/**
 * 监听主域消息
 */
wx.onMessage(data => {
    switch (data['type']) {
    case 'friend':
        currentScene = 'friend';
        getFriendRanking(data['key'], data['me'],'friend');
        openOn = true;
        console.log('friend开放域已监听到主域消息');
        break;
    case 'start':
        currentScene = 'threeList';
        getFriendRanking(data['key'], data['me'],'start');
        console.log('threeList开放域已监听到主域消息');
        break;
    case 'overNewRecord':
        currentScene = 'threeList';
        getFriendRanking(data['key'], data['me'],'overNewRecord');
        console.log('overNewRecord开放域已监听到主域消息');
        break;
    case 'overNormal':
        currentScene = 'overNormal';
        getFriendRanking(data['key'], data['me'],'overNormal');
        console.log('overNormal开放域已监听到主域消息');
        break;
    case 'cache':
        currentScene = 'cache';
        openCache = {};
        console.log('开放域缓存已清除');
        break;
    case 'openOff':
        currentScene = 'openOff';
        openOn = false;
        break;
    }
});

let scrollHandler;

/**
 * 触摸开始事件
 */
wx.onTouchStart(event =>{
    if(!openOn){
        return;
    }
    // console.log('wx.onTouchStart');
    let touchInfo = _touchInfo;
    let listener = scrollHandler;
    if (!listener) return;

    touchInfo.trackingID = 'touch';
    touchInfo.x = event.touches[0].pageX;
    touchInfo.y = event.touches[0].pageY;

    touchInfo.maxDx = 0;
    touchInfo.maxDy = 0;
    touchInfo.historyX = [0];
    touchInfo.historyY = [0];
    touchInfo.historyTime = [ + new Date()];
    touchInfo.listener = listener;
    if (listener.onTouchStart) {
        listener.onTouchStart();
    }
});
/**
 * 触摸移动事件
 */
wx.onTouchMove(event => {
    if(!openOn){
        return;
    }
    // console.log('wx_touchMove')
    let touchInfo = _touchInfo;
    if (touchInfo.trackingID == -1) return;
    // event.preventDefault();
    let delta = _findDelta(event);
    if (!delta) return;
    touchInfo.maxDy = Math.max(touchInfo.maxDy, Math.abs(delta.y));
    touchInfo.maxDx = Math.max(touchInfo.maxDx, Math.abs(delta.x));

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

});

/**
 * 触摸移除事件
 */
wx.onTouchEnd(event => {
    if(!openOn){
        return;
    }
    // console.log('wx_touchEnd')
    let touchInfo = _touchInfo;
    if (touchInfo.trackingID == -1) return;
    // event.preventDefault();
    let delta = _findDelta(event);
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

});


function renderRankList(res) {
    //滑动使用ScrollHandler
    let outterOffsetHeight;
    sotedRankList = res; // 存下来，滑动的时候用到
    let innerHeight = (sotedRankList.length) * _cwh(ListLineHeight); // 内部列表高度
    outterOffsetHeight = _s(687);// 外部容器高度
    scrollHandler = new ScrollHandler({
        innerOffsetHeight: innerHeight, // 个数 * 每一行的高度百分比 * 总高度
        outterOffsetHeight: outterOffsetHeight,
        updatePosition: updatePosition,
    });
}

function updatePosition(scrollY) {
    //更新位置
    if (scrollY > 0) {
        // 表头下拉效果
        scrollY = 0;
    }
    drawRankingItems(-scrollY);
}

function _findDelta(e) {
    //移动
    let touchInfo = _touchInfo;
    let touches = e.touches[0] || e.changedTouches[0];
    if (touches) return {x: touches.pageX - touchInfo.x, y: touches.pageY - touchInfo.y};
    return null;
}


/**
 * 工具函数
 */
function _cx(x) {
    // change x
    // x 为 在 414*736 屏幕下的，标准像素的 x ，即为设计图的x的px值
    // realx 表示在当前屏幕下，应该得到的x值，这里所有屏幕画布将按照x轴缩放
    let realx = x * W / 414;
    if (H / W < 736 / 414) {
        // 某4
        realx = x * H / 736 + (W - H * 414 / 736) / 2;
    }
    return realx * Dpr;
}
function _cxx(x){
    //按照实际尺寸，换算成414*736
    let cxX =( x / Dpr )* 414 / 375;
    let realX = _cx(cxX);
    return realX;
}
function _cy(y) {
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
}
function _cyy(y){
    let cyY = y * 736 / 1334;
    let realY = _cy(cyY);
    return realY;
}
function _s(x) {
    let cxX =( x / Dpr )* 414 / 375;
    let realX = _cx(cxX);
    return realX;
}
function _cwh(x) {
    let realx = x * W / 414;
    if (H / W < 736 / 414) {
        // 某4
        realx = x * H / 736;
    }
    return realx * Dpr;
}
function drawImageCenter(res,x,y,w,h) {
    let image = wx.createImage();
    image.src = res;
    image.onload = () => {
        cvs.drawImage(image, x, y, w, h);
        image = null;
    };
}
function drawImageCenter1(res,x,y,w,h) {
    let image = wx.createImage();
    image.src = res;
    image.onload = () => {
        ctx.drawImage(image, x, y, w, h);
        image = null;
    };
}
function _roundedRectR(x, y, width, height, radius, cvs) {
    cvs.beginPath();
    cvs.moveTo(x, y + radius - 1);
    cvs.lineTo(x, y + height - radius);
    cvs.quadraticCurveTo(x, y + height, x + radius, y + height);
    cvs.lineTo(x + width - radius, y + height);
    cvs.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    cvs.lineTo(x + width, y + radius);
    cvs.quadraticCurveTo(x + width, y, x + width - radius, y);
    cvs.lineTo(x + radius, y); // 终点
    cvs.quadraticCurveTo(x, y, x, y + radius);
    cvs.stroke();
    cvs.closePath();
}