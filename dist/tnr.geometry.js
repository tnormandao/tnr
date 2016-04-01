var pointInRect = function( rect, point ){
    // rect [ x1, y1, x2, y2 ]
    // poin { x: Int, y: Int }
    var x1 = rect[2] < rect[0] ? rect[2] : rect[0];
    var y1 = rect[3] < rect[1] ? rect[3] : rect[1];
    var x2 = rect[2] > rect[0] ? rect[2] : rect[0];
    var y2 = rect[3] > rect[1] ? rect[3] : rect[1];
    if( ( point.x < x2 && point.x >= x1 ) && ( point.y < y2 && point.y >= y1 ) ) return true;
    return false;
};

var rectangleCollision = function( rect1, rect2 ){
 
    // rect1 [ x1, y1, x2, y2 ]
    // rect2 [ x1, y1, x2, y2 ]
 
    var x1 = rect1[2] < rect1[0] ? rect1[2] : rect1[0];
    var y1 = rect1[3] < rect1[1] ? rect1[3] : rect1[1];
    var x2 = rect1[2] > rect1[0] ? rect1[2] : rect1[0];
    var y2 = rect1[3] > rect1[1] ? rect1[3] : rect1[1];
    var x3 = rect2[2] < rect2[0] ? rect2[2] : rect2[0];
    var y3 = rect2[3] < rect2[1] ? rect2[3] : rect2[1];
    var x4 = rect2[2] > rect2[0] ? rect2[2] : rect2[0];
    var y4 = rect2[3] > rect2[1] ? rect2[3] : rect2[1];
    var pointInRect = false;
    var point;
    // check rect1 in rect2
    point = { x: x1, y: y1 };
    if( ( point.x < x4 && point.x >= x3 ) && ( point.y < y4 && point.y >= y3 )  ) {
        pointInRect = true;
    };
    point = { x: x1, y: y2 };
    if( ( point.x < x4 && point.x >= x3 ) && ( point.y < y4 && point.y >= y3 )  ) {
        pointInRect = true;
    };
    point = { x: x2, y: y1 };
    if( ( point.x < x4 && point.x >= x3 ) && ( point.y < y4 && point.y >= y3 )  ) {
        pointInRect = true;
    };
    point = { x: x2, y: y2 };
    if( ( point.x < x4 && point.x >= x3 ) && ( point.y < y4 && point.y >= y3 )  ) {
        pointInRect = true;
    };
    // check rect2 in rect1
    point = { x: x3, y: y3 };
    if( ( point.x < x2 && point.x >= x1 ) && ( point.y < y2 && point.y >= y1 )  ) {
        pointInRect = true;
    };
    point = { x: x4, y: y3 };
    if( ( point.x < x2 && point.x >= x1 ) && ( point.y < y2 && point.y >= y1 )  ) {
        pointInRect = true;
    };
    point = { x: x3, y: y4 };
    if( ( point.x < x2 && point.x >= x1 ) && ( point.y < y2 && point.y >= y1 )  ) {
        pointInRect = true;
    };
    point = { x: x4, y: y4 };
    if( ( point.x < x2 && point.x >= x1 ) && ( point.y < y2 && point.y >= y1 )  ) {
        pointInRect = true;
    };
 
    return pointInRect;
};
