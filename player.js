var Game = new function() {
    this.accelerometer = new Accelerometer();
    this.accelerometer.startListening();
    this.lastDirection = "none";
    this.direction = "none";
    this.update = function() {
        this.lastAccel = this.accelerometer.getLast();
        if(this.lastAccel.y < -1.0) {
            this.direction = "down";
        } else if(this.lastAccel.y > 1.0) {
            this.direction = "up";
        } else {
            this.direction = "none";
        }
        if(this.direction != this.lastDirection) {
            this.socket.emit('send', {receiver: "host", player: getUser(), direction: this.direction});
        }
        this.lastDirection = this.direction;
    }
    this.init = function() {
        // Make a connection to the socket.io server
        // This fires the "connection" event!!
        this.socket = io.connect('http://192.168.0.188:3000/');
        setInterval(this.update.bind(this), 100);
        this.socket.on('receive', function(data) {
            if(data.receiver === getUser()) {
                $('#game-alert').stop();
                $('#game-alert').fadeIn();
                // update the DOM with received data
                $('#game-alert').html(data.info);
                $('#game-alert').fadeOut(5000);
            }
        });
        this.socket.emit('send', {receiver: "host", player: getUser(), init: true});
    }
}

function getUser() {
    var cookieArray = document.cookie.split(';');
    var cookies = {};
    for (var i = 0; i < cookieArray.length; i++){
        var parts = cookieArray[i].split('=');
        var key = parts[0].trim();
        var value = parts[1];
        cookies[key] = value;
    }
    return cookies['user'];
}
function hasSessionCookie(){
    //user will be an id if they're logged in
    return getUser() !== 'none';
}

window.onload = function() {
    if (hasSessionCookie()){
        document.getElementById('login').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        Game.init();
    }
}
