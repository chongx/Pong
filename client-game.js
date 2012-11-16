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
	this.p1 = new GameObj(p1Params);
	this.p2 = new GameObj(p2Params);
	this.p1score = 0;
	this.p2score = 0;
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
	this.drawScore = function() {	
		console.log(this.p1score, this.p2score);
	};
	this.resetGame = function(winner) {
		this[winner+'score']++;
		this.drawScore();
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
		this.p1score = 0;
		this.p2score = 0;
		canvas.addEventListener('keydown', onKeyDown, false);
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



function onKeyDown(event) {
	switch(event.keyCode) {
		case 38:
			game.p2.setVelocity(0, -80);
			break;
		case 40:
			game.p2.setVelocity(0, 80);
			break;
		case 87:
			game.p1.setVelocity(0, -80);
			break;
		case 83:
			game.p1.setVelocity(0, 80);
			break;
	}
}

var game = new GameState();
game.init();