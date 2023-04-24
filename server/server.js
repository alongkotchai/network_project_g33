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

  socket.on('login', (username, password, callback) =>{
    console.log('login:',username, password);
    callback({
      status:200,
      message: "login"
    })
  });

  socket.on('broadcast', (message, callback) =>{
    console.log('broadcast from:',socket.id, 'message:',message);
    io.emit(`broadcast-all`,{ status:200, message:message, sender:socket.id});
    callback({
      status:200,
      message: 'send broadcast successfuly'
    })
  });

});

console.log('start server');
io.listen(5001);