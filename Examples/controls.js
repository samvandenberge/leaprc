/**
 * This is a script that defines a possibility of controls with the Leap Motion.
 * According to the position of one hand, you'll be 'steering' something.
 * For now, the only this that happens is a console log to show you which direction you're headed.
 *
 * @author Sam Van Den Berge, Pieter Van Molle and Yannick Stevens
 */

/**
 * Creates a websocket that'll be used to read the Leap Motion data
 */
var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437');

/**
 * Each time the websocket provides data, this function will parse it to a JSON format.
 * This way the data is ready to be used.
 * The steering controlls are based on the Altitude, Direction and PalmPosition properties of the Hand object.
 * Direction: The way the hand is pointing, seen from the center of the palm to the tip of the middle finger.
 * Position: Position of the palm in a 3D-grid (X-axis: horizontal, Y-Axis: vertical, Z-axis: diagonal)
 * Altitude: the space between the palm and the Leap Motion
 */
ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        // Execute code when there is at least 1 hand registered
	    if (frame.hands && frame.hands.length > 0) {

	    	// Only use the first registered hand
	        hand = frame.hands[0];
	        
	        // Debug data
        	console.log('Direction: ' + vectorToString(hand.direction, 2) + '\n');
        	console.log('Position: ' + vectorToString(hand.palmPosition) + '\n');

        	// Right and left controls
        	// Direction[0]: X-axis
        	if (hand.direction[0] >= 0.2) {
        		console.log('you\'re steering to the right!');
        	} else if (hand.direction[0] < 0.2 && hand.direction[0] > -0.2) {
        		console.log('you\'re keeping it steady.');
        	} else {
        		console.log('you\'re turning left.');
        	}

        	// Forward and backward controls
        	// PalmPosition[2]: Z-axis
			if(hand.palmPosition[2] <= -20) {
				console.log('Thrusting forward.');
			} else if (hand.palmPosition[2] >= 20) {
				console.log('Going back!');
			} else {
				console.log('Not going anywhere...');
			}

			// Altitude printing
        	console.log('Altitude: ' + hand.palmPosition[1]);

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
