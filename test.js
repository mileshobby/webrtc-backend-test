var socket = new WebSocket('ws://flex-aa.herokuapp.com');

let message = {message: 'hello there'}

socket.onmessage = function(e) {
    console.log(e.data);
    alert(e.data);
};

socket.onopen = function() {
    socket.send(JSON.stringify(message));
};

if (socket.readyState == WebSocket.OPEN) socket.onopen();
