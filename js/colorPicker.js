/**
 * Create slider objects and fan selector.
 *
 * @date 2016-01-03
 */

const colorPicker = function ($) {

    "use strict";

    // public interface
    const pub = {};

    // input spinboxes
    const RED = $('input#red-value');
    const GREEN = $('input#green-value');
    const BLUE = $('input#blue-value');
    const ALPHA = $('input#alpha-value');

    /**
     * Get the red color component from the color picker.
     * @param {number} v Optional value assigned to the color component.
     * @return {number} Value of the red color component.
     */
    pub.red = function (v) {
        if (v !== undefined) {
            RED.val(parseInt(v));
        }
        return RED.val();
    };

    /**
     * Get the green color component from the color picker.
     * @param {number} v Optional value assigned to the color component.
     * @return {number} Value of the green color component.
     */
    pub.green = function (v) {
        if (v !== undefined) {
            GREEN.val(parseInt(v));
        }
        return GREEN.val();
    };

    /**
     * Get the blue color component from the color picker.
     * @param {number} v Optional value assigned to the color component.
     * @return {number} Value of the blue color component.
     */
    pub.blue = function (v) {
        if (v !== undefined) {
            BLUE.val(parseInt(v));
        }
        return BLUE.val();
    };

    /**
     * Get the alpha color component from the color picker.
     * @param {number} v Optional value assigned to the color component.
     * @return {number} Value of the alpha color component.
     */
    pub.alpha = function (v) {
        if (v !== undefined) {
            ALPHA.val(parseInt(v));
        }
        return ALPHA.val();
    };

    /**
     * Get the color from the color picker as hexadecimal RGB string.
     * @return {string} Hexadecimal RGB string for the color.
     */
    pub.getRGBColor = function () {
        return '#' +
            ('00' + parseInt(pub.red()).toString(16)).slice(-2) +
            ('00' + parseInt(pub.green()).toString(16)).slice(-2) +
            ('00' + parseInt(pub.blue()).toString(16)).slice(-2);
    };

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
        cursor.setCursor();
    }

    $(document).ready(function () {
        // create slider objects
        $(".color-slider").each(function () {
            var color = $(this).data("slider-id");

            $(this).bootstrapSlider({
                reversed: true,
                id: $(this).attr("id") + "-x" // Different id with trailing "-x"
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

            // activate and set inptut afford when focused
            $(this).on("focus", function () {
                toolManagement.activateInput($(this).parent('.color-item'));
                circularSelector.setInputAfford();
            });

            // initial configuration: load value from storage and set sliders
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
    });

    return pub;

} (jQuery);
