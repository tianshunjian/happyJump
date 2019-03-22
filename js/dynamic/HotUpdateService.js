'use strict';

import HotUpdateManager from '../shared/hotUpdate/HotUpdateManager.js';
import * as HotUpdateConfigs from './HotUpdateConfigs.js';

class HotUpdateService {

    get hotService(){
        if (!this._hotService){
            this._hotService = new HotUpdateManager(HotUpdateConfigs.Version,HotUpdateConfigs.ConfigMap);
        }
        return this._hotService;
    }

    updateIfNeed(callback){
        this.hotService.updateConfigs(callback);
    }

    getObjInfoConfig(cb){
        this.hotService.getObjInfoConfig(HotUpdateConfigs.ObjInfo,cb);
    }
}

export default new HotUpdateService();
