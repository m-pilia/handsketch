/**
 * Draw instruments and canvas management.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-17
 */

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// new image from menu
$('#new-image').click(function (e) {
    // open overlay popup to get size
    openPopup('size-popup');
});

// create new image with input size
$('#size-popup .popup-exit').click(function (e) {
    closePopup();
    // clear and resize canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = $('#size-popup input[name="width"]').val();
    canvas.height = $('#size-popup input[name="height"]').val();
    fitCanvas();
});

// open image from menu
$('#open-file').click(function (e) {
    $('#image-file').trigger('click');
});

// put the opened image into the canvas
$('#image-file').on('change', function (e) {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw image
    var img = new Image();
    img.src = window.URL.createObjectURL(e.target.files[0]);
    img.onload = function() {
        // resize canvas
        canvas.width = img.width;
        canvas.height = img.height;
        fitCanvas();
        // draw image
        ctx.drawImage(img, 0, 0);
    }
});
