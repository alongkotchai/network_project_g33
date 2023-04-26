const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./db/app.db', (err) => {
  if (err) {
    console.log(err, 'start database fail');
    return;
  }
  console.log('Connected to the app database.');
});

db.serialize(() => {
  console.log('create tables');
  // Queries scheduled here will be serialized.
  db.run(`CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL  UNIQUE,
            nickname TEXT NOT NULL,
            password TEXT NOT NULL)`)
    .run(`CREATE TABLE IF NOT EXISTS groups (
            group_id INTEGER PRIMARY KEY,
            group_name TEXT NOT NULL,
            group_owner INTEGER NOT NULL,
            group_color TEXT NOT NULL,
            FOREIGN KEY (group_owner)
              REFERENCES users (user_id) 
            )`)
    .run(`CREATE TABLE IF NOT EXISTS messages (
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            is_direct INTEGER DEFAULT 0 NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users (user_id)
            )`)
    .run(`CREATE TABLE IF NOT EXISTS join_groups(
            group_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (group_id)
              REFERENCES groups (group_id),
            FOREIGN KEY (user_id)
              REFERENCES users (user_id)
            )`);
})

// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });

exports.CreateUser = (u_name,n_name, pass)=>{
  db.run(`INSERT INTO users(username,nickname,password) VALUES(?)`, [u_name,n_name,pass], function(err) {
    if (err) {
      console.log(err.message);
      return false;
    }
    return this.lastID;
  });
};

exports.UpdateUserNickname = (u_id,new_name,)=>{
  db.run(`UPDATE users SET nickname = ? WHERE user_id = ?`, [new_name,u_id], function(err) {
    if (err) {
      console.log(err.message);
      return false;
    }
    return true;
  });
};

exports.CheckUser = (u_name, pass)=>{
  db.each(`SELECT user_id FROM users WHERE user_name = ? AND password = ?`, [u_name,pass], (err, row) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return row;
  });
};

exports.getAllUsers = ()=> {
  db.all(`SELECT user_id, nickname FROM users`, [], (err, rows) =>{
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
  });
};

exports.CreateMessage = (sender_id,receiver_id,is_direct, message)=>{
  db.run(`INSERT INTO messages(sender_id, receiver_id, is_direct, message) VALUES(?)`, [sender_id,receiver_id,is_direct,message], function(err) {
    if (err) {
      console.log(err.message);
      return false;
    }
    return true;
  });
};

exports.GetMessages = (sender_id,receiver_id,is_direct)=>{
  if(is_direct){
    is_direct = parseInt(is_direct, 10);
    db.all(`SELECT sender_id, receiver_id, message, timestamp 
          FROM messages
          WHERE (sender_id = ? AND  receiver_id = ? AND  is_direct = ?)
          OR (sender_id = ? AND  receiver_id = ? AND  is_direct = ?)
          ORDER BY timestamp`, [sender_id,receiver_id,is_direct,
                        receiver_id,sender_id,is_direct], (err, rows) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
    });
  }else{
    is_direct = parseInt(is_direct, 10);
    db.all(`SELECT sender_id, receiver_id, message, timestamp 
          FROM messages
          WHERE receiver_id = ? 
          AND  is_direct = ?
          ORDER BY timestamp`, [receiver_id,is_direct], (err, rows) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
    });
  }
  
};

exports.GetGroups = ()=>{
  db.all(`SELECT group_id, group_name, group_owner, group_color FROM groups`, [], (err, rows) => {
  if (err) {
    console.log(err.message);
    return false;
  }
  return rows;
  });
};

exports.GetUserInGroup = (group_id)=>{
  db.all(`SELECT user_id
          FROM join_groups
          WHERE group_id = ?,
          INNER JOIN users ON join_rooms.user_id = rooms.user_id`, 
          [group_id], (err, rows) => {
  if (err) {
    console.log(err.message);
    return false;
  }
  return rows;
  });
};

exports.JoinGroup = (user_id,group_id)=>{
  db.all(`INSERT INTO join_groups(user_id, group_id) VALUES(?)`, 
          [user_id,group_id], (err, rows) => {
  if (err) {
    console.log(err.message);
    return false;
  }
  return true;
  });
};
