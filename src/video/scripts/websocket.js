var WebSocket = require('ws')
	, ws = new WebSocket('ws://localhost:8081');
ws.on('open', function() {
	ws.send('something');
});
ws.on('message', function(message) {
	console.log('received: %s', message);
});