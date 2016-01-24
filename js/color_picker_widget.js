/**
 * Create slider objects and fan selector.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-03
 */

"use strict";

/**
 * Update the color preview with the current component values.
 */
function updateColorPreview() {
    $("#fg-color").css(
        "background",
        "rgba(" +
            $("#red-value").val()   + "," +
            $("#green-value").val() + "," +
            $("#blue-value").val()  + "," +
            $("#alpha-value").val() / 255 + ")"
        );

    // update cursor
    setCursor();
}

// create slider objects
$(".color-slider").each(function () {
    var color = $(this).data("slider-id");

    $(this).bootstrapSlider({
        reversed: true,
        id: $(this).attr("id") + "-x" /** Different id with trailing "-x" **/
    });

    // bind sliders to spinboxes and save value into local storage
    $(this).on("slide change", function () {
        var value = $("#" + color + "-slider").val();
        $("#" + color + "-value").val(value);
        localStorage.setItem(color + "-value", value);
        updateColorPreview();
    });
});

$(".color-value").each(function () {
    var color = $(this).data("color");
    var slider = $("#" + color + "-slider");

    // bind spinbox values to sliders and save value into local storage
    $(this).on("input", function () {
        var value = parseInt($(this).val());
        slider.bootstrapSlider("setValue", value);
        localStorage.setItem(color + "-value", value);
        updateColorPreview();
    });

    // initial configuration: load value from storage and set it to sliders
    var value = localStorage.getItem(color + "-value");
    if (value === null) {
        value = $(this).attr('value');
    }
    $(this).val(value);
    slider.bootstrapSlider("setValue", parseInt(value));
    updateColorPreview();
});

// create the fan selector
$('#color-selector').fanSelector(60);
