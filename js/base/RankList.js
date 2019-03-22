import ScrollHandler from './ScrollHandler';
import * as Config from './Config';
import CanvasBase from './CanvasBase';
import PageBase from './PageBase';

var Dpr = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio; // 当前屏幕的Dpr， i7p 设置3 会挂
var W = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var H = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth; // CSS像素
var HEIGHT = H * Dpr; // 设备像素
var WIDTH = W * Dpr; // 设备像素
var ListLineHeight = 60;
var ListColumnWidth = 90;
var _config = Config;
var frustumSizeHeight = _config.FRUSTUMSIZE; // 动画的尺寸单位坐标高度
var frustumSizeWidth = WIDTH / HEIGHT * frustumSizeHeight; // 动画的尺寸单位坐标高度
var ListLineHeight4PrizeRecord = 90;
var family = 'num_Regular';

class RankList {
    // 创建画布
    constructor (){
        console.log('RankList constructor');
        this.instance = null;
        this.sceneName = '';
        this._touchInfo = {trackingID: -1, maxDy: 0, maxDx: 0};
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
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new RankList();
        }
        return this.instance;
    }

    /**
     * @param res 渲染列表需传进的数据，数组
     * @param sceneName 渲染列表所在界面的名字
     */
    renderRankList(res,sceneName) {

        this.sceneName = sceneName;
        this.sotedRankList = res; // 存下来，滑动的时候用到

        let innerHeight = (this.sotedRankList.length+1) * this._cwh(ListLineHeight) / Dpr;
        let outterOffsetHeight;

        if (sceneName == 'rankGlobal') {
            outterOffsetHeight = this._cwh(445) / Dpr;
        }
        if(sceneName == 'prizeRecord'){
            outterOffsetHeight = this._s(490)/ Dpr;
            innerHeight = (this.sotedRankList.length ) * this._cwh(ListLineHeight4PrizeRecord)/ Dpr;
        }
        if(sceneName == 'prizeRankLast'){
            outterOffsetHeight = this._s(590)/ Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }
        if(sceneName == 'prizeRankMoney'){
            outterOffsetHeight = this._s(805) / Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }
        if(sceneName == 'awardList'){
            outterOffsetHeight = this._s(590)/ Dpr;
            innerHeight = (this.sotedRankList.length) * this._cwh(ListLineHeight) / Dpr;
        }

        let direction = 'y';
        //水平列表
        if (sceneName == 'testHorizontalList'){
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
        if(sceneName == 'prizeRecord'){
            let listNum = 7;
            this._drawRecordList(0, 'list1');
            this._drawRecordList(listNum, 'list2');
            return;
        }else if(sceneName == 'prizeRankLast'){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
            return;
        }else if(sceneName == 'prizeRankMoney'){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
            return;
        }else if (sceneName == 'awardList'){
            //上期排行榜详情
            this._drawMyList(0, 'list1');
            this._drawMyList(10, 'list2');
        }else if(sceneName == 'rankGlobal'){
            this._drawMyList(0, 'list1'); // 绘制滚动列表
            this._drawMyList(10, 'list2'); // 绘制滚动列表
        }else if (this.sceneName == 'testHorizontalList'){
            this._drawHorizontalList(0,'list3');
            this._drawHorizontalList(7,'list4');
        }

    }

    doTouchStartEvent(e) {
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
        this.startX = pageX;
        this.startY = pageY;

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

    doTouchMoveEvent(e) {
        let touchInfo = this._touchInfo;
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        let delta = this._findDelta(e);
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
    }

    doTouchEndEvent(e) {

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
        if (Math.abs(pageX - this.startX) > 5 || Math.abs(pageY - this.startY) > 5) {
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
        let touchInfo = this._touchInfo;
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

    updatePosition(scrollY) {
        let viewS; // 好友/ 群排行
        if (scrollY > 0) {
            // 表头下拉效果
            scrollY = 0;
        }
        let listlength = 10 * this._cwh(ListLineHeight) / HEIGHT * frustumSizeHeight; // list length 在 fust 下的尺寸
        let listlength1 = 10 * this._cwh(ListLineHeight);


        if (this.sceneName == 'rankGlobal') {
            //排行榜详细坐标位置280
            viewS = -(this._cyy(300) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.sceneName == 'prizeRankLast') {
            //获奖榜单上期排行榜坐标位置505
            viewS = -(this._cyy(515) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.sceneName == 'prizeRankMoney') {
            //获奖榜单奖金榜坐标位置290
            viewS = -(this._cyy(300) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.sceneName == 'awardList'){
            viewS = -(this._cyy(430) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
        }
        if (this.sceneName == 'prizeRecord') {
            // 获奖记录坐标位置 ListLineHeight4PrizeRecord
            let listNum = 7;
            listlength = listNum * this._cwh(ListLineHeight4PrizeRecord)/ HEIGHT * frustumSizeHeight;
            listlength1 = listNum * this._cwh(ListLineHeight4PrizeRecord);
            viewS = -(this._cyy(745) + listlength1 / 2 - HEIGHT / 2) / HEIGHT * frustumSizeHeight;
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
                CanvasBase.getObj('list1').position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
                CanvasBase.getObj('list2').position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
            } else {
                CanvasBase.getObj('list2').position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
                CanvasBase.getObj('list1').position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
            }
            this.lastN = n;
            this.lastScrollY = scrollY;
            return;
        }

        //水平列表
        // if (this.canvasType == CANVASTYPE['testHorizontalList']) {
        //     // 获奖记录坐标位置 ListLineHeight4PrizeRecord
        //     let listNum = 7;
        //     listlength = listNum * this._cwh(ListColumnWidth)/ WIDTH * frustumSizeWidth;
        //     listlength1 = listNum * this._cwh(ListColumnWidth);
        //     viewS = (this._cx(0)+listlength1/2 - WIDTH/2) / WIDTH * frustumSizeWidth;
        //     // 滑到第几屏的list
        //     let n = Math.abs(Math.floor((viewS + frustumSizeWidth * scrollY / W) / listlength));
        //     n -= 1;
        //     if (this.lastN != n && this.lastN - n < 0) {
        //         // 下移
        //         if (n % 2 == 0) {
        //             this._drawHorizontalList((n + 1) * listNum, 'list4');
        //         } else {
        //             this._drawHorizontalList((n + 1) * listNum, 'list3');
        //         }
        //     } else if (this.lastN != n && this.lastN - n > 0) {
        //         // 上移
        //         let x = n;
        //         if (x == -1) x = 1;
        //         if (n % 2 == 0) {
        //             this._drawHorizontalList(n * listNum, 'list3');
        //         } else {
        //             this._drawHorizontalList(x * listNum, 'list4');
        //         }
        //     }
        //
        //     if (n % 2 == 0) {
        //         this.obj['list3'].position.x = viewS + frustumSizeWidth * scrollY / W + n * listlength;
        //         this.obj['list4'].position.x = viewS + frustumSizeWidth * scrollY / W + (n + 1) * listlength;
        //     } else {
        //         this.obj['list4'].position.x = viewS + frustumSizeWidth * scrollY / W + n * listlength;
        //         this.obj['list3'].position.x = viewS + frustumSizeWidth * scrollY / W + (n + 1) * listlength;
        //     }
        //     this.lastN = n;
        //     this.lastScrollY = scrollY;
        //     return;
        // }

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
            CanvasBase.getObj('list1').position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
            CanvasBase.getObj('list2').position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
        } else {
            CanvasBase.getObj('list2').position.y = viewS - frustumSizeHeight * scrollY / H - n * listlength;
            CanvasBase.getObj('list1').position.y = viewS - frustumSizeHeight * scrollY / H - (n + 1) * listlength;
        }
        this.lastN = n;
        this.lastScrollY = scrollY;
    }

    _drawRecordList(offset,type){
        //获奖记录列表内容
        if(this.sceneName != 'prizeRecord'){
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
        let ctx = CanvasBase.getContext(type);
        ctx.clearRect(0, 0, WIDTH, limit * lineH);
        ctx.fillStyle = 'rgba(255,255,255,1.0)';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0, 0, WIDTH, limit * this._cwh(lineH)); //list 底色为白色

        if (offset != 0 && list.length == 0) {
            // 最后面列表结束显示白色屏幕就可以，不显示
            CanvasBase.getTexture(type).needsUpdate = true;
            CanvasBase.getObj(type).visible = true;
            // this._updatePlane(type);
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
        if(this.sceneName != 'prizeRecord'){
            return;
        }
        // this._updatePlane(type);
        CanvasBase.getTexture(type).needsUpdate = true;
        CanvasBase.getObj(type).visible = true;
    }

    _drawMyList(offset,type){
        if (this.sceneName != 'rankGlobal' && this.sceneName!='prizeRankLast' && this.sceneName!='prizeRankMoney' && this.sceneName!='awardList'){
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
        let ctx = CanvasBase.getContext(type);
        ctx.clearRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight));

        ctx.fillStyle = 'rgba(255,255,255,1.0)';
        ctx.textBaseline = 'middle';
        ctx.fillRect(0, 0, WIDTH, 10 * this._cwh(ListLineHeight)); //list 底色为白色

        if (offset != 0 && list.length == 0) {
            // 最后面列表结束显示白色屏幕就可以，不显示
            CanvasBase.getTexture(type).needsUpdate = true;
            CanvasBase.getObj(type).visible = true;
            // this._updatePlane(type);
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
                if (_this.sceneName == 'prizeRankMoney'){
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
                }else if (_this.sceneName=='prizeRankLast' || _this.sceneName=='awardList'){
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
                if (_this.sceneName == 'prizeRankMoney'){
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
                }else if (_this.sceneName=='prizeRankLast' || _this.sceneName=='awardList'){
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
                if (_this.sceneName == 'prizeRankMoney'){
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
                }else if (_this.sceneName=='prizeRankLast' || _this.sceneName=='awardList'){
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

            if(_this.sceneName == 'prizeRankLast'||_this.sceneName == 'prizeRankMoney'||_this.sceneName == 'rankGlobal'||_this.sceneName == 'rankLeCard'||_this.sceneName == 'awardList'){
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
        if (this.sceneName!='rankGlobal' && this.sceneName!='prizeRankLast' && this.sceneName!='prizeRankMoney'  && this.sceneName!='awardList'){
            return;
        }
        CanvasBase.getTexture(type).needsUpdate = true;
        CanvasBase.getObj(type).visible = true;
        // this._updatePlane(type);
    }

    _drawHorizontalList(offset,type){
        //获奖记录列表内容
        if(this.sceneName != 'testHorizontalList'){
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
        let ctx = CanvasBase.getContext(type);
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
        if(this.sceneName != 'testHorizontalList'){
            return;
        }
        this._updatePlane(type);
    }


    //-------工具函数--------
    _cf(size, is_num) {
        // font size
        let realf = size * Dpr * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realf = size * Dpr * H / 736;
        }
        if (!!is_num && !!family) return realf + ('px ' + family); else return realf + 'px Helvetica';//px Helvetica
    }

    _cy(y) {
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

    _cyy(y){
        let cyY = y * 736 / 1334;
        let realY = this._cy(cyY);
        return realY;
    }

    _cwh(x) {
        let realx = x * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realx = x * H / 736;
        }
        return realx * Dpr;
    }

    _s(x) {
        let cxX =( x / Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    }

    _cxx(x){
        //按照实际尺寸，换算成414*736
        let cxX =( x / Dpr )* 414 / 375;
        let realX = this._cx(cxX);
        return realX;
    }

    _cx(x) {
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

    formatDateTime(inputTime,type) {
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

    }

    _drawImageCenter(src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        console.log('PageBase _drawImageCenter');
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片

        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        this._loadImg(src, x, y, width, height, type, function (img) {
            if (img){
                CanvasBase.getContext(type).drawImage(img, x - width / 2, y - height / 2, width, height);
            }
            !!cb && cb(img);
            if (!noupdate){
                that._updatePlane(type); // 更新画布
            }
        }, imgid, errImg);
    }

    _loadImg(src, x, y, width, height, type, cb, imgid, errImg){
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
    }

    _drawImageCircle(src, x, y, width, height, type, cb, imgid, noupdate,errImg) {
        // imgid 是渲染时候的imgid， 在每次改变画布的时候自增
        // 以xy为中心来显示一副图片
        if (src == '/0' || src == '/96' || src == '/64' || !src) {
            src = 'res/img/ava.png';
        }
        const that = this;
        let ctx = CanvasBase.getContext(type);

        this._loadImg(src, x, y, width, height, type, function (img) {

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

        }, imgid,errImg);
    }

    _circleRectR(x, y, width, height, radius, type) {
        let ctx = CanvasBase.getContext(type);
        ctx.beginPath();
        ctx.arc(x+width/2.0,y+height/2.0,Math.min(width,height)/2.0,0,2*Math.PI);
        ctx.stroke();
        ctx.closePath();
    }

    _updatePlane(type) {
        console.log('PageBase updatePlane');
        CanvasBase.getTexture(type).needsUpdate = true;
        CanvasBase.getObj(type).visible = true;
    }

    number2MinSec(num){
        if (num<0){
            return '0\'0"';
        }
        let min = Math.floor(num/60);
        let sec = Math.floor(num%60);
        return min+'\''+sec+'"';
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
export default RankList.getInstance();