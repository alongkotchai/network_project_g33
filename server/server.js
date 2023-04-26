const { Server } = require("socket.io");
const {authToken, authUser, getAllUsers, registerUser, logoutUser, setNickname, checkAuth } = require('./controller/user');
const {sendMessage, getMessageHistory} = require('./controller/chat');
const {getGroups, createGroup, joinGroup} = require('./controller/group');

const io = new Server({ 
    //allow frontend cors 
    cors: {
    origin: "http://localhost:5500"
    } 
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if(token){
    const session = authToken(token,socket.id);
    if(session){
      console.log("session",session);
    }else{
      console.log("session fail");
    }
  }
  next();
});

io.on("connection", (socket) => {
  console.log("connected", socket.id);
  socket.emit("welcome",{ status:200, message:`Welcome socket:${socket.id} to Server`});

  //testing
  socket.on("greeting", (...args) => {
    console.log(args);
  });

  socket.on('broadcast', (message, response) =>{
    console.log('broadcast from:',socket.id, 'message:',message);
    io.emit(`broadcast-all`,{ status:200, message:message, sender:socket.id});
    response({
      status:200,
      message: 'send broadcast successfuly'
    })
  });
  // end testing

  socket.on('login', (username, password, response) =>{
    console.log('login:',username, password);
    const result = authUser(username,password,socket.id);
    if(result){
      response({status:200, auth: result});
    }else{
      response({status:400, message:'fail to login'});
    }
  });

  socket.on('logout', (token, response) =>{
    console.log('logot');
    if(!checkAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    if(logoutUser(token)){
      response({status:200});
    }else{
      response({status:400, message:'fail to logout'});
    }
  });

  socket.on('register', (username, password, nickname, response) =>{
    console.log('register');
    const result = registerUser(username,password,nickname,socket.id);
    if(result){
      response({status:200, auth: result});
    }else{
      response({status:400, message:'fail to register'});
    }
  });

  socket.on('setNickname', (token, nickname, response) =>{
    console.log('set nickname');
    if(!checkAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    const result = setNickname(token,nickname);
    if(result){
      response({status:200, result: result});
    }else{
      response({status:400, message:'fail to set nickname'});
    }
  });

  socket.on('getUsers', (response) =>{
    const result = getAllUsers();
    if(result){
      response({status:200, users: result});
    }else{
      response({status:400, message:'fail to get users'});
    }
  });

  socket.on('getGroups', (response) =>{
    console.log('getGroups');
    let groups = getGroups();
    if(groups){
      response({status:200, groups: groups});
    }else{
      response({status:400, message:'fail to get groups'});
    }
  });

  socket.on('createGroup', (token, groupName, color, response) =>{
    console.log('createGroup');
    const userId = checkAuth(token,socket.id);
    if(!user){
      response({status:400, message:'not authorize'});
    }else{
      let group = createGroup(io,socket,groupName,userId,color);
      if(group){
        response({status:200, group:group});
      }else{
        response({status:400, message:'fail to create group'});
      }
    }
  });

  socket.on('joinGroup', (token, groupId, response) =>{
    console.log('joinGroup');
    const userId = checkAuth(token,socket.id);
    if(!userId){
      response({status:400, message:'not authorize'});
    }else{
      let result = joinGroup(socket,userId,groupId);
      if(result){
        response({status:200});
      }else{
        response({status:400, message:'fail to join group'});
      }
    }
  });

  socket.on('getMessages', (token, isDirect, receiverId, response) =>{
    console.log('getMessages');
    if(!checkAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    let messages = getMessageHistory(isDirect, )
    if(messages){
      response({status:200, messages: messages});
    }else{
      response({status:400, message:'fail to send message'});
    }
  });

  socket.on('sendMessage', (token, isDirect, receiverId, response) =>{
    console.log('sendMessage');
    if(!checkAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    if(sendMessage(io,socket.id, receiverId, isDirect)){
      response({status:200,});
    }else{
      response({status:400, message:'fail to send message'});
    }
  });

  socket.on('setBackground', (token, groupId, response) =>{
    console.log('sendMessage');
    if(!checkAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    response({
      status:200,
      message: "sendMessage"
    })
  });
});

console.log('start server');
io.listen(5001);