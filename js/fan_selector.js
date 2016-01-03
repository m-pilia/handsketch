/**
 * JavaScript code for the fan selector.
 * This script extends the JQuery function to define a fan selector.
 * To do this it counts the n entries in the selector and places them in a
 * fan disposition.
 * @author Fabio Colella <fcole90@gmail.com>
 * @date 2016-01-01
 */

"use strict";

/** Fan selector definition: extending jQuery function **/
jQuery.fn.extend({
    fanSelector: function (angle) {
        /** The maximum aperture angle of the fan **/
        const maxFanAngle = 160; /* degrees */

        if (angle === undefined) {
            angle = maxFanAngle;
        }

        /** Get the children and count them **/
        var items = $(this).children(".fan-selector-item");
        var size = items.size();

        /** The increment of each step **/
        var increment = Math.floor(angle / (size));

        /** The starting angle **/
        var startAngle = - ((size / 2) * increment);

        /** The angle of rotation **/
        var rotAngle = startAngle;

        /** Adaptation for even num **/
        if (size % 2 === 0) {
            rotAngle += Math.floor(increment / 2);
        }

        /** Apply the rotation to all the items **/
        items.each(function(){
            /** Apply the rotation with center in center bottom**/
            $(this).css("transform-origin", "center bottom");
            $(this).css("-webkit-transform-origin", "center bottom");
            $(this).css("transform", "rotate(" + rotAngle + "deg)");
            $(this).css("-webkit-transform", "rotate(" + rotAngle + "deg)");
            rotAngle += increment;
        });

        /** Needed for JQuery chaining **/
        return $(this);
    }
});
