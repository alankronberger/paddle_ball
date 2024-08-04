const app = require("./index")

class Game {
    constructor (gameId, ws) {
        gameId = gameId;
        this.players = [];
        let player = this.createPlayer(ws, 50, 300);
        this.players.push(player);
        player = this.createPlayer(null, 950, 300);
        this.players.push(player);
        this.playerCount = 1;
        this.ball = {x: 500, y: 300};
        this.ballStartSpeed = 3;
        this.ballspeedx = this.ballStartSpeed;
        this.ballspeedy = this.ballStartSpeed;
        this.inPlay = false;
        this.ballDelta = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.gameClockReal = 0;
        this.gameClock = 0;
        this.Updates = [];
        this.tick = null;
        this.UPtick = null;
        
    }
    
    addPlayer(ws) {
        this.playerCount = 2;
        this.players[1].socket = ws;
    }

    start(){
        const player1 = this.players[0].socket.session;
        const player2 = this.players[1].socket.session;
        for(const player of this.players){
            player.socket.send(JSON.stringify({
                cmd : "sg",
                player : {
                    username : (player === this.players[0]) ? player1.username : player2.username,
                    paddle : (player === this.players[0]) ? player1.paddle : player2.paddle,
                },
                opponent : {
                    username : (player === this.players[0]) ? player2.username : player1.username,
                    paddle : (player === this.players[0]) ? player2.paddle : player1.paddle
                }
            }));
        }
        
        const self = this;
        setTimeout(() =>{this.updatePlayers();}, 1000);
        setTimeout(() =>{self.inPlay = true}, 2000);
    }

    playerLeft(ws){
        clearInterval(this.tick);
        clearInterval(this.UPtick);
        const opponent = (ws.session.username === this.players[0].socket.session.username) ? this.players[1].socket : this.players[0].socket;
        opponent.send(JSON.stringify({
            cmd : "dc",
            opponent : ws.session.username
        }));
        app.updateScore(this.gameId, opponent.session.username);
        return opponent;
    }

    endGame(){
        clearInterval(this.tick);
        clearInterval(this.UPtick);
        const winner = (this.player1Score === 5) ? this.players[0].socket.session.username : this.players[1].socket.session.username;
        for(const player of this.players){
            player.socket.send(JSON.stringify({
                cmd : "go",
                winner : winner
            }));
        }
        app.updateScore(this.gameId, winner);
    }

    updatePlayers(){
        const self = this;
        self.tick = setInterval(function() {
            const oldTime = self.gameClockReal;
            self.gameClockReal = new Date().getTime();
            self.gameClock += self.gameClockReal - oldTime;
            
            for(const player of self.players){
                for(const input of player.inputs){
                    if(input.key === "UP"){
                        player.y -= 25;
                        if(player.y - 50 <= 0){
                            player.y = 50;
                        }
                        player.lastKey = input.keyPress;
                    }
                    else if(input.key === "DOWN"){
                        player.y += 25;
                        if(player.y + 50 >= 600){
                            player.y = 550;
                        }
                        player.lastKey = input.keyPress;
                    }
                }
                player.inputs.splice(0,player.inputs.length);
                
            }
            
            if(self.inPlay){
                self.ball.x += self.ballspeedx;
                self.ball.y += self.ballspeedy;
                if(self.ballspeedx > 0){
                    self.ballspeedx += 0.002;
                }
                else{
                    self.ballspeedx -= 0.002;
                }
                if(self.ballspeedy > 0){
                    self.ballspeedx += 0.002;
                }
                else{
                    self.ballspeedy -= 0.002;
                }
            }
            
            if((self.ball.x - 15 <= self.players[0].x + 5) && (self.ball.x + 15 >= self.players[0].x - 5)){
                if(self.ball.y + 16 >= self.players[0].y - 50 && self.ball.y - 16 <= self.players[0].y + 50 && self.ball.x >= self.players[0].x + 5){
                    self.ballspeedx *= -1;
                    self.ball.x = self.players[0].x + 19;
                }
                else if(self.ball.y + 16 >= self.players[0].y - 50 && self.ball.y < self.players[0].y - 50 && self.ball.x < self.players[0].x + 5){
                    self.ballspeedy *= -1;
                    self.ball.y = self.players[0].y - 66;
                }
                else if(self.ball.y - 16 <= self.players[0].y + 50 && self.ball.y > self.players[0].y + 50 && self.ball.x < self.players[0].x + 5){
                    self.ballspeedy *= -1;
                    self.ball.y = self.players[0].y + 66;
                }
            }
            if((self.ball.x + 15 >= self.players[1].x - 5) && (self.ball.x - 15 <= self.players[1].x + 5)){
                if(self.ball.y + 16 >= self.players[1].y - 50 && self.ball.y - 16 <= self.players[1].y + 50 && self.ball.x <= self.players[1].x + 5){
                    self.ballspeedx *= -1;
                    self.ball.x = self.players[1].x - 19;
                }
                else if(self.ball.y + 16 >= self.players[1].y - 50 && self.ball.y < self.players[1].y - 50 && self.ball.x > self.players[1].x - 5){
                    self.ballspeedy *= -1;
                    self.ball.y = self.players[1].y - 66;
                }
                else if(self.ball.y - 16 <= self.players[1].y + 50 && self.ball.y > self.players[1].y + 50 && self.ball.x > self.players[1].x - 5){
                    self.ballspeedy *= -1;
                    self.ball.y = self.players[1].y + 66;
                }
            }
            
            if(self.ball.x >= 1000){
                self.ballspeedy = self.ballStartSpeed;
                self.ballspeedx = -self.ballStartSpeed;
                self.player1Score++;
                self.inPlay = false;
                self.ball.x = 500;
                self.ball.y = 300;
                
                setTimeout(() =>{self.inPlay = true}, 2000);
            }
            else if(self.ball.x <= 0){
                self.ballspeedx = self.ballStartSpeed;
                self.ballspeedy = self.ballStartSpeed;
                self.player2Score++;
                self.inPlay = false;
                self.ball.x = 500;
                self.ball.y = 300;
                setTimeout(() =>{self.inPlay = true}, 2000);
            }
            if(self.ball.y >= 600 || self.ball.y <= 0){
                self.ballspeedy = -1 * self.ballspeedy;
            }

            if(self.player1Score === 5 || self.player2Score === 5){
                self.endGame();
            }

        }, 15);
        self.UPtick = setInterval(function() {
            
            self.players[0].socket.send(JSON.stringify({
                cmd : "su",
                username : self.players[0].socket.session.username,
                opponent : (self.players[1].socket === null) ? "Opponent" : self.players[1].socket.session.username,
                posX : self.players[0].x,
                posY : self.players[0].y,
                oppX : self.players[1].x,
                oppY : self.players[1].y,
                ballX : self.ball.x,
                ballY : self.ball.y,
                lastKey : self.players[0].lastKey,
                gameClock : self.gameClock,
                pSc : self.player1Score,
                oSc : self.player2Score
            }));
            if(self.players[1].socket !== null){
                self.players[1].socket.send(JSON.stringify({
                    cmd : "su",
                    username : self.players[1].socket.session.username,
                    opponent : self.players[0].socket.session.username,
                    posX : 1000 - self.players[1].x,
                    posY : self.players[1].y,
                    oppX : 1000 - self.players[0].x,
                    oppY : self.players[0].y,
                    ballX : 1000 - self.ball.x,
                    ballY : self.ball.y,
                    lastKey : self.players[1].lastKey,
                    gameClock : self.gameClock,
                    pSc : self.player2Score,
                    oSc : self.player1Score
                }));
            }
        }, 15);
    }

    playerInput(ws, input){
        for(const player of this.players){
            if(player.socket !== null && ws.session.username === player.socket.session.username){
                player.inputs.push(input);
            }
        }
    }

    createPlayer(ws, x, y){
        const player = {
            socket: ws,
            inputs: [],
            x: x,
            y: y,
            lastKey: 0
        };
        return player;
    }
    
}

module.exports = Game;