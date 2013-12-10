var videoCamera = new tracking.VideoCamera().render(document.getElementById('camera'));
var WebSocket = require('ws'),
    ws = new WebSocket('ws://localhost:8081');

ws.on('open', function () {
    videoCamera.track({
        type: 'color',
        color: 'red',
        onNotFound: function (track) {
            ws.send('0');
        },
        onFound: function (track) {
            ws.send('1');
        }
    });
});