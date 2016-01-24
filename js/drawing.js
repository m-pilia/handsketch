/**
 * Drawing tools.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-17
 */

"use strict";

// canvas, context, image data, data array
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var imageData = null;
var data = null;

// ensure the pixels are not processed twice in the same stroke
var done = null;

// save last coordinates for interpolation
var lastX = null;
var lastY = null;

// scroll amount
var scrollTop = 0;
var scrollLeft = 0;

// color input
var red = $('input#red-value');
var green = $('input#green-value');
var blue = $('input#blue-value');
var alpha = $('input#alpha-value');

// is false while dragging a tool
var notDragging = true;

// maximum opacity and thereshold value
const OPACITY_MAX = 100;
const THERESH_MAX = 100;
const DENSITY_MAX = 100;

// current tool and its properties
var tool = null;
var thickness = null;
var density = null;
var shape = null;
var opacity = null;
var thereshold = null;

/**
 * Clean the canvas, resize it to the input size and optionally draw an
 * image inside it.
 * @param  {number} width  Width for the canvas.
 * @param  {number} height Height for the canvas.
 * @param  {Image}  img    Optional image to be drawn inside the canvas.
 */
function canvasResize(width, height, img) {
    // clear and resize
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;

    // draw image from file or fill with white pixels
    if (img !== undefined && img !== null) {
        ctx.drawImage(img, 0, 0);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        data = imageData.data;
    }
    else {
        imageData = ctx.createImageData(canvas.width, canvas.height);
        data = imageData.data;
        for (var i = 0; i < data.length; i++)
            data[i] = 255;
        ctx.putImageData(imageData, 0, 0);
    }

    // update done array
    done = new Array((data.length / 4) | 0);

    // fit canvas layout
    fitCanvas();
}

/**
 * Check if a pixel is inside a circle.
 * @param  {number} x  X coordinate of the pixel in the canvas.
 * @param  {number} y  Y coordinate of the pixel in the canvas.
 * @param  {number} x0 X coordinate of the circle's centre.
 * @param  {number} y0 Y coordinate of the circle's centre.
 * @return {bool}      True if the pixel is inside the circle.
 */
function circle(x, y, x0, y0) {
    var dx = x - x0;
    var dy = y - y0;
    return dx * dx + dy * dy <= thickness * thickness;
}

/**
 * Check if a pixel is inside a square.
 * @param  {number} x  X coordinate of the pixel in the canvas.
 * @param  {number} y  Y coordinate of the pixel in the canvas.
 * @param  {number} x0 X coordinate of the square's centre.
 * @param  {number} y0 Y coordinate of the square's centre.
 * @return {bool}      True if the pixel is inside the square.
 */
function square(x, y, x0, y0) {
    return true;
}

/**
 * Check if a pixel is inside a diamond.
 * @param  {number} x  X coordinate of the pixel in the canvas.
 * @param  {number} y  Y coordinate of the pixel in the canvas.
 * @param  {number} x0 X coordinate of the diamond's centre.
 * @param  {number} y0 Y coordinate of the diamond's centre.
 * @return {bool}      True if the pixel is inside the diamond.
 */
function diamond(x, y, x0, y0) {
    return Math.abs(x - x0) + Math.abs(y - y0) < thickness;
}

/**
 * Distance from the centre of the tool, using a different metric according
 * to the tool's shape.
 * @param  {number} x  X coordinate of the pixel in the canvas.
 * @param  {number} y  Y coordinate of the pixel in the canvas.
 * @param  {number} x0 X coordinate of the tool's centre.
 * @param  {number} y0 Y coordinate of the tool's centre.
 * @return {number}    Distance between the pixel and the tool's centre.
 */
function distance(x, y, x0, y0) {
    switch (shape) {
        case circle:
            return Math.hypot(x - x0, y - y0);
        case square:
            return Math.max(x - x0, y - y0);
        case diamond:
            return Math.abs(x - x0, y - y0);
        default:
            throw "Invalid shape";
    }
}

/**
 * Insert intermediate strokes between the current and the last tool positions
 * when the distance between them is significative.
 * @param  {number} x X coordinate for the current position.
 * @param  {number} y Y coordinate for the current position.
 */
function interpolation(x, y) {
    if (lastX === null || lastY === null)
        return;
    var deltaX = lastX - x;
    var deltaY = lastY - y;
    var d = (Math.hypot(deltaX, deltaY) / thickness * 2) | 0;
    if (d < 1)
        return;
    var dx = deltaX / d;
    var dy = deltaY / d;
    while (d > 0) {
        toolAction((x + d * dx) | 0, (y + d * dy) | 0);
        d--;
    }
}

/**
 * Perform alpha blending on the selected pixel.
 * @param  {number} k Index of the pixel in the data array.
 */
function alphaBlend(k) {
    // alpha blending
    var m = k * 4;
    var a = alpha.val() / 255 * opacity / OPACITY_MAX;
    var na = (1 - a) * data[m + 3] / 255;
    var da = a + na; // computed alpha
    data[m + 3] = 255 * da | 0;
    if (da) {
        data[m + 0] = (data[m + 0] * na + red.val() * a) | 0;
        data[m + 1] = (data[m + 1] * na + green.val() * a) | 0;
        data[m + 2] = (data[m + 2] * na + blue.val() * a) | 0;
    }
    else {
        data[m] = data[m + 1] = data[m + 2] = 0;
    }
}

/**
 * Pixel action for the brush tool.
 * @param  {number} i X coordinate of the pixel.
 * @param  {number} j Y coordinate of the pixel
 * @param  {number} x X coordinate for the centre of the tool.
 * @param  {number} y Y coordinate for the centre of the tool.
 */
function brush(i, j, x, y) {
    var k = canvas.width * i + j;
    if (shape(j, i, x, y) && !done[k]) {
        alphaBlend(k);
        done[k] = true;
    }
}

/**
 * Pixel action for the airbrush tool.
 * @param  {number} i X coordinate of the pixel.
 * @param  {number} j Y coordinate of the pixel
 * @param  {number} x X coordinate for the centre of the tool.
 * @param  {number} y Y coordinate for the centre of the tool.
 */
function airbrush(i, j, x, y) {
    var k = canvas.width * i + j;
    if (shape(j, i, x, y) && !done[k]) {
        if (Math.random() < density / DENSITY_MAX) {
            alphaBlend(k);
        }
        done[k] = true;
    }
}

/**
 * Pixel action for the eraser tool.
 * @param  {number} i X coordinate of the pixel.
 * @param  {number} j Y coordinate of the pixel
 * @param  {number} x X coordinate for the centre of the tool.
 * @param  {number} y Y coordinate for the centre of the tool.
 */
function eraser(i, j, x, y) {
    var k = canvas.width * i + j;
    if (shape(j, i, x, y) && !done[k]) {
        var m = k * 4;
        data[m + 3] = (data[m + 3] * (1 - opacity / OPACITY_MAX)) | 0;
        done[k] = true;
    }
}

/**
 * Check wether a point has still to be processed by the bucket filler.
 * @param  {Object} p Point
 * @return {bool}     True if the point must be processed, false if it has
 *                    already been processed or if it is outside of the canvas.
 */
function filled(p) {
    return done[canvas.width * p.y + p.x]
        || p.x < 0
        || p.x > canvas.width
        || p.y < 0
        || p.y > canvas.height;
}

/**
 * Filler bucket tool.
 * @param  {number} x X coordinate.
 * @param  {number} y Y coordinate.
 */
function filler(x, y) {
    // canvas size
    const WW = canvas.width;
    const HH = canvas.height;

    // pixel indexes
    var k = WW * y + x;
    var m = k * 4;

    // color of the start pixel
    const R0 = data[m + 0];
    const G0 = data[m + 1];
    const B0 = data[m + 2];
    const A0 = data[m + 3];

    // fill color
    const RR = red.val();
    const GG = green.val();
    const BB = blue.val();
    const AA = alpha.val() * opacity / OPACITY_MAX;

    // squared thereshold for the color distance
    const THERESHOLD = thereshold * thereshold * 260100 / THERESH_MAX / THERESH_MAX;

    // variable for the pixel
    var p = {'x': x, 'y': y};
    var q = null;

    // FIFO for the pixels to be processed
    const fifo = [p];

    // variables for color difference components
    var da, db, dc;

    while (fifo.length) {
        p = fifo.pop();

        k = (WW * p.y + p.x);
        m = 4 * k;
        done[k] = true;

        // check color distance respect to the start pixel
        da = (data[m + 0] - R0);
        db = (data[m + 1] - G0);
        dc = (data[m + 2] - B0);
        da = (data[m + 3] - A0);

        if (da * da + db * db + dc * dc + da * da < THERESHOLD) {
            // color the point
            data[m + 0] = RR;
            data[m + 1] = GG;
            data[m + 2] = BB;
            data[m + 3] = AA;

            // add its neighbours to the fifo if needed
            // the code inlining here actually provides a performance gain

            // leftward pixel
            if (!(done[WW * p.y + (p.x - 1)] ||
                    p.x - 1 < 0 || p.x - 1 >= WW || p.y < 0 || p.y >= HH)) {
                fifo.push({'x' : p.x - 1, 'y': p.y});
            }

            // rightward pixel
            if (!(done[WW * p.y + (p.x + 1)] ||
                    p.x + 1 < 0 || p.x + 1 >= WW || p.y < 0 || p.y >= HH)) {
                fifo.push({'x' : p.x + 1, 'y': p.y});
            }

            // downward pixel
            if (!(done[WW * (p.y - 1) + p.x] ||
                    p.x < 0 || p.x >= WW || p.y - 1 < 0 || p.y - 1 >= HH)) {
                fifo.push({'x' : p.x, 'y': p.y - 1});
            }

            // upward pixel
            if (!(done[WW * (p.y + 1) + p.x] ||
                    p.x < 0 || p.x >= WW || p.y + 1 < 0 || p.y + 1 >= HH)) {
                fifo.push({'x' : p.x, 'y': p.y + 1});
            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Color picker tool.
 * @param  {number} x X coordinate.
 * @param  {number} y Y coordinate.
 */
function picker(x, y) {
    var k = canvas.width * y + x;
    var m = k * 4;

    if (thickness > 1) {
        // pick the average color from an area
        var n = 0;
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;

        var y0 = Math.max(0, y - thickness);
        var y1 = Math.min(canvas.height, y + thickness);
        var x0 = Math.max(0, x - thickness);
        var x1 = Math.min(canvas.width, x + thickness);

        for (var i = y0; i <= y1; i++) {
            for (var j = x0; j <= x1; j++) {
                if (shape(j, i, x, y)) {
                    var m = 4 * (canvas.width * i + j);
                    r += data[m + 0];
                    g += data[m + 1];
                    b += data[m + 2];
                    a += data[m + 3];
                    ++n;
                }
            }
        }

        red.val((r / n) | 0);
        green.val((g / n) | 0);
        blue.val((b / n) | 0);
        alpha.val((a / n) | 0);
    }
    else {
        red.val(data[m + 0]);
        green.val(data[m + 1]);
        blue.val(data[m + 2]);
        alpha.val(data[m + 3]);
    }

    // trigger event to update the sliders
    $('.color-value').trigger('input');
}

/**
 * Apply the action of the currently selected tool, on the canvas coordinates
 * passed as arguments.
 * @param  {number} x X coordinate.
 * @param  {number} y Y coordinate.
 */
function toolAction(x, y) {
    var y0 = Math.max(0, y - thickness);
    var y1 = Math.min(canvas.height, y + thickness);
    var x0 = Math.max(0, x - thickness);
    var x1 = Math.min(canvas.width, x + thickness);

    for (var i = y0; i <= y1; i++) {
        for (var j = x0; j <= x1; j++) {
            tool(i, j, x, y);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
