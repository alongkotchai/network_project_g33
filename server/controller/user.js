const {CreateUser, CheckUser,getUser, getAllUsers, UpdateUserNickname} = require('../db/db');

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

exports.authToken = (token, socketId) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        let user = session.get(token);
        user.socketId = socketId;
        deleteSession(socketId);
        session.set(token,temp);
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

exports.authUser = (username, password, socketId) =>{
    const user = CheckUser(username,password);
    if(user){
        deleteSession(socketId);
        index += 1;
        session.set(index,{userId:user.user_id,
                           username:user.username,
                           nickname:user.nickname,
                           socketId:socketId});

        return {token:index.toString(),
                userId:user.user_id, 
                username:user.username, 
                nickname:user.nickname};
    }
};

exports.getAllUsers = () =>{
    let usersList = Array();
    const users = getAllUsers();
    if(!users){return false;}
    users.forEach(user => {
        usersList.push({userId:user.user_id,nickname:user.nickname});
    });
    return usersList;
};

//emit 'newUser' event
exports.registerUser = async(username, nickname, password, socket) =>{
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

        return {token:index.toString(),
                userId:id, 
                username:username, 
                nickname:nickname};
    }
};

//emit 'userChangeNickname' event
exports.setNickname = (token,socket, nickname) =>{
    token = parseInt(token, 10);
    const userId = this.getUserIdFromAuth(token,socket.id);
    if(!userId){return false;}
    const result = UpdateUserNickname(userId,nickname);
    if(result){
        let user = session.get(token);
        user.nickname = nickname;
        session.set(token,user);
        socket.broadcast.emit('userChangeNickname',
                              {userId:id,
                               nickname:nickname});
        return {nickname:user.nickname};
    }
};

exports.logoutUser = (token) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        session.delete(token);
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