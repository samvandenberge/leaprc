/**
 * This is a script that defines a possibility of controls with the Leap Motion.
 * According to the position of one hand, you'll be 'steering' something.
 * For now, the only this that happens is a console log to show you which direction you're headed.
 *
 * @author Sam Van Den Berge, Pieter Van Molle and Yannick Stevens
 */

// Require the leapjs library
var Leap = require('leapjs');

// Controller object, used to provide data to interpret
var controller = new Leap.Controller();

/**
 * Basic checks, to see whether the Leap Motion controller is connected.
 */
controller.on('connect', function() {
  console.log("Successfully connected.");
});

controller.on('deviceConnected', function() {
  console.log("A Leap device has been connected.");
});

controller.on('deviceDisconnected', function() {
  console.log("A Leap device has been disconnected.");
});

/**
 * Each time the controller creates a frame, this function will check the hand data needed for the controls.
 * The steering controlls are based on the Altitude, Direction and PalmPosition properties of the Hand object.
 * PalmNormal: A vector pointing perpendicular to the palm of the hand.
 * PalmPosition: Position of the palm in a 3D-grid (X-axis: horizontal, Y-Axis: vertical, Z-axis: diagonal)
 */
controller.on('frame', function(frame) {

  // Execute code when there is at least 1 hand registered
    if (frame.hands && frame.hands.length > 0) {

        // Save the previous and current frame for altitude calculations
        var previousFrame = controller.frame(1);
        var currentFrame = controller.frame(0);

        // Only use the first registered hand
        hand = frame.hands[0];

        // Debug data
        console.log('PalmNormal: ' + vectorToString(hand.palmNormal, 2) + '\n');
        console.log('PalmPosition: ' + vectorToString(hand.palmPosition) + '\n');

        // Right and left controls
        // PalmNormal[0]: X-axis
        // PalmNormal[2]: Z-axis
        if (hand.palmNormal[0] >= 0.2) {
            console.log('you\'re steering to the right!');
        } else if (hand.palmNormal[0] < 0.2 && hand.palmNormal[0] > -0.2) {
            console.log('you\'re keeping it steady.');
        } else {
            console.log('you\'re turning left.');
        }

        if(hand.palmNormal[2] >= 0.2) {
            console.log('Thrusting forward.');
        } else if (hand.palmNormal[2] <= -0.2) {
            console.log('Going back!');
        } else {
            console.log('Not going anywhere...');
        }

        // Altitude calculations
        // When the current frame's altitude is higher, the hand is higher
        console.log('Altitude: ' + hand.palmPosition[1]);           
        if (previousFrame.hands[0]) {

            if(previousFrame.hands[0].palmPosition[1] < currentFrame.hands[0].palmPosition[1]) {
                console.log("Going up!");
            }

            if (previousFrame.hands[0].palmPosition[1] > currentFrame.hands[0].palmPosition[1]) {
                console.log("Going down!");
            }   
        }
});

/**
 * Makes the data from several properties readable
 * @see http://jsfiddle.net/AdmiralBrodnack/7UJuY/1/
 */
function vectorToString(vector, digits) {
    if (typeof digits === 'undefined') {
        digits = 1;
    }
    return '(' + vector[0].toFixed(digits) + ', ' + vector[1].toFixed(digits) + ', ' + vector[2].toFixed(digits) + ')';
}
