'use strict';

import {GetPlatform, PLATFORM} from '../service/Constants';
import setupSHJSBridge from '../bridge/WebNativeBridge';
import GameLogStorage from './GameLogStorage';

/**
 * 日志级别
 * @type {{TRACE: number, DEBUG: number, INFO: number, WARN: number, ERROR: number}}
 */
const logLevel = {
    CONSOLE: 0,
    TRACE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5
};

/**
 * logLevelDesc
 * @type {{}}
 */
const logLevelDesc = {
    [logLevel.CONSOLE]: 'CONSOLE',
    [logLevel.TRACE]: 'TRACE',
    [logLevel.DEBUG]: 'DEBUG',
    [logLevel.INFO]: 'INFO',
    [logLevel.WARN]: 'WARN',
    [logLevel.ERROR]: 'ERROR'
};

/**
 * logLevelMethod
 * @type {{}}
 */
const logLevelMethod = {
    [logLevel.CONSOLE]: 'logConsole',
    [logLevel.TRACE]: 'logTrace',
    [logLevel.DEBUG]: 'logDebug',
    [logLevel.INFO]: 'logInfo',
    [logLevel.WARN]: 'logWarn',
    [logLevel.ERROR]: 'logError'
};


/**
 * GameLogImp 应用日志
 *
 * @example
 * import GameLog from '../log/GameLog';
 * const logger = GameLog.getLogger('mr-pomelo');
 * logger.info('connected');
 */
class GameLogImp {
    /**
     * logLevel 默认情况，debug下打印debug及以上级别日志，release下打印info及以上级别日志
     * @param {number} level
     */
    static logLevel(level) {
        console.log(`Logger.js - log level: ${logLevelDesc[level]}`);
        this.logLevel = level;
    }

    static _dateFormat(date,format)
    {
        var o = {
            'M+' : date.getMonth()+1, //month
            'd+' : date.getDate(),    //day
            'h+' : date.getHours(),   //hour
            'm+' : date.getMinutes(), //minute
            's+' : date.getSeconds(), //second
            'q+' : Math.floor((date.getMonth()+3)/3),  //quarter
            'S' : date.getMilliseconds() //millisecond
        };
        if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
            (date.getFullYear()+'').substr(4 - RegExp.$1.length));
        for(var k in o)if(new RegExp('('+ k +')').test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length==1 ? o[k] :
                    ('00'+ o[k]).substr((''+ o[k]).length));
        return format;
    }

    static logInfo(title){
        const name = this._dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss.S');
        const path = GameLogStorage.logFilePath();
        const url = `https://qipai.56.com/feedback/${GameLogImp.logPath}/upload?title=${title}`;
        return {
            'name': name,
            'path': path,
            'url': url
        };
    }

    /**
     * 将缓冲区的日志写入文件，上传日志前需要调用
     * @param cb
     */
    static saveLog(cb){
        GameLogStorage.saveLog(cb);
    }

    set logLevel(level) {
        this._logLevel = level;
    }

    get logLevel() {
        return this._logLevel;
    }

    /**
     * constructor
     * @param {string} name
     */
    constructor(name, level) {
        this._logLevel = level;
        this._tag = name || '';
        GameLogStorage.reveiveLog(this._initLogMsg());
    }

    _printToConsole(){
        return GameLogImp.toConsole;
    }

    /**
     * log 只会写到控制台不会写到日志文件
     * @param msg
     * @param args
     */
    log(msg, ...args) {
        if (this._printToConsole()){
            const content = this._format(logLevel.CONSOLE,msg, ...args);
            console.log(content);
        }
    }

    /**
     * trace级别日志，会根据logLevel是否写到日志文件
     * @param msg
     * @param args
     */
    trace(msg, ...args) {
        const level = logLevel.TRACE;
        const content = this._format(level,msg, ...args);
        if (this._printToConsole()) {
            console.log(content);
        }
        this._log(level, content);
    }

    /**
     * debug级别日志，会根据logLevel是否写到日志文件
     * @param msg
     * @param args
     */
    debug(msg, ...args) {
        const level = logLevel.DEBUG;
        const content = this._format(level,msg, ...args);
        if (this._printToConsole()) {
            console.log(content);
        }
        this._log(level, content);
    }

    /**
     * info级别日志，会根据logLevel是否写到日志文件
     * @param msg
     * @param args
     */
    info(msg, ...args) {
        const level = logLevel.INFO;
        const content = this._format(level,msg, ...args);
        if (this._printToConsole()) {
            console.info(content);
        }
        this._log(level, content);
    }

    /**
     * warn级别日志，会根据logLevel是否写到日志文件
     * @param msg
     * @param args
     */
    warn(msg, ...args) {
        const level = logLevel.WARN;
        const content = this._format(level,msg, ...args);
        if (this._printToConsole()) {
            console.warn(content);
        }
        this._log(level, content);
    }

    /**
     * error级别日志，会根据logLevel是否写到日志文件
     * @param msg
     * @param args
     */
    error(msg, ...args) {
        const level = logLevel.ERROR;
        const content = this._format(level,msg, ...args);
        if (this._printToConsole()) {
            console.error(content);
        }
        this._log(level, content);
    }

    /**
     * _log
     * @param {number} level
     * @param {string} info
     * @private
     */
    _log(level, info) {
        const logLevel = this._logLevel || GameLogImp.logLevel;
        if (level >= logLevel) {
            GameLogStorage.reveiveLog(info);
        }
    }

    /**
     * 初始化
     * 创建log文件
     */
    initLogFile(path,cb){
        GameLogImp.logPath = path;
        GameLogStorage.updateLogPath(path);
        cb && cb();
    }

    _initLogMsg(){
        let sysInfo = '';
        if (GetPlatform() == PLATFORM.kWeChatGame){
            const system = wx.getSystemInfoSync() || {};
            sysInfo = JSON.stringify(system);
        }else {
            sysInfo = navigator.userAgent;
        }

        const msg = '================= ' + GameLogImp.logPath + ' lanunch' + ' =================\n=================\n' + sysInfo + '\n=================\n';
        return msg;
    }

    /**
     * _format
     * @param {string} msg
     * @param {...} args
     * @returns {string}
     * @private
     */
    _formatArgs(msg, ...args) {
        let result = msg + '';
        if (args.length > 0) {
            if (args.length === 1 && typeof (args[0]) === 'object') {
                const obj = args[0];
                for (let key in obj) {
                    const reg = new RegExp('({' + key + '})', 'g');
                    if (obj.hasOwnProperty(key)) {
                        result = result.replace(reg, obj[key]);
                    }
                }
            } else {
                for (let i = 0; i < args.length; i++) {
                    if (args[i] !== undefined) {
                        const reg = new RegExp('({)' + i + '(})', 'g');
                        result = result.replace(reg, args[i]);
                    }
                }
            }
        }
        return result;
    }

    _format(level,msg, ...args){
        const info = this._formatArgs(msg,...args);
        const date = GameLogImp._dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss.S');
        const levelS = logLevelDesc[level];
        //2018-03-17 11:48:11.672 [INFO] - App.js: constructor
        return `${date} [${levelS}] - ${this._tag}:${info}`;
    }
}

///default do not print to console.
GameLogImp.toConsole = false;
GameLogImp.logLevel = logLevel.TRACE;
GameLogImp.logPath = '';

setupSHJSBridge(function (bridge) {
    bridge.registerMethod('log-saveLog',function(data,cb){
        GameLogImp.saveLog(cb);
    });
});

const GameLog =  {
    /**
     * 日志级别
     */
    LEVEL: logLevel,
    /**
     * get logger
     * @param {*} name
     * @returns {GameLogImp}
     */
    getLogger: function (name, level) {
        return new GameLogImp(name, level);
    },

    /**
     * set log level
     * @param {number} level
     */
    logLevel: function (level) {
        GameLogImp.logLevel(level);
    },

    /**
     * 设置是否需要将日志打印到控制台
     * @param flag
     */
    printToConsole: function(flag){
        GameLogImp.toConsole = flag;
    },

    saveLog: function (cb) {
        GameLogImp.saveLog(cb);
    },

    logInfo: function (title) {
        return GameLogImp.logInfo(title);
    },

    closeWriteFile: function () {
        GameLogStorage.closeWriteFile();
    }
};

export default GameLog;
