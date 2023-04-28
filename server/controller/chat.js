const {createMessage, GetMessages} = require('../db/db');
const {getUserFromId,getSocktFromUserId} = require('./user');
const {getUserInGroup} = require('./group');


// emit
exports.sendMessage = (io,socket,senderId, receiverId, message, is_direct) =>{
    let timestamp = new Date();
    timestamp = timestamp.toISOString();
    if(is_direct){
        const target = getUserFromId(receiverId);
        const isOnline = getSocktFromUserId(receiverId);
        if(target){
            if(isOnline){
                io.to(target.socketId).emit("directMessage",{senderId:senderId
                                                            ,message:message,
                                                            timestamp:timestamp});
            }
            createMessage(senderId,receiverId,parseInt(is_direct, 10),message);
            return true;
        }
    }else{
        if(checkUserInGroup(receiverId)){
            let mes = {senderId:senderId,groupId:receiverId,message:message,timestamp:timestamp};
            io.in('g-' + receiverId.toString()).emit("groupMessage",mes);
            mes.receiverId = receiverId;
            return true;
        }
    }
};

exports.getMessageHistory = (is_direct, receiverId, senderId) =>{
    
};