/**
 * Dynamic view settings.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-02
 */

"use strict";

// bounding client rectangle for the canvas
var canvasBCR = null;

/**
 * Fit the size of a selector in order to fill the available space in the
 * wrapper. The selector is expanded as much as possible, and its top and
 * left css attributes are set in order to center it.
 * @param  {string} key     Identifier of the selector's class and id.
 * @param  {bool}   expand  If true, the selector is expanded as most as
 *                          possible to fit the wrapper.
 */
function fitSelector(key, expand) {
    var margin = 10;
    var selector = $("#" + key + "-selector");
    var wrapper = selector.parent();
    var wWidth = wrapper.width();
    var wHeight = wrapper.height();
    var size = Math.min(wWidth, wHeight) - 2 * margin;;

    if (expand) {
        // set width and height
        selector.width(size + "px");
        selector.height(size + "px");
    }

    // set top
    var top = (wHeight - selector.height()) / 2;
    top = Math.max(0, top);
    selector.css("top", top);

    // set left
    var left = (wWidth - $(".selector-hint").outerWidth(true)
        - selector.width()) / 2;
    left = Math.max(0, left);
    selector.css("left", left);

    // set entries position
    var entries = $("#" + key + "-selector .selector-entry");
    var n = entries.length;
    entries.each(function () {
        var x = ($(this).outerWidth() * 50 / size);
        var y = ($(this).outerHeight() * 50 / size);
        $(this).css("right", (3 + 100 / n - x | 0).toString() + "%");
        $(this).css("top", (3 + 25 - y).toString() + "%");
    });
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

    // update bounding client rectangle
    canvasBCR = canvas[0].getBoundingClientRect();
}

/**
 * Fit the canvas area to occupy the available horizontal space.
 */
function fitColumns() {
    var width = $(window).width() - $(".side-panel").outerWidth();
    $(".canvas-wrapper").css("width", width);
}

/**
 * Place the popup at the center of the viewport.
 */
function fitPopup() {
    var popup = $(".popup");

    // compute top and left distances
    var top = Math.max(0, ($(window).height() - popup.outerHeight(true)) / 2);
    var left = Math.max(0, ($(window).width() - popup.outerWidth(true)) / 2);

    // apply style
    popup.css("top", top);
    popup.css("left", left);
}

/**
 * Fit all the sizes which need a dynamic adjustment.
 */
function fitSizes() {
    fitColumns();
    fitCanvas();
    fitSelector("tool", true);
    fitSelector("brush", true);
    fitSelector("airbrush", true);
    fitSelector("eraser", true);
    fitSelector("picker", true);
    fitSelector("filler", true);
    fitSelector("color-picker", false);
    fitPopup();
}

/**
 * Search for theme stilesheet files, and append one menu entry for each one
 * in the menubar's theme submenu.
 */
function collectThemes() {
    $("link[data-theme]").each(function () {
        var theme = $(this).attr("data-theme");
        $("#themes-submenu").append(`
            <li>
                <a  id="` + theme + `-theme"
                    tabindex="0"
                    onclick="applyTheme('` + theme + `')">
                        <span class="glyphicon glyphicon-eye-open"
                              aria-hidden="true"></span>&nbsp;` +
                        theme + `
                </a>
            </li>`
        );
    });
}

/*
 * A function wich is executed when the document is ready and which does all
 * the dynamic settings needed.
 */
$(document).ready(function () {
    // enable submenus
    $('[data-submenu]').submenupicker();

    // add themes in the menubar
    collectThemes();

    // add rulers to the canvas area
    $("#canvas-area").ruler();

    // setup selectors
    setupSelector("tool", setTool);
    setupSelector("brush", null);
    setupSelector("airbrush", null);
    setupSelector("eraser", null);
    setupSelector("filler", null);
    setupSelector("picker", null);

    // fit sizes on load and on resize
    fitSizes();
    window.addEventListener('resize', fitSizes);
});
