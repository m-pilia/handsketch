/**
 * JavaScript code for the tool selector.
 * This script counts the n entries in the selector, draws a circular sector
 * covering 1/n th of the circle and uses it to clip each entry. The entries
 * are then disposed around the circle with proper rotations.
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-31
 */

// selector entries
var items = $(".tool-selector li");

// angular amplitude of each selector entry
var angleRad = 2 * Math.PI / items.length;
var angle = angleRad  * 180 / Math.PI;

// draw the path in the svg to clip the selector entry
var x = 0.5 + 0.5 * Math.cos(angleRad);
var y = 0.5 - 0.5 * Math.sin(angleRad);
$(".sector").attr("d", "M0.5,0.5 l0.5,0 A0.5,0.5 0 0,0 " + x + "," + y + " z");

// clip-path and rotate each selector entry
items.each(function (i) {
    var rot = angle * i;

    // clip-path the entry
    $(this).css("clip-path", "url(#sector)");
    $(this).css("-webkit-clip-path", "url(#sector)");

    // rotate to its final position
    $(this).css("transform", "rotate(" + rot + "deg)");
    $(this).css("-webkit-transform", "rotate(" + rot + "deg)");

    // counter-rotate the entry's content
    $(this).find(".tool-entry").css("transform", "rotate(-" + rot + "deg)");
    $(this).find(".tool-entry").css("-webkit-transform", "rotate(-" + rot + "deg)");
});
