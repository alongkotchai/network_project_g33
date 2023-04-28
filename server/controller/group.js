const { GetGroups, GetUserInGroup,JoinGroup } = require("../db/db");

//emit
exports.createGroup = (socket, groupName, creatorId, bgColor) => {

    
};

exports.joinGroup = (userId, groupId) => {
    const isJoin = JoinGroup(userId, groupId);
  return isJoin == True ?true : false;
};

exports.getGroups = () => {
  const groups = GetGroups();
  return groups != false ? groups : false;
};

exports.getUserInGroup = (groupId) => {
  const users = GetUserInGroup(groupId);
  return users != false ? users : (console.log("getUserInGroupError"), false);
};
