// const {GetRooms, GetUserInRooms} = require('../db/db');

//not use
let groups = new Map();
let index = 99999;

exports.createGroup = (socket, groupName, creatorId, bgColor) =>{
    groups.set(index,{groupName:groupName, creatorId:creatorId, bgColor:bgColor, users:[creatorId,]});
    return {groupId:index, groupName:groupName, creatorId:creatorId, bgColor:bgColor};
};

exports.joinGroup = (userId, groupId) =>{
    groupId = parseInt(groupId, 10);
    if(groups.has(groupId)){
        let temp = groups.get(groupId);
        temp.users.push(userId);
        return true;
    }
};

exports.getGroups = () =>{
    return groups;
};

exports.getGroupFromId = (groupId) =>{
    groupId = parseInt(groupId, 10);
    if(groups.has(groupId)){
        return groupId.toString();
    }
}