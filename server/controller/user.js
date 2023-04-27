const {CreateUser, CheckUser,getUser, getAllUsers, UpdateUserNickname} = require('../db/db');

let session = new Map();
session.set(1,{userId:1, username:"test1",nickname:"test1",socketId:"0"});
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
    users.forEach(user => {
        usersList.push({userId:user.user_id,nickname:user.nickname});
    });
    return usersList;
};

exports.registerUser = (username, nickname, password, socketId) =>{
    const id = CreateUser(username,nickname,password);
    if(id){
        index += 1;
        session.set(index,{userId:id,
                           username:username,
                           nickname:nickname,
                           socketId:socketId});

        return {token:index.toString(),
                userId:id, 
                username:username, 
                nickname:nickname};
    }
};

exports.setNickname = (token,socketId, nickname) =>{
    token = parseInt(token, 10);
    const userId = this.getUserIdFromAuth(token,socketId);
    if(!userId){return false;}
    const result = UpdateUserNickname(userId,nickname);
    if(result){
        let user = session.get(token);
        user.nickname = nickname;
        session.set(token,user);
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