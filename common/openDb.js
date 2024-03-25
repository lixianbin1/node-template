const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const dbPath = '../database.db';
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) {
//       console.error(err.message);
//     } else {
//       console.log('已连接到数据库:', dbPath);
//     }
//   });

// 创建一个可以重用的数据库连接池
async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

module.exports = { openDb };