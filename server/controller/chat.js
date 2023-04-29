const {CreateMessage, GetMessages, IsUserInGroup} = require('../db/db');
const {getUserFromId,getSocktFromUserId} = require('./user');

// emit
exports.sendMessage = async(io,senderId, receiverId, message, isDirect) =>{
    console.log('sendMessage')
    if(isDirect){
        const target = getUserFromId(receiverId);
        const onSocketId = getSocktFromUserId(receiverId);
        if(target){
            const timestamp = await CreateMessage(senderId,receiverId,isDirect,message);
            if(onSocketId){
                io.to(onSocketId).emit("directMessage",{senderId:senderId,
                                                        message:message,
                                                        timestamp:timestamp});
            }
            return timestamp;
        }
    }else{
        if(IsUserInGroup(receiverId,senderId)){
            io.in('g-' + receiverId.toString()).emit("groupMessage",{senderId:senderId,
                                                                     groupId:receiverId,
                                                                     message:message,
                                                                     timestamp:timestamp});
            const timestamp = await CreateMessage(senderId,receiverId,isDirect,message);
            return timestamp;
        }
    }
};

exports.getMessageHistory = async(isDirect, receiverId, senderId) =>{
    const message = await GetMessages(isDirect,receiverId,senderId);
    if(message){
        console.log("GetMessage ")
        return message;
    }
    console.log("getMessageError");
};