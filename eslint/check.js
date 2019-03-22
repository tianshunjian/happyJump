'use strict';
/**
 * 参考：http://web.jobbole.com/88899/
 */
/* eslint-disable */

const exec = require('child_process').exec;

/**
 * 日志
 * 颜色对照表：https://blog.csdn.net/autumn84/article/details/44816947
 */
const LOG = {
    /**
     * 默认颜色
     */
    log: function(msg){
        console.log(msg);
    },

    /**
     * 成功蓝色
     */
    suc: function(msg){
        console.log('\x1B[32m%s\x1B[0m',msg);
    },

    /**
     * 错误红色
     */
    err: function(msg){
        console.log('\x1B[31m%s\x1B[0m',msg);
    }
};

// eslint
const lint = function(filename,cb) {
    const execCb = function(error, stdout, stderr) {
        if(stdout) {
            // 输出eslint错误信息
            LOG.err('<<<<<< eslint fail');
            LOG.log(stdout);
            LOG.err('>>>>>> eslint fail');
            cb && cb(1);
        } else {
            cb && cb(0);
        }
    };
    // 通过node子进程执行命令
    exec('eslint ' + filename + ' --cache --quiet --fix', execCb);
};

// git diff
const diff = function(cb) {
    const execCb = function(error, stdout, stderr) {
        if(stdout) {
            // 通过切割换行，拿到文件列表
            const fileList = stdout.replace('\n',' ');
            LOG.log('diff file list: ' + fileList);
            lint(fileList,cb);
        }else {
            cb && cb(0);
        }
    };
    // 通过node子进程执行命令
    exec('git diff --staged --name-only --diff-filter=ACMR -- */**.js', execCb);
};

// 执行检查
const task = function() {
    diff(function(pass) {
        if(pass === 0) {
            LOG.suc('eslint success');
        }
        process.exit(pass);
    });
};

const startTask = function() {
    LOG.log('eslint start...');
    task();
};

// 执行检查
startTask();
