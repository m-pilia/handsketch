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
}

// create slider objects
$(".color-slider").each(function () {
    var color = $(this).data("slider-id");
    $(this).bootstrapSlider({
        reversed: true,
        id: $(this).attr("id") + "-x" /** Different id with trailing "-x" **/
    });

    // bind sliders to spinboxes
    $(this).on("slide change", function () {
        $("#" + color + "-value").val($("#" + color + "-slider").val());
        updateColorPreview();
    });
});

// bind spinbox values to sliders and reset initial value
$(".color-value").each(function () {
    var color = $(this).data("color");
    $(this).on("input", function () {
        var value = parseInt($(this).val());
        $("#" + color + "-slider").bootstrapSlider("setValue", value);
        updateColorPreview();
    });
    $(this).val(255); // reset initial value (useful on refresh)
});

// create the fan selector
$('#color-selector').fanSelector(60);
