/**
 * Provide gesture actions.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-31
 */

"use strict";

// capture device options
var options = {};

// main loop
Leap.loop(options, function (frame) {
    if (frame.hands.length > 0)
        frameHandler(frame.hands[0]);
});

// some useful constants
const RAD2DEG = 180 / Math.PI;
const X = 0;
const Y = 1;
const Z = 2;

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
 * Compute a 5x4 matrix (where the row index identifies the finger, the column
 * one the bone) filled with the angles between the bones and the hand palm
 * normal vector.
 * @param  {Hand} hand   The hand to be checked.
 * @return {number[][]} A matrix containing the angles (expressed in degrees).
 */
function bonesAngle(hand) {
    var m = Array(5).fill(Array(4));
    hand.fingers.forEach(function (finger, i) {
        finger.bones.forEach(function (bone, j) {
            var dot = Leap.vec3.dot(bone.direction(), hand.palmNormal);
            m[i][j] = RAD2DEG * Math.acos(dot);
        });
    });
    return m;
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
var tAngle = 0;      // current angle
var tFirst = NONE;   // angle of the hand at the start of the interaction
var tLast = 0;       // value read on the last seen frame
var tLastN = 1;      // last tool index

function frameHandler(hand) {
    var m = bonesAngle(hand);
    var s = spread(hand);

    var pinkyAngle = m[4][3];
    var mediumAngle = m[3][3];

    // these values define a rotation of the tool knob
    if (120 < s && s < 300 && pinkyAngle < 50 && mediumAngle < 50) {
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
            selectTool(n);
            tLastN = n;
        }
        hintHighlight(true); // feedback of the detected gesture
    }
    else {
        tFirst = NONE;
        hintHighlight(false); // stop feedback of the detected gesture
    }
}
