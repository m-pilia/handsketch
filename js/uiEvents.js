/**
 * Handle events from the UI and from the model.
 *
 * @date 2016-01-20
 */

const uiEvents = function ($) {

    "use strict";

    // public interface
    const pub = {};

    // undo and redo buttons
    const UNDO_BUTTON = $('#undo');
    const REDO_BUTTON = $('#redo');

    // is false while dragging a tool
    var notDragging = true;

    // save last coordinates for interpolation
    var lastX = null;
    var lastY = null;

    // color input items
    const colorInput = [
        $('.color-item.red'),
        $('.color-item.green'),
        $('.color-item.blue'),
        $('.color-item.alpha')
    ];

    /**
     * Insert intermediate strokes between the current and the last tool
     * positions when the distance between them is significative.
     * @param  {number} x X coordinate for the current position.
     * @param  {number} y Y coordinate for the current position.
     */
    function interpolation(x, y) {
        // number of stroke points inside a tool thickness distance
        const k = 4;
        if (lastX === null || lastY === null)
            return;
        var deltaX = lastX - x;
        var deltaY = lastY - y;
        var d = (Math.hypot(deltaX, deltaY) / drawing.thickness() * k) | 0;
        if (d < 1)
            return;
        var dx = deltaX / d;
        var dy = deltaY / d;
        while (d > 0) {
            drawing.toolAction((x + d * dx) | 0, (y + d * dy) | 0);
            d--;
        }
    }

    /**
     * Undo a tool action, restoring the canvas before the action itself.
     */
    function undoTool() {
        // call action undo and check if there was something to undo
        if (!drawing.undo()) {
            return;
        }

        // set button activity
        REDO_BUTTON.removeClass('inactive-button');
        if (!drawing.undoable())
            UNDO_BUTTON.addClass('inactive-button');
    }

    /**
     * Redo an undone action.
     */
    function redoTool() {
        // call action redo and check if there was something to redo
        if (!drawing.redo()) {
            return;
        }

        // set button activity
        UNDO_BUTTON.removeClass('inactive-button');
        if (!drawing.redoable())
            REDO_BUTTON.addClass('inactive-button');
    }

    /**
     * Open an overlay popup to get the size for a new image.
     * @param  {Event} e Event (unused).
     */
    function newImage(e) {
        popup.openPopup('size-popup');
    }

    /**
     * Open in the canvas an image from file.
     * @param  {Event} e Event (unused).
     */
    function openImage(e) {
        var inputImage = $('#image-file');
        inputImage.val(null);
        inputImage.trigger('click');
    }

    /**
     * Export the image from the canvas to file.
     * @param  {Event} e Event (unused).
     */
    function saveImage(e) {
        $('#image-save')
            .attr('href', $('#canvas')[0].toDataURL("image/png"))[0]
            .click();
    }

    /**
     * Set the input inside the container as the active one for gestures.
     * @param  {Object} o JQuery selection of the container.
     */
    pub.activateInput = function (o) {
        // activate input field if it is an option or color selector
        if (o.find('input').length || o.attr('data-entry') == 'shape') {
            $("[data-active]").removeAttr('data-active');
            o.attr("data-active", "true");
        }
        // activate relative option if it is a tool selector
        else {
            var tool = o.attr('data-entry');
            $('#' + tool + '-selector .selected-tool').trigger('click');
        }
    };

    /**
     * Set the tool function.
     * @param {string} f Selected tool.
     */
    pub.setTool = function (f) {
        drawing.tool(f);
        // enable option selector for the tool and disable others
        var wrapper = $('.option-widget-wrapper');
        wrapper.find('.circular-selector[id!=' + f + '-selector]')
            .addClass('hidden-selector');
        var selector = $('#' + f + '-selector');
        selector.removeClass('hidden-selector');
        // ask for a entries re-fit
        var e = new CustomEvent('selectedTool', {detail: {'tool': f}});
        document.dispatchEvent(e);
        // restore settings
        var prevShape = selector
                .find('li[data-entry="shape"] img:not(.inactive)')
                .attr('data-shape')
        if (prevShape !== undefined && prevShape !== null) {
            drawing.shape(prevShape);
        }
        selector.find('li[data-entry] input').trigger('input');
    };

    // set undo action
    UNDO_BUTTON.click(function (e) {
        undoTool();
    });

    // set redo action
    REDO_BUTTON.click(function (e) {
        redoTool();
    });

    // disable undo and redo buttons on startup
    UNDO_BUTTON.addClass('inactive-button');
    REDO_BUTTON.addClass('inactive-button');

    // show/hide input hint on mouse enter/leave
    // track all input fields: quite ugly, but the actual afford has mouse
    // events disabled by css, so it cannot handle this directly
    $('input,.shape-entry').mouseenter(function (e) {
        if ($(this).closest('[data-active]').length === 0) {
            return;
        }
        $('body').append(
            `<div id="input-selector-hint"
                  style="position: fixed;
                         top: ` + e.pageY + `px;
                         left: ` + e.pageX + `px">
             </div>`);
    }).mouseleave(function (e) {
        $('#input-selector-hint').remove();
    });

    // disable hints on event
    $(document).on('disableHints', function (e) {
        $('.highlighted-selector').removeClass('highlighted-selector');
    });

    // toggle hint highlightment on event
    $(document).on('toggleHint', function (e) {
        var hint = e.originalEvent.detail.hint;
        var value = e.originalEvent.detail.value;
        circularSelector.hintHighlight(hint, value);
    });

    // rotate afford on event
    $(document).on('rotateAfford', function (e) {
        var name = e.originalEvent.detail.name;
        var angle = e.originalEvent.detail.angle;
        $('#' + name + '-afford').css('transform', 'rotate(' + angle + 'deg)');
    });

    // select color channel input on event
    $(document).on('selectColor', function (e) {
        var o = colorInput[e.originalEvent.detail.n];
        uiEvents.activateInput(o);
        circularSelector.setInputAfford();
    });

    // change input value on event
    $(document).on('inputChange', function (e) {
        var sign = e.originalEvent.detail.sign;

        // active input entry
        var active = $('[data-active]');

        if (active.attr('data-entry') === 'shape') {
            var currentShape = active.find('[data-shape]:not(.inactive)');
            var f = sign > 0 ? drawing.nextShape : drawing.prevShape;
            var s = f(currentShape.attr('data-shape'));
            active.find('[data-shape="' + s + '"]').trigger('click');
        }
        else {
            const input = active.find('input');
            const max = parseInt(input.attr('max'));
            const min = parseInt(input.attr('min'));
            var k = max / 10 | 0;
            var v = parseInt(input.val());

            v += sign * k;
            v -= v % k; // ensure the value is a multiple of k

            if (v > max || v < min) {
                // limit v to the input bounds
                v = v > max ? max : min;

                // feedback the reaching of the input limit
                input.css('background-color', '#F99');

                // restore background after timeout
                window.setTimeout(function () {
                    input.css('background-color', '#FFF');
                }, 200);
            }

            input.val(v);
            input.trigger('change');
            input.trigger('input')
        }
    });

    // select an entry on event
    $(document).on('selectEntry', function (e) {
        var selector = e.originalEvent.detail.selector;
        var entry = e.originalEvent.detail.entry;
        var handler = (selector === 'tool' ? pub.setTool : null);
        circularSelector.selectEntry(selector, entry, handler);
    });

    // keyboard event handler
    $(document).keydown(function (e) {
        switch (e.which) {
        case 90: // z key
            if (e.ctrlKey) {
                if  (e.shiftKey) {
                    e.preventDefault();
                    redoTool();
                }
                else {
                    e.preventDefault();
                    undoTool();
                }
            }
            break;
        case 83: // s key
            if (e.ctrlKey) {
                e.preventDefault();
                saveImage();
            }
            break;
        case 79: // o key
            if (e.ctrlKey) {
                e.preventDefault();
                openImage();
            }
            break;
        case 65: // a key
            if (e.ctrlKey) {
                e.preventDefault();
                newImage();
            }
            break;
        case 27: // esc key
            if (popup.isPopupOpen()) {
                e.preventDefault();
                popup.closePopup();
            }
            break;
        }
    });

    // open about popup from menu
    $('#about').click(function (e) {
        // open overlay popup
        popup.openPopup('about-popup');
    });

    // close about popup
    $('#about-popup .popup-exit').click(function (e) {
        popup.closePopup();
    });

    // new image from menu
    $('#new-image').click(newImage);

    // create new image with input size
    $('#size-popup .popup-exit').click(function (e) {
        var width = $('#size-popup input[name="width"]').val();
        var height = $('#size-popup input[name="height"]').val();
        drawing.canvasResize(width, height);
        popup.closePopup();
    });

    // open image from menu
    $('#open-file').click(openImage);

    // put the opened image into the canvas
    $('#image-file').on('change', function (e) {
        var img = new Image();
        img.src = window.URL.createObjectURL(e.target.files[0]);
        img.style.display = 'none';
        img.onload = function() {
            drawing.canvasResize(img.width, img.height, img);
        }
    });

    // save image from the canvas
    $('#save-file').click(saveImage);

    // event handler to draw on mouse clik
    $('#canvas').on('mousedown', function (e) {
        // forbid input when a popup is open or with buttons different than left
        if (popup.isPopupOpen() || e.which !== 1) {
            return;
        }

        // keep a copy for undo and forbid redo
        drawing.snapshot();

        // set undo/redo button activity
        UNDO_BUTTON.removeClass('inactive-button');
        REDO_BUTTON.addClass('inactive-button');

        // set the start of a stroke
        drawing.startStroke();

        var p = canvasCoord.getCoord(e);

        const tool = drawing.tool();
        switch (tool) {
        // non-draggable tools
        case 'picker':
        case 'filler':
            drawing[tool](p.x, p.y);
            break;

        // draggable tools
        case 'brush':
        case 'airbrush':
        case 'eraser':
            notDragging = false;
            drawing.toolAction(p.x, p.y);
            lastX = p.x;
            lastY = p.y;
            break;
        }
    });

    // event handler to stop drawing on mouse release
    $('#canvas').on('mouseup mouseleave', function (e) {
        if (notDragging)
            return;
        var p = canvasCoord.getCoord(e);
        drawing.toolAction(p.x, p.y);
        notDragging = true;
        lastX = lastY = null;
    });

    // event handler to draw dragging the mouse
    $('#canvas').on('mousemove', function (e) {
        if (notDragging)
            return;
        var p = canvasCoord.getCoord(e);
        drawing.toolAction(p.x, p.y);
        interpolation(p.x, p.y);
        lastX = p.x;
        lastY = p.y;
    });

    // get numeric options
    $('.circular-selector li[data-entry] input').on('input change', function (e) {
        // get value
        var val = parseInt($(this).val());

        // do a minimum data validation
        const min = $(this).attr('min');
        const max = $(this).attr('max');
        if (val != val || val < min)
            val = min;
        if (val > max)
            val = max;

        // set value
        var entry = $(this).closest('li[data-entry]').attr('data-entry');
        drawing[entry](val);

        // update cursor
        cursor.setCursor();
    });

    // get shape options
    $('.circular-selector li[data-entry="shape"] img').click(function (e) {
        drawing.shape($(this).attr('data-shape'));
        // update cursor
        cursor.setCursor();
        // highlight selected shape and dim others
        var parent = $(this).closest('li[data-entry=shape]');
        parent.find('[data-shape]').addClass('inactive');
        $(this).removeClass('inactive');
    });

    return pub;

} (jQuery);
