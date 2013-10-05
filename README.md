# Leap RC

## Connect Arduino to Node.js

Prerequisite: [Johnny-Five](https://github.com/rwaldron/johnny-five/wiki/Getting-Started)

Create a script with the following code, and run it using `node`:

```
var five = require("johnny-five"),
        board = new five.Board();

board.on("ready", function() {

	// Create a Led op pin 13 and strobe it
	(new five.Led(13)).strobe();
});
```
