var Leap = require('leapjs'),
	controller = new Leap.Controller({
		enableGestures: true
	}),
	Five = require('johnny-five'),
	board = new Five.Board();

board.on('ready', function () {
	leftLed = new Five.Led(8);
	middleLed = new Five.Led(9);
	rightLed = new Five.Led(10);

	controller.on('frame', function (frame) {
		var direction = 0;

		// there has to be a hand in the range
		if (frame.hands.length > 0) {
			var hand = frame.hands[0];
			direction = vectorToDigit(hand.direction, 2);
			console.log(direction);
		}

		// right
		if (direction > 0.05) {
			middleLed.off();
			leftLed.off();
			rightLed.on();

			// left
		} else if (direction < -0.05) {
			middleLed.off();
			leftLed.on();
			rightLed.off();

			// middle	
		} else {
			middleLed.on();
			leftLed.off();
			rightLed.off();
		}
	});

	controller.connect();
});

// convert the horizontal part of the vector to a digit

function vectorToDigit(vector, digits) {
	if (typeof digits === 'undefined') {
		digits = 1;
	}
	return vector[0].toFixed(digits);
}