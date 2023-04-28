const {GetGroups,JoinGroup,CreateGroup,IsUserInGroup, UpdateGroupColor} = require("../db/db");

//emit
exports.createGroup = (socket, groupName, groupOwnerId, bgColor) => {
  const groupId = CreateGroup(groupName, groupOwnerId, bgColor);
  if (!groupId) {
    return false;
  }
  const group = { groupId: groupId, //groupId
                groupName: groupName,
                creatorId: groupOwnerId, //userId
                color: bgColor //#ffffff format
              }
  socket.broadcast.emit("newGroup", group);
  socket.join("g-"+groupId.toString());
  return group;
};

exports.joinGroup = (socket, userId, groupId) => {
  if(IsUserInGroup(groupId,userId)){return false;}
  const isJoin = JoinGroup(userId, groupId);
  if(!isJoin){return false;}
  socket.join("g-"+groupId.toString());
  return true;
};

exports.getGroups = (userId) => {
  let groupList = Array();
  const groups = GetGroups();
  if(!groups){return false;}
  groups.forEach(g => {
    groupList.push({groupId:g.group_id,
                    groupName:g.group_name,
                    creatorId:g.group_owner,
                    color:group_color,
                    isJoined:IsUserInGroup(g.group_id,userId)});
  });
  return groupList;
};

// exports.getUserInGroup = (groupId) => {
//   const users = GetUserInGroup(groupId);
//   return users != false ? users : (console.log("getUserInGroupError"), false);
// };

//emit
exports.changeGroupColor = (io,userID,groupId,newColor)=>{
    if(IsUserInGroup(groupId,userID)){
        if(UpdateGroupColor(groupId,newColor)){
            io.emit("groupChangeColor",{groupId:groupId,
                                        color:newColor});
            return true;
        }
    }
};