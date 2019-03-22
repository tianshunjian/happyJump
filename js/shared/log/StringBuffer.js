
class StringBuffer {
    constructor(){
        this._string_ = new Array();
    }
    append(str){
        this._string_.push(str);
    }
    toString(){
        return this._string_.join('\n');
    }
    length(){
        return this._string_.length;
    }
    clear(){
        this._string_ = new Array();
    }
}

export default new StringBuffer();