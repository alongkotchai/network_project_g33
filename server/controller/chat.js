const {createMessage} = require('../db/db');
const {getUserFromId} = require('./user');

let messages = Array();

exports.sendMessage = (io, senderId, receiverId, message, is_direct) =>{
    if(is_direct){
        const target = getUserFromId(receiverId);
        if(target){
            let timestamp = new Date();
            timestamp = timestamp.toISOString();
            let mes = {senderId:senderId,message:message,timestamp:timestamp};
            io.to(target.socketId).emit("receiveMessage",mes);
            mes.receiverId = receiverId;
            messages.push(mes);
            return true;
        }
    }else{
        return true;
    }
};

exports.getMessageHistory = (is_direct, receiverId, senderId) =>{
    if(is_direct){
        return messages;
    }else{
        return messages;
    }
};