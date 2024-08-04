'use strict';

document.querySelector('body').onload = main;

function main () {
    getAccount();
    document.getElementById('colors').onchange = (event) => {
        event.preventDefault();
        updateColor(event.target.value);
        return false;
    }
    document.getElementById('paddles').onchange = (event) => {
        event.preventDefault();
        updatePaddle(event.target.value);
        return false;
    }
    
    document.getElementById('change_username').onsubmit = (event) => {
        event.preventDefault();
        changeUsername();
        return false;
    }
    document.getElementById('change_password').onsubmit = (event) => {
        event.preventDefault();
        changePassword();
        return false;
    }
    document.getElementById('deleteButton').onclick = (event) => {
        event.preventDefault();
        deleteAccount();
        return false;
    }

    document.getElementById('logoutB').onclick = (event) => {
        event.preventDefault();
        logout();
        return false;
    }
    
    
}

async function getAccount () {
    await fetch('http://www.ssproductions.tech/account/info', {
        method: 'GET'
    }).then( res => {
        return res.json();
    }).then( data => {
        document.getElementById('user').innerHTML += data.username;
        document.getElementById(`${data.color}`).checked = true;
        document.getElementById(`${data.paddle}`).checked = true;
    }).catch( err => {
        console.log(err);
    });
    
}

async function updateColor(color) {
    const body = {color};
    fetch("http://www.ssproductions.tech/color", {
        method: "post",
        body: JSON.stringify(body),
        headers: {"Content-Type": "application/json"}
    }).then( async res => {
        if (res.status === 200) {
            alert('Chat color updated');
        }
    }).catch( err => {
        console.log(err);
    });
}

async function updatePaddle(paddle) {
    const body = {paddle};
    fetch("http://www.ssproductions.tech/paddle", {
        method: "post",
        body: JSON.stringify(body),
        headers: {"Content-Type": "application/json"}
    }).then( async res => {
        if (res.status === 200) {
            alert('Paddle updated');
        }
    }).catch( err => {
        console.log(err);
    });
}

async function changeUsername(){
    const field = document.getElementById('new_username');
    const username = field.value;
    const res = await fetch('http://www.ssproductions.tech/account/changeusername', {
        method: 'post',
        body: JSON.stringify({username}),
        headers: {'Content-Type': 'application/json'}
    });
    if (res.status === 200) {
        document.getElementById('user').innerHTML = "Username: " + username;
    }  
    else if (res.status === 409) {
        alert('Username exists');
    }
    else{
        console.log(res.status);
    }
    field.value = "";
}

function changePassword(){
    const field1 = document.getElementById("old_password");
    const field2 = document.getElementById("new_password");
    const field3 = document.getElementById("confirmPassword");
    const old_pass = field1.value;
    const new_pass = field2.value;
    const confirmPassword = field3.value;

    if (new_pass !== confirmPassword) {
        alert("Passwords aren't the same.");
        return;
    }
    const data = {old_pass, new_pass};
    fetch("http://www.ssproductions.tech/account/changepassword", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( async res => {
        if (res.status === 200) {
            alert('Password updated!');
        } else if (res.status === 401) {
            alert('Old password was incorrect!');
        }
        else{
            console.log(res.status);
        }
    }).catch( err => {
        console.log(err);
    });
    field1.value = "";
    field2.value = "";
    field3.value = "";
}

function deleteAccount(){
    const resp = confirm("Are you sure you want to delete your account?");
    if(resp){
        fetch("http://www.ssproductions.tech/account/deleteAccount", {
            method: "delete"
        }).then( async res => {
            if (res.status === 200) {
                window.location = "http://www.ssproductions.tech";
            }
            else{
             console.log(res.status);
            }
        }).catch( err => {
            console.log(err);
        });
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