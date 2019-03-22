'use strict';
import {PLATFORM,GetPlatform} from './Constants';
import Toast from './Toast';
import GameModal from './GameModal';

class Utils {

    static parseString(info) {
        let subStrArray = info.split('[-]');
        let parseResult = [];
        subStrArray.forEach(function (item) {
            if (item) {
                let start = -1;
                let stop = -1;
                for (let i = 0; i < item.length; i++) {
                    if (item.charAt(i) === '<') {
                        start = i;
                    } else if (item.charAt(i) === '>') {
                        stop = i;
                    }
                }
                let itemObj = {};
                if (start != -1 && stop != -1 && stop > start + 1) {
                    let styleStr = item.substring(start + 1, stop);
                    let contentStr = item.substring(stop + 1);
                    let styleObj = {};
                    itemObj.c = contentStr;
                    itemObj.style = styleObj;
                    let styleArray = styleStr.split('-');
                    styleArray.forEach(function (value) {
                        if (value) {
                            if (value.charAt(0) === 'c') {
                                styleObj.c = value.substring(1);
                            } else if (value === 'b') {
                                styleObj.b = 1;
                            } else if (value === 'i') {
                                styleObj.i = 1;
                            } else if (value.charAt(0) === 'f') {
                                styleObj.f = value.substring(1);
                            }
                        }
                    });
                } else {
                    itemObj.c = item;
                }
                parseResult.push(itemObj);
            }
        });

        return parseResult;
    }

    /**
     * @param {string} originalStr - 需要处理的原始字符串
     * @param {int} expectLength - 希望保留的汉字个数（不需要考虑英文和数字，内部会处理)，两个英文算做一个汉字
     */
    static stringEndEllipsis(originalStr, expectLength) {
        originalStr = originalStr || '';
        if(!expectLength) {
            expectLength = 5;
        }
        var endIndex = 0;
        var realExpectLength = expectLength * 2;
        var currentLength = 0;
        for(var i = 0; i < originalStr.length; i++) {
            if(originalStr.charCodeAt(i) > 255) {
                currentLength += 2;
            }else{
                ++currentLength;
            }
            endIndex = i;
            if(currentLength >= realExpectLength) {
                break;
            }
        }

        if(endIndex  < originalStr.length - 1) {
            return originalStr.substring(0, endIndex + 1) + '...';
        } else {
            return originalStr;
        }
    }

    static getStorageSync (key) {

        switch (GetPlatform()) {
        case PLATFORM.kH5: {
            let value = localStorage.getItem(key);
            if (this.isJSON(value)) {
                value = JSON.parse(value);
            }
            return value;
        }
        case PLATFORM.kWeChatGame:{
            return wx.getStorageSync(key);
        }
        }
    }

    static setStorageSync (key, value) {

        switch (GetPlatform()) {
        case PLATFORM.kH5: {
            if(typeof value == 'object'){
                return localStorage.setItem(key, JSON.stringify(value));
            }else{
                return localStorage.setItem(key, value);
            }
        }
        case PLATFORM.kWeChatGame:{
            wx.setStorageSync(key, value);
        }
            break;
        }
    }

    static removeStorageSync(key){
        switch (GetPlatform()) {
        case PLATFORM.kH5: {
            localStorage.removeItem(key);
        }
            break;
        case PLATFORM.kWeChatGame:{
            wx.removeStorageSync(key);
        }
            break;
        }
    }

    static isJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                if(typeof obj == 'object' && obj ){
                    return true;
                }else{
                    return false;
                }

            } catch(e) {
                console.log('error：'+str+'!!!'+e);
                return false;
            }
        }
    }

    static request(options){

        switch (GetPlatform()) {
        case PLATFORM.kH5: {

            let xhr = new XMLHttpRequest();
            let url = options.url || '';
            let success = options.success;
            let fail = options.fail;
            xhr.onreadystatechange = function () {

                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 304) { // opera浏览器有时返回304
                        if (typeof (success) === 'function') {
                            let data = JSON.parse(xhr.responseText);
                            success({
                                statusCode: 200,
                                data: data
                            });
                            console.log(data);
                        }
                    } else {
                        if (typeof (fail) === 'function') {
                            fail(xhr.statusText);
                        }
                    }
                }
            };
            xhr.open('GET', url);
            xhr.send(null);
        }
            break;
        case PLATFORM.kWeChatGame:{
            wx.request(options);
        }
            break;
        }
    }

    /*
    * options: {
    *   icon: 图标，不必要。默认success, 可选值：success，loading，none，自定图片路径
    *   title:  标题，不必要。默认''
    *   duration:   持续时间，不必要，默认2500ms，小于0时永久持续
    *   mask:   是否有蒙层，不必要，默认false
    *   longText:   title是否需要显示较多文字，默认为false，当icon=='none'时必定为true。
    * }
    * */
    static showToast(options){
        switch (GetPlatform()){
        case PLATFORM.kH5:
            Toast.showToast(options);
            break;
        case PLATFORM.kWeChatGame:
        default:
            wx.showToast(options);
            break;
        }
    }

    static showLoading(options){
        switch (GetPlatform()){
        case PLATFORM.kH5:
            Toast.showLoading(options);
            break;
        case PLATFORM.kWeChatGame:
            wx.showLoading(options);
            break;
        }
    }

    static hideToast(){
        switch (GetPlatform()){
        case PLATFORM.kH5:
            Toast.hideToast();
            break;
        case PLATFORM.kWeChatGame:
            wx.hideToast();
            break;
        }
    }

    static hideLoading(){
        switch (GetPlatform()){
        case PLATFORM.kH5:
            Toast.hideLoading();
            break;
        case PLATFORM.kWeChatGame:
            wx.hideLoading();
            break;
        }
    }

    /**
     * 游戏内的模态弹框
     * options:{
     *      title:  string 标题，不必要，不设置该属性即展示无标题
     *      content:    string 内容
     *      showCancel:     boolean 是否展示取消按钮，默认为true
     *      cancelText:     string 取消按钮文案
     *      confirmText:    string 确定按钮文案
     *      success:    function(res) 按钮点击回调，点击确定按钮res {confirm:true}，点击取消按钮res {cancel:true}
     * }
     */
    static showModal(options){
        switch (GetPlatform()){
        case PLATFORM.kH5:
            GameModal.showGameModal(options);
            break;
        case PLATFORM.kWeChatGame:
        default:
            wx.showModal(options);
            break;
        }
    }
}

export default Utils;
