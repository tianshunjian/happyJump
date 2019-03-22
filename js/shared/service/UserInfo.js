import { GetENV, PRODUCT_ENV_TYPE} from './Env.js';
import Utils from './Utils';

const StorageKey = {
    kUserInfo: function () {
        if(GetENV() === PRODUCT_ENV_TYPE){
            return 'kUserInfo';
        }else {
            return GetENV() + '_kUserInfo';
        }
    }
    // ,
    // kUserJscode: function () {
    //     if(GetENV() === PRODUCT_ENV_TYPE){
    //         return 'kUserJscode';
    //     }else {
    //         return GetENV() + '_kUserJscode';
    //     }
    // },
    // kGateServer: function () {
    //     if(GetENV() === PRODUCT_ENV_TYPE){
    //         return 'kGateServer';
    //     } else {
    //         return GetENV() + '_kGateServer';
    //     }
    // }
};

class UserInfo {

    getItem(key) {
        return Utils.getStorageSync(key);
    }

    setItem(key, value) {
        return Utils.setStorageSync(key, value);
    }

    removeItem(key){
        return Utils.removeStorageSync(key);
    }

    /**
     * 用户信息
     */
    get userInfoData(){
        if (!this._userInfoData) {
            this._userInfoData = this.getItem(StorageKey.kUserInfo()) || {};
        }
        return this._userInfoData;
    }

    /**
     * 保存用户信息到本地除了numberId
	 * @param i
	 */
    set userInfoData(i){
        if(typeof (i) != 'undefined'){
            this._userInfoData = Object.assign({},i);
            const info = Object.assign({},i);
            delete info['numberId'];
            this.setItem(StorageKey.kUserInfo(),info);
        }
    }

    /**
     * 游戏信息
     */
    get gameInfoData(){
        return this._gameInfoData || [];
    }

    set gameInfoData(i){
        if(typeof (i) != 'undefined'){
            this._gameInfoData = Object.assign([],i);
        }
    }

    /**
     * 皮肤信息
     */
    get skinInfoData(){
        return this._skinInfoData || [];
    }

    set skinInfoData(i){
        if(typeof (i) != 'undefined'){
            this._skinInfoData = Object.assign([],i);
        }
    }

    /**
     * 背包信息
     */
    get knapsackInfoData(){
        return this._knapsackInfoData || [];
    }

    set knapsackInfoData(i){
        if(typeof (i) != 'undefined'){
            this._knapsackInfoData = Object.assign([],i);
        }
    }

    /**
     * numberId
     */
    get numberId(){
        return this.userInfoData.numberId;
    }

    set numberId(nid){

        const userInfo = this.userInfoData;
        if(typeof (nid) == 'undefined' || nid == null) {
            delete userInfo['numberId'];
        }else {
            userInfo.numberId = nid;
        }
        // numberId 不再存到本地！
        // this.setItem(StorageKey.kUserInfo(),userInfo);
    }

    /**
     * jsCode
     */
    get jsCode(){
        return this._jsCode || '';
        // return this.getItem(StorageKey.kUserJscode());
    }

    set jsCode(c){
        if(typeof (c) == 'undefined' || c == null) {
            this._jsCode = '';
            // this.removeItem(StorageKey.kUserJscode());
        }else {
            // this.setItem(StorageKey.kUserJscode(),c);
            this._jsCode = c;
        }
    }

    /**
     * 时间差，代表serverTime - userTime
     */
    get timeDifferSU(){
        if(typeof (this._timeDifferSU) == 'undefined') {
            return 0;
        }else {
            return this._timeDifferSU;
        }
    }

    set timeDifferSU(t){
        if(typeof (t) != 'undefined'){
            this._timeDifferSU = t;
        }
    }

    /**
     * connector地址
     */
    get connector () {
        return this._connector || null;
    }

    set connector (conn) {
        if (conn) {
            this._connector = Object.assign({},conn);
        }
    }

    /**
     * gate服务器地址
     */
    get gateServer () {
        return this._gateServer || null;
        // return this.getItem(StorageKey.kGateServer()) || null;
    }

    set gateServer (gate) {
        if (gate) {
            this._gateServer = Object.assign({},gate);
            // this.setItem(StorageKey.kGateServer(), gate);
        }
    }

    cleanGateServer () {
        this.removeItem(StorageKey.kGateServer());
    }

}

export default new UserInfo();
