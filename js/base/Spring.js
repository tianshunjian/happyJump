'use strict';

var epsilon = 0.4;

var Spring = function () {

    /***
   * Simple Spring implementation -- this implements a damped spring using a symbolic integration
   * of Hooke's law: F = -kx - cv. This solution is significantly more performant and less code than
   * a numerical approach such as Facebook Rebound which uses RK4.
   *
   * This physics textbook explains the model:
   *  http://www.stewartcalculus.com/data/CALCULUS%20Concepts%20and%20Contexts/upfiles/3c3-AppsOf2ndOrders_Stu.pdf
   *
   * A critically damped spring has: damping*damping - 4 * mass * springConstant == 0. If it's greater than zero
   * then the spring is overdamped, if it's less than zero then it's underdamped.
   */
    function Spring(mass, springConstant, damping) {
    // _classCallCheck(this, Spring);

        this._m = mass;
        this._k = springConstant;
        this._c = damping;
        this._solution = null;
        this._endPosition = 0;
        this._startTime = 0;
    }

    return Spring;
}();

Spring.prototype = {
    _solve:function(initial, velocity) {
        let c = this._c;
        let m = this._m;
        let k = this._k;
        // Solve the quadratic equation; root = (-c +/- sqrt(c^2 - 4mk)) / 2m.
        let cmk = c * c - 4 * m * k;
        if (cmk == 0) {
        // The spring is critically damped.
        // x = (c1 + c2*t) * e ^(-c/2m)*t
            let r = -c / (2 * m);
            let c1 = initial;
            let c2 = velocity / (r * initial);
            return {
                x: function x(t) {
                    return (c1 + c2 * t) * Math.pow(Math.E, r * t);
                },
                dx: function dx(t) {
                    let pow = Math.pow(Math.E, r * t);return r * (c1 + c2 * t) * pow + c2 * pow;
                }
            };
        } else if (cmk > 0) {
        // The spring is overdamped; no bounces.
        // x = c1*e^(r1*t) + c2*e^(r2t)
        // Need to find r1 and r2, the roots, then solve c1 and c2.
            let r1 = (-c - Math.sqrt(cmk)) / (2 * m);
            let r2 = (-c + Math.sqrt(cmk)) / (2 * m);
            let c2 = (velocity - r1 * initial) / (r2 - r1);
            let c1 = initial - c2;

            return {
                x: function x(t) {
                    let powER1T, powER2T;
                    if (t === this._t) {
                        powER1T = this._powER1T;
                        powER2T = this._powER2T;
                    }

                    this._t = t;

                    if (!powER1T) {
                        powER1T = this._powER1T = Math.pow(Math.E, r1 * t);
                    }
                    if (!powER2T) {
                        powER2T = this._powER2T = Math.pow(Math.E, r2 * t);
                    }

                    return c1 * powER1T + c2 * powER2T;
                },
                dx: function dx(t) {
                    let powER1T, powER2T;
                    if (t === this._t) {
                        powER1T = this._powER1T;
                        powER2T = this._powER2T;
                    }

                    this._t = t;

                    if (!powER1T) {
                        powER1T = this._powER1T = Math.pow(Math.E, r1 * t);
                    }
                    if (!powER2T) {
                        powER2T = this._powER2T = Math.pow(Math.E, r2 * t);
                    }

                    return c1 * r1 * powER1T + c2 * r2 * powER2T;
                }
            };
        } else {
        // The spring is underdamped, it has imaginary roots.
        // r = -(c / 2*m) +- w*i
        // w = sqrt(4mk - c^2) / 2m
        // x = (e^-(c/2m)t) * (c1 * cos(wt) + c2 * sin(wt))
            let w = Math.sqrt(4 * m * k - c * c) / (2 * m);
            let r = -(c / 2 * m);
            let c1 = initial;
            let c2 = (velocity - r * initial) / w;

            return {
                x: function x(t) {
                    return Math.pow(Math.E, r * t) * (c1 * Math.cos(w * t) + c2 * Math.sin(w * t));
                },
                dx: function dx(t) {
                    let power = Math.pow(Math.E, r * t);
                    let cos = Math.cos(w * t);
                    let sin = Math.sin(w * t);
                    return power * (c2 * w * cos - c1 * w * sin) + r * power * (c2 * sin + c1 * cos);
                }
            };
        }
    },

    x:function(dt) {
        if (dt == undefined) dt = (new Date().getTime() - this._startTime) / 1000.0;
        return this._solution ? this._endPosition + this._solution.x(dt) : 0;
    },

    dx:function (dt) {
        if (dt == undefined) dt = (new Date().getTime() - this._startTime) / 1000.0;
        return this._solution ? this._solution.dx(dt) : 0;
    },

    setEnd:function(x, velocity, t) {
        if (!t) t = new Date().getTime();
        if (x == this._endPosition && this.almostZero(velocity, epsilon)) return;
        velocity = velocity || 0;
        let position = this._endPosition;
        if (this._solution) {
        // Don't whack incoming velocity.
            if (this.almostZero(velocity, epsilon)) velocity = this._solution.dx((t - this._startTime) / 1000.0);
            position = this._solution.x((t - this._startTime) / 1000.0);
            if (this.almostZero(velocity, epsilon)) velocity = 0;
            if (this.almostZero(position, epsilon)) position = 0;
            position += this._endPosition;
        }
        if (this._solution && this.almostZero(position - x, epsilon) && this.almostZero(velocity, epsilon)) {
            return;
        }
        this._endPosition = x;
        this._solution = this._solve(position - this._endPosition, velocity);
        this._startTime = t;
    },

    snap:function(x) {
        this._startTime = new Date().getTime();
        this._endPosition = x;
        this._solution = {
            x: function x() {
                return 0;
            },
            dx: function dx() {
                return 0;
            }
        };
    },

    done:function(t) {
        if (!t) t = new Date().getTime();
        return this.almostEqual(this.x(), this._endPosition, epsilon) && this.almostZero(this.dx(), epsilon);
    },

    almostEqual:function(a, b, epsilon) {
        return a > b - epsilon && a < b + epsilon;
    },

    almostZero:function(a, epsilon) {
        return this.almostEqual(a, 0, epsilon);
    }
};

export default Spring;