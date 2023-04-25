const sqlite3 = require('sqlite3').verbose();

// open the database
let db = new sqlite3.Database('./app.db', sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log('Connected to the app database.');
});

db.serialize(() => {
  // Queries scheduled here will be serialized.
  db.run(`CREATE TABLE [IF NOT EXISTS] users (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL  UNIQUE,
            nickname TEXT NOT NULL  UNIQUE,
            password TEXT NOT NULL)`)
    .run(`CREATE TABLE [IF NOT EXISTS] rooms (
            room_id INTEGER PRIMARY KEY,
            room_name TEXT NOT NULL  UNIQUE,
            owner_id INTEGER NOT NULL,
            FOREIGN KEY (owner_id)
              REFERENCES users (user_id) 
            )`)
    .run(`CREATE TABLE [IF NOT EXISTS] messages (
            message_id INTEGER PRIMARY KEY,
            sender_id INTEGER NOT NULL,
            FOREIGN KEY (sender_id)
              REFERENCES users (user_id)
            receiver_id INTEGER NOT NULL,
            is_direct INTEGER DEFAULT 0 NOT NULL,
            message TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`)
    .run(`CREATE TABLE [IF NOT EXISTS] join_rooms (
            room_id INTEGER NOT NULL,
            FOREIGN KEY (room_id)
              REFERENCES rooms (room_id)
            user_id INTEGER NOT NULL,
            FOREIGN KEY (room_id)
              REFERENCES rooms (room_id)
            )`)
    ;
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
  db.each(`SELECT user_id FROM users WHERE user_name = ?, password = ?`, [u_name,pass], (err, row) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return row;
  });
  throw "err";
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
  db.all(`SELECT sender_id, message, timestamp 
          FROM message
          WHERE sender_id = ?,
                receiver_id = ?,
                is_direct = ?
          ORDER BY timestamp`, [sender_id,receiver_id,is_direct], (err, rows) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
  });
};

exports.GetRooms = (joined_only,u_id)=>{
  if(joined_only){
    db.all(`SELECT room_id, room_name FROM rooms`, [], (err, rows) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
    });
  }else{
    db.all(`SELECT room_id
            FROM join_rooms
            WHERE user_id = ?,
            INNER JOIN rooms ON join_rooms.room_id = rooms.room_id`, 
            [u_id], (err, rows) => {
    if (err) {
      console.log(err.message);
      return false;
    }
    return rows;
    });
  }
};

exports.GetUserInRooms = (r_id)=>{
  db.all(`SELECT user_id
          FROM join_rooms
          WHERE room_id = ?,
          INNER JOIN users ON join_rooms.user_id = rooms.user_id`, 
          [r_id], (err, rows) => {
  if (err) {
    console.log(err.message);
    return false;
  }
  return rows;
  });
};
