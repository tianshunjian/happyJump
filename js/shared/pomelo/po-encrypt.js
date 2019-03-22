'use strict';

import EncryptConfig from './EncryptConfig.js';
import MD5 from '../encrypt/md5.js';
import AES from '../encrypt/aes.js';

/**
 * pomelo通信层数据加解密
 */
const Encrypt = {};

/**
 * aes密钥
 * @param key
 */
(function () {
    const guessKey = EncryptConfig.GUESS_KEY;
    const md5GuessKey = MD5.hash(guessKey);
    const md5GuessKeyBytes = AES.utils.hex.toBytes(md5GuessKey);
    // const keyBytes = AES.utils.utf8.toBytes(guessKey);
    // md5 array 16字节，非hex值
    // const md5GuessKeyBytes = MD5.array(keyBytes);
    Encrypt._aesEcb = new AES.ModeOfOperation.ecb(md5GuessKeyBytes);
})();

/**
 * Create aes-128-ecb by text.
 *
 * @param  {String} text
 * @return {String} aes-128-ecb string
 */
Encrypt.encrypt = function (text) {
    const textBytes = AES.utils.utf8.toBytes(text);
    const paddingTextBytes = AES.padding.pkcs7.pad(textBytes);
    const encryptedBytes = this._aesEcb.encrypt(paddingTextBytes);
    return AES.utils.hex.fromBytes(encryptedBytes);
};

/**
 * Parse aes-128-ecb to validate it and get the text
 *
 * @param  {String} aesText string
 * @return {string|null} text from aesText. null for illegal token.
 */
Encrypt.decrypt = function (aesText) {
    const encryptedBytes = AES.utils.hex.toBytes(aesText);
    const decryptedBytes = this._aesEcb.decrypt(encryptedBytes);
    const stripBytes = AES.padding.pkcs7.strip(decryptedBytes);
    return AES.utils.utf8.fromBytes(stripBytes);
};

export default Encrypt;
