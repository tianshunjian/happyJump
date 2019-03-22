//线上环境
export const PRODUCT_ENV_TYPE = 'product';
//测试环境
export const DEVELOP_ENV_TYPE = 'test';
//version服务器地址
export const ServerConfig = function () {
    return {
        kHost: 'wss://gws.56.com/minigame-version-main',
        //kHost: '10.7.36.255',
        //kPort: 3014
    };
};
//当前环境！
let ENV_TYPE = PRODUCT_ENV_TYPE;
export const SetENV = function (ENV) {
    ENV_TYPE = ENV;
};
export const GetENV = function () {
    return ENV_TYPE;
};
