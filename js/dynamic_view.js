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
 * @param  {string} key Identifier of the selector's class and id.
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
 * Fit all the sizes which need a dynamic adjustment.
 */
function fitSizes() {
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

    // fit sizes on load and on resize
    fitSizes();
    window.addEventListener('resize', fitSizes);

    // add rulers to the canvas
    $("#canvas-area").ruler();
});
