/**
 * Dynamic view settings.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-02
 */

/**
 * Fit the size of a selector in order to fill the available space in the
 * wrapper. The selector is expanded as much as possible, and its top and
 * left css attributes are set in order to center it.
 * @param  {string} key  Identifier of the selector's class and id.
 */
function fitSelector(key) {
    var margin = 10;
    var wrapper = $("." + key + "-widget-wrapper");
    var wWidth = parseInt(wrapper.width());
    var wHeight = parseInt(wrapper.height());
    var selector = $("#" + key + "-selector");

    // set width and height
    var size = Math.min(wWidth, wHeight) - 2 * margin;
    selector.width(size + "px");
    selector.height(size + "px");

    // set top
    var top = (wHeight - parseInt(selector.height())) / 2;
    selector.css("top", top);

    // set left
    var left = (wWidth - $("#tool-selector-hint").outerWidth(true)
        - selector.width()) / 2;
    selector.css("left", left);
}

/**
 * Place the canvas at the center of the canvas area.
 */
function fitCanvas() {
    var canvas = $("#canvas");
    var container = $("#canvas-area");
    var rulerCorner = $(".ef-ruler .corner");

    // compute top and left distances
    var top = (container.height()
        - rulerCorner.outerHeight(true)
        - canvas.outerHeight(true))
        / 2;
    top = Math.max(0, top);
    var left = (container.width()
        - rulerCorner.outerWidth(true)
        - canvas.outerWidth(true))
        / 2;
    left = Math.max(0, left);

    // apply style
    canvas.css("top", top);
    canvas.css("left", left);

    // set ruler starting values
    container.ruler("option", "startY", -top);
    container.ruler("option", "startX", -left);
    container.ruler("refresh");
}

/**
 * Fit all the sizes which need a dynamic adjustment.
 */
function fitSizes() {
    fitCanvas();
    fitSelector("tool");
    //fitSelector("options");
    //fitSelector("color-picker");
}

/*
 * A function wich is executed when the document is ready and which does all
 * the dynamic settings needed.
 */
$(document).ready(function () {
    // enable submenus
    $('[data-submenu]').submenupicker();

    // add rulers to the canvas area
    $("#canvas-area").ruler();

    // fit sizes on load and on resize
    fitSizes();
    window.addEventListener('resize', fitSizes);
});
