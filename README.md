Leap RC
========

Connect Arduino to Node.js
---------------------------

```
var five = require("johnny-five"),
        board = new five.Board();

board.on("ready", function() {
        (new five.Led(13)).strobe();
});
```
