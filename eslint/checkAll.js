'use strict';
/**
 * 参考：http://web.jobbole.com/88899/
 */
/* eslint-disable */

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const process = require('process');

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

function travel(dir,extension,excepts) {
	const result = [];

	const files = fs.readdirSync(dir);
	for(let f = 0; f < files.length; f ++){
		const file = files[f];

		const pathname = path.join(dir, file);

		if (file == "fuhuoka.png"){
			console.log("");
		}
		if (file.indexOf('.') == 0){
			continue;
		}
		const isDir = fs.statSync(pathname).isDirectory();
		if (!isDir && extension){
			if (file.indexOf(extension) !== file.length - extension.length){
				continue;
			}
		}

		if (excepts && excepts.length > 0){
			let exceptFalg = false;
			for (let i = 0; i < excepts.length; i++) {
				const except = excepts[i];
				if (pathname.indexOf(except) != -1) {
					exceptFalg = true;
					break;
				}
			}
			if (exceptFalg){
				continue;
			}
		}

		if (isDir) {
			const r = travel(pathname,extension,excepts);
			Array.prototype.push.apply(result,r);
		} else {
			result.push(pathname);
		}
	}

	return result;
}

function findAllJsFile() {
	let rootPath = process.cwd();
	// rootPath = path.resolve(rootPath,"../");
	const files = travel(rootPath,".js",["check.js","checkAll.js","node_modules","dist","three.min.js","less.min.js","weapp-adapter.js"]);
	return files;
}

// eslint
const lint = function(filename,cb) {
	const execCb = function(error, stdout, stderr) {
		if(stdout || error) {
			// 输出eslint错误信息
			LOG.err('<<<<<< eslint fail');
			LOG.log(stdout || error);
			LOG.err('>>>>>> eslint fail');
			cb && cb(1);
		} else {
			cb && cb(0);
		}
	};
	// 通过node子进程执行命令
	exec('eslint ' + filename + ' --quiet --fix', execCb);
};

// git diff
const diff = function(cb) {

	const files = findAllJsFile();
	const fileStr = files.join(' ');
	lint(fileStr,cb);
	// const execCb = function(error, stdout, stderr) {
	//     if(stdout) {
	//         // 通过切割换行，拿到文件列表
	//         const fileList = stdout.replace('\n',' ');
	//         LOG.log('diff file list: ' + fileList);
	//         lint(fileList,cb);
	//     }else {
	//         cb && cb(0);
	//     }
	// };
	// // 通过node子进程执行命令
	// exec('git diff --staged --name-only --diff-filter=ACMR -- */**.js', execCb);
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
