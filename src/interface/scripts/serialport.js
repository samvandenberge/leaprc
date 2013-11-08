var application_stopped = false;

/**
 * Setup the serial port
 */
var SerialPort = require('serialport').SerialPort;
var arduinoPort = 'COM3';
var arduinoSerial;
var controller = new Leap.Controller({enableGestures: true});

var gui = global.window.nwDispatcher.requireNwGui();
var win = gui.Window.get(); // Get the current window
var throttle = yaw = pitch = trim = 0;

var connectArduino = function () {
    arduinoSerial = new SerialPort(arduinoPort);
    $('#connectedPort').html('Not connected!'); // set the port name label
    /**
     * Wait for connection
     */
    arduinoSerial.on('open', function () {
        console.log('Serial port open');
        $('#connectedPort').html('Connected to: ' + arduinoPort); // set the port name label

        /**
         * The Arduino will send data when it's ready to receive the control bits
         */
        arduinoSerial.on('data', function (data) {
            // send data
            if (application_stopped) {
                arduinoSerial.write(String.fromCharCode(63));   // yaw
                arduinoSerial.write(String.fromCharCode(63));   // pitch
                arduinoSerial.write(String.fromCharCode(0));  // throttle
                arduinoSerial.write(String.fromCharCode(63));   // trim
            } else {
                arduinoSerial.write(String.fromCharCode(yaw));   // yaw
                arduinoSerial.write(String.fromCharCode(pitch));   // pitch
                arduinoSerial.write(String.fromCharCode(throttle));  // throttle
                arduinoSerial.write(String.fromCharCode(trim));   // trim
            }

            // set labels
            $('#lblThrottle').html(Math.round(throttle / 1.27) + '%');
            $('#lblPitch').html(pitch);
            $('#lblYaw').html(yaw);
            $('#lblTrim').html(trim);
        });
    });

    /**
     * The serial connection is closed
     */
    arduinoSerial.on('close', function () {
        if (!application_stopped) {
            reconnectArduino();
        }
    });
}

// check for connection errors or drops and reconnect
var reconnectArduino = function () {
    console.log('reconnecting');
    connectArduino();
};

/**
 * Stop the helicopter and close the window
 */
$('#btnExitApp').on('click', function (e) {
    window.close();
});

/**
 * Listen to main window's close event
 */
win.on('close', function () {
    this.hide(); // Pretend to be closed already
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
})

/**
 * Data recieved from the Leap Motion
 */
controller.on('frame', function (frame) {

    // Execute code when there is at least 1 hand registered
    if (frame.hands && frame.hands.length > 0) {
        var hand = frame.hands[0];

        // Throttle control
        var height = hand.palmPosition[1];
        if (height < 126) {
            throttle = 0;
        } else if (height > 370) {
            throttle = 127;
        } else {
            throttle = linearScaling(126, 370, 0, 128, height);
        }
        // limit slider updates
        if (Math.abs($('#sldThrottle').val() - throttle) > 10) {
            $('#sldThrottle').val(throttle);
        }

        // Yaw control
        var x = hand.palmNormal[0];
        yaw = 126 - linearScaling(-1, 1, 0, 126, x);
        // limit slider updates
        if (Math.abs($('#sldYaw').val() - yaw) > 5) {
            $('#sldYaw').val(yaw);
        }

        // Pitch control
        var z = hand.palmNormal[2];
        pitch = 126 - linearScaling(-1, 1, 0, 126, z);
        // limit slider updates
        if (Math.abs($('#sldPitch').val() - pitch) > 5) {
            $('#sldPitch').val(pitch);
        }
    }
});

/**
 * @see http://stackoverflow.com/questions/15254280/linearly-scaling-a-number-in-a-certain-range-to-a-new-range
 * @returns {value between a specific range}
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

$('#btnChangePort').on('click', function (e) {
    // close the current serial connection and open a new one
    arduinoPort = $('#fldCustomSerialPort').val() !== '' ? $('#fldCustomSerialPort').val() : 'COM3';;
    // @TODO check if port is really closed
    try {
        arduinoSerial.close();
    } catch (err) {
    }
    reconnectArduino();
});

// connect the Leap Motion & Arduino
connectArduino();
controller.connect();