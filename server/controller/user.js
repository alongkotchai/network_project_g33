const {CreateUser, CheckUser, getAllUsers, UpdateUserNickname} = require('../db/db');

let session = new Map();
session.set(1,{username:"test1",nickname:"test1",socketId:"0"});
let index = 10000;

exports.getUserFromId = (userId)=>{
    userId = parseInt(userId, 10);
    if(session.has(userId)){
        return session.get(userId);
    }
};

exports.authToken = (token, socketId) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        let temp = session.get(token);
        temp.socketId = socketId;
        session.set(token,temp);
        return {token:token, username:temp.username, nickname:temp.nickname};
    }
};

exports.checkAuth = (token, socketId)=>{
    token = parseInt(token, 10);
    if(session.has(token)){
        const temp = session.get(token);
        if(temp.socketId == socketId){
            return token; // user id
        }
    }
}

exports.authUser = (username, password, socketId) =>{
    if(username && password){
        index += 1;
        session.set(index,{username:username,nickname:username,socketId:socketId});
        const temp = session.get(index);
        return {token:index.toString(), username:temp.username, userId:0, nickname:temp.nickname};
    }
};

exports.getAllUsers = () =>{
    let users = Array();
    for (let user of session.values()) {
        users.push({nickname:user.nickname, socketId:socketId});
      }
    return users;
};

exports.registerUser = (username, password, nickname, socketId) =>{
    if(username && password){
        index += 1;
        session.set(index,{username:username,nickname:nickname,socketId:socketId});
        return {token:index.toString(),userId:0, username:username, nickname:nickname};
    }
};

exports.setNickname = (token, nickname) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        let temp = session.get(token);
        temp.nickname = nickname;
        session.set(token,temp);
        return {nickname:temp.nickname};
    }
};

exports.logoutUser = (token) =>{
    token = parseInt(token, 10);
    if(session.has(token)){
        session.delete(token);
        return true;
    }
};