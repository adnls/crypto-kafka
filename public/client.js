var socket = io();
socket.on('hello-message', function(msg){
    document.getElementById("test").innerHTML = msg
});
socket.on('init-value', function(msg){
    document.getElementById("value").innerHTML = msg
});
socket.on('new-value', function(msg){
    document.getElementById("value").innerHTML = msg
});