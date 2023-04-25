const { Server } = require("socket.io");

const io = new Server({ 
    //allow frontend cors 
    cors: {
    origin: "http://localhost:5500"
    } 
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.emit("welcome",{ status:200, message:`Welcome socket:${socket.id} to Server`});

  socket.on("greeting", (...args) => {
    console.log(args);
  });

  socket.on('broadcast', (message, callback) =>{
    console.log('broadcast from:',socket.id, 'message:',message);
    io.emit(`broadcast-all`,{ status:200, message:message, sender:socket.id});
    callback({
      status:200,
      message: 'send broadcast successfuly'
    })
  });

  socket.on('login', (username, password, callback) =>{
    console.log('login:',username, password);
    callback({
      status:200,
      message: "login"
    })
  });

  socket.on('logout', (callback) =>{
    console.log('logot');
    callback({
      status:200,
      message: "logout"
    })
  });

  socket.on('register', (callback) =>{
    console.log('register');
    callback({
      status:200,
      message: "register"
    })
  });

  socket.on('setNickname', (callback) =>{
    console.log('setNickname');
    callback({
      status:200,
      message: "setNickname"
    })
  });

  socket.on('getUsers', (callback) =>{
    console.log('getUsers');
    callback({
      status:200,
      message: "getUsers"
    })
  });

  socket.on('getGroups', (callback) =>{
    console.log('getGroups');
    callback({
      status:200,
      message: "getGroups"
    })
  });

  socket.on('createGroup', (callback) =>{
    console.log('createGroup');
    callback({
      status:200,
      message: "createGroup"
    })
  });

  socket.on('joinGroup', (callback) =>{
    console.log('joinGroup');
    callback({
      status:200,
      message: "joinGroup"
    })
  });

  socket.on('getMessages', (callback) =>{
    console.log('getMessages');
    callback({
      status:200,
      message: "getMessages"
    })
  });

  socket.on('sendMessage', (callback) =>{
    console.log('sendMessage');
    callback({
      status:200,
      message: "sendMessage"
    })
  });


});

console.log('start server');
io.listen(5001);