/**
 * Overlay popup.
 *
 * @date 2016-01-18
 */

const popup = function ($) {

    "use strict";

    // public interface
    const pub = {};

    /**
     * Open the popup with the specified id.
     * @param  {string} popupName The id for the popup div.
     */
    pub.openPopup = function (popupName) {
        $('#' + popupName).addClass('popup-visible');
        $('.body-wrapper')
                .addClass('overlay')
                .add('.popup-cancel')
                .click(function () {
            pub.closePopup();
        });
    };

    /**
     * Close any open popup.
     */
    pub.closePopup = function () {
        $('.popup-visible').removeClass('popup-visible');
        $('.overlay').removeClass('overlay');
    };

    /**
     * Check if a popup is open.
     * @param {string} name Id for the popup. If not specified, the check is
     *                      done for any popup.
     * @return {Boolean} True if the specified popup (or any popup, if
     *                   not specified) is open.
     */
    pub.isPopupOpen = function (name) {
        if (name === undefined || name === null || $.type(name) !== "string")
            name = '';
        else
            name = "#" + name;
        return $(name + '.popup-visible').length > 0;
    };

    return pub;

} (jQuery);
