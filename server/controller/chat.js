const {CreateMessage, GetMessages, IsUserInGroup} = require('../db/db');
const {getUserFromId,getSocktFromUserId} = require('./user');

// emit
exports.sendMessage = (io,senderId, receiverId, message, isDirect) =>{
    let timestamp = new Date();
    timestamp = timestamp.toISOString();
    if(isDirect){
        const target = getUserFromId(receiverId);
        const onSocketId = getSocktFromUserId(receiverId);
        if(target){
            if(onSocketId){
                io.to(onSocketId).emit("directMessage",{senderId:senderId,
                                                        message:message,
                                                        timestamp:timestamp});
            }
            CreateMessage(senderId,receiverId,isDirect,message);
            return true;
        }
    }else{
        if(IsUserInGroup(receiverId,senderId)){
            io.in('g-' + receiverId.toString()).emit("groupMessage",{senderId:senderId,
                                                                     groupId:receiverId,
                                                                     message:message,
                                                                     timestamp:timestamp});
            CreateMessage(senderId,receiverId,isDirect,message);
            return true;
        }
    }
};

exports.getMessageHistory = (isDirect, receiverId, senderId) =>{
    const message = GetMessages(isDirect,receiverId,senderId);
    if(message){
        console.log("Get Message ")
        return message
    }
    console.log("getMessageError");
};