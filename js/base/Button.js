'use strict';

class Button {

    constructor(canvas){
        //默认可点击
        this._able = true;

        if (!canvas.mrChildren){
            canvas.mrChildren = [];
        }
        canvas.mrChildren.push(this);
        this.canvas = canvas;
    }

    _initRect(){
        if (!this._rect){
            this._rect = {origin:{x:0,y:0},size:{width:0,height:0}};
        }
    }

    _supportAnimation(){
        ///文字暂不支持动画
        let support = false;
        if (this._image){
            support = true;
        }
        return support;
    }

    _display(detal){

        ///没有内容可绘制
        if(!this._image && !this._style)
            return;

        if (this._image){
            if (!this._loaded){
                return;
            }
        }

        let rect = this.rect;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);

        if (this._supportAnimation()){

            if (detal && detal != 0){
                rect = {origin:{x : rect.origin.x + (rect.size.width * (1-detal)/2.0),
                    y : rect.origin.y + (rect.size.height * (1-detal)/2.0)},
                size:{width: rect.size.width * detal,
                    height: rect.size.height * detal}
                };
            }
        }


        if (this._image){
            ctx.drawImage(this._image, rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        } else {
            //for debug
            // ctx.fillStyle = '#ff0000';
            // ctx.fillRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)

            ctx.font = this._style.font || '14px';
            ctx.textAlign = this._style.textAlign || 'left';
            ctx.fillStyle = this._style.fillStyle || '#fff';
            ctx.textBaseline = this._style.textBaseline || 'top';
            ctx.fillText(this._style.text, rect.origin.x, rect.origin.y);
        }
        this.afterDisplayCallback && this.afterDisplayCallback();
        this.canvas.update();
    }

    hitTest(opt){
        if (!this._show)
            return false;
        if (!this._isAble()){
            return false;
        }

        const p = opt.point;

        return (p.x >= this.origin.x) && (p.x <= this.origin.x + this.size.width) && (p.y >= this.origin.y) && (p.y <= this.origin.y + this.size.height);
    }

    handleEvent(opt){

        if (this._supportAnimation){

            if (!this._animating){
                this._animating = true;
                this._display(0.9);
                setTimeout(function () {
                    this._display(1);
                    setTimeout(function () {
                        this.onClick && this.onClick(this);
                        this._animating = false;
                    }.bind(this),100);
                }.bind(this),100);
            }
        } else {
            this.onClick && this.onClick(this);
        }
    }

    set rect(r){
        this._rect = r;
    }

    get rect(){
        this._initRect();
        return this._rect;
    }

    set origin(o){
        this._initRect();
        this._rect.origin = o;
    }

    get origin(){
        this._initRect();
        return this._rect.origin;
    }

    set size(s){
        this._initRect();
        this._rect.size = s;
        if (this._c){
            this._rect.origin = {x:this._c.x - this._rect.size.width/2.0,y:this._c.y - this._rect.size.height/2.0};
        }
    }

    get size(){
        this._initRect();
        return this._rect.size;
    }

    set center(c){
        this._initRect();
        this._c = c;
        this._rect.origin = {x:c.x - this._rect.size.width/2.0,y:c.y - this._rect.size.height/2.0};
    }

    get center(){
        this._initRect();
        return {x:this._rect.origin.x + this._rect.size.width/2.0,y:this._rect.origin.y + this._rect.size.height/2.0};
    }

    set image(src){
        const img = new Image();
        const that = this;
        const tag = new Date().getTime();
        img._tag = tag;
        img._retryTimes = 3;
        img.onload = function () {
            that._loaded = true;
            if ((img._tag == tag) && that._show) {
                that._display();
            }
        };
        img.onerror = function () {
            if (img._retryTimes > 0){
                img._retryTimes --;
                console.error('retry : ' + src);
                img.src = src;
            }
        };
        img.src = src;
        this._image = img;
    }

    onDisplay(callback){
        this.afterDisplayCallback = callback;
    }

    set style(opt){
        this._style = opt;
    }

    set tag(t){
        this._tag = t;
    }

    get tag(){
        return this._tag;
    }

    _isAble(){
        return this._able;
    }

    disable(){
        this._able = false;
    }

    enable(){
        this._able = true;
    }

    show(){
        this._show = true;
        this._display();
    }

    hidden(update){
        if (!this.canvas)
            return;

        const rect = this.rect;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        if (typeof (update) === 'undefined'){
            update = true;
        }
        if (update){
            this.canvas.update();
        }
        this._show = false;
    }

    destroy(){

        if (!this.canvas)
            return;

        let idx = -1;
        for (let i = 0; i < this.canvas.mrChildren.length; i ++){
            if (this ===  this.canvas.mrChildren[i]){
                idx = i;
                break;
            }
        }

        if (idx != -1){
            this.hidden();
            this.canvas.mrChildren.splice(idx,1);
            this.canvas = undefined;
            if (this.onClick){
                this.onClick = undefined;
            }
        }
    }

    get superCanvas(){
        return this.canvas;
    }

    static destroyAllButtons(canvas){
        if (canvas && canvas.mrChildren){
            const arr = canvas.mrChildren;
            canvas.mrChildren = [];
            for (let i = 0; i < arr.length; i ++){
                const btn = arr[i];
                btn.hidden && btn.hidden(false);
                btn.canvas = undefined;
            }
            canvas.update();
        }
    }

    static buttonWithTag(canvas,tag){
        if (!canvas || !tag)
            return undefined;

        const arr = canvas.mrChildren;
        let result = undefined;
        for (let i = 0; i < arr.length; i ++){
            const btn = arr[i];
            if (btn.tag === tag){
                result = btn;
                break;
            }
        }
        return result;
    }
}

export default Button;
