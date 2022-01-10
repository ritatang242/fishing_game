var socket = io.connect('http://localhost:3001');
let jump = document.querySelector('.jump');
socket.on('second', function (second) {
    $('#second').text(second.second);
});

$(document).ready(function () {
    $('#text').keypress(function (e) {
        socket.emit('client_data', String.fromCharCode(e.charCode));
    });
});

function popup(e) {
    window.location.assign("http://localhost:3000/index.html");
}

jump.addEventListener('click', popup);