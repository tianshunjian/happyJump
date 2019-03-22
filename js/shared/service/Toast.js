const ToastCss = `#white-toast-container{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -10000;
            display: -webkit-flex;
            display: -webkit-box;
            display: flex;
            -webkit-align-items: center;
            -webkit-box-align: center;
            align-items: center;
            -webkit-justify-content: center;
            -webkit-box-pack: center;
            justify-content: center;
            
            -webkit-touch-callout:none; /*系统默认菜单被禁用*/
            -webkit-user-select:none; /*webkit浏览器*/
            -khtml-user-select:none; /*早期浏览器*/
            -moz-user-select:none;/*火狐*/
            -ms-user-select:none; /*IE10*/
            user-select:none;
        }
        #white-toast{
            width: 240px;
            height: 240px;
            border-radius: 10px;
            background-color: rgba(0,0,0,0.5);
            overflow: hidden;
        }
        #white-toast.long{
            min-width: 240px;
            max-width: 400px;
            height: auto;
            width: auto;
        }
        #white-toast-up{
            box-sizing: border-box;
            height: 160px;
            width: 100%;
            padding-top: 20px;
        }
        #white-toast-up.hidden{
            display: none;
        }
        #white-toast-icon{
            width: 140px;
            height: 140px;
            background-size: 100% 100%;
            margin: 0 auto;
        }
        #white-toast-loading-cont, #white-toast-success-cont{
            /*width: 100%;
            height: 100%;*/
            width: 140px;
            height: 140px;
            margin: 0 auto;
            position: relative;
        }
        #white-toast-loading-cont.hidden, #white-toast-success-cont.hidden, #white-toast-icon.hidden{
            display: none;
        }
        #white-toast-low{
            height: 80px;
            width: 100%;
            line-height: 80px;
            text-align: center;
            color: white;
            font-size: 16px;
        }
        #white-toast-low.long{
            width: auto;
            height: auto;
            box-sizing: border-box;
            min-width: 240px;
            max-width: 400px;
            padding: 30px;
            line-height: 20px;
            word-wrap:break-word;
        }
        #white-toast-span{
            margin: auto auto;
        }
        .point{
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: white;
            border-radius: 50%;
            top: 80px;
            animation:jumpPoint 500ms infinite both;
            -webkit-animation: jumpPoint 500ms infinite both;
            -moz-animation: jumpPoint 500ms infinite both;
            -o-animation: jumpPoint 500ms infinite both;
        }
        .point.first{
            left: 30px;
        }
        .point.second{
            left: 60px;
            animation-delay:125ms;
            -webkit-animation-delay:125ms;
        }
        .point.third{
            left: 90px;
            animation-delay:250ms;
            -webkit-animation-delay:250ms;
        }
        @keyframes jumpPoint{
            0%{
                top: 80px;
            }
            50%{
                top: 60px;
            }
            0%{
                top: 80px;
            }
        }
        @-webkit-keyframes jumpPoint {
            0%{
                top: 80px;
            }
            50%{
                top: 60px;
            }
            0%{
                top: 80px;
            }
        }
        @-moz-keyframes jumpPoint {
            0%{
                top: 80px;
            }
            50%{
                top: 60px;
            }
            0%{
                top: 80px;
            }
        }
        @-o-keyframes jumpPoint {
            0%{
                top: 80px;
            }
            50%{
                top: 60px;
            }
            0%{
                top: 80px;
            }
        }
        #white-toast-success-circle{
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background-color: white;
            margin: 0 auto;
        }
        #white-toast-success-circle.play{
            animation: circleGo 1s 1 both;
            -webkit-animation: circleGo 1s 1 both;
        }
        #white-toast-success-circle.restart{
            animation: circleGo2 1s 1 both;
            -webkit-animation: circleGo2 1s 1 both;
        }
        #white-toast-success-dui{
            position: absolute;
            width: 100px;
            height: 60px;
            top: 30px;
            left: 20px;
            transform: rotate(-45deg);
            overflow: hidden;
        }
        #white-toast-success-dui1{
            width: 20px;
            height: 60px;
            background-color: #FFC600;
            border-radius: 8px 8px 0 8px;
        }
        #white-toast-success-dui1.play{
            animation: dui1Go 0.5s 1 both;
            -webkit-animation: dui1Go 0.5s 1 both;
        }
        #white-toast-success-dui1.restart{
            animation: dui1Go2 0.5s 1 both;
            -webkit-animation: dui1Go2 0.5s 1 both;
        }
        #white-toast-success-dui2{
            width: 100px;
            height: 20px;
            position: absolute;
            top: 40px;
            left: 0px;
            background-color: #FFC600;
            border-radius: 0 8px 8px 8px;
        }
        #white-toast-success-dui2.play{
            animation: dui2Go 0.5s 0.5s 1 both;
            -webkit-animation: dui2Go 0.5s 0.5s 1 both;
        }
        #white-toast-success-dui2.restart{
            animation: dui2Go2 0.5s 0.5s 1 both;
            -webkit-animation: dui2Go2 0.5s 0.5s 1 both;
        }
        @keyframes circleGo{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-webkit-keyframes circleGo{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-moz-keyframes circleGo{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-o-keyframes circleGo{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @keyframes dui1Go {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-webkit-keyframes dui1Go {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-moz-keyframes dui1Go {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-o-keyframes dui1Go {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @keyframes dui2Go {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-webkit-keyframes dui2Go {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-moz-keyframes dui2Go {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-o-keyframes dui2Go {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        
        
        @keyframes circleGo2{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-webkit-keyframes circleGo2{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-moz-keyframes circleGo2{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @-o-keyframes circleGo2{
            from{
                transform: scale(0);
                -webkit-transform: scale(0);
                -moz-transform: scale(0);
                -o-transform: scale(0);
            }
            to{
                transform: scale(1);
                -webkit-transform: scale(1);
                -moz-transform: scale(1);
                -o-transform: scale(1);
            }
        }
        @keyframes dui1Go2 {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-webkit-keyframes dui1Go2 {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-moz-keyframes dui1Go2 {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @-o-keyframes dui1Go2 {
            from{
                height: 0px;
            }
            to{
                height: 60px;
            }
        }
        @keyframes dui2Go2 {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-webkit-keyframes dui2Go2 {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-moz-keyframes dui2Go2 {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }
        @-o-keyframes dui2Go2 {
            from{
                width: 0px;
            }
            to{
                width: 100px;
            }
        }`;

const toastHtml = `
        <div id="white-toast">
            <div id="white-toast-up">
                <div id="white-toast-icon"></div>
                <div id="white-toast-loading-cont">
                    <div class='point first'></div>
                    <div class='point second'></div>
                    <div class='point third'></div>
                </div>
                <div id="white-toast-success-cont">
                    <div id="white-toast-success-circle"></div>
                    <div id="white-toast-success-dui">
                        <div id="white-toast-success-dui1"></div>
                        <div id="white-toast-success-dui2"></div>
                    </div>
                </div>
            </div>
            <div id="white-toast-low">
                <span id="white-toast-span">loading...</span>
            </div>
        </div>`;

export default class Toast{

    /*
    * options {
    *   icon: 图标，不必要。默认success, 可选值：success，loading，none，自定图片路径
    *   title:  标题，不必要。默认''
    *   duration:   持续时间，不必要，默认2500ms，小于0时永久持续
    *   mask:   是否有蒙层，不必要，默认false
    *   longText:   title是否需要显示较多文字，默认为false，当icon=='none'时必定为true。
    * }
    * */
    static showToast(options){
        clearTimeout(this.toastTimeout);
        options = options || {};
        let ratio = window.innerWidth / 750;
        let ratioF = 750 / window.innerWidth;
        let icon = options.icon || 'success';
        let title = options.title || '';
        let duration = options.duration || 2500;
        let mask = options.mask == null? false : options.mask;
        let longText = options.longText || false;

        let toast = document.getElementById('white-toast-container');
        if(toast == null){
            let body = document.getElementsByTagName('body')[0];
            let styleTag = document.createElement('style');
            styleTag.setAttribute('type', 'text/css');
            styleTag.innerHTML = ToastCss;
            body.appendChild(styleTag);

            toast = document.createElement('div');
            toast.setAttribute('id', 'white-toast-container');
            if(mask){
                toast.style.pointerEvents = 'auto';
            }else{
                toast.style.pointerEvents = 'none';
            }
            body.appendChild(toast);
            toast.innerHTML = toastHtml;

            //适配，toast缩小，内部字体放大
            let whiteToast = document.getElementById('white-toast');
            whiteToast.style.transform = 'scale('+ratio+')';
            whiteToast.style.webkitTransform = 'scale('+ratio+')';
            let whiteToastLow = document.getElementById('white-toast-low');
            let textDiv = document.getElementById('white-toast-span');
            textDiv.style.fontSize = (16 * ratioF)+'px';
            textDiv.style.lineHeight = (20 * ratioF) + 'px';

            let imgCont = document.getElementById('white-toast-up');    //toast上半部分
            let imgTag = document.getElementById('white-toast-icon');   //icon
            let loading = document.getElementById('white-toast-loading-cont');  //loading部分
            let success = document.getElementById('white-toast-success-cont');  //成功部分
            let loadingCircle = document.getElementById('white-toast-success-circle');
            let loadingDui1 = document.getElementById('white-toast-success-dui1');
            let loadingDui2 = document.getElementById('white-toast-success-dui2');

            if(longText){
                whiteToastLow.classList.add('long');
                whiteToast.classList.add('long');
            }else{
                whiteToastLow.classList.remove('long');
                whiteToast.classList.remove('long');
            }
            if(icon == 'none'){
                imgCont.classList.add('hidden');
                whiteToastLow.classList.add('long');
                whiteToast.classList.add('long');
            }else if(icon == 'success'){
                imgCont.classList.remove('hidden');
                imgTag.classList.add('hidden');
                loading.classList.add('hidden');
                success.classList.remove('hidden');
                if(loadingCircle.classList.contains('play')){
                    loadingCircle.classList.remove('play');
                    loadingDui1.classList.remove('play');
                    loadingDui2.classList.remove('play');

                    loadingCircle.classList.add('restart');
                    loadingDui1.classList.add('restart');
                    loadingDui2.classList.add('restart');
                }else{
                    loadingCircle.classList.remove('restart');
                    loadingDui1.classList.remove('restart');
                    loadingDui2.classList.remove('restart');

                    loadingCircle.classList.add('play');
                    loadingDui1.classList.add('play');
                    loadingDui2.classList.add('play');
                }
            }else if(icon == 'loading'){
                imgCont.classList.remove('hidden');
                imgTag.classList.add('hidden');
                success.classList.add('hidden');
                loading.classList.remove('hidden');
            }else{
                imgCont.classList.remove('hidden');
                imgTag.classList.remove('hidden');
                loading.classList.add('hidden');
                success.classList.add('hidden');
                imgTag.style.backgroundImage = icon;
            }
            textDiv.innerText = title;

            toast.style.zIndex = '10000';
            toast.style.opacity = '1';
            if(duration >= 0){
                this.toastTimeout = setTimeout(function () {
                    this.hideToast();
                }.bind(this), duration);
            }
        }else{
            if(mask){
                toast.style.pointerEvents = 'auto';
            }else{
                toast.style.pointerEvents = 'none';
            }

            let whiteToast = document.getElementById('white-toast');
            let whiteToastLow = document.getElementById('white-toast-low');
            let textDiv = document.getElementById('white-toast-span');

            if(longText){
                whiteToastLow.classList.add('long');
                whiteToast.classList.add('long');
            }else{
                whiteToastLow.classList.remove('long');
                whiteToast.classList.remove('long');
            }

            let imgCont = document.getElementById('white-toast-up');
            let imgTag = document.getElementById('white-toast-icon');
            let loading = document.getElementById('white-toast-loading-cont');
            let success = document.getElementById('white-toast-success-cont');
            let loadingCircle = document.getElementById('white-toast-success-circle');
            let loadingDui1 = document.getElementById('white-toast-success-dui1');
            let loadingDui2 = document.getElementById('white-toast-success-dui2');
            if(icon == 'none'){
                imgCont.classList.add('hidden');
                whiteToastLow.classList.add('long');
                whiteToast.classList.add('long');
            }else if(icon == 'success'){
                imgCont.classList.remove('hidden');
                imgTag.classList.add('hidden');
                loading.classList.add('hidden');
                success.classList.remove('hidden');
                if(loadingCircle.classList.contains('play')){
                    loadingCircle.classList.remove('play');
                    loadingDui1.classList.remove('play');
                    loadingDui2.classList.remove('play');

                    loadingCircle.classList.add('restart');
                    loadingDui1.classList.add('restart');
                    loadingDui2.classList.add('restart');
                }else{
                    loadingCircle.classList.remove('restart');
                    loadingDui1.classList.remove('restart');
                    loadingDui2.classList.remove('restart');

                    loadingCircle.classList.add('play');
                    loadingDui1.classList.add('play');
                    loadingDui2.classList.add('play');
                }
            }else if(icon == 'loading'){
                imgCont.classList.remove('hidden');
                imgTag.classList.add('hidden');
                success.classList.add('hidden');
                loading.classList.remove('hidden');
            }else{
                imgCont.classList.remove('hidden');
                imgTag.classList.remove('hidden');
                loading.classList.add('hidden');
                success.classList.add('hidden');
                imgTag.style.backgroundImage = icon;
            }

            textDiv.innerText = title;

            toast.style.zIndex = '10000';
            toast.style.opacity = '1';
            if(duration >= 0){
                this.toastTimeout = setTimeout(function () {
                    this.hideToast();
                }.bind(this), duration);
            }
        }
    }

    static hideToast(){
        let toast = document.getElementById('white-toast-container');
        toast.style.zIndex = '-10000';
        toast.style.opacity = '0';
        clearTimeout(this.toastTimeout);
    }

    static showLoading(options){
        options = options || {};
        this.showToast({
            icon:'loading',
            title: options.title || 'loading...',
            duration: -1,
            mask: options.mask == null ? false : options.mask
        });
    }

    static hideLoading(){
        this.hideToast();
    }
}