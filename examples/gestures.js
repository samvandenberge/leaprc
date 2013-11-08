var Leap = require('leapjs'),
	controller = new Leap.Controller({enableGestures: true}),
	Five = require('johnny-five'),
	board = new Five.Board();

board.on('ready', function() {
	led = new Five.Led(13);

	controller.on('frame', function(frame) {
		if (frame.gestures[0] !== undefined) {
			if (frame.gestures[0].type === 'swipe' && frame.gestures[0].direction[0] < 0) {
				led.on();
			}
			
			if (frame.gestures[0].type === 'swipe' && frame.gestures[0].direction[0] > 0) {
				led.off();
			}
		}
	});

	controller.connect();
});
