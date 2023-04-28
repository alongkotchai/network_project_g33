const sqlite3 = require("sqlite3").verbose();

// open the database
let db = new sqlite3.Database("./db/app.db", (err) => {
  if (err) {
    console.log(err, "start database fail");
    return;
  }
  console.log("Connected to the app database.");
});

db.serialize(() => {
  console.log("create tables");
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
});

// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });

exports.CreateUser = (u_name, n_name, pass) => {
  db.run(
    `INSERT INTO users(username,nickname,password) 
          VALUES(?,?,?)`,
    [u_name, n_name, pass],
    (err) =>{
      return err?(console.log(err.message),false):this.lastID;
    }
  );
};

exports.UpdateUserNickname = (u_id, new_name) => {
  db.run(
    `UPDATE users SET nickname = ? 
          WHERE user_id = ?`,
    [new_name, u_id],
    (err) =>{
      return err?(console.log(err.message),false):true;
    }
  );
};

exports.CheckUser = (u_name, pass) => {
  db.each(
    `SELECT user_id FROM users 
           WHERE username = ? 
           AND password = ?`,
    [u_name, pass],
    (err, row) => {
      return err?(console.log(err.message),false):row;
    }
  );
};

exports.getUser = (user_id) => {
  db.each(`SELECT FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    return err?(console.log(err.message),false):rows;
  });
};

exports.getAllUsers = () => {
  db.all(`SELECT user_id, nickname FROM users`, [], (err, rows) => {
    return err?(console.log(err.message),false):rows;
  });
};

exports.CreateMessage = (sender_id, receiver_id, is_direct, message) => {
  is_direct = (is_direct)? 1:0;
  db.run(
    `INSERT INTO messages(sender_id, receiver_id, is_direct, message) 
          VALUES(?,?,?,?)`,
    [sender_id, receiver_id, is_direct, message],
    function (err) {
      return err?(console.log(err.message),false):true;
    }
  );
};

exports.GetMessages = (sender_id, receiver_id, is_direct) => {
  if (is_direct) {
    is_direct = 1;
    db.all(
      `SELECT sender_id, receiver_id, message, timestamp 
       FROM messages
       WHERE (sender_id = ? AND  receiver_id = ? AND  is_direct = ?)
       OR (sender_id = ? AND  receiver_id = ? AND  is_direct = ?)
       ORDER BY timestamp`,
      [sender_id, receiver_id, is_direct, receiver_id, sender_id, is_direct],
      (err, rows) => {
        return err?(console.log(err.message),false):rows;}
    );
  } else {
    is_direct = 0;
    db.all(
      `SELECT sender_id, receiver_id, message, timestamp 
       FROM messages
       WHERE receiver_id = ? 
       AND  is_direct = ?
       ORDER BY timestamp`,
      [receiver_id, is_direct],
      (err, rows) => {
        return err ? (console.log(err.message), false) : rows;
      }
    );
  }
};

exports.GetGroups = () => {
  db.all(
    `SELECT group_id,group_name,group_owner,group_color FROM groups`,
    [],
    (err, rows) => {
      return err ? (console.log(err.message), false) : rows;
    }
  );
};

exports.GetUserInGroup = (group_id) => {
  db.all(
    `SELECT user_id
     FROM join_groups
     WHERE group_id = ?,
     INNER JOIN users ON join_rooms.user_id = rooms.user_id`,
    [group_id],
    (err, rows) => {
      return err ? (console.log(err.message), false) : rows;
    }
  );
};

exports.JoinGroup = (user_id, group_id) => {
  db.run(
    `INSERT INTO join_groups(user_id, group_id) VALUES(?,?)`,
    [user_id, group_id],
    (err) => {
      return err ? (console.log(err.message), false) : true;
    }
  );
};

exports.CreateGroup = (group_name, group_owner, group_color) => {
  db.run(
    `INSERT INTO groupds (group_name,group_owner,group_color) VALUES(?,?,?)`,
    [group_name, group_owner, group_color],
    (err) => {
      return err ? (console.log(err.message), false) : this.lastID;
    }
  );
};

exports.IsUserInGroup =(group_id,user_id)=>{
  db.each(
    `SELECT *
     FROM join_rooms
     WHERE group_id = ? AND user_id = ?`,
    [group_id,user_id],
    (err,row) => {
      return (err|| !row) ? (console.log(err.message), false) : true;
    }
  );

exports.UpdateGroupColor = (group_id, new_color) => {
    db.run(
      `UPDATE groups SET group_color  = ? 
            WHERE group_id = ?`,
      [new_color, group_id],
      (err) =>{
        return err?(console.log(err.message),false):true;
      }
    );
  };

};