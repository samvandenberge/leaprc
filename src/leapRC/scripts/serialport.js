/**
 * Window configuration
 *
 */

var gui = global.window.nwDispatcher.requireNwGui(),
    win = gui.Window.get(),
    application_stopped = false;

/**
 * SerialPort configuration
 *
 */

var SerialPort  = require('serialport').SerialPort,
    arduinoPort = 'COM4',
    arduinoSerial;

/**
 * Leap Motion controller configuration
 *
 */

var controller = new Leap.Controller({enableGestures: true});


/**
 * Directional controls configuration
 *
 */

var throttle = 0,
    yaw      = 0,
    pitch    = 0,
    trim     = 0;

/**
 * Additional controls configuration
 *
 */

var stop    = 0,
    inRange = 0,
    camera  = false;

/**
 * Canvas configuration
 *
 */

var state = new CanvasState(document.getElementById('canvas'));

/**
 * Arduino setup
 * 
 * The connection to the Arduino UNO is made using the serial port.
 * On the Arduino resides a c sketch that sends the control commands to the rc helicopter.
 * This sketch also sends a 'ready' bit to the serial port when it's ready to receive new commands.
 *
 */

var connectArduino = function () {
    arduinoSerial = new SerialPort(arduinoPort);
    
    // set the port name label
    $('#connectedPort').html('Not connected!');
    
    // wait for connection
    arduinoSerial.on('open', function () {
        console.log('Serial port open');

        // set the port name label
        $('#connectedPort').html('Connected to: ' + arduinoPort);

        // send data after receiving 'ready' bit
        arduinoSerial.on('data', function () {
            if (application_stopped) {
                arduinoSerial.write(String.fromCharCode(63));   // yaw
                arduinoSerial.write(String.fromCharCode(63));   // pitch
                arduinoSerial.write(String.fromCharCode(0));  // throttle
                arduinoSerial.write(String.fromCharCode(63));   // trim
            } else {
                trim = $('#sldTrim').val();
                arduinoSerial.write(String.fromCharCode(yaw));   // yaw
                arduinoSerial.write(String.fromCharCode(pitch));   // pitch
                arduinoSerial.write(String.fromCharCode(throttle));  // throttle
                arduinoSerial.write(String.fromCharCode(trim));   // trim
            }
        });
    });

    // try reconnecting when the serial connection closes
    arduinoSerial.on('close', function () {
        if (!application_stopped) {
            connectArduino();
        }
    });
}

/**
 * Serial port Setup
 *
 * Close the current serial connection and open a new one on a given port.
 *
 */

$('#btnChangePort').on('click', function (e) {
    arduinoPort = $('#fldCustomSerialPort').val() !== '' ? $('#fldCustomSerialPort').val() : 'COM4';
    try {
        arduinoSerial.close();
    } catch (err) {
    }
    connectArduino();
});

/**
 * Video Setup
 *
 */

$('#myonoffswitch').on('change', function() {
   camera = $(this).is(':checked');
});

/**
 * Leap Motion Setup
 *
 * A Leap Motion controller is used for gesture analysis.
 * Each frame, the three-dimensional position of the hand is analyzed, and updated.
 * The rc helicopter can be motion-controlled using one hand.
 *
 */

controller.on('frame', function (frame) {

    // at least one hand is required
    if (frame.hands && frame.hands.length > 0 && frame.fingers.length > 1 && (!camera || inRange == 1)) {
        var hand = frame.hands[0],
            x    = hand.palmNormal[0],
            y    = hand.palmPosition[1],
            z    = hand.palmNormal[2];

        // yaw control
        if (x < 0.15 && x > -0.15) {
            x = 0;
        } else if (x <= -0.9) {
            x = -0.9;
        } else if (x >= 0.9) {
            x = 0.9;
        }

        yaw = linearScaling(-0.9, 0.9, 0, 127, x);

        // pitch control
        if (z <= -0.9) {
            z = -0.9;
        } else if (z >= 0.9) {
            z = 0.9;
        }
        pitch = 127 - linearScaling(-0.9, 0.9, 0, 127, z);

        // throttle control
        if (y < 90) {
            throttle = 0;
            yaw = pitch = trim = 63;
        } else if (y > 340) {
            throttle = 127;
        } else {
            throttle = linearScaling(90, 340, 0, 127, y);
        }
        stop = throttle;

        // update canvas
        state.setThrottle(throttle / 127);
        state.setYaw((127 - yaw) / 127);
        state.setPitch(pitch / 127);
    }

    // detect fist
    if (typeof frame.hands == 'undefined' || frame.fingers.length <= 1 || (inRange == 0 && camera)) {
        
        // exponential decrement
        if (stop > 65) {
            stop = 65;
        }
        stop -= (stop / 250);
        if (stop <= 15) {
            stop = 0;
        }

        throttle = stop;
        yaw = pitch = 63;

        // update canvas
        state.setThrottle(throttle / 127);
        state.setYaw((127 - yaw) / 127);
        state.setPitch(pitch / 127);
    }

});

/**
 * Helper method: maps a given value in a range
 * @see http://stackoverflow.com/questions/15254280/linearly-scaling-a-number-in-a-certain-range-to-a-new-range
 * @returns {Number} value in a specific range
 *
 */
function linearScaling(oldMin, oldMax, newMin, newMax, oldValue) {
    var newValue;
    if (oldMin !== oldMax && newMin !== newMax) {
        newValue = parseFloat((((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin);
        newValue = newValue.toFixed(0);
    }
    else {
        newValue = error;
    }
    return newValue;
}

/**
 * Websocket Setup
 *
 * Set the inRange variable when reveicing data.
 *
 */

var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8081});
wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        inRange = message;
    });
});

/**
 * Window Setup
 * 
 * Make sure everything's closed before terminating the app.
 *
 */

$('#btnExitApp').on('click', function (e) {
    window.close();
});

win.on('close', function () {
    this.hide();
    application_stopped = true;

    // the timeout is needed to execute all commands
    setTimeout(function () {
        try {
            arduinoSerial.close();
        } catch (err) {
        } finally {
            gui.App.quit();
        }

    }, 2000);
});

win.on('closed', function () {
    win = null;
});

/**
 * Main
 *
 * Connect the Arduino UNO and the Leap Motion controller.
 *
 */

connectArduino();
controller.connect();