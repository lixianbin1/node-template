// const express = require('express');
// const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');

//创建用户
exports.userCreatePost = async(req,res)=>{
  const user = req.user.name;
  const time = new Date().toLocaleString();
  console.log(`${time}'：${user} 创建用户：/api/user/create`);
  logger.info(`${time}'：${user} 创建用户：/api/user/create `);
  const db = await myPool.acquire();
  try{
    let { UserName,Password,Email,RoleID } = req.body;
    if(!Email){
      return res.status(400).send({ code:"400",message: '未填写邮箱' });
    }
    if(!Password){
      Password = process.env.DEFAULT_PASSWORD;
    }

    //检测邮箱是否被占用
    const emailRun = await new Promise((resolve, reject) => {
      db.get('SELECT Email FROM users WHERE Email = ?', [Email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row !== undefined);
        }
      });
    });
    if(emailRun){
      return res.send({ code:"409",message: '该邮箱已注册用户' });
    }

    //创建用户
    const enPassword = await bcrypt.hash(Password, 12);
    const Insert = await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (UserName, Password, Email,CreateTime) VALUES (?, ? ,?,?)', [UserName, enPassword, Email ,time], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    //查询用户ID
    const userID = await new Promise((resolve, reject) => {
      db.get('SELECT UserID FROM users WHERE Email = ?', [Email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.UserID);
        }
      });
    });

    //关联表
    RoleID.forEach(async(item)=>{
      const toUserRoles = await new Promise((resolve, reject) => {
        db.run('INSERT INTO UserRoles (UserID, RoleID) VALUES (?,?)', [userID, item], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    })

    res.send({ code:"200",message: '创建账号成功' });

  }catch(err){
    console.log(`${time}'：${user} 创建角色 Error`, err);
    logger.error(`${time}'：${user} 创建角色 Error`, err);
    res.send({code:500,message:'请求失败'});
  }
  myPool.release(db); //释放连接 
}

//用户登录
exports.userloginPost = async(req,res)=>{
  try{
    const SECRET_KEY = process.env.SECRET_KEY;
    const Expiration = process.env.Expiration
    const { Email, Password } = req.body;
    if(!Email || !Password){
      return res.status(403).send({code:"403",message:'邮箱或密码错误'});
    }
    const db = await myPool.acquire()
    try{
      db.get('SELECT * FROM users WHERE Email = ?', [Email], (err, user) => {
        if (err) {
          logger.error('userloginPost Error:' + err)
          res.status(500).send({code:500,message:'数据库查询出错'});
        }
        if (!user || !bcrypt.compareSync(Password, user.Password)) {
          return res.status(403).send({code:"403",message:'邮箱或密码错误'});
        }
        const token = jwt.sign({ id: user.UserID, name:user.UserName }, SECRET_KEY, { expiresIn: Expiration }); //token有效期
        res.send({code:200,token,message:"登录成功"});
      });
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({code:500,message:'无法获取数据库连接'});
  }
}

//用户退出
exports.userExitget = async(req,res)=>{
  try{
    let UserID = req.user.id
    let Token = req.headers.authorization.split(' ')[1];
    let Expiration = new Date(req.user.exp * 1000).toLocaleString('zh-CN')
    const db = await myPool.acquire()
    try{
      const stmt = db.prepare('INSERT INTO LoseToken (UserID, Token, Expiration) VALUES (?, ?, ?)');
      stmt.run(UserID, Token, Expiration, (err) => {
        if (err) {
          logger.error('userExitget Error:' + err)
          res.status(500).send({code:500,message:'数据库查询出错'});
        }else{
          res.send({code:200,message:"退出成功"});
        }
      })
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userExitget Error:' + err)
    console.error('userExitget Error:' , err);
    res.status(500).send({code:500,message:'无法获取数据库连接'});
  }
}

//用户信息
exports.userInfoGet= async(req,res)=>{
  console.log('请求api/user/info接口')
  try{
    const db = await myPool.acquire()
    var { UserID } = req.query;
    if(!UserID){
      UserID = req.user.id
    }
    try{
      db.get('SELECT * FROM users WHERE UserID = ?', [UserID], (err, user) => {
        if (err) {
          logger.error('userloginPost Error:' + err)
          res.status(500).send({code:500,message:'数据库查询出错'});
        }
        if(!user){
          res.status(404).send({code:"404",message:'未查找到该用户信息'})
        }
        delete user.Password
        res.send({code:200,data:user,message:"成功"});
      });
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({code:500,message:'无法获取数据库连接'});
  }
}

//用户列表
exports.userListGet = async(req,res)=>{
  const user = req.user.name;
  const time = new Date().toLocaleString();
  console.log(`${time}'：${user} 用户列表：/api/user/list`);
  logger.info(`${time}'：${user} 用户列表：/api/user/list `);
  const db = await myPool.acquire();
  try{
    const current = parseInt(req.query.current, 10);
    const pageSize = parseInt(req.query.pageSize, 10);

    //获取总数
    const totalsql = `SELECT COUNT(*) AS total FROM Users`;
    const total = await new Promise((resolve, reject) => {
      db.get(totalsql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total);
        }
      })
    })

    //查询用户
    const offset = (current - 1) * pageSize;
    const querySql = `
      SELECT 
        u.UserID,
        u.UserName,
        u.Email,
        (SELECT GROUP_CONCAT(r.RoleName, ', ') 
         FROM UserRoles ur 
         JOIN Roles r ON ur.RoleID = r.RoleID 
         WHERE ur.UserID = u.UserID) AS Roles
      FROM 
        Users u
      LIMIT ? OFFSET ?;
    `;
    const users = await new Promise((resolve, reject) => {
      db.all(querySql, [pageSize, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      })
    })
    res.send({
      code: 200,
      data: users,
      total,
      current,
      pageSize,
      message: "成功"
    });
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({code:500,message:'无法获取数据库连接'});
  }
  myPool.release(db);
}

//删除用户
exports.userDelete = async(req, res)=>{
  try{
    const db = await myPool.acquire();
    db.run('DELETE FROM Users WHERE UserID = ?', [req.body.UserID],(err, result)=>{
      console.log(result)
      if (err) {
        res.send({ code: 500, message: '请求失败，请联系管理员' });
      } else {
        res.send({ code: 200, message: '删除成功' });
      }
    })
  }catch(err){
    console.log(err)
    res.send({ code: 500, message: '请求失败，请联系管理员' });
  }
}

//更新用户
exports.userUpdata = async(req, res)=>{
  try{
    let { UserID,UserName,Email,Status,RoleID } = req.body;
    const sql = 'update Users set UserName=?,Email=?,Status=? where UserID=?'
    const params = [UserName,Email, role, Status, UserID]
    db.run(sql, params, (err, result) => {
      if (err) {
        res.send({ code: 500, message: '请求失败，请联系管理员' });
      }
      db.run('delete from UserRoles where UserID=?',[UserID])
      RoleID.forEach(async (item) => {
        await db.run('insert into UserRoles(UserID,RoleID) values(?,?)',[UserID,item])
      })
      res.send({ code: 200, message: '更新成功' });
    })
  }catch(err) { 
    res.send({ code: 500, message: '请求失败，请联系管理员' });
  }
}
