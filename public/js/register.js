"use strict";
document.querySelector("body").onload = main;

function main () {
    document.getElementById("register_form").onsubmit = (event) => {
        event.preventDefault();

        processForm(event);

        return false;
    };
}

function processForm (event) {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords aren't the same.");
        return;
    }
    const data = {username, password};
    fetch("http://www.ssproductions.tech/register", {
        method: "post",
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }).then( async res => {
        if (res.status === 200) {
            alert('Account Created');
            window.location = "http://www.ssproductions.tech";
        } else if (res.status === 409) {
            alert('Username exists');
        }
    }).catch( err => {
        console.log(err);
    });
}