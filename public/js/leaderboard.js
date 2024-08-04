'use strict';

document.querySelector('body').onload = main;

function main () {
    getLeaderboard();
    document.getElementById('logoutB').onclick = (event) => {
        event.preventDefault();
        logout();
        return false;
    }
    
    
    
}

async function getLeaderboard() {
    await fetch('http://www.ssproductions.tech/leaderboard/standings', {
        method: 'GET'
    }).then( res => {
        return res.json();
    }).then( data => {
        fillList(data);
    }).catch( err => {
        console.log(err);
    });
    
}

function fillList(data){
    const userList = document.getElementById("LB-list");
    const scoreList = document.getElementById("scores");
    for(const user of data){
        let li = document.createElement("li");
        let text = document.createTextNode(user.username);
        li.appendChild(text);
        userList.appendChild(li);
        li = document.createElement('li');
        text = document.createTextNode(user.wins);
        li.appendChild(text);
        scoreList.appendChild(li);
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