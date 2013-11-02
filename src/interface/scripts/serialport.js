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
 * Keyboard navigation
 */
$(document).keydown(function(e) {
    $sldThrottle = $('#sldThrottle');
    sldYaw = $('#sldYaw');
    sldPitch = $('#sldPitch');
    sldTrim = $('#sldTrim');

    if(e.which == 90) { // throttle up - z
        $sldThrottle.val(Number($sldThrottle.val()) + 1); // convert to number to fix a bug!
    } else if(e.which == 83) { // throttle down - s
        $sldThrottle.val(Number($sldThrottle.val()) - 1);
    }else if(e.which == 37) { // yaw left
        sldYaw.val(Number(sldYaw.val()) + 1);
    }else if(e.which == 39) { // yaw right
        sldYaw.val(Number(sldYaw.val()) - 1);
    }else if(e.which == 38) { // pitch up
        sldPitch.val(Number(sldPitch.val()) + 1);
    }else if(e.which == 40) { // pitch down
        sldPitch.val(Number(sldPitch.val()) - 1);
    } else if(e.which == 81) { // trim left
        sldTrim.val(Number(sldTrim.val()) + 1);
    }else if(e.which == 68) { // trim right
        sldTrim.val(Number(sldTrim.val()) - 1);
    }
});

/**
 * Setup the serial port
 */

var SerialPort = require('serialport').SerialPort,
    port = new SerialPort('COM3');

// set the port name label
$('#connectedPort').html('Connected to: ' + port.path);

/**
 * Wait for connection
 */
port.on('open', function () {
    console.log('Serial port open');

    /**
     * The Sketch will send data when it's ready to receive the control bits
     */
    port.on('data', function () {

        var throttle = $('#sldThrottle').val();
        var pitch = 126 - $('#sldPitch').val(); // reverse the slider value
        var yaw = 126 - $('#sldYaw').val(); // reverse the slider value
        var trim = 126 - $('#sldTrim').val(); // reverse the slider value

        port.write(String.fromCharCode(yaw));   // yaw
        port.write(String.fromCharCode(pitch));   // pitch
        port.write(String.fromCharCode(throttle));  // throttle
        port.write(String.fromCharCode(trim));   // trim

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
port.on('close', function() {
    console.log('Serial port closed');
});