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
  logger.info('请求api/user/create接口')
  try{
    let { UserName,Password,Email } = req.body;
    if(!Email){
      return res.status(400).send({ status:"400",message: '未填写邮箱' });
    }
    if(!Password){
      Password = process.env.DEFAULT_PASSWORD;
    }
    const Timestamp = new Date().toLocaleString('zh-CN')
    const db = await myPool.acquire()
    try{
      db.get('SELECT Email FROM users WHERE Email = ?',[Email],async(err,row)=>{
        if(err){
          logger.error('userCreatePost Error:' + err)
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }else if(row){
          res.status(409).send({status:"409",message:'该邮箱已注册用户'})
        }else{
          const UserID = uuidv4()
          const enPassword = await bcrypt.hash(Password, 12);
          const stmt = db.prepare('INSERT INTO users (UserID, UserName, Password, Email,CreateTime) VALUES (?, ?, ? ,?,?)');
          stmt.run(UserID, UserName, enPassword, Email ,Timestamp, (err) => {
            if (err) {
              logger.error('userCreatePost Error:' + err)
              logger.error(req.body)
              res.status(500).send({status:"500",message:'创建账号失败'}); 
            } else {
              res.status(200).send({ UserID, UserName,status:"200",message: '账号创建成功' });
            }
          })
        }
      })
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userCreatePost Error:' + err)
    console.error('userCreatePost Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}

//用户登录
exports.userloginPost = async(req,res)=>{
  try{
    const SECRET_KEY = process.env.SECRET_KEY;
    const Expiration = process.env.Expiration
    const { Email, Password } = req.body;
    if(!Email || !Password){
      return res.status(403).send({status:"403",message:'邮箱或密码错误'});
    }
    const db = await myPool.acquire()
    try{
      db.get('SELECT * FROM users WHERE Email = ?', [Email], (err, user) => {
        if (err) {
          logger.error('userloginPost Error:' + err)
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }
        if (!user || !bcrypt.compareSync(Password, user.Password)) {
          return res.status(403).send({status:"403",message:'邮箱或密码错误'});
        }
        const token = jwt.sign({ id: user.UserID, name:user.UserName }, SECRET_KEY, { expiresIn: Expiration }); //token有效期
        res.send({status:"200",token,message:"登录成功"});
      });
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
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
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }else{
          res.send({status:"200",message:"退出成功"});
        }
      })
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userExitget Error:' + err)
    console.error('userExitget Error:' , err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}

//用户信息
exports.userInfoGet= async(req,res)=>{
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
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }
        if(!user){
          res.status(404).send({status:"404",message:'未查找到该用户信息'})
        }
        delete user.Password
        res.send({status:"200",data:user,message:"成功"});
      });
    }finally{
      myPool.release(db); //释放连接 
    }
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}

//用户列表
exports.userListGet = async(req,res)=>{
  try{
    var { current,pageSize } = req.query;
    if(!current || Number(current)==NaN){
      current = 1 //当前页
    }
    if(!pageSize || Number(pageSize)==NaN){
      pageSize = 10 //分页数
    }
    const offSize = (current - 1) * pageSize;
    const db = await myPool.acquire()
    try{
      db.all(`SELECT * FROM users LIMIT ? OFFSET ?`, [pageSize, offSize], (err, rows) => {  
        if (err) {  
          logger.error('userloginPost Error:' + err)
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }
        rows.forEach(data=>{
          delete data.Password
        })
        logger.debug(rows)
        res.send({
          status:"200",
          data:rows,
          current,
          pageSize,
          message:"成功"
        });
      });
    }finally{
      myPool.release(db);
    }
  }catch(err){
    logger.error('userloginPost Error:' + err)
    console.error('userloginPost Error:' , err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}
