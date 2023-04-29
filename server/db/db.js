const sqlite3 = require("sqlite3").verbose();
const {open} = require("sqlite")

// open the database
async function openDb () {
  return open({
    filename: './db/app.db',
    driver: sqlite3.Database
  })
}
console.log("Connected to the app database.");
(async () => {

  const db = await openDb();

  console.log("create tables");
  await db.exec( `CREATE TABLE IF NOT EXISTS users (
                  user_id INTEGER PRIMARY KEY,
                  username TEXT NOT NULL  UNIQUE,
                  nickname TEXT NOT NULL,
                  password TEXT NOT NULL)`);
  
  await db.exec( `CREATE TABLE IF NOT EXISTS groups (
                  group_id INTEGER PRIMARY KEY,
                  group_name TEXT NOT NULL,
                  group_owner INTEGER NOT NULL,
                  group_color TEXT NOT NULL,
                  FOREIGN KEY (group_owner)
                    REFERENCES users (user_id) )`);

  await db.exec( `CREATE TABLE IF NOT EXISTS messages (
                  sender_id INTEGER NOT NULL,
                  receiver_id INTEGER NOT NULL,
                  is_direct INTEGER DEFAULT 0 NOT NULL,
                  message TEXT NOT NULL,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (sender_id) 
                    REFERENCES users (user_id) )`);
  
  await db.exec( `CREATE TABLE IF NOT EXISTS join_groups(
                  group_id INTEGER NOT NULL,
                  user_id INTEGER NOT NULL,
                  FOREIGN KEY (group_id)
                    REFERENCES groups (group_id),
                  FOREIGN KEY (user_id)
                    REFERENCES users (user_id) )`);
})();

exports.CreateUser = async(u_name, n_name, pass) => {
  console.log('create user');
  try{
    const db = await openDb();
    const result = await db.run(
          `INSERT INTO users(username,nickname,password) 
            VALUES(?,?,?)`,
          [u_name, n_name, pass]
    );
    return result.lastID;
  }catch(err){console.log(err);}
};

exports.UpdateUserNickname = async(u_id, new_name) => {
  console.log('update nickname');
  try{
    const db = await openDb();
    const result = await db.run(
          `UPDATE users SET nickname = ? 
            WHERE user_id = ?`,
          [new_name, u_id]
    );
    return result.changes;
  }catch(err){console.log(err);}
};

exports.CheckUser = async(username, password) => {
  console.log('chech user');
  try{
    const db = await openDb();
    const result = await db.get(
          `SELECT user_id, username, nickname FROM users 
            WHERE username = ? 
            AND password = ?`,
          [u_name, pass]
    );
    return (result.user_id)? result : false;
  }catch(err){console.log(err);}
};

// exports.getUser = async(user_id) => {
//   console.log('get users');
//   try{
//     const db = await openDb();
//     const result = await db.all(
//             `SELECT * FROM users WHERE user_id = ?`, 
//             [user_id]
//     );
//     return (result.length)? result : false;
//   }catch(err){console.log(err);}
// };

exports.getAllUsers = async() => {
  console.log('get users');
  try{
    const db = await openDb();
    const result = await db.all(
            `SELECT user_id, nickname FROM users`, 
            []
    );
    return result;
  }catch(err){console.log(err);}
};

exports.CreateMessage = async(sender_id, receiver_id, is_direct, message) => {
  console.log('create message');
  is_direct = (is_direct)? 1:0;
  try{
    const db = await openDb();
    const result = await db.run(
              `INSERT INTO messages(sender_id, receiver_id, is_direct, message) 
                VALUES(?,?,?,?)`,
              [sender_id, receiver_id, is_direct, message]
    );
    const tim = await db.get(
              `SELECT timestamp FROM messages WHERE rowid = ?`, 
              [result.lastID]
    )
    return tim.timestamp;
  }catch(err){console.log(err);}
};

exports.GetMessages = async(sender_id, receiver_id, is_direct) => {
  console.log('get messages');
  try{
    const db = await openDb();
    if (is_direct) {
      const result = await db.all(
        `SELECT sender_id, receiver_id, message, timestamp FROM messages
          WHERE (sender_id = ? AND  receiver_id = ? AND  is_direct = 1)
          OR (sender_id = ? AND  receiver_id = ? AND  is_direct = 1)
          ORDER BY timestamp`,
        [sender_id, receiver_id, receiver_id, sender_id]
      );
      return result;
    }else{
      const result = await db.all(
        `SELECT sender_id, receiver_id, message, timestamp 
          FROM messages
          WHERE receiver_id = ? 
          AND  is_direct = 0
          ORDER BY timestamp`,
        [receiver_id]
      );
      return result;
    }
  }catch(err){console.log(err);}
};

exports.GetGroups = async() => {
  console.log('get groups');
  try{
    const db = await openDb();
    const result = await db.all(
          `SELECT group_id,group_name,group_owner,group_color FROM groups`,
          []
    );
    return result;
  }catch(err){console.log(err);}
};

// exports.GetUserInGroup = (group_id) => {
//   db.all(
//     `SELECT user_id
//      FROM join_groups
//      WHERE group_id = ?,
//      INNER JOIN users ON join_rooms.user_id = rooms.user_id`,
//     [group_id],
//     (err, rows) => {
//       return err ? (console.log(err.message), false) : rows;
//     }
//   );
// };

exports.JoinGroup = async(user_id, group_id) => {
  console.log('join group');
  try{
    const db = await openDb();
    const result = await db.run(
          `INSERT INTO join_groups(user_id, group_id) VALUES(?,?)`,
          [user_id, group_id]
    );
    return (result.lastID)? true : false;
  }catch(err){console.log(err);}
};

exports.CreateGroup = async(group_name, group_owner, group_color) => {
  console.log('create group');
  try{
    const db = await openDb();
    const result = await db.run(
          `INSERT INTO groupds (group_name,group_owner,group_color) VALUES(?,?,?)`,
          [group_name, group_owner, group_color]
    );
    return result.lastID;
  }catch(err){console.log(err);}
};

exports.IsUserInGroup = async(group_id,user_id) => {
  console.log('get groups');
  try{
    const db = await openDb();
    const result = await db.all(
          `SELECT * FROM join_groups
            WHERE group_id = ? AND user_id = ?`,
          [group_id,user_id]
    );
    return (result.length>0);
  }catch(err){console.log(err);}
};

exports.UpdateGroupColor = async(group_id, new_color) => {
  console.log('update group color');
  try{
    const db = await openDb();
    const result = await db.run(
          `UPDATE groups SET group_color  = ? 
            WHERE group_id = ?`,
          [new_color, group_id]
    );
    return result.lastID;
  }catch(err){console.log(err);}
};

exports.getJoinedGroups = async(user_id) => {
  console.log('get joined groups');
  try{
    const db = await openDb();
    const result = await db.all(
            `SELECT group_id
              FROM join_groups
              WHERE user_id = ?,
              INNER JOIN groups ON join_rooms.group_id = groups.group_id`,
            [user_id]
    );
    return result;
  }catch(err){console.log(err);}
};