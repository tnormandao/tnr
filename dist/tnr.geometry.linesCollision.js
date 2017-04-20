
var tnr = tnr || {};
(function(){

/**
 *
 * Check Lines intersection
 *
 * @param pLine1 — { start: THREE.Vector2, end: THREE.Vecotr2 }
 * @param pLine2 — { start: THREE.Vector2, end: THREE.Vecotr2 }
 * @returns {boolean} — { x:X, y:Y } or false;
 */
tnr.linesCollision = function( pLine1, pLine2 ){
// jshint ignore: start
    let result = false;
    let s1_x = pLine1.end.x - pLine1.start.x,
        s1_y = pLine1.end.y - pLine1.start.y,
        s2_x = pLine2.end.x - pLine2.start.x,
        s2_y = pLine2.end.y - pLine2.start.y,
        s = (-s1_y * (pLine1.start.x - pLine2.start.x) + s1_x * (pLine1.start.y - pLine2.start.y)) / (-s2_x * s1_y + s1_x * s2_y),
        t = ( s2_x * (pLine1.start.y - pLine2.start.y) - s2_y * (pLine1.start.x - pLine2.start.x)) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)  {
        // Collision detected
        result = { 
          x: pLine1.start.x + (t * s1_x), 
          y: pLine1.start.y + (t * s1_y) 
        };
    }
    return result;
// jshint ignore: end
}

})();
