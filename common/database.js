const sqlite3 = require('sqlite3').verbose();
const genericPool = require('generic-pool');
const factory = {
  create: function() {
    return new Promise(function(resolve, reject) {
      let db = new sqlite3.Database('./SQLite.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  },
  destroy: function(db) {
    return new Promise(function(resolve) {
      db.close();
      resolve();
    });
  }
};

const opts = {
  max: 10, // 最大连接数
  min: 2  // 最小连接数
};

const myPool = genericPool.createPool(factory, opts);

module.exports = myPool;