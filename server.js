const express = require('express');
var cors = require('cors');
const app = express();
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
      origin: "https://personal-ixhtgx65.outsystemscloud.com",
      methods: ["GET", "POST"]
    }
});

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello world");
});


app.use(express.static(__dirname + '/public'));

io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const userId = socket.handshake.auth.userId;

    if (!username) {
      return next(new Error("invalid username"));
    }
    
    socket.username = username;
    socket.id = Number(userId);
    next();
});

io.on('connection', (socket) => {
  console.log('A user connected with Username: ' + JSON.stringify(socket?.username) + " and UserId = " + socket?.id);

  socket.on('disconnect', (socket) => {
    console.log('A user disconnected with Username:' + JSON.stringify(socket?.username));
  });

  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });

  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  socket.emit("users", users);

  socket.on('message', ({ message, to }) => {
    console.log('Received message:', message);
    console.log('Received message to:', typeof to);

    io.to(Number(to)).emit('chat-message', {
        message,
        from: socket.id,
    });
    
  });
});

http.listen(3000, () => {
  console.log('Server started on port 3000');
});