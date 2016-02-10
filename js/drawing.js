/**
 * Drawing tools.
 *
 * @date 2016-01-17
 */

"use strict";

const drawing = function ($) {

    // public interface
    const pub = {};

    // private and dynamically callable interface
    const pvt = {};

    // canvas, context, image data, data array
    var canvas = null;
    var ctx = null;
    var imageData = null;
    var data = null;

    // ensure the pixels are not processed twice in the same stroke
    var done = null;

    // maximum possible squared distance between RGBA colors
    const MAX_DISTANCE = 4 * 255 * 255;

    // maximum possible values
    const OPACITY_MAX = 100;
    const THRESH_MAX = 100;
    const DENSITY_MAX = 100;

    // color components
    var mR = null;
    var mG = null;
    var mB = null;
    var mA = null;

    // current tool and its properties
    var mTool = null;
    var mRadius = null;
    var mDensity = null;
    var mShape = null;
    var mOpacity = null;
    var mThreshold = null;

    // undo and redo stacks
    // the whole image data is saved for each entry: quite expensive but easy
    // enough for this application prototype
    const UNDO_STACK = [];
    const REDO_STACK = [];

    /**
     * Get and set the red color component.
     * @param  {number} v New value for the red component.
     * @return {number}   Value of the red component.
     */
    pub.red = function (v) {
        if (v !== undefined) {
            mR = parseInt(v);
        }
        return mR;
    };

    /**
     * Get and set the green color component.
     * @param  {number} v New value for the green component.
     * @return {number}   Value of the green component.
     */
    pub.green = function (v) {
        if (v !== undefined) {
            mG = parseInt(v);
        }
        return mG;
    };

    /**
     * Get and set the blue color component.
     * @param  {number} v New value for the blue component.
     * @return {number}   Value of the blue component.
     */
    pub.blue = function (v) {
        if (v !== undefined) {
            mB = parseInt(v);
        }
        return mB;
    };

    /**
     * Get and set the alpha color component.
     * @param  {number} v New value for the alpha component.
     * @return {number}   Value of the alpha component.
     */
    pub.alpha = function (v) {
        if (v !== undefined) {
            mA = parseInt(v) / 255;
        }
        return parseInt(mA * 255);
    };

    /**
     * Get or set the active drawing tool.
     * @param  {string} t Tool name.
     * @return {string}   Tool name.
     */
    pub.tool = function (t) {
        if (t !== undefined) {
            try {
                if ($.type(pvt[t]) !== 'function' && $.type(pub[t]) !== 'function')
                    throw new Error('The selected object is not a function');
                mTool = t;
            }
            catch (e) {
                console.log('Error: invalid tool ' + t + '\n' + e);
            }
        }

        return mTool;
    };

    /**
     * Get or set the active drawing tool's shape.
     * @param  {string} s Shape name.
     * @return {string}   Shape name.
     */
    pub.shape = function (s) {
        if (s !== undefined) {
            mShape = s;
        }

        return mShape;
    };

    /**
     * Get or set the opacity value.
     * @param  {number} o Opacity value in the `0..OPACITY_MAX` range.
     * @return {number}   Opacity value in the [0,1] range.
     */
    pub.opacity = function (o) {
        if (o !== undefined) {
            mOpacity = o / OPACITY_MAX;
        }
        return mOpacity;
    };

    /**
     * Get or set the density value.
     * @param  {number} d Density value in the `0..DENSITY_MAX` range.
     * @return {number}   Density value in the [0,1] range.
     */
    pub.density = function (d) {
        if (d !== undefined) {
            mDensity = d / DENSITY_MAX;
        }
        return mDensity;
    };

    /**
     * Get or set the threshold value.
     * @param  {number} t Threshold value in the `0..THRESH_MAX` range.
     * @return {number}   Threshold value in the [0,1] range.
     */
    pub.threshold = function (t) {
        if (t !== undefined) {
            mThreshold = t / THRESH_MAX;
        }
        return mThreshold;
    };

    /**
     * Get or set the thickness value.
     * @param  {number} t Thickness value.
     * @return {number}   Thickness value.
     */
    pub.thickness = function (t) {
        if (t !== undefined) {
            mRadius = t / 2;
        }
        return  2 * mRadius;
    };

    /**
     * Get or set the canvas object in use.
     * @param  {Canvas} c Canvas object to use.
     * @return {Canvas}   Canvas object in use.
     */
    pub.canvas = function (c) {
        if (c !== undefined) {
            canvas = c;
            ctx = canvas.getContext('2d');
        }
        return canvas;
    };

    /**
     * Clear the canvas, resize it to the input size and optionally draw an
     * image inside it.
     * @param  {number} width  Width for the canvas.
     * @param  {number} height Height for the canvas.
     * @param  {Image}  img    Optional image to be drawn inside the canvas.
     */
    pub.canvasResize = function (width, height, img) {
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

        // ask to fit canvas layout
        var e = new Event('canvasUpdate');
        document.dispatchEvent(e);
    };

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
        switch (mShape) {
            case 'circle':
                return Math.hypot(x - x0, y - y0);
            case 'square':
                return Math.max(x - x0, y - y0);
            case 'diamond':
                return Math.abs(x - x0) + Math.abs(y - y0);
            default:
                throw "Invalid shape";
        }
    }

    /**
     * Perform alpha blending on the selected pixel.
     * @param  {number} k Index of the pixel in the data array.
     * @param  {number} o Coefficient to scale the alpha.
     */
    function alphaBlend(k, o) {
        // alpha blending
        var m = k * 4;
        var a = mA * mOpacity * o;
        var na = (1 - a) * data[m + 3] / 255;
        var da = a + na; // computed alpha
        data[m + 3] = 255 * da | 0;
        if (da) {
            data[m + 0] = (data[m + 0] * na + mR * a) | 0;
            data[m + 1] = (data[m + 1] * na + mG * a) | 0;
            data[m + 2] = (data[m + 2] * na + mB * a) | 0;
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
    pvt.brush = function (i, j, x, y) {
        const k = canvas.width * i + j;
        const d = distance(j, i, x, y);
        if (!done[k] && d < mRadius) {
            alphaBlend(k, 1);
            done[k] = true;
        }
    };

    /**
     * Pixel action for the airbrush tool.
     * @param  {number} i X coordinate of the pixel.
     * @param  {number} j Y coordinate of the pixel
     * @param  {number} x X coordinate for the centre of the tool.
     * @param  {number} y Y coordinate for the centre of the tool.
     */
    pvt.airbrush = function (i, j, x, y) {
        var k = canvas.width * i + j;
        const d = distance(j, i, x, y);
        if (!done[k] && d < mRadius) {
            if (Math.random() < mDensity) {
                alphaBlend(k, 1);
            }
            done[k] = true;
        }
    };

    /**
     * Pixel action for the eraser tool.
     * @param  {number} i X coordinate of the pixel.
     * @param  {number} j Y coordinate of the pixel
     * @param  {number} x X coordinate for the centre of the tool.
     * @param  {number} y Y coordinate for the centre of the tool.
     */
    pvt.eraser = function (i, j, x, y) {
        var k = canvas.width * i + j;
        const d = distance(j, i, x, y);
        if (!done[k] && d < mRadius) {
            var m = k * 4;
            data[m + 3] = (data[m + 3] * (1 - mOpacity)) | 0;
            done[k] = true;
        }
    };

    /**
     * Check wether a point has still to be processed by the bucket filler.
     * @param  {Object} p Point
     * @return {bool}     True if the point must be processed, false if it has
     *                    already been processed or if it is outside of the
     *                    canvas.
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
    pub.filler = function (x, y) {
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
        const RR = mR;
        const GG = mG;
        const BB = mB;
        const AA = mA * mOpacity;

        // squared threshold for the color distance
        const THRESHOLD = mThreshold * mThreshold * MAX_DISTANCE;

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

            if (da * da + db * db + dc * dc + da * da < THRESHOLD) {
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
    };

    /**
     * Color picker tool.
     * @param  {number} x X coordinate.
     * @param  {number} y Y coordinate.
     */
    pub.picker = function (x, y) {
        var k = canvas.width * y + x;
        var m = k * 4;
        var c = {}; // picked color

        if (mRadius > 1) {
            // pick the average color from an area
            var n = 0;
            var r = 0;
            var g = 0;
            var b = 0;
            var a = 0;

            const cRadius = Math.ceil(mRadius);
            const fRadius = Math.floor(mRadius);

            var y0 = Math.max(0, y - cRadius);
            var y1 = Math.min(canvas.height, y + fRadius);
            var x0 = Math.max(0, x - cRadius);
            var x1 = Math.min(canvas.width, x + fRadius);

            for (var i = y0; i <= y1; i++) {
                for (var j = x0; j <= x1; j++) {
                    const d = distance(j, i, x, y);
                    if (d < mRadius) {
                        var m = 4 * (canvas.width * i + j);
                        r += data[m + 0];
                        g += data[m + 1];
                        b += data[m + 2];
                        a += data[m + 3];
                        ++n;
                    }
                }
            }

            c.r = (r / n) | 0;
            c.g = (g / n) | 0;
            c.b = (b / n) | 0;
            c.a = (a / n) | 0;
        }
        else {
            // pick the exact color from a pixel
            c.r = data[m + 0];
            c.g = data[m + 1];
            c.b = data[m + 2];
            c.a = data[m + 3];
        }

        // trigger event to update the ui
        var e = new CustomEvent('updateColor', {detail: {'color': c}});
        document.dispatchEvent(e);
    };

    /**
     * Apply the action of the currently selected tool, on the canvas
     * coordinates passed as arguments.
     * @param  {number} x X coordinate.
     * @param  {number} y Y coordinate.
     */
    pub.toolAction = function (x, y) {
        const cRadius = Math.ceil(mRadius);
        const fRadius = Math.floor(mRadius);

        var y0 = Math.max(0, y - cRadius);
        var y1 = Math.min(canvas.height, y + fRadius);
        var x0 = Math.max(0, x - cRadius);
        var x1 = Math.min(canvas.width, x + fRadius);

        for (var i = y0; i <= y1; i++) {
            for (var j = x0; j <= x1; j++) {
                pvt[mTool](i, j, x, y);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    };

    /**
     * Start a new stroke with a drawing tool.
     */
    pub.startStroke = function () {
        done.fill(false);
    }

    /**
     * Return the shape following the input one.
     * @param  {string} s Name of the current shape.
     * @return {string}   Name of the following shape.
     */
    pub.nextShape = function (s) {
        switch (s) {
        case 'circle':
            return 'square';
        case 'square':
            return 'diamond';
        case 'diamond':
            return 'circle';
        default:
            throw new Error('nextShape: invalid shape');
        }
    }

    /**
     * Return the shape preceeding the input one.
     * @param  {string} s Name of the current shape.
     * @return {string}   Name of the preceeding shape.
     */
    pub.prevShape = function (s) {
        switch (s) {
        case 'circle':
            return 'diamond';
        case 'square':
            return 'circle';
        case 'diamond':
            return 'square';
        default:
            throw new Error('prevShape: invalid shape');
        }
    }

    /**
     * Undo a tool action, restoring the canvas before the action itself.
     * @return {bool}      True if an action was successfully undone, false if
     *                     there was not any undoable action.
     */
    pub.undo = function () {
        if (UNDO_STACK.length < 1) {
            return false;
        }

        // keep a copy of undone action for redo
        REDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));

        // restore canvas
        imageData = UNDO_STACK.pop();
        data = imageData.data;
        ctx.putImageData(imageData, 0, 0);

        return true;
    };

    /**
     * Redo an undone action.
     * @return {bool}      True if an action was successfully redone, false if
     *                     there was not any redoable action.
     */
    pub.redo = function () {
        if (REDO_STACK.length < 1) {
            return false;
        }

        // keep a copy of redone image for undo
        var d = new ImageData(data.slice(), canvas.width, canvas.height);
        UNDO_STACK.push(d);

        // restore canvas
        imageData = REDO_STACK.pop();
        data = imageData.data;
        ctx.putImageData(imageData, 0, 0);

        return true;
    };

    /**
     * Check if there are undoable actions.
     * @return {bool} True if there is at least one undoable action.
     */
    pub.undoable = function () {
        return UNDO_STACK.length > 0;
    };

    /**
     * Check if there are redoable actions.
     * @return {bool} True if there is at least one redoable action.
     */
    pub.redoable = function () {
        return REDO_STACK.length > 0;
    };

    /**
     * Create a snapshot of the current canvas in the undo stack.
     */
    pub.snapshot = function () {
        var d = new ImageData(data.slice(), canvas.width, canvas.height);
        UNDO_STACK.push(d);
        REDO_STACK.length = 0;
    };

    return pub;

} (jQuery);
