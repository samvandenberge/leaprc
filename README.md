# Leap RC

## Connect Arduino UNO to Node.js

Prerequisite: [Serialport](https://github.com/voodootikigod/node-serialport)

Create a script with the following code, and run it using `node`:

```js
var SerialPort = require('serialport').SerialPort;
var arduinoPort = 'COM3';

var connectArduino = function () {
    arduinoSerial = new SerialPort(arduinoPort);

    arduinoSerial.on('open', function () {
            console.log('Serial port open');
    });

}
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

## Node Webkit

Prerequisite: [Node Webkit](https://github.com/rogerwang/node-webkit)

Node Webkit is an app runtime based on `Chromium` and `node.js`. It supports third party modules and is platform independent.
Webkit is easy to use since all there's needed to be done is to compress your files into an app.nw folder and open that folder with nw.

[Quick startguide](https://github.com/rogerwang/node-webkit#quick-start)

## Websockets

Prerequisite: [Websocket] (https://github.com/einaros/ws)

Since Nodejs is single-threaded, Websockets provide a way to allow 2 threads to communicate with eachother.

[Usage](https://github.com/sam45/leaprc/wiki/Websocket)

## Tracking

Prerequisite: [Tracking](https://github.com/eduardolundgren/tracking.js)

With tracking.js, it's possible to track a certain colour.
When a certain color is found, tracking.js provides the colour's coordinates.

[Usage](https://github.com/sam45/leaprc/wiki/Tracking)
