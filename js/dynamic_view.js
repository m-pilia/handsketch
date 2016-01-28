/**
 * Dynamic view settings.
 *
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
    var margin = 20;
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
        // very provisional and horrible
        var k = 4 * (1 - (size - 185) / (262 - 185)) | 0
        var x = ($(this).outerWidth() * 50 / size);
        var y = ($(this).outerHeight() * 50 / size);
        $(this).css("right", (k + 100 / n - x | 0).toString() + "%");
        $(this).css("top", (k + 25 - y).toString() + "%");
    });

    // place labels tangent to sectors
    var sectors = $("#" + key + "-selector li[data-entry]")
    sectors.each(function (i) {
        var val = $(this).attr("data-entry");
        var label = $(this).parent().find("span[data-label=" + val + "]" );
        if (label.attr("data-label")) {
            var size = $(this).parent().outerWidth()
            var angle = - (180 / n + 360 / n * (i - 1))
            const conv = Math.PI / 180;

            // translate to the centre of the circle
            var x0 = (size - label.outerWidth()) / 2;
            var y0 = (size - label.outerHeight()) / 2;

            // move to its position
            var r = size + label.outerHeight() * 1.7;
            var x = 0.5 * r * Math.cos(conv * angle);
            var y = 0.5 * r * Math.sin(conv * angle);

            label.css("position", "absolute");
            label.css("top", y0 - y);
            label.css("left", x0 + x);

            // avoid showing text upside-down in lower sectors
            if (angle > -180 && angle < 0) {
                angle += 180;
            }

            label.css("transform", "rotate(" + (90 - angle) + "deg)");
        }
    });
}

/**
 * Fit size and centering of the color picker widget.
 */
function fitColorPicker() {
    var margin = 5;
    var afford = $("#color-picker-afford");
    var display = $("#color-display");
    var selector = $("#color-picker-selector");
    var wrapper = selector.parent();
    var wWidth = wrapper.width();
    var wHeight = wrapper.height();
    var aHeight = afford.outerHeight();

    // expand height
    var height = wHeight - aHeight - 2 * margin;
    selector.css("height", height);

    // set top
    var top = (wHeight - selector.height() + aHeight) / 2;
    top = Math.max(0, top);
    selector.css("top", top);

    // set left
    var left = (wWidth - $(".selector-hint").outerWidth(true)
        - selector.width()) / 2;
    left = Math.max(0, left);
    selector.css("left", left);

    // set slider height
    $('.slider').css('height', selector.outerHeight() - display.outerHeight() - aHeight);
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
 * Fit affordance hints.
 * @param  {string} afford   Name of the afford hint.
 * @param  {string} selector Name of the referring selector.
 */
function fitAfford(afford) {
    // get related selector's name
    var w = $('.option-widget-wrapper');
    var s = w.find('.circular-selector:not(.hidden-selector)');
    var name = /([^-]*)-selector/.exec(s.first().attr('id'))[1];
    var b = $('#' + name + '-selector');

    var d = 6;
    var a = $('#' + afford + '-afford')
    var w = b.width()
    var h = b.height()
    var p = b.position()
    a.css({
        width: w + 2 * d,
        height: h + 2 * d,
        top: p.top - d,
        left: p.left - d,
    });
}

/**
 * Fit the position of the color picker affordance hint.
 */
function fitPickerAfford() {
    var s = $('#color-picker-selector');
    var a = $('#color-picker-afford');
    var w = $('.color-picker-widget-wrapper');
    var h = $('#color-picker-selector-hint');
    var pWidth = parseInt(w.css('width'));
    a.css('width', s.outerWidth() * 0.8 | 0);
    a.css('left', (w.outerWidth() - a.outerWidth() - h.outerWidth()) / 2 | 0);
    a.css('top', s.position().top - a.outerHeight() / 2);
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
    fitColorPicker();
    fitAfford('tool');
    fitAfford('option');
    fitPickerAfford();
    setInputAfford();
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
