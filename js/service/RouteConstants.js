'use strict';

import ServerConstants from './ServerConstants.js';

/**
 * 响应路由
 */
const RouteConstants =  {
    /**
     * 请求类路由
     */
    REQUEST: {
        /**
         * 加入喇叭广播通道
         */
        JOIN_TRUMPET_CHANNEL: 'lobby.lobbyHandler.joinTrumpetChannel',
        /**
         * 使用喇叭，发送消息
         */
        USE_TRUMPET: 'lobby.lobbyHandler.useTrumpet',
        /**
         * 加入匹配队列
         */
        ENTER_MATCH_QUEUE: 'connector.userHandler.enterMatchQueue',
        /**
         * 取消匹配
         */
        CANCEL_MATCH: 'match.matchHandler.cancelMatch',
        /**
         * 准备ok
         */
        READY: 'fight.fightHandler.ready',
        /**
         * 开始游戏
         */
        START_FIGHT: 'fight.fightHandler.startFight',
        /**
         * 同步状态
         */
        SYNC_STATE: 'fight.fightHandler.syncState',
        /**
         *
         */
        RECALL_ON_ALL_PLAYERS_READY: 'fight.fightHandler.recallOnAllPlayersReady',
        /**
         * 获取操作历史
         */
        GET_OPERATION_HISTORY: 'fight.fightHandler.getOperationHistory',
        /**
         * 发送游戏操作
         */
        SEND_OPERATION: 'fight.fightHandler.sendOperation'
    },

    /**
     * 推送类路由
     */
    ON: ServerConstants.CLIENT_ROUTER,

    /**
     * 游戏流程
     */
    GAME_INIT: 'connector.jumperHandler.initJumperGame',
    GAME_START: 'connector.jumperHandler.startJumperGame',
    GAME_END: 'connector.jumperHandler.endJumperGame',

    /// 分享特权初始化
    ShareInit: 'connector.shareHandler.sharedInit',
    GAME_SHARE_TYPE:'connector.shareHandler.sharedByType',

    //比赛场
    COMPETE_GAME_REGISTER: 'connector.championshipHandler.registerChampionship',//注册场次，即预约
    COMPETE_GAME_START: 'connector.jumperHandler.startJumperGame',//开始比赛场游戏
    COMPETE_GAME_END: 'connector.jumperHandler.endJumperGame',//结束比赛场游戏

    //使用复活卡
    GAME_USE_REVIVAL:'connector.championshipHandler.useChampionshipRevivedCard',

    ///上报乐卡数
    GAME_PICKED_LECARD: 'connector.jumperHandler.finishJumperGameLeCardPick',
    ///上报五彩石数
    GAME_PICKED_COLORSTONE: 'connector.jumperHandler.finishJumperGameColorStonePick',
    ///排行榜
    // GAME_RANK_LIST: 'connector.rankHandler.rankList',
    ///奖金榜接口
    GAME_ALLRANK_LIST: 'connector.rankHandler.getAllRankList',
    ///上期排行榜接口
    GAME_LASTRANK_LIST: 'connector.rankHandler.getLastRankList',
    ///抽奖配置
    GAME_LOTTERY_LIST: 'connector.lotteryHandler.getLotteryList',
    ///开始抽奖
    GAME_START_LOTTERY: 'connector.lotteryHandler.startLottery',

    /**
     * 锦标赛
     */
    //获奖信息
    CHAMPIONSHIP_AWARD:'connector.championshipHandler.getChampionshipAward',
    ///场次预告
    CHAMPION_SESSION_INIT:'connector.championshipHandler.initChampionship',
    ///场次预约,id
    CHAMPION_RESERVATION_ID:'connector.championshipHandler.reservationChampionship',
    ///获奖记录
    CHAMPION_AWARD_HISTORY:'connector.championshipHandler.getChampionshipAwardHistory',

    /**
     * 大理寺活动
     */
    INIT_ACTIVITY: 'connector.activityHandler.initActivity',
    ACCEPT_ACTIVITY: 'connector.activityHandler.acceptActivity',
    REGISTER_ACTIVITY: 'connector.activityHandler.registerActivity',
    ACQUIRE_ACTIVITY_AWARD: 'connector.activityHandler.acquireActivityAward',
};

export default RouteConstants;
