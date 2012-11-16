var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var GameObj = function(params) {
	this.x = params.x;
	this.y = params.y;
	this.w = params.w;
	this.h = params.h;
	this.dx = 0;
	this.dy = 0;
	this.maxX = params.maxX;
	this.maxY = params.maxY;
	this.minX = params.minX;
	this.minY = params.minY;
	this.color = params.color;
	this.bounce = params.bounce;
	this.draw = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);
	};
	this.updatePos = function(dt) {
		this.x += (this.dx * dt)/100.0;
		this.y += (this.dy * dt)/100.0;
		if (this.x + this.w > this.maxX)
			this.x = this.maxX - this.w;
		else if (this.x < this.minX)
			this.x = this.minX;
		
		
		if (this.y + this.h > this.maxY) {
			if (this.bounce) this.dy = -1*this.dy;
			this.y = this.maxY - this.h;
		}
		else if (this.y < this.minY){
			if (this.bounce) this.dy = -1*this.dy;
			this.y = this.minY;		
		}
	};
	this.setVelocity = function(dx, dy) {
		this.dx = dx;
		this.dy = dy;
	};
	
}

var p1Params = {
	'x' : 0,
	'y' : 0,
	'w' : 30,
	'h' : 200,
	'maxX' : canvas.width,
	'maxY' : canvas.height,
	'minX' : 0,
	'minY' : 0,
	'color': '#0000FF',
	'bounce' : false
}

var p2Params = {
	'x' : canvas.width-30,
	'y' : 0,
	'w' : 30,
	'h' : 200,
	'maxX' : canvas.width,
	'maxY' : canvas.height,
	'minX' : 0,
	'minY' : 0,
	'color': '#00FF00',
	'bounce' : false
}

var ballParams = {
	'x' : canvas.width/2-20,
	'y' : canvas.height/2-20,
	'w' : 40,
	'h' : 40,
	'maxX' : canvas.width,
	'maxY' : canvas.height,
	'minX' : 0,
	'minY' : 0,
	'color': '#FF0000',
	'bounce' : true
}


var GameState = function() {
    this.inited = false;
	this.p1 = new GameObj(p1Params);
	this.p2 = new GameObj(p2Params);
	this.p1score = 0;
	this.p2score = 0;
    this.p1ready = false;
    this.p2ready = false;
	this.ball = new GameObj(ballParams);
	this.draw = function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		this.ball.draw();
		this.p1.draw();
		this.p2.draw();
		
	};
	this.update = function(dt) {
		this.ball.updatePos(dt);
		this.p1.updatePos(dt);
		this.p2.updatePos(dt);
	};
	this.drawScore = function(winner) {	
        if(winner == "p1") {
            this.socket.emit('send', {receiver: '0', info: "<h1>YOU WON</h1><br />You have won " + this.p1score + " / " + (this.p1score + this.p2score) + " games so far"});
            this.socket.emit('send', {receiver: '1', info: "<h1>YOU LOST</h1><br />You have won " + this.p2score + " / " + (this.p1score + this.p2score) + " games so far"});
        } else {
            this.socket.emit('send', {receiver: '1', info: "<h1>YOU WON</h1><br />You have won " + this.p2score + " / " + (this.p1score + this.p2score) + " games so far"});
            this.socket.emit('send', {receiver: '0', info: "<h1>YOU LOST</h1><br />You have won " + this.p1score + " / " + (this.p1score + this.p2score) + " games so far"});
        }
		console.log(this.p1score, this.p2score);
	};
	this.resetGame = function(winner) {
		this[winner+'score']++;
		this.drawScore(winner);
		clearInterval(this.gameInterval);
		var that = this;
		setTimeout(function() {
			that.startGame();
		}, 1000);
	};
	this.checkState = function() {
		var b = this.ball;
		var p1 = this.p1;
		var p2 = this.p2;
		if(b.x <= p1.x + p1.w){
			if(b.y + b.h > p1.y && b.y < p1.y + p1.h)
				this.ball.dx = Math.abs(this.ball.dx);
			else(this.resetGame('p2'));
		}
		if(b.x + b.w >= p2.x){
			if(b.y + b.h > p2.y && b.y < p2.y + p2.h)
				this.ball.dx = -1*Math.abs(this.ball.dx);
			else(this.resetGame('p1'));
		}
	};
	this.resetBall = function(){
		this.ball.x = canvas.width/2-20;
		this.ball.y = canvas.height/2-20;
		do {
			var dirX = Math.floor(Math.random()*120) - 60;
			var dirY = Math.floor(Math.random()*100) - 50;
		} while(Math.sqrt(dirX*dirX + dirY*dirY) < 500 && Math.abs(dirX) < 40);
		this.ball.setVelocity(dirX, dirY);
	}
	this.init = function() {
        this.inited = true;
		this.p1score = 0;
		this.p2score = 0;
		canvas.setAttribute('tabindex','0');
		canvas.focus();
		this.startGame();
	};
	this.startGame = function() {
		var timeStep = 10;
		this.resetBall();
		this.gameInterval = setInterval(function() {
			game.draw();	
			game.checkState();
			game.update(timeStep);
		}, timeStep);
	};
}

var game = new GameState();
// Make a connection to the socket.io server
// This also fires the "connection" event, but it doesn't matter
var socket = io.connect('http://192.168.0.188:3000/');
game.socket = socket;

// When getting a "receive" event from the server
socket.on('receive', function(data) {
    console.log(data);
    if(data.receiver !== "host") {
        return;
    }
    if(data.init === true && !game.inited) {
        switch(data.player) {
            case "0":
                game.p1ready = true;
                break;
            case "1":
                game.p2ready = true;
                break;
        }
        if(game.p1ready && game.p2ready) {
            game.init();
        }
    } else {
        if(data.player == "0" && data.direction == "up") {
            game.p1.setVelocity(0, 80);
        } else if(data.player == "0" && data.direction == "down") {
            game.p1.setVelocity(0, -80);
        } else if(data.player == "0" && data.direction == "none") {
            game.p1.setVelocity(0, 0);
        } else if(data.player == "1" && data.direction == "up") {
            game.p2.setVelocity(0, 80);
        } else if(data.player == "1" && data.direction == "down") {
            game.p2.setVelocity(0, -80);
        } else if(data.player == "1" && data.direction == "none") {
            game.p2.setVelocity(0, 0);
        }
    }
});
