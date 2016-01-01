/**
 * JavaScript code for the fan selector.
 * This script extends the JQuery function to define a fan selector.
 * To do this it counts the n entries in the selector and places them in a 
 * fan disposition.
 * @author Fabio Colella <fcole90@gmail.com>
 * @date 2016-01-01
 */

/** Fan selector definition: extending jQuery function **/
jQuery.fn.extend({
    fanSelector: function (angle) {
        /** The maximum aperture angle of the fan **/
        var maxFanAngle = 160; /* degrees */
        
        if (angle === undefined)
        {
            angle = maxFanAngle;
        }
        
        /** Get the children and count them **/
        var items = $(this).children(".fan-selector-item");
        var size = items.size();
 
        /** The increment of each step **/
        var increment = Math.floor(angle, size - 1);
        
        /** The starting angle **/
        var startAngle = - ((size / 2) * increment);
        
        /** The angle of rotation **/
        rotAngle = startAngle;
        
        /** Apply the rotation to all the items **/
        items.each(function(){
            $(this).css("transform", "rotate(" + rotAngle + "deg)");
            $(this).css("-webkit-transform", "rotate(" + rotAngle + "deg)");
            rotAngle += increment;
        });

        /** Needed for JQuery chaining **/
        return $(this);
    }
});