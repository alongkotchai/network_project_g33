const {
  GetGroups,
  GetUserInGroup,
  JoinGroup,
  CreateGroup,
} = require("../db/db");

//emit
exports.createGroup = (io, groupName, groupOwnerId, bgColor) => {
  const groupId = CreateGroup(groupName, groupOwnerId, bgColor);
  if (!groupId) {
    return false;
  }

  let obj = {
    groupId: groupId, //groupId
    creatorId: groupOwnerId, //userId
    color: bgColor, //#ffffff format
  };
  io.emit("newGroup", obj);
  return true;
};

exports.joinGroup = (userId, groupId) => {
  const isJoin = JoinGroup(userId, groupId);
  return isJoin == True ? true : false;
};

exports.getGroups = () => {
  const groups = GetGroups();
  return groups != false ? groups : false;
};

exports.getUserInGroup = (groupId) => {
  const users = GetUserInGroup(groupId);
  return users != false ? users : (console.log("getUserInGroupError"), false);
};

exports.changeGroupColor = (userID,groupId,newColor)=>{};