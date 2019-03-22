'use strict';

class MRUtil {

    static showLoading(title){
        if (window.WechatGame){
            wx.showLoading({
                title: title||'',
                mask: true
            });
        }else {
            //TODO:
        }
    }

    static hiddenLoading(){
        if (window.WechatGame){
            wx.hideLoading();
        }else {
            //TODO:
        }
    }

    static radiusForStep(step){
        const config = window.JumpGoConfigs;
        if (!config){
            console.error('没有配置文件！！！');
            return 0.5;
        }

        if (!this._jump_radius_config){
            const keys = Object.keys(config);
            const sortedKeys = keys.sort(function(a, b) {
                return a - b;
            });

            const arr = [];

            for (let i = 0; i < sortedKeys.length; i++){
                const key = sortedKeys[i];
                const value = config[key];
                const c = {
                    s:parseInt(value.S0),
                    v:1.0*parseInt(value.V)/100.0
                };
                arr.push(c);
            }

            arr.reverse();

            this._jump_radius_config = arr;
        }

        for (let i = 0; i < this._jump_radius_config.length; i++){
            const item = this._jump_radius_config[i];
            const s = item.s;
            if (step >= s){
                return item.v;
            }
        }

        return 0.5;
    }

}

export default MRUtil;
