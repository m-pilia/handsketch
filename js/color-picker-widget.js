/**
 * This file contains the functions for the color related widgets.
 * It contains even the color related events and event handlers.
 *
 * @author Fabio Colella <fcole90@gmail.com>
 * @date 2016-01-01
 */

"use strict";


/** Variable to handle the sliders objects **/
var sliders = new Array();

/** Event handlers for color management **/

/**
 * Updates the color values.
 * Used as event handler
 *
 * @param Object color an object containing colors as keys and their values.
 */
function updateColorValues(color) {
    if (color.red !== undefined) {
        $("#red-value").val(color.red);
    }

    if (color.green !== undefined) {
        $("#green-value").val(color.green);
    }

    if (color.blue !== undefined) {
        $("#blue-value").val(color.blue);
    }

    if (color.alpha !== undefined) {
        $("#alpha-value").val(color.alpha);
    }
    $(".color-value").trigger("color-change");
}

/**
 * Updates the color selectors.
 * Used as event handler
 *
 * @param Object color an object containing colors as keys and their values.
 */
function updateColorSelectors(color)
{
    if (color.red !== undefined) {
        $(".red-setting").val(color.red);
    }

    if (color.green !== undefined) {
        $(".green-setting").val(color.green);
    }

    if (color.blue !== undefined) {
        $(".blue-setting").val(color.blue);
    }

    if (color.alpha !== undefined) {
        $(".alpha-setting").val(color.alpha);
    }
}

/**
 * Updates the color sliders.
 * Used as event handler
 *
 * @param Object color an object containing colors as keys and their values.
 */
function updateColorSliders(color) {
    if (sliders.length < 4)
        return;

    if (color.red !== undefined) {
        sliders[0].data("slider").setValue(parseInt(color.red));
    }

    if (color.green !== undefined) {
        sliders[1].data("slider").setValue(parseInt(color.green));
    }

    if (color.blue !== undefined) {
        sliders[2].data("slider").setValue(parseInt(color.blue));
    }

    if (color.alpha !== undefined) {
        sliders[3].data("slider").setValue(parseInt(color.alpha));
    }
}

/**
 * Returns the updated color CSS rule.
 * Used as event handler on in conjunction with event handlers.
 *
 * @param Object color an object containing colors as keys and their values.
 * @return String rgba CSS rule.
 */
function updateColorRule(color) {
    return "rgba(" + color.red + ", " + color.green + ", " +
            color.blue + ", " + color.alpha/255 + ")";
}


/** Create the color sliders and set their variable**/
$('.color-slider').each(function (i) {
    sliders.push($(this).slider({
        reversed: true,
        /** Sets a different id with trailing "-x" **/
        id: $(this).attr("id") + "-x"
    }));
});

/** Creates a new fan selector **/
$('#color-selector').fanSelector(60);

/** Events **/

/** Bind color sliders to the values **/
$('.color-slider').on('slide', function () {
    updateColorValues({
        red: $("#red-slider").val(),
        green: $("#green-slider").val(),
        blue: $("#blue-slider").val(),
        alpha: $("#alpha-slider").val()
    });
});

/** Bind color values to its setters **/
$('.color-value').change(function () {
    updateColorSelectors({
           red: $("#red-value").val(),
           green: $("#green-value").val(),
           blue: $("#blue-value").val(),
           alpha: $("#alpha-value").val()
       });
});

/** Update the values of the sliders **/
$('.color-value').change(function () {
    updateColorSliders({
           red: $("#red-value").val(),
           green: $("#green-value").val(),
           blue: $("#blue-value").val(),
           alpha: $("#alpha-value").val()
       });
});

/** Update the value of the fg-element **/
$('.color-value').on("color-change", function () {
    var css = updateColorRule({
           red: $("#red-value").val(),
           green: $("#green-value").val(),
           blue: $("#blue-value").val(),
           alpha: $("#alpha-value").val()
       });
    $("#fg-color").css("background", css);
});
