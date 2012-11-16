Pong

Alexander Malyshev (amalyshe)
Arjuna Hayes (achayes)
Chong Xie (chongx)

Instructions for running:
Some url's need to be changed. In both player.html and client-game.html,the url for sourcing socket.io/socket.io.js needs to be changed to the IP address of the server. Additionally in player.js and client-game.js, the socket connection (io.connect) needs to be changed to the server's IP as well. Once this is down, run node server.js and node socketserver.js

The phones should navigate to player.html.

The main screen is client-game.html.

The users are:
Username: player1
Pass: pass1

Username: player2
Pass: pass2

Once both players have connected, the game starts. Tilting the phone up or down will move their respective paddles up or down.
