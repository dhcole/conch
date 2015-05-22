var io = require('socket.io-client'),
    socket = io(),
    goColor = 'green url("/conch.svg") no-repeat center center',
    noGoColor = 'red',
    defaultColor = 'gray',
    waitingMessage = 'You\'re in line!',
    me;

// Listen for clicks or taps
document.body.addEventListener('mouseup', ping, false);
document.body.addEventListener('touchstart', ping, false);
function ping(event) {
  event.preventDefault();
  socket.emit('ping');
  return false;
}

// Assign my id
socket.on('id', function(id, active) {
  me = id;
  document.body.style.background = (active) ? noGoColor : defaultColor;
});

// Show waiting style
socket.on('waiting', function(id) {
  document.getElementById('status').innerHTML = waitingMessage;
});

// Clear waiting style
socket.on('not waiting', function(id) {
  document.getElementById('status').innerHTML = '';
});

// Check to see if I'm the active socket
socket.on('active', function(id) {

  // My turn
  if (id && id === me) {
    document.body.style.background = goColor;
    document.getElementById('status').innerHTML = '';

  // Not my turn
  } else if (id) {
    document.body.style.background = noGoColor;

  // Empty Line
  } else {
    document.body.style.background = defaultColor;
  }
});
