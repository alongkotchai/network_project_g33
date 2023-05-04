const {CreateUser, CheckUser,getUser, getAllUsers, UpdateUserNickname, getJoinedGroups} = require('../db/db');

let session = new Map();
let index = 1000000;

exports.getUserFromId = (userId)=>{
    const user = getUser(userId);
    if(user){
        return {userId:user.user_id,
                username:user.username,
                nickname:user.nickname};
    }
};

exports.getSocktFromUserId = (userId)=>{
    for (let user of session.values()) {
        if(userId == user.userId){
            return user.socketId;
        }
    }
};

exports.authToken = async(token, socket) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        let user = session.get(token);
        user.socketId = socket.id;
        deleteSession(socket.id);
        session.set(token,temp);
        await setupSocketRoomsOnFirstConnect(socket,user.userId);
        return {token:token,
                userId:user.userId, 
                username:user.username, 
                nickname:user.nickname};
    }
};

exports.getUserIdFromAuth = (token, socketId)=>{
    token = parseInt(token, 10);
    if(session.has(token)){
        const user = session.get(token);
        if(user.socketId == socketId){
            return user.userId;
        }
    }
}

exports.authUser = async(username, password, socket) =>{
    const user = await CheckUser(username,password);
    if(user){
        deleteSession(socket.id);
        index += 1;
        session.set(index,{userId:user.user_id,
                           username:user.username,
                           nickname:user.nickname,
                           socketId:socket.id});
        await setupSocketRoomsOnFirstConnect(socket,user.user_id);
        return {token:index.toString(),
                userId:user.user_id, 
                username:user.username, 
                nickname:user.nickname};
    }
};

exports.getAllUsers = async() =>{
    let usersList = Array();
    const users = await getAllUsers();
    if(!users){return false;}
    users.forEach(user => {
        usersList.push({userId:user.user_id,nickname:user.nickname});
    });
    return usersList;
};

//emit 'newUser' event
exports.registerUser = async(username, nickname, password, socket) =>{
    if (username == "" || nickname == "" || password == "") return undefined;
    const id = await CreateUser(username,nickname,password);
    if(id){
        deleteSession(socket.id);
        index += 1;
        session.set(index,{userId:id,
                           username:username,
                           nickname:nickname,
                           socketId:socket.id});
        socket.broadcast.emit('newUser',{userId:id,
                                         nickname:nickname});
        await setupSocketRoomsOnFirstConnect(socket,id);
        return {token:index.toString(),
                userId:id, 
                username:username, 
                nickname:nickname};
    }
};

//emit 'userChangeNickname' event
exports.setNickname = async(token,socket, nickname) =>{
    token = parseInt(token, 10);
    const userId = this.getUserIdFromAuth(token,socket.id);
    if(!userId){return false;}
    const result = await UpdateUserNickname(userId,nickname);
    if(result){
        let user = session.get(token);
        user.nickname = nickname;
        session.set(token,user);
        socket.broadcast.emit('userChangeNickname',
                              {userId:userId,
                               nickname:nickname});
        return {nickname:user.nickname};
    }
};

exports.logoutUser = (token,socketId) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        session.delete(token);
        deleteSession(socketId);
        return true;
    }
};

function deleteSession(socketId){
    const s = Array();
    for (let [token, user] of session) {
        if(user.socketId == socketId){
            s.push(token);
        }
    }
    s.forEach((token)=>{
        session.delete(token);
    });
}

async function setupSocketRoomsOnFirstConnect(socket,userId){
    const joinedGroups = await getJoinedGroups(userId);
    const rooms = socket.rooms;
    for (const room of rooms) {
        if(room.slice(0, 2) == "g:"){
            socket.leave(room)
        }
      }
    if(!joinedGroups){return;}
    joinedGroups.forEach((group)=>{
        socket.join("g:"+group.group_id.toString());
    });
}