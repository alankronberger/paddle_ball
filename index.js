const express        = require('express');
const app            = express();
const WebSocket = require('ws');
const path           = require('path');
const createDAO      = require('./Models/dao');
const UserModel      = require('./Models/UserModel');
const AuthController = require('./Controllers/AuthController');
const UserController = require('./Controllers/UserController')
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);
const Game           = require('./Game.js');

const redisClient = redis.createClient();

const sess = session({
    store: new RedisStore({ 
        client: redisClient, 
        host: 'localhost',   
        port: 6379,          
        ttl: 12 * 60 * 60,   
    }),
    secret: 'gRMbD25YksCiqSOQ1uFB', 
    resave: false, 
    cookie: {
        httpOnly: true,
    },
    saveUninitialized: false, 
});

app.use(sess);



const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'Users.db');
let User   = undefined;
let Auth   = undefined;
let messages = [];

app.use(express.static('public'));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let playerID = 0;
const rooms = [];
let gameID = 1;
let gameCount = 0;




app.get('/account', (req, res) => {
    if (req.session.isVerified ) {
        res.sendFile(path.join(__dirname, "public", "html", "account.html"));
    } else {
        res.redirect("/login");
    }
});

// All information associated with a user account
app.get('/account/info', errorHandler( async (req, res) => {
    if(req.session.isVerified){
        const result = await User.getUserAccount(req.session.username);
        res.send(JSON.stringify(result));
    }
    else {
        res.sendStatus(403);
    }
}));

app.post("/account/changepassword", errorHandler( async (req, res) => {
    const body = req.body;
    console.log("Hit CHanged password");
    if (body === undefined || (!body.old_pass || !body.new_pass)) {
        return res.sendStatus(400);
    }
    if(req.session.isVerified){
        const changed = await Auth.changePassword(req.session.username, body.old_pass, body.new_pass);
        if(changed){
            res.sendStatus(200);
        }
        else{
            res.sendStatus(401);
        }
    }
    else{
        res.sendStatus(403);
    }
}));

app.post('/account/changeusername', errorHandler( async (req, res) => {
    const body = req.body;
    if (body === undefined || !body.username) {
        return res.sendStatus(400);
    }
    if(req.session.isVerified){
        try {
            await Auth.updateUsername(req.session.username, body.username);
            req.session.username = body.username;
            res.sendStatus(200);
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                console.error(err);
                res.sendStatus(409); // 409 Conflict
            } else {
                throw err;
            }
        }
    }
    else{
        res.sendStatus(403);
    }
}));

app.delete('/account/deleteAccount', errorHandler( async (req, res) => {
    if(req.session.isVerified){
        try{
            await User.delete(req.session.username);
            req.session.isVerified = false;
            res.sendStatus(200);
        }
        catch(err){
            throw err;
        }
    }
    else{
        res.sendStatus(403);
    }
}));

// Default route
app.get('/', (req, res) => {
    console.log(req.ip);
    if(req.session.isVerified){
        res.sendFile(path.join(__dirname, "public", "html", "index.html"));
    }
    else{
        res.redirect('/login');
    }
});

app.get('/leaderboard', (req, res) => {
    if (req.session.isVerified ) {
        res.sendFile(path.join(__dirname, "public", "html", "leaderboard.html"));
    } else {
        res.redirect("/login");
    }
});

app.get('/leaderboard/standings', errorHandler( async (req, res) => {
    if(req.session.isVerified){
        const result = await User.getLeaderboard();
        res.send(JSON.stringify(result));
    }
    else{
        res.redirect("/login");
    }
}));


app.post("/logout", (req, res) => {
    req.session.isVerified = false;
    res.sendStatus(200);
});

/*
        Account Registration
*/
app.get("/register", (req, res) => {
    if(req.session.isVerified){
        res.redirect('/');
    }
    else{
        res.sendFile(path.join(__dirname, "public", "html", "register.html"));
    }
});

app.post("/register", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        await Auth.register(username, password);
        req.session.isVerified = true;
        req.session.username = username;
        req.session.color = await User.getColor(username);
        const paddle = await User.getPaddle(username);
        req.session.paddle = paddle.paddle;
        res.sendStatus(200);
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            res.sendStatus(409); // 409 Conflict
        } else {
            throw err;
        }
    }
}));

/*
        User Login
*/
app.get("/login", (req, res) => {
    if(req.session.isVerified){
        res.redirect('/');
    }
    else{
        res.sendFile(path.join(__dirname, "public", "html", "login.html"));
    }
});

app.post("/login", errorHandler( async (req, res) => {
    if (req.body === undefined || (!req.body.username || !req.body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = req.body;
    const isVerified = await Auth.login(username, password);
    const status = isVerified ? 200 : 401;
    req.session.isVerified = isVerified;
    if (isVerified) {
        req.session.username = username;
        req.session.color = await User.getColor(username);
        const paddle = await User.getPaddle(username);
        req.session.paddle = paddle.paddle;
    }
    res.sendStatus(status);

}));

// Allows client to change their chat color, 
// Updates color in DB for client
app.post("/color", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined && req.session.isVerified) {
        return res.sendStatus(400);
    }
    req.session.color = body.color;
    await User.updateColor(req.session.username, req.session.color);
    res.sendStatus(200);
}));

app.post("/paddle", errorHandler(async (req, res) => {
    const body = req.body;
    if (body === undefined && req.session.isVerified) {
        return res.sendStatus(400);
    }
    req.session.paddle = body.paddle;
    await User.updatePaddle(req.session.username, req.session.paddle);
    res.sendStatus(200);
    
}));


// Listen on port 80 (Default HTTP port)
const server = app.listen(80, async () => {
    // wait until the db is initialized and all models are initialized
    await initDB();
    // Then log that the we're listening on port 80
    console.log("Listening on port 80.");
});

// Start WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// Intercept WebSocket upgrade request
// Parses session from request
// Passes the request object to be able to attatch request
// Session to WebSocket
server.on('upgrade', function(request, socket, head) {
    sess(request, {}, () => {
        if (!request.session) {
        socket.destroy();
        return;
        }
        wss.handleUpgrade(request, socket, head, function(ws) {
            wss.emit('connection', ws, request);
        });
    });
});


// Establishes WebSocket connection
wss.on('connection', (ws,req) => {
    //Attaches request session to WebSocket on connection
    ws.session = req.session;
    // Populates client's chat window
    sendChatLog(ws);
    ws.on('message', (data) => {
        try{
            const message = JSON.parse(data);
            if(message.cmd === 'jg'){
                findGame(ws);
            }
            else if(message.cmd === 'pu'){
                rooms[ws.session.gameId].playerInput(ws, message.input);
            }
            else if(message.cmd === "cm"){
                sendMessage(ws, message.msg);
            }
        }
        catch(err){
            console.log(err);
            
        }        
    });
    ws.on('close', () => {
        const gameId = ws.session.gameId
        if(gameId && rooms[gameId] && rooms[gameId].playerCount === 2){
            const opponent = rooms[ws.session.gameId].playerLeft(ws);
            delete rooms[gameId];
            delete opponent.session.gameId;
        }
        else if(gameId && rooms[gameId] && rooms[gameId].playerCount === 1){
            delete rooms[gameId];
        }
        ws.close();
    });
  });

// Sends client chat message to all connected clients
// and stores it in messages array
function sendMessage (ws, msg) {
    const message = {
        cmd  : 'chatmsg',
        user : ws.session.username,
        msg  : msg,
        color : ws.session.color
    };
    if(messages.length === 300){
        messages.shift();
    }
    messages.push(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {

            client.send(JSON.stringify(message));
        }
    });
}

// Populates cliet chat with messages when WebSocket connection
// is established
function sendChatLog (ws) {
    const message = {
        cmd  : 'popchat',
        messages : messages
    };
    ws.send(JSON.stringify(message));
}

function findGame(ws) {
    if(gameCount){
        let foundGame = false;
        for(const gameId in rooms){
            const game = rooms[gameId];
            if(game.playerCount === 1){
                ws.session.gameId = gameId;
                game.addPlayer(ws);
                game.start();
                foundGame = true;
            }
        }

        if(!foundGame){
            createGame(ws);
        }
    }
    else{
        createGame(ws);
    }

}

function createGame(ws){
    const gameId = gameID++;
    ws.session.gameId = gameId;
    rooms[gameId] = new Game(gameId, ws);
    gameCount++;
}

async function initDB () {
    const dao = await createDAO(dbFilePath);
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
    User = new UserController(dao);
}

exports.updateScore = async (gameID, username) => {
    await User.incrementWins(username);
    delete rooms[gameID];
}

// This is our default error handler (the error handler must be last)
// it just logs the call stack and send back status 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(500);
});

// We just use this to catch any error in our routes so they hit our default
// error handler. We only need to wrap async functions being used in routes
function errorHandler (fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next);
    };
};