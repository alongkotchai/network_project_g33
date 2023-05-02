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
            const timestamp = await CreateMessage(senderId,receiverId,isDirect,message);
            io.in('g:' + receiverId.toString()).emit("groupMessage",{senderId:senderId,
                                                                     groupId:receiverId,
                                                                     message:message,
                                                                     timestamp:timestamp});
            return timestamp;
        }
    }
};

exports.getMessageHistory = async(isDirect, receiverId, senderId) =>{
    console.log("GetMessage")
    let messageList = Array();
    const messages = await GetMessages(isDirect,receiverId,senderId);
    if(!messages){return false;}
    for(const m of messages){
        messageList.push({senderId:m.sender_id,
                          receiverId:m.receiver_id,
                          message:m.message,
                          timestamp:m.timestamp});
    }
  return messageList;
};

exports.sendIsTyping = async(io,senderId, receiverId, typing, isDirect) => {
    if(isDirect){
        const target = getUserFromId(receiverId);
        const onSocketId = getSocktFromUserId(receiverId);
        if(target){
            if(onSocketId){
                io.to(onSocketId).emit("isTyping",{senderId:senderId, typing:typing});
            }
            return true;
        }
    }else{
        if(IsUserInGroup(receiverId,senderId)){
            io.in('g:' + receiverId.toString()).emit("isTypingGroup",{senderId:senderId,groupId:receiverId, typing:typing});
            return true;
        }
    }
}