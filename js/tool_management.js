/**
 * Drawing tools switch and setup.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2016-01-20
 */

// undo and redo stacks
// the whole image data is saved for each entry: quite expensive but easy
// enough for an application prototype
const UNDO_STACK = [];
const REDO_STACK = [];

// undo and redo buttons
const UNDO_BUTTON = $('#undo');
const REDO_BUTTON = $('#redo');

/**
 * Get canvas coordinates from a mouse event.
 * @param  {event} e Mouse event.
 * @return {Object}  An object containing the event coordinates {x, y}, whose
 *                   values are referred to the canvas coordinate system.
 */
function getCoord(e) {
    return {
        'x': (e.clientX - canvasBCR.left + scrollLeft) | 0,
        'y': (e.clientY - canvasBCR.top + scrollTop) | 0
    }
}

/**
 * Check if a point is inside the canvas area.
 * @param  {Object}  p A point whose coordinates are the x and y attributes.
 * @return {Boolean}   True if the point lies inside the canvas.
 */
function isOnCanvas(p) {
    return p.x >= 0 && p.x < canvas.width && p.y >= 0 && p.y < canvas.height;
}

/**
 * Set the tool function.
 * @param {string} f Selected tool.
 */
function setTool(f) {
    try {
        // set tool function
        tool = window[f];
        if ($.type(tool) !== 'function')
            throw new Error('The selected object is not a function');
        // enable option selector for the tool and disable others
        var wrapper = $('.option-widget-wrapper');
        wrapper.find('.circular-selector[id!=' + f + '-selector]')
            .addClass('hidden-selector');
        var selector = $('#' + f + '-selector');
        selector.removeClass('hidden-selector');
        // re-fit entries
        fitSelector(f);
        // restore settings
        var prevShape = selector
                .find('li[data-entry="shape"] img:not(.inactive)')
                .attr('data-shape')
        if (prevShape !== undefined && prevShape !== null) {
            setShape(prevShape);
        }
        selector.find('li[data-entry] input').trigger('input');
    }
    catch (e) {
        console.log('Error: invalid tool function ' + f + '\n' + e);
    }
}

/**
 * Set the shape of the tool.
 * @param {string} f Selected shape.
 */
function setShape(s) {
    try {
        // set shape
        shape = window[s];
        if ($.type(shape) !== 'function')
            throw new Error('The selected object is not a function');
    }
    catch (e) {
        console.log('Error: invalid shape ' + s + '\n' + e);
    }
}

/**
 * Undo a tool action, restoring the canvas before the action itself.
 */
function undoTool() {
    if (UNDO_STACK.length < 1) {
        return;
    }

    // keep a copy of undone action for redo
    REDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));

    // restore canvas
    imageData = UNDO_STACK.pop();
    data = imageData.data;
    ctx.putImageData(imageData, 0, 0);

    // set button activity
    REDO_BUTTON.removeClass('inactive-button');
    if (UNDO_STACK.length < 1)
        UNDO_BUTTON.addClass('inactive-button');
}

/**
 * Redo an undone action.
 */
function redoTool() {
    if (REDO_STACK.length < 1) {
        return;
    }

    // keep a copy of redone image for undo
    UNDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));

    // restore canvas
    imageData = REDO_STACK.pop();
    data = imageData.data;
    ctx.putImageData(imageData, 0, 0);

    // set button activity
    UNDO_BUTTON.removeClass('inactive-button');
    if (REDO_STACK.length < 1)
        REDO_BUTTON.addClass('inactive-button');
}

// prepare default white canvas on loading
$(document).ready(function (e) {
    canvasResize(canvas.width, canvas.height);
});

// update scroll amount on scrolling
$(document).ready(function (e) {
    var ruledArea = $('.ef-ruler');
    ruledArea.scroll(function (e) {
        scrollTop = ruledArea.scrollTop();
        scrollLeft = ruledArea.scrollLeft();
    });
});

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

// keyboard event handler
$(document).keypress(function (e) {
    switch (e.which) {
    case 90: // Z key (= shift + z key)
        if (e.ctrlKey)
            redoTool();
        break;
    case 122: // z key
        if (e.ctrlKey)
            undoTool();
        break;
    }
});

// new image from menu
$('#new-image').click(function (e) {
    // open overlay popup to get size
    openPopup('size-popup');
});

// create new image with input size
$('#size-popup .popup-exit').click(function (e) {
    var width = $('#size-popup input[name="width"]').val();
    var height = $('#size-popup input[name="height"]').val();
    canvasResize(width, height);
    closePopup();
});

// open image from menu
$('#open-file').click(function (e) {
    var inputImage = $('#image-file');
    inputImage.val(null);
    inputImage.trigger('click');
});

// put the opened image into the canvas
$('#image-file').on('change', function (e) {
    var img = new Image();
    img.src = window.URL.createObjectURL(e.target.files[0]);
    img.style.display = 'none';
    img.onload = function() {
        canvasResize(img.width, img.height, img);
    }
});

// event handler to draw on mouse clik
$('#canvas').on('mousedown', function (e) {
    // forbid input when a popup is open or with buttons different than left
    if (isPopupOpen() || e.which !== 1) {
        return;
    }

    // keep a copy for undo and forbid redo
    UNDO_STACK.push(new ImageData(data.slice(), canvas.width, canvas.height));
    REDO_STACK.length = 0;

    // set undo/redo button activity
    UNDO_BUTTON.removeClass('inactive-button');
    REDO_BUTTON.addClass('inactive-button');

    done.fill(false);
    var p = getCoord(e);

    switch (tool) {
    // non-draggable tools
    case picker:
    case filler:
        tool(p.x, p.y);
        break;

    // draggable tools
    case brush:
    case airbrush:
    case eraser:
        notDragging = false;
        toolAction(p.x, p.y);
        lastX = p.x;
        lastY = p.y;
        break;
    }
});

// event handler to stop drawing on mouse release
$('#canvas').on('mouseup mouseleave', function (e) {
    if (notDragging)
        return;
    var p = getCoord(e);
    toolAction(p.x, p.y);
    notDragging = true;
    lastX = lastY = null;
});

// event handler to draw dragging the mouse
$('#canvas').on('mousemove', function (e) {
    if (notDragging)
        return;
    var p = getCoord(e);
    toolAction(p.x, p.y);
    interpolation(p.x, p.y);
    lastX = p.x;
    lastY = p.y;
});

// get numeric options
$('.circular-selector li[data-entry] input').on('input change', function (e) {
    var entry = $(this).closest('li[data-entry]').attr('data-entry');
    window[entry] = parseInt($(this).val());
    // update cursor
    setCursor();
});

// get shape options
$('.circular-selector li[data-entry="shape"] img').click(function (e) {
    setShape($(this).attr('data-shape'));
    // update cursor
    setCursor();
    // highlight selected shape and dim others
    var parent = $(this).closest('li[data-entry=shape]');
    parent.find('[data-shape]').addClass('inactive');
    $(this).removeClass('inactive');
});

// select circle as default
$(document).on('ready', function (e) {
    $('[data-shape="circle"]').trigger('click');
});
