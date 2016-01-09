/**
 * JavaScript code for the tool selector.
 * This script counts the n entries in the selector, draws a circular sector
 * covering 1/n th of the circle and uses it to clip each entry. The entries
 * are then disposed around the circle with proper rotations.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-31
 */

/**
 * Apply style to the selected tool entry.
 * @param {number} i  Index of the selected entry.
 */
function selectTool(i) {
    $("#tool-selector .selected-tool").removeClass("selected-tool");
    $("#tool-selector li:nth-child(" + i + ")").addClass("selected-tool");
}

/**
 *
 */
function hintHighlight(val) {
    if (val)
        $("#tool-selector-hint").addClass("highlighted-selector");
    else
        $("#tool-selector-hint").removeClass("highlighted-selector");
}

// default selection on first tool
selectTool(1);

// selector entries
var tools = $("#tool-selector li");

// number of entries in the selector
const TOOLS_NO = tools.length;

// angular separation between entries (in degs)
var sep = 1;

// angular amplitude of each selector entry
var angle = 360 / TOOLS_NO - sep;

// draw the path in the svg to clip the selector entry
var angleRad = angle * Math.PI / 180;
var x = 0.5 + 0.5 * Math.cos(angleRad);
var y = 0.5 - 0.5 * Math.sin(angleRad);
$(".sector").attr("d", "M0.5,0.5 l0.5,0 A0.5,0.5 0 0,0 " + x + "," + y + " z");

// clip-path and rotate each selector entry
tools.each(function (i) {
    // (angle + sep) * i is occupated by the previous i entries, (sep / 2) is
    // for actual separation from the previous entry
    var rot = (angle + sep) * i + (sep / 2);

    // clip-path the entry
    $(this).css("clip-path", "url(#sector)");
    $(this).css("-webkit-clip-path", "url(#sector)");

    // rotate to its final position
    $(this).css("transform", "rotate(" + rot + "deg)");
    $(this).css("-webkit-transform", "rotate(" + rot + "deg)");

    // counter-rotate the entry's content
    $(this).find(".tool-entry").css("transform", "rotate(-" + rot + "deg)");
    $(this).find(".tool-entry").css("-webkit-transform", "rotate(-" + rot + "deg)");

    // add event handler on mouse click for the tool selection
    $(this).click(function () {
        selectTool(i + 1);
    });
});
