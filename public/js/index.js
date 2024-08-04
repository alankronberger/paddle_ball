document.querySelector('body').onload = main;


function main () {
  const connection = new WebSocket("ws://10.0.0.187");
  const button = document.querySelector("#send");
  let game;

  document.getElementById('logoutB').onclick = (event) => {
      event.preventDefault();
      logout();
      return false;
  }


  connection.onopen = (event) => {
      console.log("WebSocket is open now.");
      game = createGame();
      setTimeout(() =>{game.scene.keys.Menu.setSocket(connection);}, 1000);
  };

  connection.onclose = (event) => {
      console.log("WebSocket is closed now.");
  };

  connection.onerror = (event) => {
      console.error("WebSocket error observed:", event);
  };

  connection.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if(data.cmd == 'su'){
          game.scene.keys.Play.serverUpdate(data);

        }
        else if(data.cmd === "popchat"){
          populateChat(data.messages);
        }
        else if(data.cmd === "chatmsg"){
          updateChat(data);
        }
        else if(data.cmd === "go"){
          game.scene.keys.Play.endGame(data.winner);
        }
        else if(data.cmd === "dc"){
          game.scene.keys.Play.disconnect(data.opponent);
        }
        else if(data.cmd === "sg"){
          game.scene.keys.Matching.joinGame(data.player, data.opponent);
        }
    }
    catch(error){
      console.log(error);
    }
  };

  

  function updateChat (data){
    // append received message from the server to the DOM element 
    const chat = document.querySelector("#chatbox");
    const message = `${data.user}: ${data.msg}`;
    const color = data.color;
    const newLine = document.createElement('p');
    newLine.textContent = message;
    newLine.style.color = color;
    chat.append(newLine);
    chat.scrollTop += chat.scrollHeight;
  }

  function populateChat (messages) {
    // append received message from the server to the DOM element 
    const chat = document.querySelector("#chatbox");
    for(const data of messages){
      updateChat(data);
    }
    
  }

  button.addEventListener("click", sendMessage);
  window.addEventListener("keypress", (event) => {
    if(event.keyCode === 13){
      sendMessage();
    }
  });

  function sendMessage () {
    const message = document.querySelector("#message");
    if(message.value !== null && message.value !== ""){
      const data = {
        cmd : "cm",
        msg :`${message.value}`
      }

      // Send composed message to the server
      connection.send(JSON.stringify(data));

      // clear input field
      message.value = "";
    }
  }

  function createGame(socket){
    const config = {
      type: Phaser.AUTO,
      width: 1000,
      height: 600,
      parent : "phaser",
      physics: {
          default: 'arcade',
          arcade: {
              debug: false
          }
      },
      scene: [Menu, Matching, Play, GameOver]
      
    };    
  
    const game = new Phaser.Game(config);

    return game;
  
  }
}

function logout(){
  const resp = confirm("Are you sure you want to logout?");
  if(resp){
    fetch("http://www.ssproductions.tech/logout", {
      method: "post"
    }).then( async res => {
        if (res.status === 200) {
          window.location = "http://www.ssproductions.tech";
        }
    }).catch( err => {
        console.log(err);
    });
  }
}
  