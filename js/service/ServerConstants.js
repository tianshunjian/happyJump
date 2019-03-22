'use strict';

const ServerConstants = {
    SERVER_STATUS: {
        STARTING: 'starting',
        READY: 'ready',
        CLOSED: 'closed',
        MAINTAIN: 'maintain',
        RUNNING: 'running',
    },

    SERVER_TYPE: {
        MASTER: 'master',
        LOBBY: 'lobby',
        DCENTER: 'dcenter',
        GATE: 'gate',
        CONNECTOR: 'connector',
        MATCH: 'match',
        FIGHT: 'fight'
    },

    SIGNAL: {
        OK: 1,
        FAIL: 0,
        APP_VERSION_ERROR: 2,
        RES_VERSION_ERROR: 3,
        TOKEN_ERROR: 4,
        REDIS_ERROR: 5,
        MYSQL_ERROR: 6,
        SERVER_NOT_RUN: 7,
        PURCHASE_OBSOLETE: 8,
        CARD_NOT_EXIST: 9,
        USER_OBSOLETE: 10,
        FAKE_USER_USED: 11,
        HIGHER_THAN_CURRENT_APP_VERSION: 12,
        NOT_LOGIN_STATE: 13,
    },

    TIME: {
        GLOBAL_ROOM_TIMER_INTERVAL: 1000 * 3, //3s
        AREA_FORCE_DESTROY_TIME: 1000 * 60 * 20, // 20 minutes,
        DEFAULT_MATCH_INTERVAL: 3 * 1000, //3s,
        DEFAULT_WAIT_READY_TIMEOUT: 20 * 1000, //20s,
        DEFAULT_MAX_TIMEOUT: 1000 * 60 * 20, //20 minutes
        DEFAULT_AREAS_POOL_CHECK_INTERVAL: 5 * 60 * 1000, //5min
    },

    RUN_MODE: {
        PRO: 'production',
        DEV: 'development',
        PRO_OR_DEV: 'production|development',
    },

    SESSION_KEY: {
        IS_GM: 'isGM',
        MONITOR_TIMERS: 'monitorTimers',
        REQUEST_CHECKER: 'requestChecker',
        PLAYER_PROTO: 'playerProto'
    },

    APP_KEY: {
        AREAS_POOL: 'areasPool',
        MATCH_POOL_MAJIANG: 'matchPoolMajiang',
        MATCH_POOL_POKER: 'matchPoolPoker',
        MATCH_POOL_MAJIANG2P: 'matchPoolMajiang2p',
        GLOBAL_ROOM: 'globalRoom',
        GATE_OBSOLETE: 'gateObsolete',
        SERVERS: 'servers',
        ERROR_HANDLER: 'errorHandler',
        MAINTAINING_INFO: 'maintainingInfo',
        ENV: 'env',
        NAME: 'name',
        GAME_SERVER_VERSION: 'gameServerVersion',
        LOG_CONFIG: 'logConfig',
        CONNECTOR_CONFIG: 'connectorConfig',
        MYSQL_CLIENT: 'mysqlClient',
        REDIS_CLIENTS: 'redisClients',
        SERVER_ID: 'serverId',
        TOTAL_SERVERS_COUNT: 'totalServersCount',
        SERVICE_NAMES: {
            SESSION_SERVICE: 'sessionService',
            CHANNEL_SERVICE: 'channelService',
            BACKEND_SESSION_SERVICE: 'backendSessionService',
            GAME_MGMT_SERVICE: 'gameMgmtService',
            SYSTEM_MGMT_SERVICE: 'systemMgmtService',
        },
    },

    EVENT: {
        UNCAUGHT_EXCEPTION: 'uncaughtException',
        CLOSED: 'closed',
        PLAYER_DISCONNECTED: 'playerDisconnect',
        MAJIANG_MATCHED: 'majiangMatched',
        MAJIANG_MATCHED_AI: 'majiangMatchedAI',
        POKER_MATCHED: 'pokerMatched',
        POKER_MATCHED_AI: 'pokerMatchedAI',
        AREA_CLOSED: 'areaClosed',
        LOCKED_GAME: 'lockedGame',
        UNLOCK_GAME: 'unlockGame'
    },

    CLIENT_ROUTER: {
        ON_KEY_FRAME: 'onKeyFrame',
        ON_RECEIVED_TRUMPET: 'onReceivedTrumpet',
        ON_MAIN_STATE_CHANGED: 'onMainSateChanged',
        ON_MATCHED: 'onMatched',
        ON_CANCEL_MATCH: 'onCancelMatch',
        ON_ENTER_AREA: 'onEnterArea',
        ON_LEAVE_AREA: 'onLeaveArea',
        ON_ALL_PLAYER_READY: 'onAllPlayerReady',
        ON_GAME_OVER: 'onGameOver',
        ON_AREA_CLEAN_UP: 'onAreaCleanup',
        ON_OPERATE: 'onOperate',
        ON_SYNC_STATE: 'onSyncState'
    },

    NUMBER: {
        MAX_AREAS_COUNT: 5000,
        WARN_USED_AREAS_COUNT: 4000,
        MAX_USED_AREAS_COUNT: 4500,
        USER_TRUMPET_LIMIT_LEVEL: 3,
        GAME_LEVEL_LIMIT: 6
    },

    GAME_MODE_CLIENT: {
        POKER: 1,
        MAJIANG: 2,
        MAJIANG_2P: 3
    },

    AREA_STATE: {
        WAIT_READY: 1,
        LOCK_GAME: 2,
        GAME_RUNNING: 3,
        FIGURE_RESULT: 4,
        CLOSED: 5,
    },

    PLAYER_STATE: {
        ENTERED: 1,
        MATCHING: 2,
        PREPARING: 3,
        READY: 4,
        OK_TO_START: 5,
        RUNNING: 6,
        SUBMIT_RESULT: 7,
        FINISHED: 8,
    },

    GAME_RESULT: {
        LOSE: 0,
        WIN: 1,
        DRAW: 2,
        PERFECT_WIN: 3,
        PERFECT_LOSE: 4,
        UNBELIEVABLE: 5,
    },

    KICK_REASON: {
        DUPLICATE_LOGIN: 'DupLogin',//the same player repeat login
        INVALID_REQUEST: 'InvalidRequest',//unknown error when enter game connector
        SERVER_BUSY: 'ServerBusy',//beyond max areas when enter match queue.
        AUTH_ERROR: 'AuthError',
        SERVER_MAINTAINING: 'ServerMaintaining',//server maintaining
        NEED_UPDATE_GATE_SERVER: 'NeedUpdateGateServer',//need update gate server
        NO_REAL_SESSION: 'NoRealSession',//real session is not exist
        MSG_TIMEOUT: 'MsgTimeout',//serial request blocking
        NOT_LOGIN_STATE: 'NotLoginState'//user is not login state
    },

    AREA_CLEAN_UP_REASON: {
        GAME_OVER: 1,
        REMATCH: 2,
        READY_TIMEOUT: 3,
        INVALID_VERSION: 4,
    },

    TIMER_NAME: {
        READY: 'ready',
        NORMAL: 'normal',
        OVER: 'over',
        TAIL: 'tail',
    },

    MAIN_STATE: {
        OFFLINE: 0,
        ONLINE: 1,
        GAMING: 2,
        BUSY: 3,
    },

    TRUMPET_TYPE: {
        OPERATION_ANNOUNCEMENT: 1, //运营公告
        USER_REDPOCKET_MSG: 2, //红包
        OPEN_BOX_MSG: 3, //开宝箱信息
        TAVERN_RECRUIT: 4, //酒馆招募信息
        RANKING_FIRST_ONE: 5, //排行榜第一名
        RANKING_RISE: 6, //排行榜上升名次
        RANKING_LEAGUE_FIRST_ONE: 7, //联赛榜第一名
        RANKING_LEAGUE_RISE: 8, //联赛榜上升名次
        CHAMPIONSHIP_BEFORE_START: 9, //锦标赛开赛前n分钟
        CHAMPIONSHIP_START: 10,//锦标赛开赛
        CHAMPIONSHIP_BEFORE_END: 11,//锦标赛结束前n分钟
        CHAMPIONSHIP_END: 12,//锦标赛结束
        ROULETTE_MSG: 13,//开轮盘开出金色
        OPEN_BOX_GET_MULTI_LEGENDS: 14 //开宝箱得到多张传奇卡
    },

    AI_LIBRARY_STATUS: {
        STARTING: 'starting',
        READY: 'ready',
        DISABLED: 'disabled'
    },

    COMMAND_TYPE: {
        PLAYER_DISCONNECTED: 998,
        PLAYER_RECONNECT: 999,
        START_GAME: 1
    }
};

export default ServerConstants;
