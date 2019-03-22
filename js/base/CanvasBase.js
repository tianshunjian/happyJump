import * as THREE from '../libs/three/three.min';
import * as Config from './Config';

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

class CanvasBase{
    // 创建画布
    constructor (){
        console.log('CanvasBase constructor');
        this.instance = null;
        this.planList = ['btn','list1', 'list2','list3', 'list4', 'bg', 'nine'];
        this.canvas = {};
        this.context = {};
        this.texture = {};
        this.material = {};
        this.geometry = {};
        this.obj = {};
        this.camera = null;

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
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new CanvasBase();
        }
        return this.instance;
    }

    //创建画板
    createPlane(camera){
        console.log('CanvasBase createPlane');

        this.camera = camera;
        for (let i = 0; i < this.planList.length; i++) {
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

            const mrTexture = new THREE.CanvasTexture(this.canvas[this.planList[i]]);

            this.material[this.planList[i]] = new THREE.MeshBasicMaterial({
                map: mrTexture,
                transparent: true,
            });

            this.texture[this.planList[i]] = mrTexture;
            if (this.planList[i] == 'list1' || this.planList[i] == 'list2') {
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(frustumSizeWidth, 10 * this._cwh(ListLineHeight) / HEIGHT * frustumSizeHeight);
            } else if (this.planList[i] == 'list3' || this.planList[i] == 'list4'){
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(7 * this._cwh(ListColumnWidth) / WIDTH * frustumSizeWidth, frustumSizeHeight);
            } else {
                this.geometry[this.planList[i]] = new THREE.PlaneGeometry(frustumSizeWidth, frustumSizeHeight);
            }

            this.mrObj = new THREE.Mesh(this.geometry[this.planList[i]], this.material[this.planList[i]]);
            this.mrObj.position.y = 0; // 上下
            this.mrObj.position.x = 0; // 左右
            this.mrObj.position.z = 11 - i * 0.001; // 前后 -1 - scrollBar , -2 background, -3 list 1, -4 list 2
            this.obj[this.planList[i]] = this.mrObj;
            this.material[this.planList[i]].map.minFilter = THREE.LinearFilter;

            camera.add(this.mrObj); //挂载到camera

            canvas.mrTexture = mrTexture;
            canvas.mrObj = this.mrObj;
            if (window.WechatGame){
                canvas.onUpdate(function (canvas) {
                    canvas.mrTexture.needsUpdate = true;
                    canvas.mrObj.visible = true;
                });
            }
        }
    }

    //获取开放域环境
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
    }

    //开放域展示
    openDisplay(sharedCanvas){
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
        this.camera.add(sharedCanvas.mrObj);
    }

    //开放域更新
    update(){
        let openDataContext = this.openDataContext();
        if (openDataContext) {
            let sharedCanvas = openDataContext.canvas;
            if (sharedCanvas.mrObj){
                sharedCanvas.mrTexture.needsUpdate = true;
            }
        }
    }


    // 更新切面位置
    _updateClip(sceneName) {
        let cp0 = this.p0.clone();
        let cp1 = this.p1.clone();
        let cp2 = this.p2.clone();
        let cp3 = this.p3.clone();
        let cp4 = this.p4.clone();
        if (sceneName == 'pk') {
            cp1 = this.p5.clone();
            cp2 = this.p6.clone();
            cp3 = this.p7.clone();
            cp4 = this.p8.clone();
        }
        if(sceneName == 'prizeRecord') {
            cp0 = this.centerP.clone();
            cp1 = this.p9.clone();
            cp2 = this.p10.clone();
            cp3 = this.p11.clone();
            cp4 = this.p12.clone();
        }
        if(sceneName == 'prizeRankLast') {
            cp1 = this.p13.clone();
            cp2 = this.p14.clone();
            cp3 = this.p15.clone();
            cp4 = this.p16.clone();
        }
        if(sceneName == 'prizeRankMoney') {
            cp1 = this.p17.clone();
            cp2 = this.p18.clone();
            cp3 = this.p19.clone();
            cp4 = this.p20.clone();
        }
        if(sceneName == 'awardList') {
            cp1 = this.p21.clone();
            cp2 = this.p22.clone();
            cp3 = this.p23.clone();
            cp4 = this.p24.clone();
        }

        this.camera.updateMatrixWorld();
        let matrixWorld = this.camera.matrixWorld;

        cp0.applyMatrix4(matrixWorld);
        cp1.applyMatrix4(matrixWorld);
        cp2.applyMatrix4(matrixWorld);
        cp3.applyMatrix4(matrixWorld);
        cp4.applyMatrix4(matrixWorld);

        let triangle = new THREE.Triangle(cp2, cp1);
        let cutA = triangle.plane();
        this._negatePlane(cutA, cp0.clone());

        triangle = new THREE.Triangle(cp3, cp2);
        let cutB = triangle.plane();
        this._negatePlane(cutB, cp0.clone());

        triangle = new THREE.Triangle(cp4, cp3);
        let cutC = triangle.plane();
        this._negatePlane(cutC, cp0.clone());

        triangle = new THREE.Triangle(cp1, cp4);
        let cutD = triangle.plane();
        this._negatePlane(cutD, cp0.clone());

        this.material['list1'].clippingPlanes = [cutA, cutB, cutC, cutD];
        this.material['list1'].needsUpdate = true;
        this.material['list2'].clippingPlanes = [cutA, cutB, cutC, cutD];
        this.material['list2'].needsUpdate = true;
        // 更新切面位置结束
    }

    _negatePlane(plane, point) {
        if (!plane || !point) {
            return;
        }
        let distance = plane.distanceToPoint(point);
        if (distance < 0) {
            plane.negate();
        }
    }

    //获取Canvas
    getCanvas(type){
        return this.canvas[type] || {};
    }

    //获取上下文
    getContext(type){
        return this.context[type] || {};
    }

    //获取材质
    getTexture(type){
        return this.texture[type] || {};
    }

    getMaterial(type){
        return this.material[type] || {};
    }

    //获取mesh
    getObj(type){
        return this.obj[type] || {};
    }

    /**----------------- 工具函数 -----------------*/

    _cwh(x){
        let realx = x * W / 414;
        if (H / W < 736 / 414) {
            // 某4
            realx = x * H / 736;
        }
        return realx * Dpr;
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
}
export default CanvasBase.getInstance();