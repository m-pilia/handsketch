/**
 * Provide gesture actions.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-31
 */

"use strict";

// capture device options
var options = {enableGestures: true};

// main loop
var controller = Leap.loop(options, function (frame) {
    if (!frame.valid) {
        return;
    }

    if (frame.hands.length > 0) {
        frameHandler(frame.hands[0], frame.gestures);
    }
    else {
        $('.highlighted-selector').removeClass('highlighted-selector');
    }
});

// some useful constants
const RAD2DEG = 180 / Math.PI;
const X = 0;
const Y = 1;
const Z = 2;
const THUMB = 0;
const INDEX = 1;
const MIDDLE = 2;
const RING = 3;
const PINKY = 4;

// get tools and the number of options for each tool
var OPT_NO = {};
var TOOLS_STR = {};
$('#tool-selector li').each(function () {
    var val = $(this).attr('data-entry');
    OPT_NO[window[val]] = $('#' + val + '-selector li').length;
    TOOLS_STR[window[val]] = val;
});
const TOOLS_NO = $('#tool-selector li').length;

/**
 * Apply the sign of a variable to another.
 * @param  {number} val  Variable with the desired value.
 * @param  {number} sgn  Variable with the desired sign.
 * @return {number} A number with the same absoulte value as val and
 *                  the same sign as sgn.
 */
function copysign(val, sgn) {
    return ((sgn >= 0) - (sgn < 0)) * Math.abs(val);
}

/**
 * Compute the rotation of the hand around the z axis, defined as the angle
 * between the y axis and the projection of the hand direction vector along
 * the xy plane.
 * @param  {Hand} h  The hand to be checked.
 * @return {number} The rotation of the hand (expressed in degrees).
 */
function rotation(hand) {
    var x = hand.direction[X];
    var y = hand.direction[Y];
    var n = Math.hypot(x, y);
    return copysign(180 / Math.PI * Math.acos(y / n), x);
}

/**
 * Compute the spread of the hand, defined as the sum of the distances
 * between each of index, middle and ring fingertips respect to the thumb
 * fingertip.
 * @param  {Hand} hand  The hand to be checked.
 * @return {number} The spread expressed in millimeters.
 */
function spread(hand) {
    var t = hand.thumb.distal.nextJoint;
    var i = Array(3);
    var m = Array(3);
    var r = Array(3);
    Leap.vec3.sub(i, hand.indexFinger.distal.nextJoint, t);
    Leap.vec3.sub(m, hand.middleFinger.distal.nextJoint, t);
    Leap.vec3.sub(r, hand.ringFinger.distal.nextJoint, t);
    return Leap.vec3.length(i) + Leap.vec3.length(m) + Leap.vec3.length(r);
}

/**
 * Angle of the distal phalanx of the finger respect to the palm normal.
 * @param  {Hand}   hand   Hand containing the finger.
 * @param  {string} finger Type of the finger.
 * @return {number}        Angle in degrees.
 */
function fingerAngle(hand, finger) {
    var dot = Leap.vec3.dot(hand[finger].distal.direction(), hand.palmNormal);
    return RAD2DEG * Math.acos(dot);
}

/*
 * When the hand position is recognized in a rotation gesture first, its
 * rotation angle in that first frame of the gesture is recorded. The angle is
 * tracked up to the end of the gesture, and then the angle difference between
 * the last and the first frame of the gesture represents the angle variation
 * for the knob.
 */
const NONE = 0xFFFF; // an unreachable value, used as a null one
const RANGE = 360;   // the angle range for the knob is from 0 to this value
var tAngle = 10;     // current tool angle
var tFirst = NONE;   // angle of the hand at the start of the interaction
var tLast = 0;       // value read on the last seen frame
var tLastN = 1;      // last tool index

// as above, for the option selectors
var oAngle = [];
var oFirst = [];
var oLast = [];
var oLastN = [];
// init
for (var e in TOOLS_STR) {
    oAngle[e] = 10;
    oFirst[e] = NONE;
    oLast[e] = 0;
    oLastN[e] = 1;
};

// as above, for the color picker
var cAngle = 10;
var cFirst = NONE;
var cLast = 0;
var cLastN = 1;

// stored value for input gestures
var lastVal = 0;

function frameHandler(hand, gestures) {
    var s = spread(hand);
    var d = Array(3);
    Leap.vec3.sub(
        d,
        hand.indexFinger.distal.nextJoint,
        hand.thumb.distal.nextJoint);
    d = Leap.vec3.length(d);

    var t = Array(3);
    Leap.vec3.sub(
        t,
        hand.thumb.distal.nextJoint,
        hand.palmPosition);
    t = Leap.vec3.length(t);

    var pinkyAngle = fingerAngle(hand, 'pinky');
    var ringAngle = fingerAngle(hand, 'ringFinger');
    var middleAngle = fingerAngle(hand, 'middleFinger');

    // these values define a rotation of the tool knob
    if (d > 45 && t > 70 && 120 < s && s < 300 && pinkyAngle < 50 && ringAngle < 50) {
        var r = rotation(hand);
        if (tFirst == NONE)
            tFirst = tLast = r;
        else {
            // the rotations below this angle thereshold are ignored
            if (Math.abs(r - tLast) > 1) {
                // update angle
                tAngle += r - tLast;
                // limit the angle into [0,RANGE]
                tAngle = (tAngle < 0 ? RANGE + tAngle : tAngle) % RANGE;
            }
            else {
                tFirst = r;
            }
            tLast = r;
        }

        // compute tool index
        // the index is comprised in the range 1..TOOLS_NO, and it is
        // obtained projecting the knob angle in that interval
        var n = Math.floor(tAngle * 3 * TOOLS_NO / RANGE) % TOOLS_NO + 1;
        if (n != tLastN) {
            selectEntry('tool', n, setTool);
            tLastN = n;
        }
        hintHighlight('tool', true); // feedback of the detected gesture
        return;
    }
    else {
        tFirst = NONE;
        hintHighlight('tool', false); // stop feedback of the detected gesture
    }

    // these values define a rotation of the option knob
    if (d > 45 && t > 70 && 120 < s && s < 300 && pinkyAngle > 70 && ringAngle > 70 && middleAngle > 70) {
        var r = rotation(hand);
        if (oFirst[tool] == NONE)
            oFirst[tool] = oLast[tool] = r;
        else {
            // the rotations below this angle thereshold are ignored
            if (Math.abs(r - oLast[tool]) > 1) {
                // update angle
                oAngle[tool] += r - oLast[tool];
                // limit the angle into [0,RANGE]
                oAngle[tool] = (oAngle[tool] < 0 ?
                    RANGE + oAngle[tool] : oAngle[tool]) % RANGE;
            }
            else {
                oFirst[tool] = r;
            }
            oLast[tool] = r;
        }

        // compute option index
        var n = Math.floor(oAngle[tool] * 3 * OPT_NO[tool] / RANGE) % OPT_NO[tool] + 1;
        if (n != oLastN[tool]) {
            selectEntry(TOOLS_STR[tool], n, null);
            oLastN[tool] = n;
        }
        hintHighlight('option', true); // feedback of the detected gesture
        return;
    }
    else {
        oFirst[tool] = NONE;
        hintHighlight('option', false); // stop feedback of the detected gesture
    }

    // these values define a rotation of the color picker knob
    if (d > 45 && t > 70 && 120 < s && s < 300 && pinkyAngle > 70 && ringAngle > 70 && middleAngle < 50) {
        var r = rotation(hand);
        if (cFirst == NONE)
            cFirst = cLast = r;
        else {
            // the rotations below this angle thereshold are ignored
            if (Math.abs(r - cLast) > 1) {
                // update angle
                cAngle += r - cLast;
                // limit the angle into [0,RANGE/4]
                cAngle = cAngle < 0 ? 0 : cAngle;
                cAngle = cAngle > RANGE / 4 ? RANGE / 4 : cAngle;
            }
            else {
                cFirst = r;
            }
            cLast = r;
        }

        // compute tool index
        // the index is comprised in the range 1..TOOLS_NO, and it is
        // obtained projecting the knob angle in that interval
        var n = Math.floor(cAngle * 3 * 4 / RANGE) % 4;

        var o = null;
        if (n != cLastN) {
            switch (n) {
            case 0:
                o = $('.color-item.red');
                break;

            case 1:
                o = $('.color-item.green');
                break;

            case 2:
                o = $('.color-item.blue');
                break;

            case 3:
                o = $('.color-item.alpha');
                break;
            }
            activateInput(o);
            cLastN = n;
        }
        // feedback of the detected gesture
        hintHighlight('color-picker', true);
        return;
    }
    else {
        cFirst = NONE;
        // stop feedback of the detected gesture
        hintHighlight('color-picker', false);
    }

    // check gesture for input variation
    gestures.forEach(function (g) {
        if (g.type != 'circle') {
            return;
        }
        g.pointableIds.forEach(function (id) {
            var p = controller.frame().pointable(id);
            if (p.tool || p.type !== INDEX) {
                return;
            }

            // sign for the rotation
            var sign = Leap.vec3.dot(p.direction, g.normal) > 0 ? +1 : -1;

            // active input entry
            var active = $('[data-active]');

            if (active.attr('data-entry') === 'shape') {
                var currentShape = active.find('[data-shape]:not(.inactive)');

                if (g.state === 'start') {
                    lastVal = 0;
                }

                // change tool once each two finger rotations
                if (((lastVal + sign * 0.6 * g.progress) | 0) % 2 == 0) {
                    lastVal += sign;
                    var f = sign > 0 ? nextShape : prevShape;
                    var s = f(currentShape.attr('data-shape'));
                    active.find('[data-shape="' + s + '"]').trigger('click');
                }
            }
            else {
                var input = active.find('input');
                var max = parseInt(input.attr('max'));
                var min = parseInt(input.attr('min'));

                if (g.state === 'start') {
                    lastVal = parseInt(input.val());
                }

                var k = max / 10;
                var v = (lastVal + k * sign * g.progress - (k - 1) * sign) | 0;
                v = v > max ? max : v;
                v = v < min ? min : v;

                input.val(v);
                input.trigger('change');
                input.trigger('input')
            }
        });
    });
}
