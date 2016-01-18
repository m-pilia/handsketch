/**
 * Overlay popup.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-18
 */

function openPopup(popupName) {
    $('#' + popupName).addClass('popup-visible');
    $('.body-wrapper').addClass('overlay').click(function () {
        closePopup();
    });
}

function closePopup() {
    $('.popup-visible').removeClass('popup-visible');
    $('.overlay').removeClass('overlay');
}
