# Leap RC

## Connect Arduino UNO to Node.js

Prerequisite: [Johnny-Five](https://github.com/rwaldron/johnny-five/wiki/Getting-Started)

Create a script with the following code, and run it using `node`:

```js
var Five = require('johnny-five'),
        board = new Five.Board();

board.on('ready', function() {

	// Create a Led op pin 13 and strobe it
	(new Five.Led(13)).strobe();
});
```
## Connect Leap Motion to Node.js

Prerequisite: [Leap JS](https://github.com/leapmotion/leapjs)

Create a script with the following code, and run it using `node`:

```js
var Leap = require('leapjs'),
        controller = new Leap.Controller();
        
controller.on('connect', function() {
	console.log('connected!');
});

controller.connect();
```
