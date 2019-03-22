const GameModalCss = `
    #white-gm-container{
        -webkit-touch-callout:none; /*系统默认菜单被禁用*/
        -webkit-user-select:none; /*webkit浏览器*/
        -khtml-user-select:none; /*早期浏览器*/
        -moz-user-select:none;/*火狐*/
        -ms-user-select:none; /*IE10*/
        user-select:none;
    
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: -9998;
        background: rgba(0,0,0,0.40);

        display: flex;
        display: -o-flex;
        display: -webkit-flex;
        display: -moz-flex;
        justify-content: center;
        -webkit-justify-content: center;
        align-items: center;
        -webkit-align-items: center;
    }
    #white-gm{
        height: auto;
        background: #FFFDF8;
        border: 1px solid #e6e6e6;
        border-radius: 12px;
        overflow: hidden;
    }
    #white-gm-title{
        padding-top: 8.5%;
        width: 100%;
        font-family: PingFangSC-Regular;
        color: #030303;
        text-align: center;
    }
    #white-gm-title.hidden{
        display: none;
    }
    #white-gm-content{
        width: 78.8%;
        margin: 7% auto;
        font-family: PingFangSC-Regular;
        color: #030303;
        word-wrap:break-word;
        text-align: center;
    }
    #white-gm-content.noTitle{
        margin-top: 11.4%;
    }
    #white-gm-content.manyLines{
        text-align: left;
    }
    #white-gm-btn-container{
        width: 100%;
        margin-top: 6.9%;
        border-top: solid 1px #e6e6e6;

        display: flex;
        display: -o-flex;
        display: -webkit-flex;
        display: -moz-flex;
        justify-content: space-between;
        -webkit-justify-content: space-between;
        align-items: center;
        -webkit-align-items: center;
    }
    button.white-gm-btn{
        display: block;
        width: 50%;
        height: 100%;
        background-color: transparent;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        font-family: PingFangSC-Medium;
        color: #4E4E4E;
        background-size: 100% 100%;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
    }
    #white-gm-btn-cancel{
        box-sizing: border-box;
        border-right: solid 1px #e6e6e6;
        color: #9B9B9B;
    }
    #white-gm-btn-confirm{
        color: #F5A623;
    }
    button.white-gm-btn.hidden{
        display:none;
    }
    button.white-gm-btn.bigger{
        width: 100%;
    }
`;

const GameModalHtml = `
    <div id="white-gm">
        <div id="white-gm-title" class="hidde">title</div>
        <p id="white-gm-content">哈哈哈</p>
        <div id="white-gm-btn-container">
            <button id="white-gm-btn-cancel" class="white-gm-btn">取消</button>
            <button id="white-gm-btn-confirm" class="white-gm-btn">确定</button>
        </div>
    </div>
`;

export default class GameModal{
    /**
     * options:{
     *      title:
     *      content:
     *      cancelText:
     *      confirmText:
     *      success:
     * }
     */
    static showGameModal(options){
        options = options || {};
        let titleStr = options.title;
        let contentStr = options.content || '';
        let showCancel = options.showCancel == null ? true : options.showCancel;
        let cancelText = options.cancelText || '取消';
        let confirmText = options.confirmText || '确定';
        let success = typeof options.success == 'function' ? options.success : undefined;


        let ratio = window.innerWidth / 750;
        let gmContainer = document.getElementById('white-gm-container');

        let btnClick = function(par){
            gmContainer.style.zIndex = '-9998';
            gmContainer.style.opacity = '0';
            success && success(par);
        };

        let gm, gmTitle, gmContent, gmBtnContainer, gmCancelBtn, gmConfirmBtn;
        //若是首次调用
        if(gmContainer == null){
            //引入样式文件
            let body = document.getElementsByTagName('body')[0];
            let styleTag = document.createElement('style');
            styleTag.setAttribute('type', 'text/css');
            styleTag.innerHTML = GameModalCss;    //样式
            body.appendChild(styleTag);
            //容器
            gmContainer = document.createElement('div');
            gmContainer.setAttribute('id', 'white-gm-container');
            body.appendChild(gmContainer);
            //html
            gmContainer.innerHTML = GameModalHtml;
        }

        gm = document.getElementById('white-gm');
        gmTitle = document.getElementById('white-gm-title');
        gmContent = document.getElementById('white-gm-content');
        gmBtnContainer = document.getElementById('white-gm-btn-container');
        gmCancelBtn = document.getElementById('white-gm-btn-cancel');
        gmConfirmBtn = document.getElementById('white-gm-btn-confirm');

        gm.style.width = (492*ratio)+'px';
        gmTitle.style.fontSize = (28*ratio)+'px';
        gmContent.style.fontSize = (24*ratio)+'px';
        gmContent.style.lineHeight = (33*ratio)+'px';
        gmBtnContainer.style.height = (104*ratio)+'px';
        gmCancelBtn.style.fontSize = gmConfirmBtn.style.fontSize = (24*ratio)+'px';

        if(titleStr == null){
            gmTitle.classList.add('hidden');
            gmContent.classList.add('noTitle');
        }else{
            gmTitle.classList.remove('hidden');
            gmContent.classList.remove('noTitle');
            gmTitle.innerText = titleStr;
        }

        gmContent.innerHTML = contentStr;
        //超过三行的文字两端对齐，否则居中对齐
        let style = window.getComputedStyle(gmContent, null);
        let gmcHeight = style.height;
        let gmcLineHeight = style.lineHeight;
        gmcHeight = parseInt(gmcHeight.slice(0, gmcHeight.length-2));
        gmcLineHeight = parseInt(gmcLineHeight.slice(0, gmcLineHeight.length-2));
        if(gmcHeight > gmcLineHeight*3){
            gmContent.classList.add('manyLines');
        }else{
            gmContent.classList.remove('manyLines');
        }

        if(showCancel){
            gmCancelBtn.classList.remove('hidden');
            gmConfirmBtn.classList.remove('bigger');
        }else{
            gmCancelBtn.classList.add('hidden');
            gmConfirmBtn.classList.add('bigger');
        }
        gmConfirmBtn.innerText = confirmText;
        gmCancelBtn.innerText = cancelText;
        gmCancelBtn.onclick = function (){
            btnClick({cancel: true});
        };
        gmConfirmBtn.onclick = function (){
            btnClick({confirm: true});
        };

        gmContainer.style.zIndex = '9998';
        gmContainer.style.opacity = '1';
    }
}