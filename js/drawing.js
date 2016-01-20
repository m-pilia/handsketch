/**
 * Drawing instruments and canvas management.
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

// is false while dragging a tool
var notDragging = true;

// current tool and its properties
var tool = null;
var thickness = 8;
var density = 0.25;
var shape = circle;
var opacity = 0.75;
var thereshold = 60;
var pickMode = 'average';

// undo and redo stacks
const UNDO_STACK = [];
const REDO_STACK = [];

const UNDO_BUTTON = $('#undo');
const REDO_BUTTON = $('#redo');

/**
 * Get canvas coordinates from a mouse event.
 * @param  {event} e Mouse event.
 * @return {Object}  An object containing the event coordinates {x, y}, whose
 *                   values are referred to the canvas coordinate system.
 */
function getCoord(e) {
    return {
        'x': (e.clientX - canvasBCR.left + scrollLeft) | 0,
        'y': (e.clientY - canvasBCR.top + scrollTop) | 0
    }
}

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
 * Pixel action for the brush tool.
 * @param  {number} i X coordinate of the pixel.
 * @param  {number} j Y coordinate of the pixel
 * @param  {number} x X coordinate for the centre of the tool.
 * @param  {number} y Y coordinate for the centre of the tool.
 */
function brush(i, j, x, y) {
    var k = canvas.width * i + j;
    if (shape(j, i, x, y) && !done[k]) {
        var m = k * 4;
        var a = opacity;
        var na = 1 - a;
        data[m + 0] = (data[m + 0] * na + red.val() * a) | 0;
        data[m + 1] = (data[m + 1] * na + green.val() * a) | 0;
        data[m + 2] = (data[m + 2] * na + blue.val() * a) | 0;
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
        if (Math.random() < density) {
            var m = k * 4;
            var a = opacity;
            var na = 1 - a;
            data[m + 0] = (data[m + 0] * na + red.val() * a) | 0;
            data[m + 1] = (data[m + 1] * na + green.val() * a) | 0;
            data[m + 2] = (data[m + 2] * na + blue.val() * a) | 0;
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
        data[m + 3] = (data[m + 3] * (1 - opacity)) | 0;
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

    // fill color
    const RR = red.val();
    const GG = green.val();
    const BB = blue.val();

    // squared thereshold for the color distance
    const THERESHOLD = thereshold * thereshold;

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

        if (da * da + db * db + dc * dc < THERESHOLD) {
            // color the point
            data[m + 0] = RR;
            data[m + 1] = GG;
            data[m + 2] = BB;

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

    switch (pickMode) {
    // pick the average color from an area
    case 'average':
        var n = 0;
        var r = 0;
        var g = 0;
        var b = 0;

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
                    ++n;
                }
            }
        }

        red.val((r / n) | 0);
        green.val((g / n) | 0);
        blue.val((b / n) | 0);

        break;

    // pick the color from an exact point
    case 'exact':
        red.val(data[m + 0]);
        green.val(data[m + 1]);
        blue.val(data[m + 2]);
        break
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

/**
 * Set the tool function.
 * @param {function} f Selected tool function.
 */
function setTool(f) {
    if (f !== undefined && f!== null && $.type(f) === "function") {
        tool = f;
    }
    else {
        console.log("Error: invalid tool function " + f);
    }
}

/**
 * Undo a tool action, restoring the canvas before the action itself.
 */
function undoTool() {
    if (UNDO_STACK.length < 1) {
        return;
    }

    // keep a copy of undone action for redo
    REDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));

    // restore canvas
    imageData = UNDO_STACK.pop();
    data = imageData.data;
    ctx.putImageData(imageData, 0, 0);

    // set button activity
    REDO_BUTTON.removeClass('inactive-button');
    if (UNDO_STACK.length < 1)
        UNDO_BUTTON.addClass('inactive-button');
}

/**
 * Redo an undone action.
 */
function redoTool() {
    if (REDO_STACK.length < 1) {
        return;
    }

    // keep a copy of redone image for undo
    UNDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));

    // restore canvas
    imageData = REDO_STACK.pop();
    data = imageData.data;
    ctx.putImageData(imageData, 0, 0);

    // set button activity
    UNDO_BUTTON.removeClass('inactive-button');
    if (REDO_STACK.length < 1)
        REDO_BUTTON.addClass('inactive-button');
}

// prepare default white canvas on loading
$(document).ready(function (e) {
    canvasResize(canvas.width, canvas.height);
});

// update scroll amount on scrolling
$(document).ready(function (e) {
    var ruledArea = $('.ef-ruler');
    ruledArea.scroll(function (e) {
        scrollTop = ruledArea.scrollTop();
        scrollLeft = ruledArea.scrollLeft();
    });
});

// set undo action
UNDO_BUTTON.click(function (e) {
    undoTool();
});

// set redo action
REDO_BUTTON.click(function (e) {
    redoTool();
});

// disable undo and redo buttons on startup
UNDO_BUTTON.addClass('inactive-button');
REDO_BUTTON.addClass('inactive-button');

// keyboard event handler
$(document).keypress(function (e) {
    switch (e.which) {
    case 90: // Z key (= shift + z key)
        if (e.ctrlKey)
            redoTool();
        break;
    case 122: // z key
        if (e.ctrlKey)
            undoTool();
        break;
    }
});

// new image from menu
$('#new-image').click(function (e) {
    // open overlay popup to get size
    openPopup('size-popup');
});

// create new image with input size
$('#size-popup .popup-exit').click(function (e) {
    var width = $('#size-popup input[name="width"]').val();
    var height = $('#size-popup input[name="height"]').val();
    canvasResize(width, height);
    closePopup();
});

// open image from menu
$('#open-file').click(function (e) {
    var inputImage = $('#image-file');
    inputImage.val(null);
    inputImage.trigger('click');
});

// put the opened image into the canvas
$('#image-file').on('change', function (e) {
    var img = new Image();
    img.src = window.URL.createObjectURL(e.target.files[0]);
    img.style.display = 'none';
    img.onload = function() {
        canvasResize(img.width, img.height, img);
    }
});

// event handler to draw on mouse clik
$('#canvas').on('mousedown', function (e) {
    // forbid input when a popup is open or with buttons different than left
    if (isPopupOpen() || e.which !== 1) {
        return;
    }

    // keep a copy for undo and forbid redo
    UNDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));
    REDO_STACK.length = 0;

    // set undo/redo button activity
    UNDO_BUTTON.removeClass('inactive-button');
    REDO_BUTTON.addClass('inactive-button');

    done.fill(false);
    var p = getCoord(e);

    switch (tool) {
    // non-draggable tools
    case picker:
    case filler:
        tool(p.x, p.y);
        break;

    // draggable tools
    case brush:
    case airbrush:
    case eraser:
        notDragging = false;
        toolAction(p.x, p.y);
        lastX = p.x;
        lastY = p.y;
        break;
    }
});

// event handler to stop drawing on mouse release
$('#canvas').on('mouseup mouseleave', function (e) {
    if (notDragging)
        return;
    var p = getCoord(e);
    toolAction(p.x, p.y);
    notDragging = true;
    lastX = lastY = null;
});

// event handler to draw dragging the mouse
$('#canvas').on('mousemove', function (e) {
    if (notDragging)
        return;
    var p = getCoord(e);
    toolAction(p.x, p.y);
    interpolation(p.x, p.y);
    lastX = p.x;
    lastY = p.y;
});
