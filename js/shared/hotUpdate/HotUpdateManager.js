import Utils from '../service/Utils';
// const HOST = 'http://localhost:8090';
const HOST = 'https://duqipai.56.com';
const VersionKey = 'c_version';

export const HU_PRODUCT_ENV = '/staticData/';
export const HU_DEVELOP_ENV = '/staticData_dev/';

//默认是正式环境
let ENV_TYPE = HU_PRODUCT_ENV;

export const SetHotUpdateENV = function(type){
    ENV_TYPE = type;
};

class HotUpdateManager {

    constructor(v,config){
        ///包内自带版本
        this._packageVersion = v;//'20180606140031';
        ///本地缓存版本
        this._localVersion = this.getItem(VersionKey) || '0';
        ///默认配置
        this._config = config;
    }

    _updateVersion(v) {
        console.error('本地版本更新为:' + v);
        this.setItem(VersionKey,v);
        this._localVersion = v;
    }

    _versionUrl(){
        return HOST + ENV_TYPE +'version.txt';
    }

    _configUrl(v,f) {

        function d(str){
            if (str){
                return str.trim().replace(/[\r\n]/g, '');
            } else {
                return str;
            }
        }
        return HOST + ENV_TYPE + d(v) + '/' +  f;
    }

    getItem(key) {
        return Utils.getStorageSync(key);
    }

    setItem(key, value) {
        return Utils.setStorageSync(key, value);
    }

    _requestData(url,success,fail) {
        console.log('请求数据:'+ url);
        const options = {
            url: url,
            dataType: 'json',
            success: function (res) {
                if (res.statusCode == 200) {
                    success && success(res.data);
                } else {
                    fail && fail({ msg: '文件下载失败' + res.statusCode });
                }
            },
            fail: fail
        };

        Utils.request(options);
    }

    /**
     * 下载配置文件
     */

    updateConfigs(callback){

        const self = this;

        /*
        * 1：需要更新；
        * 2：读取上次本地缓存的配置；
        * 3：读取包内缓存的配置信息；
        * */
        const checkUpdate = function(callback){

            const packageOrLocalVersion = function(cb){
                if(self._localVersion > self._packageVersion){
                    console.log('读取上次本地缓存的配置信息');
                    cb(2);
                }else {
                    console.log('读取包内缓存的配置信息');
                    cb(3);
                }
            };

            console.log('开始下载 version 文件');
            const versionURL = self._versionUrl();
            self._requestData(versionURL,function (data) {

                const remoteVersion = data.toString();
                console.log('rv:' + remoteVersion);
                console.log('lv:' + self._localVersion);
                console.log('pv:' + self._packageVersion);

                if ((remoteVersion > self._localVersion) && (remoteVersion > self._packageVersion)){
                    ///需要更新
                    console.log('需要更新，开始下载配置文件');
                    callback(1,remoteVersion);
                }else{
                    ///不需要更新
                    packageOrLocalVersion(callback);
                }
            }, function (err) {
                console.error('version 文件下载或者读取失败' + JSON.stringify(err));
                packageOrLocalVersion(callback);
            });

        };

        const downloadLastConfigs = function (v,callback) {

            const result = [];

            const keys = Object.keys(self._config);

            const checkFinishAll = function(){

                if (Object.keys(result).length == keys.length){
                    let hasUnfinishTask = false;
                    for(let i = 0; i < keys.length; i++){
                        const key = keys[i];
                        if (result[key] == null){
                            hasUnfinishTask = true;
                            result[key] = loadPackageConfig(key);
                            console.error('读取默认配置:' + JSON.stringify(result[key]));
                        }
                    }
                    callback(result);
                    //配置文件都下载下来了再更新版本
                    if (!hasUnfinishTask){
                        self._updateVersion(v);
                    }
                }
            };

            keys.forEach(function (key) {
                const value = self._config[key];
                const url = self._configUrl(v,value.fileName);
                self._requestData(url,function (data) {
                    result[key] = data;
                    //if(GetPlatform() == 'h5') data = JSON.stringify(data);
                    self.setItem(key,data);
                    console.error('配置文件下载成功：'+JSON.stringify(data));
                    checkFinishAll();
                },function (err) {
                    console.error('配置文件下载或者读取失败：'+JSON.stringify(err));
                    result[key] = null;
                    checkFinishAll();
                });
            });
        };

        const loadLocalConfigs = function (callback) {

            const result = [];

            const keys = Object.keys(self._config);

            const checkFinishAll = function(){
                if (Object.keys(result).length == keys.length){
                    callback(result);
                }
            };

            keys.forEach(function (key) {
                let data = self.getItem(key);
                if (data == undefined){ //如果是null 或者 undefined
                    console.error('找不到配置:' + key);
                    result[key] = loadPackageConfig(key);
                    console.error('读取默认配置:' + JSON.stringify(result[key]));
                }else {
                    //if(GetPlatform() == 'h5') data = JSON.parse(data);
                    result[key] = data;
                }
                checkFinishAll();
            });
        };

        const loadPackageConfig = function(k){

            const keys = Object.keys(self._config);

            for (let i = 0; i < keys.length; i ++){
                const key = keys[i];
                if (key == k){
                    const value = self._config[key];
                    const config = value.configs;
                    return config;
                }
            }

            return {};
        };

        const loadPackageConfigs = function(callback){
            const result = [];

            const keys = Object.keys(self._config);

            keys.forEach(function (key) {
                const value = self._config[key];
                const config = value.configs;
                result[key] = config;
            });

            callback(result);
        };

        checkUpdate(function (code,remoteVersion) {
            switch (code){
            case 1:{
                downloadLastConfigs(remoteVersion,callback);
                break;
            }
            case 2:{
                loadLocalConfigs(callback);
                break;
            }
            case 3:{
                loadPackageConfigs(callback);
                break;
            }
            }
        });
    }

    // 获取block配置信息
    getObjInfoConfig(defaultConfig,cb){
        // let url = 'res/file/objInfo.json';
        let url = HOST + ENV_TYPE +'objInfo.json';
        this._requestData(url,function (data) {
            console.log('下载obj配置成功 '+url);
            cb(data);
        }.bind(this),function (err) {
            console.log('下载obj配置失败 '+err);
            //使用包内配置
            cb({'ObjInfo' : defaultConfig});
        }.bind(this));
    }
}

export default HotUpdateManager;
