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
});

console.log('start server');
io.listen(5001);