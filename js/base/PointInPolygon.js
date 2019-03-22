'use strict';

var pInPolygon = function () {
    //https://github.com/substack/point-in-polygon/blob/master/index.js

    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    this.PointInPolygon = function PointInPolygon(point, vs) {
        let x = point[0], y = point[1];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i][0], yi = vs[i][1];
            let xj = vs[j][0], yj = vs[j][1];

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

};

export default pInPolygon;