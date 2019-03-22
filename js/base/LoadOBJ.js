'use strict';

import * as Config from './Config.js';
import * as THREE from '../libs/three/three.min.js';
import  '../libs/three/DDSLoader.js';
import  '../libs/three/MTLLoader.js';
import  '../libs/three/OBJLoader.js';
import Utils from '../shared/service/Utils';

var loadOBJ = function () {
    function loadOBJ(path,fileName,cb,isLocal) {
        var _this3 = this;

        this._config = Config;

        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                // var percentComplete = xhr.loaded / xhr.total * 100;
                // console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };

        var onError = function ( xhr ) {
            console.log('错误');
            console.log(xhr);
        };

        THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader());
        var urlPath = this._config.RES_REMOTE_SERVER+path;
        if (window.WechatGame){
            urlPath = this._config.RES_REMOTE_SERVER+path;
        } else {
            urlPath = this._config.RES_LOCAL_SERVER+path;
        }
        if (isLocal){
            urlPath = path;
        }
        var filename = fileName;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( urlPath );
        var mtlFile = filename+'.mtl';
        if (isLocal){
            //加载本地
            console.log('加载本地obj');
            mtlLoader.loadLocal(mtlFile , function( materials ) {
                materials.preload();
                let objLoader = new THREE.OBJLoader();
                objLoader.setMaterials( materials );
                objLoader.setPath( urlPath);
                let objFile = filename+'.obj';
                objLoader.loadLocal( objFile, function ( object ) {
                    for (let i=0;i<object.children.length;++i){
                        let obj = object.children[i];
                        if(obj instanceof THREE.Mesh){
                            obj.material.side = THREE.DoubleSide;
                        }
                    }
                    object.position.set(0,0,0);
                    if (cb){
                        cb(object);
                    }
                }, onError );
            },onError);
        } else{
            if (window.WechatGame){
                //判断模型是否已缓存到本地
                wx.getStorage({
                    key:urlPath+mtlFile,
                    success:function (res) {
                        // console.log('加载 本地缓存 的模型文件'+urlPath+mtlFile);
                        mtlLoader.loadLocalText(mtlFile,function( materials ) {
                            materials.preload();
                            let objLoader = new THREE.OBJLoader();
                            objLoader.setMaterials( materials );
                            objLoader.setPath( urlPath);
                            let objFile = filename+'.obj';
                            objLoader.loadLocalText( objFile, function ( object ) {
                                for (let i=0;i<object.children.length;++i){
                                    let obj = object.children[i];
                                    if(obj instanceof THREE.Mesh){
                                        obj.material.side = THREE.DoubleSide;
                                    }
                                }
                                object.position.set(0,0,0);
                                if (cb){
                                    cb(object);
                                }
                            });
                        });
                    }.bind(this),
                    fail:function (res) {
                        // console.log('加载 远程资源：'+urlPath+mtlFile);
                        mtlLoader.load(mtlFile , function( materials ) {
                            materials.preload();
                            let objLoader = new THREE.OBJLoader();
                            objLoader.setMaterials( materials );
                            objLoader.setPath( urlPath);
                            let objFile = filename+'.obj';
                            objLoader.load( objFile, function ( object ) {
                                // console.log(object);
                                for (let i=0;i<object.children.length;++i){
                                    let obj = object.children[i];
                                    if(obj instanceof THREE.Mesh){
                                        obj.material.side = THREE.DoubleSide;
                                    }
                                }
                                object.position.set(0,0,0);
                                if (cb){
                                    cb(object);
                                }
                            }, onProgress, onError );
                        });
                    }.bind(this)
                });
            }else{
                mtlLoader.load(mtlFile , function( materials ) {
                    materials.preload();
                    let objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials( materials );
                    objLoader.setPath( urlPath);
                    let objFile = filename+'.obj';
                    objLoader.load( objFile, function ( object ) {
                        // console.log(object);
                        for (let i=0;i<object.children.length;++i){
                            let obj = object.children[i];
                            if(obj instanceof THREE.Mesh){
                                obj.material.side = THREE.DoubleSide;
                            }
                        }
                        object.position.set(0,0,0);
                        if (cb){
                            cb(object);
                        }
                    }, onProgress, onError );
                });
            }
        }
    }
    return loadOBJ;
}();

export default loadOBJ;
