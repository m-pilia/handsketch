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
            const cp = colorPicker;
            const thickness = drawing.thickness();
            const radius = thickness / 2;
            const svgColor = (tool == 'eraser' ? '#ffffff' : cp.getRGBColor());
            const svgOpacity = (drawing.opacity() * cp.alpha() / 255);

            switch (drawing.shape()) {
            case 'circle':
                svgCode =
                    '<circle ' +
                    'cx="' + radius + '" ' +
                    'cy="' + radius + '" ' +
                    'r="' + radius + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    '/>'
                break;
            case 'square':
                svgCode =
                    '<rect ' +
                    'width="' + thickness + '" ' +
                    'height="' + thickness + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    '/>'
                break;
            case 'diamond':
                var transl = radius * (Math.sqrt(2) - 1) * 0.75;
                svgCode =
                    '<rect ' +
                    'width="' + Math.sqrt(2) * radius + '" ' +
                    'height="' + Math.sqrt(2) * radius + '" ' +
                    'stroke="black" stroke-width="0.5" ' +
                    'fill="' + svgColor + '" ' +
                    'fill-opacity="' + svgOpacity + '" ' +
                    'transform="rotate(45 ' + radius + ' ' + radius + ') ' +
                    'translate(' + transl + ' ' + transl + ')" ' +
                    '/>'
                break;
            }
            CURSOR.css('width', thickness)
                  .css('height', thickness);
            break;
        }

        CURSOR.html(svgCode);
    };

    // bind the position of the cursor image to the mouse pointer
    $('#canvas,#cursor').on('mousemove', function(e) {
        CURSOR.css({
            left: e.pageX - 0.5 * CURSOR.outerWidth() + cursTraX,
            top:  e.pageY - 0.5 * CURSOR.outerHeight() + cursTraY
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
