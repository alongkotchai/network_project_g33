const { Server } = require("socket.io");
const {authToken, authUser, getAllUsers, registerUser, logoutUser, setNickname, getUserIdFromAuth } = require('./controller/user');
const {sendMessage, getMessageHistory} = require('./controller/chat');
const {getGroups, createGroup, joinGroup, changeGroupColor} = require('./controller/group');

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
      console.log("session success");
      socket.emit('reAuth',session);
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
    console.log('login:',username);
    const result = authUser(username,password,socket.id);
    if(result){
      response({status:200, auth: result});
    }else{
      response({status:400, message:'fail to login'});
    }
  });

  socket.on('logout', (token, response) =>{
    console.log('logot');
    if(!getUserIdFromAuth(token,socket.id)){response({status:400, message:'not authorize'}); return;};
    if(logoutUser(token)){
      response({status:200});
    }else{
      response({status:400, message:'fail to logout'});
    }
  });

  //emit 'newUser' event
  socket.on('register', async(username, password, nickname, response) =>{
    console.log('register');
    const result = await registerUser(username,nickname,password,socket);
    if(result){
      response({status:200, auth: result});
    }else{
      response({status:400, message:'fail to register'});
    }
  });

  //emit 'userChangeNickname' event
  socket.on('setNickname', (token, nickname, response) =>{
    console.log('set nickname');
    if(!getUserIdFromAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    const result = setNickname(token,socket,nickname);
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

  //emit 'newGroup' event
  socket.on('createGroup', (token, groupName, color, response) =>{
    console.log('createGroup');
    const userId = getUserIdFromAuth(token,socket.id);
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
    const userId = getUserIdFromAuth(token,socket.id);
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
    if(!getUserIdFromAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    let messages = getMessageHistory(isDirect, )
    if(messages){
      response({status:200, messages: messages});
    }else{
      response({status:400, message:'fail to get messages'});
    }
  });

  // emit 'directMessage' or 'groupMessage' event
  socket.on('sendMessage', (token, isDirect, receiverId, response) =>{
    console.log('sendMessage');
    const userId = getUserIdFromAuth(token,socket.id);
    if(!userId){
      response({status:400, message:'not authorize'});
    }else{
      if(sendMessage(io, socket, userId, receiverId, isDirect)){
        response({status:200,});
      }else{
        response({status:400, message:'fail to send message'});
      }
    }
  });

  //emit 'groupChangeColor' event
  socket.on('setBackground', (token, groupId, response) =>{
    console.log('setBackground');
    if(!getUserIdFromAuth(token,socket.id)){response({status:400, message:'not authorize'}); return};
    if(changeGroupColor(io,userId,groupId)){
      response({
        status:200
      });
    }else{
      response({
        status:400,
        message: "fail to change group color"
      });
    }
    
  });

  socket.on("disconnect", (reason) => {
    console.log('disconnect',socket.id,reason);
  });
});

console.log('start server');
io.listen(5001);