let groups = new Map();
let index = 99999;

exports.createGroup = (io, socket, groupName, creatorId, bgColor) =>{
    groups.set(index,{groupName:groupName, creatorId:creatorId, bgColor:bgColor, users:[creatorId,]});
    socket.join('g-' + index.toString());
    return {groupId:index, groupName:groupName, creatorId:creatorId, bgColor:bgColor};
};

exports.joinGroup = (socket, userId, groupId) =>{
    groupId = parseInt(groupId, 10);
    if(groups.has(groupId)){
        let temp = groups.get(groupId);
        temp.users.push(userId);
        socket.join('g-' + groupId.toString());
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