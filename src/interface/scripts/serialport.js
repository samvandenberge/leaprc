/**
 * Constants
 */

var application_stopped = false;

/**
 * Setup the serial port
 */
var SerialPort = require('serialport').SerialPort;
var port = new SerialPort('COM4');

var controller = new Leap.Controller({enableGestures: true});

/**
 * Get the current window
 */
var gui = global.window.nwDispatcher.requireNwGui();
var win = gui.Window.get();

var throttle = yaw = pitch = 0;

// connect the Leap Motion
controller.connect();

/**
 * Stop the helicopter and close the window
 */
$('#btnExitApp').on('click', function (e) {
    window.close();
});

/**
 * Wait for connection
 */
port.on('open', function () {
    console.log('Serial port open');
    // set the port name label
    $('#connectedPort').html('Connected to: ' + port.path);

    /**
     * The Sketch will send data when it's ready to receive the control bits
     */
    port.on('data', function (data) {
        // send data
        if (application_stopped) {
            port.write(String.fromCharCode(63));   // yaw
            port.write(String.fromCharCode(63));   // pitch
            port.write(String.fromCharCode(0));  // throttle
            port.write(String.fromCharCode(63));   // trim
        } else {
            port.write(String.fromCharCode(yaw));   // yaw
            port.write(String.fromCharCode(pitch));   // pitch
            port.write(String.fromCharCode(throttle));  // throttle
            port.write(String.fromCharCode(trim));   // trim
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
port.on('close', function () {
    console.log('Serial port closed');
});

/**
 * Listen to main window's close event
 */
win.on('close', function () {
    this.hide(); // Pretend to be closed already
    application_stopped = true;

    // the timeout is needed to execute all commands
    setTimeout(function () {
        port.close();
        port = null;
        SerialPort = null;
        this.close(true);
    }, 2000);
});

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
 * @param oldMin
 * @param oldMax
 * @param newMin
 * @param newMax
 * @param oldValue
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