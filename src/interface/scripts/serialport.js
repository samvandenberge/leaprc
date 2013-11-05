/**
 * Constants
 */

var APPLICATION_STOPPED = false

/**
 * Setup the serial port
 */

SerialPort = require('serialport').SerialPort,
    port = new SerialPort('COM3'),

/**
 * Get the current window
 */
    gui = global.window.nwDispatcher.requireNwGui(),
    win = gui.Window.get();

/**
 * Listeners
 */
$('#btnChangePort').on('click', function (e) {
    // @TODO close the current serial connection and open a new one
    /*var customPort = $('#fldCustomSerialPort').val() !== '' ? $('#fldCustomSerialPort').val() : 'COM3';
     port.close();
     port = new SerialPort(customPort);
     console.log('port' + customPort);*/
});

/**
 * Stop the helicopter and close the window
 */
$('#btnExitApp').on('click', function (e) {
    window.close();
});

/**
 * Keyboard navigation
 */
$(document).keydown(function (e) {
    $sldThrottle = $('#sldThrottle');
    sldYaw = $('#sldYaw');
    sldPitch = $('#sldPitch');
    sldTrim = $('#sldTrim');

    if (e.which == 90) { // throttle up - z
        $sldThrottle.val(Number($sldThrottle.val()) + 1); // convert to number to fix a bug!
    } else if (e.which == 83) { // throttle down - s
        $sldThrottle.val(Number($sldThrottle.val()) - 1);
    } else if (e.which == 37) { // yaw left
        sldYaw.val(Number(sldYaw.val()) - 1);
        e.preventDefault();
    } else if (e.which == 39) { // yaw right
        sldYaw.val(Number(sldYaw.val()) + 1);
        e.preventDefault();
    } else if (e.which == 38) { // pitch up
        sldPitch.val(Number(sldPitch.val()) + 1);
        e.preventDefault();
    } else if (e.which == 40) { // pitch down
        sldPitch.val(Number(sldPitch.val()) - 1);
        e.preventDefault();
    } else if (e.which == 81) { // trim left
        sldTrim.val(Number(sldTrim.val()) - 1);
    } else if (e.which == 68) { // trim right
        sldTrim.val(Number(sldTrim.val()) + 1);
    }
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
        var throttle = $('#sldThrottle').val();
        var pitch = 126 - $('#sldPitch').val(); // reverse the slider value
        var yaw = 126 - $('#sldYaw').val(); // reverse the slider value
        var trim = 126 - $('#sldTrim').val(); // reverse the slider value

        // send data
        if (APPLICATION_STOPPED) {
            port.write(String.fromCharCode(63));   // yaw
            port.write(String.fromCharCode(63));   // pitch
            port.write(String.fromCharCode(0));  // throttle
            port.write(String.fromCharCode(63));   // trim*/
        } else {
            port.write(String.fromCharCode(yaw));   // yaw
            port.write(String.fromCharCode(pitch));   // pitch
            port.write(String.fromCharCode(throttle));  // throttle
            port.write(String.fromCharCode(trim));   // trim
        }

        // set labels
        $('#lblThrottle').html(Math.round(throttle / 1.27).toFixed(0) + '%');
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
    APPLICATION_STOPPED = true;

    // the timeout is needed to execute all commands
    setTimeout(function () {
        //where we can also call foo
        port.close();
        port = null;
        SerialPort = null;
        this.close(true);
    }, 2000);
});