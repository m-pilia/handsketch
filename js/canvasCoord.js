/**
 * Manage canvas bounding rectangle and pointer coordinates on canvas.
 *
 * @date 2016-02-03
 */

const canvasCoord = function ($) {

    "use strict";

    // public interface
    const pub = {};

    // canvas object
    const canvas = document.getElementById('canvas');

    // bounding client rectangle for the canvas
    var mCanvasBCR = null;

    // scroll amount
    var scrollTop = 0;
    var scrollLeft = 0;

    /**
     * Get the canvas object in use.
     * @return {Canvas} Canvas object in use.
     */
    pub.getCanvas = function () {
        return canvas;
    }

    /**
     * Get or set the bounding client rectangle for the canvas.
     * @param  {DOMRect} cbcr The bounding client rectancle for the canvas.
     * @return {DOMRect}      Current BCR for the canvas.
     */
    pub.canvasBCR = function (cbcr) {
        if (cbcr !== undefined) {
            mCanvasBCR = cbcr;
        }
        return mCanvasBCR;
    };

    /**
     * Update the canvas bounding client rectangle.
     * @return {DOMRect} Updated BCR for the canvas.
     */
    pub.updateCanvasBCR = function () {
        mCanvasBCR = canvas.getBoundingClientRect();
        return mCanvasBCR;
    }

    /**
     * Get canvas coordinates from a mouse event.
     * @param  {event} e Mouse event.
     * @return {Object}  An object containing the event coordinates {x, y},
     *                   whose values are referred to the canvas coordinate
     *                   system.
     */
    pub.getCoord = function (e) {
        return {
            'x': (e.clientX - mCanvasBCR.left + scrollLeft) | 0,
            'y': (e.clientY - mCanvasBCR.top + scrollTop) | 0
        }
    };

    /**
     * Check if a point is inside the canvas area.
     * @param  {Object}  p A point whose coordinates are the x and y attributes.
     * @return {Boolean}   True if the point lies inside the canvas.
     */
    pub.isOnCanvas = function (p) {
        return (p.x >= 0 &&
                p.x < canvas.width &&
                p.y >= 0 &&
                p.y < canvas.height);
    };

    // set the canvas object for the drawing tools
    drawing.canvas(canvas);

    // prepare default white canvas on loading
    $(document).ready(function (e) {
        drawing.canvasResize(canvas.width, canvas.height);
    });

    // update scroll amount on scrolling
    $(document).ready(function (e) {
        var ruledArea = $('.ef-ruler');
        ruledArea.scroll(function (e) {
            scrollTop = ruledArea.scrollTop();
            scrollLeft = ruledArea.scrollLeft();
        });
    });

    return pub;

} (jQuery);
