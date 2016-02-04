/**
 * JavaScript code for the circular selector.
 * This script counts the n entries in the selector, draws a circular sector
 * covering 1/n th of the circle and uses it to clip each entry. The entries
 * are then disposed around the circle with proper rotations.
 *
 * @date 2015-12-31
 */

const circularSelector = function ($) {

    "use strict";

    // public interface
    const pub = {};

    /**
     * Apply style to the selected tool entry.
     * @param {string}   name    Name of the selector.
     * @param {number}   i       Index of the selected entry.
     * @param {function} handler Handler for the click events on entries. It is
     *                           a function taking as a parameter the
     *                            'data-entry' attribute
     */
    pub.selectEntry = function (name, i, handler) {
        // disable selection from previously selected item, and select the
        // current one
        $("#" + name + "-selector .selected-tool").removeClass("selected-tool");
        var li = $("#" + name + "-selector li:nth-child(" + i + ")");
        li.addClass("selected-tool");
        // remove activity from previously active item, and activate the
        // current one
        toolManagement.activateInput(li);
        // launch handler function if present
        if (handler)
            handler(li.attr('data-entry'));
        // set input afford
        pub.setInputAfford();
    };

    /**
     * Set the input afford position and size for the selected input.
     */
    pub.setInputAfford = function () {
        var o = $('[data-active] input, [data-active] .shape-entry');
        if (!o.length) {
            return;
        }
        var p = o.offset();
        var h = o.outerHeight();
        var w = o.outerWidth();
        var size = Math.max(h, w);
        var d = size * (Math.sqrt(2) - 1) * 0.8;
        var dh = 0.5 * Math.max(0, size - h);
        var dw = 0.5 * Math.max(0, size - w);
        var a = $('#input-afford');
        a.css({
            width: size + 2 * d,
            height: size + 2 * d,
            left: p.left - d - dw,
            top: p.top - d - dh
        })
    };

    /**
     * Toggle highlighting of the selector's hint picture.
     * @param {string} name Name of the selector.
     * @param {bool}   val  True to highlight, false to remove highlighting.
     */
    pub.hintHighlight = function (name, val) {
        if (val)
            $("#" + name + "-selector-hint,#" + name + "-afford")
                .addClass("highlighted-selector");
        else
            $("#" + name + "-selector-hint,#" + name + "-afford")
                .removeClass("highlighted-selector");
    };

    /**
     * Dynamical setup of the selector according to its size.
     * @param  {string} name    Name of the selector, the part of its id before
     *                          '-selector' (e.g. 'tool' for the selector whose
     *                          id is 'tool-selector').
     * @param  {function} handler Handler for click events on entries. Must be
     *                            a function accepting as a parameter the data
     *                            associated to the entry ('data-entry'
     *                            attribute).
     */
    pub.setupSelector = function (name, handler) {
        // selector entries
        var tools = $("#" + name + "-selector li");

        // number of entries in the selector
        const TOOLS_NO = tools.length;

        if (TOOLS_NO < 1)
            return;

        // angular separation between entries (in degs)
        var sep = 1;

        // angular amplitude of each selector entry
        var angle = 360 / TOOLS_NO - sep;

        // draw the path in the svg to clip the selector entry
        var angleRad = angle * Math.PI / 180;
        var x = 0.5 + 0.5 * Math.cos(angleRad);
        var y = 0.5 - 0.5 * Math.sin(angleRad);
        $("." + name + "-sector").attr(
                "d",
                "M0.5,0.5 l0.5,0 A0.5,0.5 0 0,0 " + x + "," + y + " z");

        // clip-path and rotate each selector entry
        tools.each(function (i) {
            // (angle + sep) * i is occupied by the previous i entries;
            // (sep / 2) is for actual separation from the previous entry;
            // (90 - angle / 2) is to centre the first entry at the top
            var rot = (angle + sep) * i + (sep / 2) - (90 - angle / 2);

            // clip-path the entry
            $(this).css("clip-path", "url(#" + name + "-sector)");
            $(this).css("-webkit-clip-path", "url(#" + name + "-sector)");

            // rotate to its final position
            $(this).css("transform", "rotate(" + rot + "deg)");
            $(this).css("-webkit-transform", "rotate(" + rot + "deg)");

            // counter-rotate the entry's content
            $(this).find(".selector-entry").css(
                    "transform",
                    "rotate(" + (-rot) + "deg)");
            $(this).find(".selector-entry").css(
                    "-webkit-transform",
                    "rotate(" + (-rot) + "deg)");

            // add event handler on mouse click for the tool selection
            $(this).click(function () {
                circularSelector.selectEntry(name, i + 1, handler);
            });
        });

        // default selection on the first entry
        circularSelector.selectEntry(name, 1, handler);
    };

    return pub;

} (jQuery);
