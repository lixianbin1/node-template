const express = require('express');
const router = express.Router();
const { openDb } = require('../common/openDb');

// 新数据库文件的路径
// const dbPath = '../database.db';

// 创建一个新的数据库实例，如果数据库文件不存在，它将被创建
// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log('已连接到数据库:', dbPath);
//   }
// });

// // 关闭数据库连接
// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
// });

router.get('/login',async (req,res)=>{
  const db = await openDb();
  const { email, password } = req.body;
  // 在实际应用中，您应该对密码进行加密处理
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) {
      res.status(500).send('数据库查询出错');
      return;
    }
    if (user) {
      // 登录成功，返回用户信息（不要返回密码）
      delete user.password;
      res.json(user);
    } else {
      // 登录失败，返回错误信息
      res.status(401).send('邮箱或密码不正确');
    }
  });
})

module.exports = router;