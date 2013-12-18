# Leap RC

Control an RC helicopter using the Leap Motion!

## What do you need

- Arduino UNO
- An infrared LED
- A transistor (we used a B337 NPN transistor)
- Leap Motion Controller
- Syma S107G Helicopter
- (Webcam)

## Arduino schematic

![Arduino schematic](https://lh4.googleusercontent.com/-sgPLD4wMx9M/Uq9j9JoPXoI/AAAAAAAASOw/sCIufU5xXn0/w1246-h560-no/schema_bb.png)

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

## Downloads

Prebuilt binaries for Windows (18 December 2013)

- [LeapRC](http://www.mediafire.com/download/v8afeemhwiaih74/nw.exe)

- [Video](http://www.mediafire.com/download/leai11d1leuw64l/video.exe)


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

[Installation](https://github.com/sam45/leaprc/wiki/Node-Webkit#installation)

## Websockets

Prerequisite: [Websocket] (https://github.com/einaros/ws)

Since Nodejs is single-threaded, Websockets provide a way to allow 2 threads to communicate with eachother.

[Usage](https://github.com/sam45/leaprc/wiki/Websocket)

## Tracking

Prerequisite: [Tracking](https://github.com/eduardolundgren/tracking.js)

With tracking.js, it's possible to track a certain color.
When a certain color is found, tracking.js provides the color's coordinates.

[Usage](https://github.com/sam45/leaprc/wiki/Tracking)
