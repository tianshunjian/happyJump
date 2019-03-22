import Scroll from './Scroll';

var UNDERSCROLL_TRACKING = 0.5;

var ScrollHandler = function () {

    function ScrollHandler(options) {
    // _classCallCheck(this, ScrollHandler);

        options = options || {};

        // this._element = element; // element 是内部的列表
        this._options = options;

        this._itemSize = options.itemSize || 0;

        this._innerOffsetHeight = options.innerOffsetHeight || 0; // 内部列表高度
        this._outterOffsetHeight = options.outterOffsetHeight || 0; // 外部容器高度
        this._extent = this._innerOffsetHeight - this._outterOffsetHeight; // 可滚动的高度

        this._position = 0;
        // this._scroll = new _scroll2.default(this._extent);
        this._scroll = new Scroll(this._extent);
        this.updatePosition();
    }
    return ScrollHandler;
}();

ScrollHandler.prototype = {
    onTouchStart:function () {
        this._startPosition = this._position;
        this._lastChangePos = this._startPosition;

        // Ensure that we don't jump discontinuously when applying the underscroll
        // tracking in onTouchMove if the view is currently outside of the valid
        // scroll constraints.
        if (this._startPosition > 0) this._startPosition /= UNDERSCROLL_TRACKING;else if (this._startPosition < -this._extent) this._startPosition = (this._startPosition + this._extent) / UNDERSCROLL_TRACKING - this._extent;

        if (this._animation) {
            this._animation.cancel();
            this._scrolling = false;
        }
        this.updatePosition();
    },

    onTouchMove:function(dx, dy) {
        var pos = this._startPosition;
        pos += dy;
        if (pos > 0) pos *= UNDERSCROLL_TRACKING;else if (pos < -this._extent) pos = (pos + this._extent) * UNDERSCROLL_TRACKING - this._extent;
        this._position = pos;

        this.updatePosition();
    },

    onTouchEnd:function(dx, dy, velocity) {
        var that = this;

        this._scroll.set(this._position, velocity.y);

        this._scrolling = true;
        this._lastChangePos = this._position;

        this._animation = this.animation(this._scroll, function () {
            var now = Date.now();
            var t = (now - that._scroll._startTime) / 1000.0;
            var pos = that._scroll.x(t);
            // console.log('t: ', t, ' pos: ', pos);
            that._position = pos;
            // The translateZ is to help older WebKits not collapse this layer into a non-composited layer
            // since they're also slow at repaints.
            that.updatePosition();
        }, function done() {
            that._scrolling = false;
        });
    },

    scrollTo:function(pos) {
        if (this._animation) {
            this._animation.cancel();
            this._scrolling = false;
        }

        if (typeof pos === 'number') {
            this._position = -pos;
        }

        if (this._position < -this._extent) {
            this._position = -this._extent;
        } else if (this._position > 0) {
            this._position = 0;
        }
        this.updatePosition();
    },

    updatePosition:function() {
        this._options.updatePosition(this._position);
    },

    animation:function(physicsModel, callback, doneFn) {

        function onFrame(handle, model, cb, doneFn) {
            if (handle && handle.cancelled) return;
            cb(model);
            var done = physicsModel.done();
            if (!done && !handle.cancelled) {
                handle.id = requestAnimationFrame(onFrame.bind(null, handle, model, cb, doneFn));
            }
            if (done && doneFn) {
                doneFn(model);
            }
        }
        function cancel(handle) {
            if (handle && handle.id) cancelAnimationFrame(handle.id);
            if (handle) handle.cancelled = true;
        }

        var handle = { id: 0, cancelled: false };
        onFrame(handle, physicsModel, callback, doneFn);

        return { cancel: cancel.bind(null, handle), model: physicsModel };
    }
};

export default ScrollHandler;