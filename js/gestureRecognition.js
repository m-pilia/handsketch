/**
 * Provide gesture actions.
 *
 * @date 2015-12-31
 */

"use strict";

const gestureRecognition = function ($, Leap) {

    // public interface
    const pub = {};

    // capture device options
    var options = {enableGestures: true};

    // controller and frame main loop
    var controller = Leap.loop(options, function (frame) {
        if (!frame.valid) {
            return;
        }

        if (frame.hands.length > 0) {
            frameHandler(frame.hands[0], frame.gestures);
        }
        else {
            // disable hints when no gesture is detected
            var e = new Event('disableHints');
            document.dispatchEvent(e);
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
    const fingers = [
        'thumb',
        'indexFinger',
        'middleFinger',
        'ringFinger',
        'pinky'
    ];

    // number of tools and number of options for each tool
    var OPT_NO = null;
    var TOOLS_NO = null;

    /**
     * Set the number of tools and of options for each tool.
     * @param {number}   tn Number of tools.
     * @param {number[]} on Number of options for each tool (tool name as
     *                      label).
     */
    pub.setToolAndOptNo = function (tn, on) {
        if (tn !== undefined) {
            TOOLS_NO = parseInt(tn);
        }
        if (on !== undefined) {
            OPT_NO = on;
            Object.keys(OPT_NO).forEach(function (e) {
                oAngle[e] = 10;
                oFirst[e] = NONE;
                oLast[e] = 0;
                oLastN[e] = 1;
            });
        }
    };

    /**
     * Apply the sign of one variable to another.
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

    /**
     * Angle of the fingers respect to the palm normal.
     * @param  {Hand} hand Hand containing the fingers.
     * @return {number[]}  Array containing the angles, from thumb to pinky.
     */
    function fingerAngles(hand) {
        return [
            fingerAngle(hand, 'thumb'),
            fingerAngle(hand, 'indexFinger'),
            fingerAngle(hand, 'middleFinger'),
            fingerAngle(hand, 'ringFinger'),
            fingerAngle(hand, 'pinky')
        ];
    }

    /**
     * Compute the angle between the medial and distal phalanxes for each finger.
     * @param  {Hand}      hand Hand object containing the fingers.
     * @return {number[5]}      Array containing the angles.
     */
    function phalanxAngles(hand) {
        var a = Array(5);
        for (var i = 0; i < fingers.length; i++) {
            a[i] = RAD2DEG * Math.acos(Leap.vec3.dot(
                hand[fingers[i]].medial.direction(),
                hand[fingers[i]].distal.direction()));
        }
        return a;
    }

    // coefficients
    const NONE = 0xFFFF; // an unreachable value, used as a null one
    const RANGE = 360;   // the angle range for the knob is from 0 to this value
    const tK = 3;
    const oK = 3;
    const kCircle = 0.6;

    /*
     * When the hand position is recognized in a rotation gesture first, its
     * rotation angle in that first frame of the gesture is recorded. The
     * angle is tracked up to the end of the gesture, and then the angle
     * difference between the last and the first frame of the gesture
     * represents the angle variation for the knob.
     */
    var tAngle = 10;     // current tool angle
    var tFirst = NONE;   // angle of the hand at the start of the interaction
    var tLast = 0;       // value read on the last seen frame
    var tLastN = 1;      // last tool index

    /**
     * Check for a rotation of the tool know.
     * @param  {number}   r  Hand rotation angle.
     * @param  {number}   d  Thumb-tip - middle-tip distance.
     * @param  {number}   t  thumb-tip - palm-center distance.
     * @param  {number}   s  Hand spread.
     * @param  {number[]} pa Angles between the last two phalanxes.
     * @param  {number[]} fa Angles between the fingers and the palm normal.
     * @return {bool}        True if a gesture was detected, false otherwise.
     */
    function toolRotation(r, d, t, s, pa, fa) {
        // these values define a rotation of the tool knob
        if (
                d > 45 &&
                t > 70 &&
                s > 120 &&
                pa[1] < 15 &&
                pa[2] < 15 &&
                pa[3] < 15 &&
                pa[4] < 15 &&
                fa[0] > 60 &&
                fa[1] > 60 &&
                fa[2] > 60 &&
                fa[3] > 60 &&
                fa[4] > 60
        ) {
            if (tFirst == NONE)
                tFirst = tLast = r;
            else {
                // the rotations below this angle threshold are ignored
                if (Math.abs(r - tLast) > ANGLE_THRESHOLD) {
                    // update angle
                    tAngle += r - tLast;
                    // limit the angle into [0,RANGE]
                    tAngle = (tAngle < 0 ? RANGE + tAngle : tAngle) % RANGE;
                    // update afford hint position
                    var obj = {
                        'name': 'tool',
                        'angle': tAngle * tK - RANGE / TOOLS_NO
                    };
                    var e = new CustomEvent('rotateAfford', {detail: obj});
                    document.dispatchEvent(e);
                }
                else {
                    tFirst = r;
                }
                tLast = r;
            }

            // compute tool index
            // the index is comprised in the range 1..TOOLS_NO, and it is
            // obtained projecting the knob angle in that interval
            var n = Math.floor(tAngle * tK * TOOLS_NO / RANGE) % TOOLS_NO + 1;
            if (n != tLastN) {
                // deliver event for tool selection
                var detail = {
                    'selector': 'tool',
                    'entry': n,
                };
                var e = new CustomEvent('selectEntry', {'detail': detail});
                document.dispatchEvent(e);

                // update variable
                tLastN = n;
            }

            // feedback of the detected gesture
            var det = {
                'hint': 'tool',
                'value': true
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return true;
        }
        else {
            tFirst = NONE;
            // cease feedback of the detected gesture
            var det = {
                'hint': 'tool',
                'value': false
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return false;
        }
    }

    // as above, for the option selectors
    var oAngle = [];
    var oFirst = [];
    var oLast = [];
    var oLastN = [];

    /**
     * Check for a rotation of the option know.
     * @param  {number}   r  Hand rotation angle.
     * @param  {number}   d  Thumb-tip - middle-tip distance.
     * @param  {number}   t  thumb-tip - palm-center distance
     * @param  {number}   d2 Thumb-tip - middle-finger-1st-interphalanx distance.
     * @param  {number}   d3 Thumb-tip - middle-finger-tip distance.
     * @param  {number[]} pa Angles between the last two phalanxes.
     * @param  {number[]} fa Angles between the fingers and the palm normal.
     * @return {bool}        True if a gesture was detected, false otherwise.
     */
    function optionRotation(r, d, t, d2, d3, pa, fa) {

        // get the active tool
        const tool = drawing.tool();

        // these values define a rotation of the option knob
        if (
                d > 45 &&
                t > 70 &&
                d2 > 30 &&
                d3 > 50 &&
                pa[0] < 25 &&
                pa[2] > 30 &&
                pa[3] > 30 &&
                pa[4] > 30 &&
                fa[2] > 70 &&
                fa[3] > 70 &&
                fa[4] > 70
        ) {
            if (oFirst[tool] == NONE)
                oFirst[tool] = oLast[tool] = r;
            else {
                // the rotations below this angle threshold are ignored
                if (Math.abs(r - oLast[tool]) > ANGLE_THRESHOLD) {
                    // update angle
                    oAngle[tool] += r - oLast[tool];
                    // limit the angle into [0,RANGE]
                    oAngle[tool] = (oAngle[tool] < 0 ?
                        RANGE + oAngle[tool] : oAngle[tool]) % RANGE;
                    // update afford hint position
                    var oA = -RANGE / OPT_NO[tool];
                    var obj = {
                        'name': 'option',
                        'angle': oAngle[tool] * oK + oA
                    };
                    var e = new CustomEvent('rotateAfford', {detail: obj});
                    document.dispatchEvent(e);
                }
                else {
                    oFirst[tool] = r;
                }
                oLast[tool] = r;
            }

            // update variable
            oLastN[tool] = n;

            // compute option index
            var n = Math.floor(oAngle[tool] * oK * OPT_NO[tool] / RANGE)
                    % OPT_NO[tool] + 1;

            // deliver event for entry selection
            var detail = {
                'selector': tool,
                'entry': n,
            };
            var e = new CustomEvent('selectEntry', {'detail': detail});
            document.dispatchEvent(e);

            // feedback of the detected gesture
            var det = {
                'hint': 'option',
                'value': true
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return true;
        }
        else {
            oFirst[tool] = NONE;
            // cease feedback of the detected gesture
            var det = {
                'hint': 'option',
                'value': false
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return false;
        }
    }

    // as above, for the color picker
    var cAngle = 10;
    var cFirst = NONE;
    var cLast = 0;

    /**
     * Check for a rotation of the color picker.
     * @param  {number}   r  Hand rotation angle.
     * @param  {number}   d  Thumb-tip - middle-tip distance.
     * @param  {number}   t  thumb-tip - palm-center distance
     * @param  {number}   s  Hand spread.
     * @param  {number[]} pa Angles between the last two phalanxes.
     * @param  {number[]} fa Angles between the fingers and the palm normal.
     * @return {bool}        True if a gesture was detected, false otherwise.
     */
    function colorPickerRotation(r, d, t, s, pa, fa) {
        // these values define a rotation of the color picker knob
        if (
                d > 45 &&
                t < 70 &&
                s > 120 &&
                pa[1] < 15 &&
                pa[2] < 15 &&
                pa[3] < 15 &&
                pa[4] < 15 &&
                fa[1] > 60 &&
                fa[2] > 60 &&
                fa[3] > 60 &&
                fa[4] > 60
        ) {
            if (cFirst == NONE)
                cFirst = cLast = r;
            else {
                // the rotations below this angle threshold are ignored
                if (Math.abs(r - cLast) > 1) {
                    // update angle
                    cAngle += r - cLast;
                    // limit the angle into [0,RANGE/4]
                    cAngle = cAngle < 0 ? 0 : cAngle;
                    cAngle = cAngle > RANGE / 4 ? RANGE / 4 : cAngle;
                    // update afford hint position
                    var obj = {
                        'name': 'color-picker',
                        'angle': cAngle / 4 - RANGE / 32 | 0
                    };
                    var e = new CustomEvent('rotateAfford', {detail: obj});
                    document.dispatchEvent(e);
                }
                else {
                    cFirst = r;
                }
                cLast = r;
            }

            // compute tool index
            // the index is comprised in the range 1..TOOLS_NO, and it is
            // obtained projecting the knob angle in that interval
            var n = Math.floor(cAngle * 3.2 * 4 / RANGE) % 4;

            // send event to activate input
            var e = new CustomEvent('selectColor', {detail: {'n': n}});
            document.dispatchEvent(e);

            // feedback of the detected gesture
            var det = {
                'hint': 'color-picker',
                'value': true
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return true;
        }
        else {
            cFirst = NONE;

            // cease feedback of the detected gesture
            var det = {
                'hint': 'color-picker',
                'value': false
            };
            var e = new CustomEvent('toggleHint', {detail: det});
            document.dispatchEvent(e);

            return false;
        }
    }

    // stored value for input gestures
    var lastVal = 0;
    // angle for the input afford rotation
    var iAngle = 0;
    // progress at the start of the circle rotation
    var sP = 0;
    // rotations below this threshold value are ignored
    const ANGLE_THRESHOLD = 1;

    /**
     * Check for a input gesture.
     * @param  {gesture[]} gestures Array of gestures for the current frame.
     * @param  {number}    d2       Thumb-tip - middle-finger-1st-interphalanx
     *                              distance
     * @param  {number[]}  pa       Angles between the last two phalanxes.
     */
    function gestureRotation(gestures, d2, pa) {
        gestures.forEach(function (g) {
            if (g.type != 'circle') {
                return;
            }
            g.pointableIds.forEach(function (id) {
                var p = controller.frame().pointable(id);
                if (p.tool || p.type !== INDEX) {
                    return;
                }

                // check shape of the hand
                if (d2 > 30 || pa[0] < 25) {
                    return;
                }

                // sign for the rotation
                var sign = Leap.vec3.dot(p.direction, g.normal) > 0 ? +1 : -1;

                // manage highlighting of the affordance for the input gesture
                var a = 180 * sign * (g.progress - sP);
                var eventType = null;
                var detail = null;
                switch (g.state) {
                case 'start':
                    // reset variable
                    lastVal = 0;
                    // get progress angle at gesture beginning
                    sP = g.progress;
                    // event parameters for highlighting activation
                    eventType = 'toggleHint';
                    detail = {'hint': 'input', 'value': true};
                    break;

                case 'update':
                    // event parameters to update afford hint position
                    eventType = 'rotateAfford';
                    detail = {'name': 'input', 'angle': iAngle + a};
                    break;

                case 'stop':
                    // update actual angle
                    iAngle += a;
                    // event parameters for highlighting deactivation
                    eventType = 'toggleHint';
                    detail = {'hint': 'input', 'value': false};
                    break;
                }
                // send event for ui update
                var e = new CustomEvent(eventType, {'detail': detail});
                document.dispatchEvent(e);

                // change input once each two finger rotations
                if (((lastVal + sign * kCircle * g.progress) | 0) % 2 == 0) {
                    lastVal += sign;
                    // deliver event for input change
                    var detail = {'sign': sign};
                    var e = new CustomEvent('inputChange', {'detail': detail});
                    document.dispatchEvent(e);
                }
            });
        });
    }

    // temp vector for computations
    var tmpv = Array(3);

    /**
     * Frame handler.
     * @param  {Hand}      hand     Hand detected in the frame.
     * @param  {Gesture[]} gestures Array of gestures detected in the frame.
     */
    function frameHandler(hand, gestures) {

        // ensure all the fingers have been recognized
        if (!(hand.thumb && hand.indexFinger && hand.middleFinger &&
                hand.ringFinger && hand.pinky)) {
            return;
        }

        var r = rotation(hand);
        var s = spread(hand);
        var pa = phalanxAngles(hand);
        var fa = fingerAngles(hand);

        // thumb-index distance
        Leap.vec3.sub(
            tmpv,
            hand.indexFinger.distal.nextJoint,
            hand.thumb.distal.nextJoint);
        var d = Leap.vec3.length(tmpv);

        // thumb-tip - middle-finger-1st-interphalanx distance
        Leap.vec3.sub(
            tmpv,
            hand.middleFinger.proximal.nextJoint,
            hand.thumb.distal.nextJoint);
        var d2 = Leap.vec3.length(tmpv);

        // thumb-tip - middle-finger-tip distance
        Leap.vec3.sub(
            tmpv,
            hand.middleFinger.distal.nextJoint,
            hand.thumb.distal.nextJoint);
        var d3 = Leap.vec3.length(tmpv);

        // thumb-tip - palm-center distance
        Leap.vec3.sub(
            tmpv,
            hand.thumb.distal.nextJoint,
            hand.palmPosition);
        var t = Leap.vec3.length(tmpv);

        // check for a rotation of the tool knob
        if (toolRotation(r, d, t, s, pa, fa)) {
            return;
        }

        // check for a rotation of the option knob
        if (optionRotation(r, d, t, d2, d3, pa, fa)) {
            return;
        }

        // check for a rotation of the color picker
        if (colorPickerRotation(r, d, t, s, pa, fa)) {
            return;
        }

        // check gesture for input variation
        gestureRotation(gestures, d2, pa);
    }

    return pub;

} (jQuery, Leap);
