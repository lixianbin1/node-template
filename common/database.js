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

myPool.status = ()=>{
  return {
    size: {
      label:'当前连接数',
      value:myPool.size
    },
    available: {
      label:'空闲连接数',
      value:myPool.available
    },
    borrowed: {
      label:'已借连接数',
      value:myPool.borrowed
    },
    pending: {
      label:'等待连接数',
      value:myPool.pending
    },
    max: {
      label:'最大连接数',
      value:myPool.max
    },
    min: {
      label:'最小连接数',
      value:myPool.min
    },
  }
}

module.exports = myPool;