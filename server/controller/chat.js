// const {createMessage, GetMessages} = require('../db/db');
const {getUserFromId} = require('./user');
const {getGroupFromId} = require('./group');

//not use
let messages = Array();

exports.sendMessage = (senderId, receiverId, message, is_direct) =>{
    if(is_direct){
        const target = getUserFromId(receiverId);
        if(target){
            let timestamp = new Date();
            timestamp = timestamp.toISOString();
            let mes = {senderId:senderId,message:message,timestamp:timestamp};
            io.to(target.socketId).emit("directMessage",mes);
            // createMessage(senderId,receiverId,parseInt(is_direct, 10),message);
            mes.receiverId = receiverId;
            messages.push(mes);
            return true;
        }
    }else{
        const targetId = getGroupFromId(receiverId);
        if(targetId){
            let timestamp = new Date();
            timestamp = timestamp.toISOString();
            let mes = {senderId:senderId,groupId:targetId,message:message,timestamp:timestamp};
            io.in('g-' + targetId).emit("groupMessage",mes);
            mes.receiverId = receiverId;
            messages.push(mes);
            return true;
        }
    }
};

exports.getMessageHistory = (is_direct, receiverId, senderId) =>{
    if(is_direct){
        return messages;
    }else{
        return messages;
    }
};