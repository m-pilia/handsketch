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
 * @param  {string} key     Identifier of the selector's class and id.
 * @param  {bool}   expand  If true, the selector is expanded as most as
 *                          possible to fit the wrapper.
 */
function fitSelector(key, expand) {
    var margin = 10;
    var wrapper = $("." + key + "-widget-wrapper");
    var wWidth = wrapper.width();
    var wHeight = wrapper.height();
    var selector = $("#" + key + "-selector");

    if (expand) {
        // set width and height
        var size = Math.min(wWidth, wHeight) - 2 * margin;
        selector.width(size + "px");
        selector.height(size + "px");
    }

    // set top
    var top = (wHeight - selector.height()) / 2;
    top = Math.max(0, top);
    selector.css("top", top);

    // set left
    var left = (wWidth - $("#" + key + "-selector-hint").outerWidth(true)
        - selector.width()) / 2;
    left = Math.max(0, left);
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
    fitCanvas();
    fitSelector("tool", true);
    //fitSelector("options", true);
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

    // fit sizes on load and on resize
    fitSizes();
    window.addEventListener('resize', fitSizes);
});
