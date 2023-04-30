const {GetGroups,JoinGroup,CreateGroup,IsUserInGroup, UpdateGroupColor} = require("../db/db");

//emit
exports.createGroup = async(socket, groupName, groupOwnerId, bgColor) => {
  const groupId = await CreateGroup(groupName, groupOwnerId, bgColor);
  if (!groupId) {
    return false;
  }
  const joined = await this.joinGroup(socket,groupOwnerId,groupId);
  const group = { groupId: groupId, //groupId
                groupName: groupName,
                creatorId: groupOwnerId, //userId
                color: bgColor, //#ffffff format
                isJoined:joined
              }
  socket.broadcast.emit("newGroup", group);
  
  return group;
};

exports.joinGroup = async(socket, userId, groupId) => {
  if(await IsUserInGroup(groupId,userId)){return false;}
  const isJoin = await JoinGroup(userId, groupId);
  if(!isJoin){return false;}
  socket.join("g:"+groupId.toString());
  return true;
};

exports.getGroups = async(userId) => {
  let groupList = Array();
  const groups = await GetGroups();
  if(!groups){return false;}
  for(const g of groups){
    groupList.push({groupId:g.group_id,
                    groupName:g.group_name,
                    creatorId:g.group_owner,
                    color:g.group_color,
                    isJoined: await IsUserInGroup(g.group_id,userId)});
  }
  return groupList;
};

// exports.getUserInGroup = (groupId) => {
//   const users = GetUserInGroup(groupId);
//   return users != false ? users : (console.log("getUserInGroupError"), false);
// };

//emit
exports.changeGroupColor = async(io,userID,groupId,newColor)=>{
    if(await IsUserInGroup(groupId,userID)){
        if(await UpdateGroupColor(groupId,newColor)){
            io.to("g:"+groupId.toString()).
                  emit("groupChangeColor",{groupId:groupId,
                                           color:newColor});
            return true;
        }
    }
};