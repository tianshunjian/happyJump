'use strict';

import stringBuffer from './StringBuffer';

import {GetPlatform, PLATFORM} from '../service/Constants';
import setupSHJSBridge from '../bridge/WebNativeBridge';

class GameLogStorage {

    constructor(){
        this._logReady = false;
        this._receiveLog = true;
        this._cacheMaxLength = 0;//暂时改为0(刷新缓冲区的SDK还没集成，日志不全，所以缓冲区大小设置的相对小些)
    }

    get supportWX(){
        if (typeof (this._supportWX) == 'undefined'){
            if (GetPlatform() == PLATFORM.kWeChatGame){
                const sysInfo = wx.getSystemInfoSync() || {};
                if (sysInfo.SDKVersion < '2.1.0'){
                    console.error('基础库版本低于2.1.0，不支持日志持久化功能！');
                    this._supportWX = false;
                }else {
                    this._supportWX = true;
                }
            }
        }
        return this._supportWX;
    }
    /**
     * 把日志地址存起来
     * @param path
     */
    updateLogPath(path){
        this.path = path;
        this.prepareLogFileIfNeed();
    }

    /**
     * 获取日志目录
     * @returns {string}
     */
    _logBasePath() {
        if (GetPlatform() == PLATFORM.kWeChatGame) {
            return `${wx.env.USER_DATA_PATH}` + '/log';
        }else {
            return '';
        }
    }

    logFilePath() {
        return this._logBasePath() + '/log.txt';
    }

    _writeLog2Local(cb){

        const str = stringBuffer.toString();
        stringBuffer.clear();

        if (!this._logReady){
            cb && cb('日志文件NotReady');
            return;
        }

        if (GetPlatform() == PLATFORM.kWeChatGame){
            if (this.supportWX){
                let logFilePath = this.logFilePath();
                wx.getFileSystemManager().appendFile({
                    filePath:logFilePath,
                    data:str + '\n',
                    success:function () {
                        cb && cb();
                    },
                    fail:function (res) {
                        console.error('Logger 日志写入失败 '+res.errMsg);
                        cb && cb( res.errMsg || '日志写入失败');
                    }
                });
            }
        }else {
            setupSHJSBridge(function (bridge) {
                bridge.invokeNative('log',str,cb);
            });
        }
    }

    reveiveLog(log){
        if (this._receiveLog) {
            stringBuffer.append(log);
            if (stringBuffer.length() > this._cacheMaxLength) {
                this._writeLog2Local();
            }
        }
    }

    saveLog(cb){
        this._writeLog2Local(cb);
    }

    closeWriteFile(){
        this._receiveLog = false;
    }

    prepareLogFileIfNeed(cb){

        const self = this;
        const msg = new Date().toString();
        if (GetPlatform() == PLATFORM.kWeChatGame){
            if(this.supportWX){
                const _createNewLogFile = function(logFilePath,callback){
                    wx.getFileSystemManager().writeFile({
                        filePath:logFilePath,
                        data:msg,
                        success:function () {
                            console.log('Logger 文件创建成功');
                            self._logReady = true;
                            callback && callback();
                        }.bind(this),
                        fail:function (res) {
                            console.log('Logger 创建文件失败 ' + res.errMsg);
                            callback && callback(res.errMsg || '创建文件失败');
                        }
                    });
                };

                let logPath = this._logBasePath();
                let logFilePath = this.logFilePath();
                wx.getFileSystemManager().access({
                    path:logFilePath,
                    success:function (res) {
                        console.log('Logger 本地log文件已存在：'+JSON.stringify(res));
                        let stat = wx.getFileSystemManager().statSync(logFilePath);
                        if (stat){
                            console.log('Logger 本地log文件 信息：'+JSON.stringify(stat));
                            let fileSize = stat.size / 1024;//单位KB
                            if(fileSize>2048){ //2M
                                console.log('Logger 本地log文件过大删除重建');
                                _createNewLogFile(logFilePath,cb);
                            }else{
                                console.log('Logger 本地log已准备完成');
                                self._logReady = true;
                                cb && cb();
                            }
                        } else {
                            console.log('Logger 本地log已准备完成');
                            self._logReady = true;
                            cb && cb();
                        }
                    }.bind(this),
                    fail:function () {
                        console.log('Logger 创建文件夹：'+logPath);
                        wx.getFileSystemManager().mkdir({
                            dirPath:logPath,
                            success:function () {
                                _createNewLogFile(logFilePath,cb);
                            }.bind(this),
                            fail:function (res) {
                                console.log('Logger 创建路径失败 '+res.errMsg);
                                if(res.errMsg && res.errMsg.indexOf('fail file already exists')!=-1){
                                    _createNewLogFile(logFilePath,cb);
                                }else {
                                    cb && cb('创建失败');
                                }
                            }.bind(this)
                        });
                    }.bind(this)
                });
            }
        }else {
            setupSHJSBridge(function (bridge) {
                bridge.invokeNative('log-init',{msg:msg,path:self.path},function (res) {
                    if (res == '1'){
                        self._logReady = true;
                    }
                });
            });
        }
    }

}

export default new GameLogStorage();
