/**
 * Cursor with the shape of the drawing tool.
 *
 * @date 2016-01-24
 */

const cursor = function ($) {

    "use strict";

    // public interface
    const pub = {};

    // cursor image object
    const CURSOR = $('#cursor');

    // margin for the cursor image
    const CURS_MARG = 1;

    // cursor translation to fit the tip of the pointer with the image
    var cursTraX = 0;
    var cursTraY = 0;

    /**
     * Set the cursor, updating shape, color and size. The cursor image is
     * defined dynamically in SVG format.
     */
    pub.setCursor = function () {

        var svgCode = '';

        const tool = drawing.tool();
        switch (tool) {

        case 'picker':
            svgCode = '<image width="22" height="22" ' +
                             'xlink:href="img/icon/white/picker.png" />';
            cursTraX = 11;
            cursTraY = -11;
            CURSOR.css({width: 22, height: 22});
            break;

        case 'filler':
            svgCode = '<image width="22" height="22" ' +
                             'xlink:href="img/icon/white/filler.png" />';
            cursTraX = -9;
            cursTraY = -6;
            CURSOR.css({width: 22, height: 22});
            break;

        default:
            cursTraX = cursTraY = 0;
            const cpw = colorPickerWidget;
            const thickness = drawing.thickness();
            const svgColor = (tool == 'eraser' ? '#ffffff' : cpw.getRGBColor());
            const svgOpacity = (drawing.opacity() * cpw.alpha() / 255);

            switch (drawing.shape()) {
            case 'circle':
                svgCode =
                    '<circle ' +
                    'cx="' + thickness + '" ' +
                    'cy="' + thickness + '" ' +
                    'r="' + thickness + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    'transform="translate(' + 0 + ' ' + CURS_MARG + ')" ' +
                    '/>'
                break;
            case 'square':
                svgCode =
                    '<rect ' +
                    'width="' + 2 * thickness + '" ' +
                    'height="' + 2 * thickness + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    'transform="translate(' + 0 + ' ' + CURS_MARG + ')" ' +
                    '/>'
                break;
            case 'diamond':
                var transl = thickness * (Math.sqrt(2) - 1);
                svgCode =
                    '<rect ' +
                    'width="' + Math.sqrt(2) * thickness + '" ' +
                    'height="' + Math.sqrt(2) * thickness + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    'transform="rotate(45 ' + thickness + ' ' + thickness + ') ' +
                    'translate(' + transl + ' ' + transl + CURS_MARG + ')" ' +
                    '/>'
                break;
            }
            CURSOR.css('width', 2 * thickness)
                  .css('height', 2 * (thickness + CURS_MARG));
            break;
        }

        CURSOR.html(svgCode);
    };

    // bind the position of the cursor image to the mouse pointer
    $('#canvas,#cursor').on('mousemove', function(e) {
        CURSOR.css({
            left: e.pageX - 0.5 * CURSOR.outerWidth() + cursTraX,
            top:  e.pageY - 0.5 * CURSOR.outerHeight() + CURS_MARG + cursTraY
        });
    });

    // hide pointer and show cursor image inside the canvas
    $(document).on('mousemove', function (e) {
        if (canvasCoord.isOnCanvas(canvasCoord.getCoord(e))
                && $('.popup-visible').length == 0) {
            CURSOR.css('display', 'inline');
            $(document.body).css('cursor', 'none');
        }
        else {
            CURSOR.css('display', 'none');
            $(document.body).css('cursor', 'default');
        }
    });

    return pub;

} (jQuery);
