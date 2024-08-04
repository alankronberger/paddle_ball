class Play extends Phaser.Scene {
    constructor() {
        super("Play");
    }

    
    preload() {
        this.load.image("pgreen", "./js/assets/paddle_green.png");
        this.load.image("ppink", "./js/assets/paddle_pink.png");
        this.load.image("porange", "./js/assets/paddle_orange.png");
        this.load.image("pred", "./js/assets/paddle_red.png");
        this.load.image("pyellow", "./js/assets/paddle_yellow.png");
        this.load.image("ball", "./js/assets/ball.png");
    }

    create(data) {
        this.socket = data.socket;
        this.player = this.physics.add.sprite(50, 300, `${data.player.paddle}`);
        this.player.score = 0;
        this.player.scoreText = this.add.text(100, 50, `${data.player.username}: 0`, {font: "30px Impact"});  
        this.opponent = this.physics.add.sprite(950, 300, `${data.opponent.paddle}`);
        this.opponent.scoreText = this.add.text(750, 50, `${data.opponent.username}: 0`, {font: "30px Impact"});
        this.ball = this.physics.add.sprite(500, 300, 'ball');    
        this.playerSpeed = 10;
        this.keypress = 0;
        //this.player.inputs = [];
        
        this.updates = [];
        this.gameClockReal = 0;
        this.gameClock = 0;
        this.debug = true;
        this.keys = this.input.keyboard.addKeys({
          up : 'up',
          down : 'down'
        });
    
        
    }

    update (){
      const oldTime = this.gameClockReal;
      this.gameClockReal = new Date().getTime();
      this.gameClock += this.gameClockReal - oldTime;
  
      if(this.keys.up.isDown && !this.keys.down.isDown){
        if(this.player.y - 50 > 0){
          //this.player1.y -= this.playerSpeed;
          const input = {key: "UP", keyPress: this.keypress++};
          //this.player1.inputs.push(input);
          this.socket.send(JSON.stringify({cmd: "pu", input: input}));
        }
      }
      if(this.keys.down.isDown && !this.keys.up.isDown){
        if(this.player.y + 50 < 600){
          //this.player1.y += this.playerSpeed;
          const input = {key: "DOWN", keyPress: this.keypress++};
          //this.player1.inputs.push(input);
          this.socket.send(JSON.stringify({cmd: "pu", input: input}));;
        }
      }
      this.updatePositions(this.gameClock - 100, this.player, this.opponent, this.ball, this.updates);
      
    }
  
  
    updatePositions(time, player, opponent, ball, updates){
      if(updates.length > 0){
        let nextUP = updates.pop();
        updates.splice(0, updates.length);
        //     previousUP = null,
        //     found = false;
        // for(let i = 1; i < updates.length && !found; i++){
        //   let currentUP = updates[i];
        //   if(currentUP.gameClock >= time){
        //     previousUP = updates[i - 1];
        //     nextUP = currentUP;
        //     found = true;
        //   }
        // }
        if(nextUP !== null /* && previousUP !== null */){
          // let delta = (time - previousUP.gameClock) / (nextUP.gameClock - previousUP.gameClock);
          // if(delta > 1.0){
          //   delta = 1.0;
          // }
          // else if(delta < 0.0){
          //   delta = 0.0;
          // }
          
          player.x = ((nextUP.posX - player.x) * 1) + player.x;
          player.y = ((nextUP.posY - player.y) * 1) + player.y;
          opponent.x = ((nextUP.oppX - opponent.x) * 1) + opponent.x;
          opponent.y = ((nextUP.oppY - opponent.y) * 1) + opponent.y;
          ball.x = ((nextUP.ballX - ball.x) * 1) + ball.x;
          ball.y = ((nextUP.ballY - ball.y) * 1) + ball.y;
          this.updateScore(player.scoreText, opponent.scoreText, nextUP.username, nextUP.opponent, nextUP.pSc, nextUP.oSc);
        }
      }
        
    }
  
    updateScore(playerText, opponentText, username, opponent, playerScore, opponentScore) {
      playerText.setText(username + ": " + playerScore);
      opponentText.setText(opponent + ": " + opponentScore);
    }

    serverUpdate(update){
      this.updates.push(update);
    }

    endGame(winner){
      this.scene.start("GameOver", {socket: this.socket, winner: winner});
    }

    disconnect(opponent){
      this.scene.start("GameOver", {socket: this.socket, opponent: opponent});
    }

    
}