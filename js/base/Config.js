'use strict';

import * as THREE from '../libs/three/three.min.js';

export const COLORS = {
    red: 0xCC463D,
    pureRed: 0xff0000,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xf39ab7,
    brownDark: 0x23190f,
    blue: 0x009FF7,
    yellow: 0xFFBE00,
    pureWhite: 0xffffff,
    orange: 0xf7aa6c,
    orangeDark: 0xFF8C00,
    black: 0x000000,
    cream: 0xF5F5F5,
    green: 0x2C9F67,
    lightBlue: 0xD1EEEE,
    cyan: 0x93e4ce,
    yellowBrown: 0xffcf8b,
    purple: 0x8a9ad6,
    yellow2:0xffc600
};

export const BOTTLE = {// = exports.BOTTLE
    headRadius: 0.945,

    //huli9
    bodyWidth: 2.5,
    bodyDepth: 2.5,
    bodyHeight: 2.8,

    //fox504right
    // bodyWidth: 3.0,
    // bodyDepth: 3.0,
    // bodyHeight: 3.8,

    //原版小人
    // bodyWidth: 2.34,
    // bodyDepth: 2.34,
    // bodyHeight: 3.2,

    reduction: 0.005,
    minScale: 0.5,
    velocityYIncrement: 15,
    velocityY: 135,
    velocityZIncrement: 70
};

export const MAO = {// = exports.BOTTLE
    headRadius: 0.945,

    //huli9
    bodyWidth: 2.5,
    bodyDepth: 2.5,
    bodyHeight: 3.0,

    reduction: 0.005,
    minScale: 0.5,
    velocityYIncrement: 15,
    velocityY: 135,
    velocityZIncrement: 70
};

export const REN = {// = exports.BOTTLE
    headRadius: 0.945,

    //huli9
    bodyWidth: 2.5,
    bodyDepth: 2.5,
    bodyHeight: 3.0,

    reduction: 0.005,
    minScale: 0.5,
    velocityYIncrement: 15,
    velocityY: 135,
    velocityZIncrement: 70
};

export const PARTICLE = {//= exports.PARTICLE
    radius: 0.3,
    detail: 2
};

export const GAME = {// = exports.GAME
    BOTTOMBOUND: -55,
    TOPBOUND: 41,
    gravity: 720,
    //gravity: 750,
    touchmoveTolerance: 20,
    LEFTBOUND: -140,
    topTrackZ: -30,
    rightBound: 90,
    HEIGHT: window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth,
    WIDTH: window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth,
    canShadow: true,
    singleGame: 'singleGame',//单人无限模式
    competitionGame: 'competitionGame', //限时单人比赛模式
};

export const WAVE = {// = exports.WAVE
    innerRadius: 2.2,
    outerRadius: 3,
    thetaSeg: 25
};

export const CAMERA = {// = exports.CAMERA
    fov: 60
};

export const AUDIO = {

    // success: 'res/audio/success.mp3',
    // perfect: 'res/audio/perfect.mp3',
    // scale_loop: 'res/audio/scale_loop.mp3',
    // scale_intro: 'res/audio/scale_intro.mp3',
    // restart: 'res/audio/start.mp3',
    // fall: 'res/audio/fall.mp3',
    // fall_2: 'res/audio/fall_2.mp3',
    combo1: 'res/audio/center1.mp3',
    combo2: 'res/audio/center2.mp3',
    combo3: 'res/audio/center3.mp3',
    combo4: 'res/audio/center4.mp3',
    combo5: 'res/audio/center5.mp3',
    combo6: 'res/audio/center6.mp3',
    combo7: 'res/audio/center7.mp3',
    combo8: 'res/audio/center8.mp3',

    pop: 'res/audio/pop.mp3',
    scale_loop: 'res/audio/sohu_scale_loop.mp3',
    scale_intro: 'res/audio/sohu_scale_intro.mp3',
    sohu_combo1: 'res/audio/sohu_combo1.mp3',
    sohu_fall: 'res/audio/sohu_fall.mp3',
    sohu_Light: 'res/audio/sohu_Light.mp3',
    sohu_MusicBox: 'res/audio/sohu_MusicBox.mp3',
    sohu_start: 'res/audio/sohu_start.mp3',
    sohu_success: 'res/audio/sohu_success.mp3',
    sohu_cheng: 'res/audio/sohu_cheng.mp3',
    sohu_yilaguan: 'res/audio/sohu_yilaguan.mp3',
    icon: 'res/audio/sohu_icon.mp3',
    lecard:'res/audio/lecard.mp3',
    bianshen:'res/audio/bianshen.mp3',
};

export const BLOCK = {
    radius: 5,
    width: 10,
    minRadiusScale: 0.8,
    maxRadiusScale: 1,
    height: 5.5,
    radiusSegments: [4, 50],
    floatHeight: 0,
    minDistance: 4,
    maxDistance: 17,
    minScale: BOTTLE.minScale,
    reduction: BOTTLE.reduction,
    moveDownVelocity: 0.07,
    fullHeight: 5.5 / 21 * 40
};

export const FRUSTUMSIZE = window.innerHeight / window.innerWidth / 736 * 414 * 60;

export const loader = new THREE.TextureLoader();

export const cylinder_shadow = new THREE.MeshBasicMaterial({
    map: loader.load('res/img/cylinder_shadow.png'),
    transparent: true,
    alphaTest: 0.01,
    opacity: 0.3
});

export const desk_shadow = new THREE.MeshBasicMaterial({
    map: loader.load('res/img/desk_shadow.png'),
    transparent: true,
    alphaTest: 0.01,
    opacity: 0.3
});

export const huaban_shadow = new THREE.MeshBasicMaterial({
    map: loader.load('res/img/huabanyingzi.png'),
    transparent: true,
    alphaTest: 0.01
});

export const shadow = new THREE.MeshBasicMaterial({
    map: loader.load('res/img/shadow.png'),
    transparent: true,
    alphaTest: 0.01,
    opacity: 0.3
});

//跳到中心点提示
export const HintMaterialArr = [
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo1.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo2.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo3.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo4.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo5.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo6.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo7.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/hint/combo8.png'),transparent:true,alphaTest:0.01})
];

//大数字：0~9
export const NumberMaterialArr = [
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/0.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/1.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/2.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/3.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/4.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/5.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/6.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/7.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/8.png'),transparent:true,alphaTest:0.01}),
    new THREE.MeshBasicMaterial({map:loader.load('res/img/number/9.png'),transparent:true,alphaTest:0.01})
];

//小数字 0~9
// export const SmallNumberMaterialArr = [
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/0.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/1.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/2.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/3.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/4.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/5.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/6.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/7.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/8.png'),transparent:true,alphaTest:0.01}),
//     new THREE.MeshBasicMaterial({map:loader.load('res/img/number/smallNum/9.png'),transparent:true,alphaTest:0.01})
//
// ];

//结果页数字：0~9
export const ScoreOver = [
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

//设计美工方块数字：0~9，大号黑色
export const SquareNumBigBlack = [
    'res/img/number/squareNumBigBlack/0.png',
    'res/img/number/squareNumBigBlack/1.png',
    'res/img/number/squareNumBigBlack/2.png',
    'res/img/number/squareNumBigBlack/3.png',
    'res/img/number/squareNumBigBlack/4.png',
    'res/img/number/squareNumBigBlack/5.png',
    'res/img/number/squareNumBigBlack/6.png',
    'res/img/number/squareNumBigBlack/7.png',
    'res/img/number/squareNumBigBlack/8.png',
    'res/img/number/squareNumBigBlack/9.png'
];

//设计美工方块数字：0~9，大号黄色
export const SquareNumBigYellow = [
    'res/img/number/squareNumBigYellow/0.png',
    'res/img/number/squareNumBigYellow/1.png',
    'res/img/number/squareNumBigYellow/2.png',
    'res/img/number/squareNumBigYellow/3.png',
    'res/img/number/squareNumBigYellow/4.png',
    'res/img/number/squareNumBigYellow/5.png',
    'res/img/number/squareNumBigYellow/6.png',
    'res/img/number/squareNumBigYellow/7.png',
    'res/img/number/squareNumBigYellow/8.png',
    'res/img/number/squareNumBigYellow/9.png'
];

//设计美工方块数字：0~9，小号黑色
export const SquareNumSmallBlack = [
    'res/img/number/squareNumSmallBlack/0.png',
    'res/img/number/squareNumSmallBlack/1.png',
    'res/img/number/squareNumSmallBlack/2.png',
    'res/img/number/squareNumSmallBlack/3.png',
    'res/img/number/squareNumSmallBlack/4.png',
    'res/img/number/squareNumSmallBlack/5.png',
    'res/img/number/squareNumSmallBlack/6.png',
    'res/img/number/squareNumSmallBlack/7.png',
    'res/img/number/squareNumSmallBlack/8.png',
    'res/img/number/squareNumSmallBlack/9.png'
];


//设计美工方块数字：0~9，小号黄色
export const SquareNumSmallYellow = [
    'res/img/number/squareNumSmallYellow/0.png',
    'res/img/number/squareNumSmallYellow/1.png',
    'res/img/number/squareNumSmallYellow/2.png',
    'res/img/number/squareNumSmallYellow/3.png',
    'res/img/number/squareNumSmallYellow/4.png',
    'res/img/number/squareNumSmallYellow/5.png',
    'res/img/number/squareNumSmallYellow/6.png',
    'res/img/number/squareNumSmallYellow/7.png',
    'res/img/number/squareNumSmallYellow/8.png',
    'res/img/number/squareNumSmallYellow/9.png'
];

//设计美工方块数字：0~9，场次预告页奖金数字
export const PrizeNum = [
    'res/img/number/prizeNum/0.png',
    'res/img/number/prizeNum/1.png',
    'res/img/number/prizeNum/2.png',
    'res/img/number/prizeNum/3.png',
    'res/img/number/prizeNum/4.png',
    'res/img/number/prizeNum/5.png',
    'res/img/number/prizeNum/6.png',
    'res/img/number/prizeNum/7.png',
    'res/img/number/prizeNum/8.png',
    'res/img/number/prizeNum/9.png'
];
//排行榜数字：0~9，黑色
export const rankNumBlack = [
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
export const rankNumYellow = [
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
export const rankNumGrey = [
    'res/img/number/rankNumGrey/4.png',
    'res/img/number/rankNumGrey/5.png',
    'res/img/number/rankNumGrey/6.png',
];

//狐狸的皮肤颜色, #ef7829是最新的
export const FoxColor = [0xef7829];

// export const RES_REMOTE_SERVER = 'http://10.7.38.112/threejs/res/obj/';

const RES_SERVER = 'https://duqipai.56.com/jump';
export const RES_LOCAL_SERVER = 'res/obj/';
// const RES_SERVER = 'http://220.181.119.65/game'
// const RES_SERVER = 'http://10.7.38.112/threejs'
export const RES_REMOTE_SERVER = RES_SERVER + '/res/obj/';
export const SHAREICON_REMOTE_SERVER = RES_SERVER + '/res/img/shareicon.png';
export const REDPACKET_SHAREICON_REMOTE_SERVER = RES_SERVER + '/res/img/red-shareicon.png';
export const HELP_SHARE_REMOTE = RES_SERVER + '/res/img/help.png';
export const XUANYAO_SHARE_REMOTE = RES_SERVER + '/res/img/xunyao.png';
export const TIXIAN_QR_URL = 'https://duqipai.56.com/gamebox/img/box-qrcode-tyt.png';
export const MOREGAME_QR_URL = 'https://duqipai.56.com/gamebox/img/box-more-tyt.png';
export const TIXIAN_QR_URL_BETA = 'https://duqipai.56.com/gamebox/img/box-qrcode-beta.png';

// export const RES_REMOTE_SERVER = 'http://10.7.38.112/threejs/res/obj/';
// // export const RES_REMOTE_SERVER = 'http://220.181.119.65/game/res/obj/';
// export const SHAREICON_REMOTE_SERVER = 'http://220.181.119.65/game/res/img/shareicon.png';
// export const REDPACKET_SHAREICON_REMOTE_SERVER = 'http://220.181.119.65/game/res/img/red-shareicon.png';

// obj模型
export const Fox = {path:'',name:'huli9'};
export const Mao = {path:'',name:'maoA'};
export const Ren = {path:'',name:'renD'};
export const LeCardInBlock = {path:'',name:'quan'};
export const colorStoneInBlock = {path:'',name:'baoshi-5'};

// export const ObjInfo = {
//     seasonSegment:[
//         {
//             min:100,max:111,season:'spring',
//             objInfo:{
//                 100:{path:'season/spring/',name:'dengzi1',index:1,isCylinder:1,isObj:0,meshInfo:{type:6,color:0x40d0be,pic:''},rotateY:0,posX:0.3,posZ:-0.15,shadow:0,extraInfo:{isEntry:0}},
//                 101:{path:'season/spring/',name:'hezi1',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFFFF,pic:''},rotateY:0,posX:0,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 102:{path:'season/spring/',name:'hezi2',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 103:{path:'season/spring/',name:'hezi3',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.5,shadow:1,extraInfo:{isEntry:0}},
//                 104:{path:'season/spring/',name:'hezi4',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 105:{path:'season/spring/',name:'huanban',index:1,isCylinder:0,isObj:0,meshInfo:{type:8,color:0xfeb3ae,pic:''},rotateY:0,posX:0,posZ:0,shadow:2,extraInfo:{isEntry:0}},
//                 106:{path:'season/spring/',name:'pingtai1',index:1,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.2,posZ:-0.2,shadow:3,extraInfo:{isEntry:0}},
//                 107:{path:'season/spring/',name:'pintai2',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:-0.2,posZ:-0.3,shadow:3,extraInfo:{isEntry:0}},
//                 108:{path:'season/spring/',name:'shoutixiang',index:1,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:-0.1,shadow:5,extraInfo:{isEntry:0}},
//                 109:{path:'season/spring/',name:'zhuzi1',index:0,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.05,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 110:{path:'season/spring/',name:'xiaoniao',index:3,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:0,shadow:6,extraInfo:{isEntry:0}},
//                 111:{path:'season/spring/',name:'shudun',index:1,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//             },
//         },
//         {
//             min:200,max:211,season:'summer',
//             objInfo:{
//                 200:{path:'season/summer/',name:'x_dengzi1',index:0,isCylinder:1,isObj:0,meshInfo:{type:11,color:0xdef5a5,pic:''},rotateY:0,posX:-0.1,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 201:{path:'season/summer/',name:'x_dengzi2',index:1,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:0,extraInfo:{isEntry:0}},
//                 202:{path:'season/summer/',name:'x_yuanzhu1',index:0,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 203:{path:'season/summer/',name:'x_xigua',index:3,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.1,posZ:-0.2,shadow:7,extraInfo:{isEntry:0}},
//                 204:{path:'season/summer/',name:'x_fangzhuo',index:0,isCylinder:0,isObj:0,meshInfo:{type:9,color:0xFFFFFF,pic:''},rotateY:0,posX:0.1,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 205:{path:'season/summer/',name:'x_hezi2',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 206:{path:'season/summer/',name:'x_hezi3',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 207:{path:'season/summer/',name:'x_hezi4',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 208:{path:'season/summer/',name:'x_hezi5',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 209:{path:'season/summer/',name:'x_huaban',index:1,isCylinder:0,isObj:0,meshInfo:{type:8,color:0x2fffd6,pic:''},rotateY:0,posX:0,posZ:0,shadow:2,extraInfo:{isEntry:0}},
//                 210:{path:'season/summer/',name:'x_xiaoniao',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 211:{path:'season/summer/',name:'dangao',index:5,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//             },
//         },
//         {
//             min:300,max:310,season:'autumn',
//             objInfo:{
//                 300:{path:'season/autumn/',name:'q_dengzi1',index:1,isCylinder:1,isObj:0,meshInfo:{type:6,color:0x9e8458,pic:''},rotateY:0,posX:0.3,posZ:-0.15,shadow:0,extraInfo:{isEntry:0}},
//                 301:{path:'season/autumn/',name:'q_shudun',index:6,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:90,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 302:{path:'season/autumn/',name:'q_yuanzhu1',index:0,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 303:{path:'season/autumn/',name:'q_hezi1',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 304:{path:'season/autumn/',name:'q_hezi2',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 305:{path:'season/autumn/',name:'q_hezi3',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 306:{path:'season/autumn/',name:'q_hezi4',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.5,shadow:1,extraInfo:{isEntry:0}},
//                 307:{path:'season/autumn/',name:'q_pingtai1',index:1,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:4,extraInfo:{isEntry:0}},
//                 308:{path:'season/autumn/',name:'q_pingtai2',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:3,extraInfo:{isEntry:0}},
//                 309:{path:'season/autumn/',name:'q_shu',index:1,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:-90,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 310:{path:'season/autumn/',name:'q_zhuozi1',index:0,isCylinder:0,isObj:0,meshInfo:{type:9,color:0xc4b694,pic:''},rotateY:0,posX:0.1,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}}
//             },
//         },
//         {
//             min:400,max:411,season:'winter',
//             objInfo:{
//                 400:{path:'season/winter/',name:'d_fangdeng',index:0,isCylinder:0,isObj:0,meshInfo:{type:9,color:0x93b0c9,pic:''},rotateY:0,posX:0.1,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 401:{path:'season/winter/',name:'d_hezi1',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0x97b5d0,pic:''},rotateY:0,posX:-0.1,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 402:{path:'season/winter/',name:'d_hezi2',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 403:{path:'season/winter/',name:'d_hezi3',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 404:{path:'season/winter/',name:'d_hezi4',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 405:{path:'season/winter/',name:'d_hezi5',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 406:{path:'season/winter/',name:'d_pixiang',index:1,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:-0.1,shadow:5,extraInfo:{isEntry:0}},
//                 407:{path:'season/winter/',name:'d_tiaotai',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:3,extraInfo:{isEntry:0}},
//                 408:{path:'season/winter/',name:'d_xiaoniao',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 409:{path:'season/winter/',name:'d_yuandeng',index:1,isCylinder:1,isObj:0,meshInfo:{type:6,color:0x6e78b7,pic:''},rotateY:0,posX:0,posZ:0,shadow:0,extraInfo:{isEntry:0}},
//                 410:{path:'season/winter/',name:'d_yuanzhu',index:0,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 411:{path:'season/winter/',name:'d_yuanzhu1',index:0,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}}
//             },
//         },
//         {
//             min:100000,max:100003,season:'special',
//             objInfo:{
//                 100000:{path:'special/',name:'cd',index:7,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:90,posX:-0.06,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 100001:{path:'special/',name:'cheng',index:9,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:180,posX:-0.1,posZ:-0.1,shadow:1,extraInfo:{isEntry:0}},
//                 100002:{path:'special/',name:'deng',index:0,isCylinder:0,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:-0.2,posZ:-0.5,shadow:1,extraInfo:{isEntry:0}},
//                 100003:{path:'special/',name:'yilaguan',index:4,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:-90,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}}
//             },
//         },
//         {
//             min:500,max:504,season:'qinming',
//             objInfo:{
//                 500:{path:'qinming/',name:'',index:1,isCylinder:1,isObj:0,meshInfo:{type:1,color:0xFFFF00,pic:'res/img/qinming/qingming1.png'},rotateY:0,posX:0,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 501:{path:'qinming/',name:'',index:1,isCylinder:1,isObj:0,meshInfo:{type:1,color:0xFFFF00,pic:'res/img/qinming/hezi.png'},rotateY:0,posX:0,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 502:{path:'qinming/',name:'',index:1,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 503:{path:'qinming/',name:'',index:1,isCylinder:1,isObj:0,meshInfo:{type:4,color:0xFFFFFF,pic:'res/img/qinming/eye.png'},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 504:{path:'qinming/',name:'qm-kulou',index:1,isCylinder:1,isObj:1,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:-90,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//             }
//         },
//         {
//             min:601,max:612,season:'dalisi',
//             objInfo:{
//                 601:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:-0.1,posZ:-0.1,shadow:7,extraInfo:{isEntry:0}},
//                 602:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.2,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 603:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.1,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 604:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0.1,posZ:-0.3,shadow:7,extraInfo:{isEntry:0}},
//                 605:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:-0.2,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//                 606:{path:'dalisi/',name:'',index:1,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 607:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 608:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:1,color:0xFFFF00,pic:'res/img/dalisi/blueBook.png'},rotateY:0,posX:0,posZ:-0.2,shadow:1,extraInfo:{isEntry:0}},
//                 609:{path:'dalisi/',name:'',index:1,isCylinder:1,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:-0.3,shadow:1,extraInfo:{isEntry:0}},
//                 610:{path:'dalisi/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:2,color:0xFED032,pic:'res/img/dalisi/fuzhou.png'},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 611:{path:'dalisi/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:1,color:0xFFFF00,pic:'res/img/dalisi/redBlock.png'},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//                 612:{path:'dalisi/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:1,color:0xFFFF00,pic:'res/img/dalisi/dalisizhi.png'},rotateY:0,posX:0,posZ:-0.2,shadow:1,extraInfo:{isEntry:1}},
//             },
//         },
//         // {
//         //     min:700,max:713,season:'test',
//         //     objInfo:{
//         //         700:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:0,color:0xFFFF00,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:1}},
//         //         701:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:1,color:0xFFFFFF,pic:'res/img/dalisi/redBlock.png'},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//         //         702:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:2,color:0xFFFFFF,pic:'res/img/dalisi/fuzhou.png'},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//         //         703:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:3,color:0xfec329,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //         704:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:4,color:0xfec329,pic:'res/img/dalisi/bagua.png'},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //         705:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:5,color:0xfec329,pic:'res/img/dalisi/red2.png'},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //         706:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:6,color:0x40d0be,pic:''},rotateY:0,posX:0,posZ:0,shadow:0,extraInfo:{isEntry:0}},
//         //         707:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:7,color:0x40d0be,pic:'res/img/dalisi/bagua.png'},rotateY:0,posX:0,posZ:0,shadow:0,extraInfo:{isEntry:0}},
//         //         708:{path:'test/',name:'',index:0,isCylinder:0,isObj:0,meshInfo:{type:8,color:0xfeb3ae,pic:''},rotateY:0,posX:0,posZ:0,shadow:2,extraInfo:{isEntry:0}},
//         //         709:{path:'test/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:9,color:0xffffff,pic:''},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//         //         710:{path:'test/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:10,color:0xffffff,pic:'res/img/dalisi/fuzhou.png'},rotateY:0,posX:0,posZ:0,shadow:1,extraInfo:{isEntry:0}},
//         //         711:{path:'test/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:11,color:0xdef5a5,pic:''},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //         712:{path:'test/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:12,color:0xdef5a5,pic:'res/img/dalisi/bagua.png'},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //         713:{path:'test/',name:'',index:0,isCylinder:1,isObj:0,meshInfo:{type:13,color:0x880032,pic:'res/img/dalisi/bagua.png,res/img/dalisi/red2.png'},rotateY:0,posX:0,posZ:0,shadow:7,extraInfo:{isEntry:0}},
//         //     },
//         // },
//     ],
// };

// const SeasonPath = 'res/img/season/';
// const DalisiSeasonPath = 'res/img/';
// export const SeasonElem = {
//     spring:{
//         small:[
//             {name:SeasonPath+'spring/small/grass1.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass2.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass3.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass4.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass5.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass6.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass7.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/small/grass8.png', size:{w:4,h:4},}
//         ],
//         big:[
//             {name:SeasonPath+'spring/big/cherry.png', size:{w:15,h:20},},
//             {name:SeasonPath+'spring/big/flower.png', size:{w:15,h:20},},
//             {name:SeasonPath+'spring/big/flower1.png', size:{w:15,h:15},},
//             {name:SeasonPath+'spring/big/flower2.png', size:{w:20,h:15},},
//             {name:SeasonPath+'spring/big/peach.png', size:{w:15,h:20},},
//             {name:SeasonPath+'spring/big/stone1.png', size:{w:4,h:4},},
//             {name:SeasonPath+'spring/big/stone2.png', size:{w:4,h:4},}
//         ]
//     },
//     summer:{
//         small:[
//             {name:SeasonPath+'summer/small/flower.png', size:{w:3,h:3},},
//             {name:SeasonPath+'summer/small/flower1.png', size:{w:3,h:3},}
//         ],
//         big:[
//             {name:SeasonPath+'summer/big/room.png', size:{w:20,h:20},},
//             {name:SeasonPath+'summer/big/room1.png', size:{w:20,h:20},},
//             {name:SeasonPath+'summer/big/room2.png', size:{w:18,h:20},},
//             {name:SeasonPath+'summer/big/tree.png', size:{w:18,h:18},},
//             {name:SeasonPath+'summer/big/tree1.png', size:{w:15,h:18},},
//             {name:SeasonPath+'summer/big/treeTop.png', size:{w:15,h:10},},
//             {name:SeasonPath+'summer/big/treeTop1.png', size:{w:15,h:10},},
//             {name:SeasonPath+'summer/big/treeTop2.png', size:{w:20,h:10},}
//         ]
//     },
//     autumn:{
//         small:[
//             {name:SeasonPath+'autumn/small/grid.png', size:{w:5,h:5},}
//         ],
//         big:[
//             {name:SeasonPath+'autumn/big/bench.png', size:{w:20,h:20},},
//             {name:SeasonPath+'autumn/big/bench2.png', size:{w:20,h:20},},
//             {name:SeasonPath+'autumn/big/bridge.png', size:{w:20,h:20},},
//             {name:SeasonPath+'autumn/big/grid.png', size:{w:15,h:15},},
//             {name:SeasonPath+'autumn/big/grid1.png', size:{w:15,h:15},},
//             {name:SeasonPath+'autumn/big/stone.png', size:{w:7,h:5},},
//             {name:SeasonPath+'autumn/big/tree.png', size:{w:7,h:5},},
//             {name:SeasonPath+'autumn/big/tree1.png', size:{w:15,h:22},},
//             {name:SeasonPath+'autumn/big/tree2.png', size:{w:15,h:20},},
//             {name:SeasonPath+'autumn/big/tree3.png', size:{w:15,h:20},}
//         ]
//     },
//     winter:{
//         small:[
//             {name:SeasonPath+'winter/small/ice1.png', size:{w:4,h:4},},
//             {name:SeasonPath+'winter/small/ice2.png', size:{w:4,h:4},},
//             {name:SeasonPath+'winter/small/ice3.png', size:{w:4,h:4},},
//             {name:SeasonPath+'winter/small/ice4.png', size:{w:4,h:4},}
//         ],
//         big:[
//             {name:SeasonPath+'winter/big/bear.png', size:{w:20,h:20},},
//             {name:SeasonPath+'winter/big/hole.png', size:{w:15,h:10},},
//             {name:SeasonPath+'winter/big/hole1.png', size:{w:10,h:10},},
//             {name:SeasonPath+'winter/big/hole2.png', size:{w:10,h:10},},
//             {name:SeasonPath+'winter/big/ice1.png', size:{w:13,h:13},},
//             {name:SeasonPath+'winter/big/ice2.png', size:{w:13,h:13},},
//             {name:SeasonPath+'winter/big/ice3.png', size:{w:13,h:13},}
//         ]
//     },
//     dalisi:{
//         small:[
//             {name:DalisiSeasonPath+'dalisi/small/dalisicatfoot.png', size:{w:2,h:3},},
//             {name:DalisiSeasonPath+'dalisi/small/dalisigrass.png', size:{w:2,h:2},},
//         ],
//         big:[
//             {name:DalisiSeasonPath+'dalisi/big/hill.png', size:{w:15,h:15},},
//             {name:DalisiSeasonPath+'dalisi/big/langan.png', size:{w:13,h:17},},
//             {name:DalisiSeasonPath+'dalisi/big/shanshitou.png', size:{w:13,h:15},},
//             {name:DalisiSeasonPath+'dalisi/big/shitou.png', size:{w:12,h:11},},
//             {name:DalisiSeasonPath+'dalisi/big/gongdian.png', size:{w:19,h:19},},
//             {name:DalisiSeasonPath+'dalisi/big/di.png', size:{w:9,h:11},},
//             {name:DalisiSeasonPath+'dalisi/big/shanshi.png', size:{w:16,h:18},},
//             {name:DalisiSeasonPath+'dalisi/big/huashu.png', size:{w:14,h:20},}
//         ]
//     }
// };

export const StorageKey = {
    kUserInfo: 'kUserInfo',
    kSkinIdx: 'kSkinIdx',
    kUserPack: 'kUserPack',
    kUserJscode: 'kUserJscode',
    kShowDanmu: 'kShowDanmu',//比赛场 —— 是否显示弹幕
    kHaveAwardInfo: 'kHaveAwardInfo',//比赛场 —— 是否有未展示的中奖信息
    kFirstOnSpecialBlock:'kFirstOnSpecialBlock',//是否第一次跳到特殊block
    kLastHideTime:'kLastHideTime',//记录退后台时间
    kPlayNormalCount:'kPlayNormalCount',//玩普通场的局数
    kTime4ShareInNormalLecard:'kTime4ShareInNormalLecard',//普通场结果页分享的时间
};


/**  好友榜 区分服务器的三个选项，用哪个解注哪个*/
// export const openOff = 'openOff'; //好友榜缓存的开关
export const openJumperScore  ='jumperScore';//好友榜，原来不区分服务器的key
// export const openJumperScore  =  'JumperTest';  //好友榜 测试服
// export const openJumperScore  =  'JumperCheck';  //好友榜 审核服
// export const openJumperScore  =  'JumperFormal';  //好友榜 正式服