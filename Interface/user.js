const express = require('express');
const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');

exports.userCreatePost = async(req,res)=>{
  logger.info('请求api/user/create接口')
  try{
    const { Username,Password,Email } = req.body;
    if(!Email){
      return res.status(400).send({ status:"400",message: '未填写邮箱' });
    }
    if(!Password){
      return res.status(400).send({ status:"400",message: '未填写密码' });
    }
    const db = await myPool.acquire()
    db.get('SELECT Email FROM users WHERE Email = ?',[Email],async(err,row)=>{
      if(err){
        logger.error(err)
        res.status(500).send({status:"500",message:'数据库查询出错'});
      }else if(row){
        res.status(409).send({status:"409",message:'该邮箱已注册用户'})
      }else{
        const UserID = uuidv4()
        const enPassword = await bcrypt.hash(Password, 12);
        const stmt = db.prepare('INSERT INTO users (UserID, Username, Password, Email) VALUES (?, ?, ? ,?)');
        stmt.run(UserID, Username, enPassword, Email , (err) => {
          if (err) {
            logger.error(err)
            res.status(500).send({status:"500",message:'创建账号失败'}); 
          } else {
            res.status(200).send({ UserID, Username,status:"200",message: '账号创建成功' });
          }
        })
      }
    })
  }catch(err){
    logger.error(err)
    console.error('Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}

exports.userloginPost = async(req,res)=>{
  try{
    const SECRET_KEY = process.env.SECRET_KEY;
    const Expiration = process.env.Expiration
    const { Email, Password } = req.body;
    const db = await myPool.acquire()
    if(!Email || !Password){
      return res.status(403).send({status:"403",message:'邮箱或密码错误'});
    }
    db.get('SELECT * FROM users WHERE Email = ?', [Email], (err, user) => {
      if (err) {
        logger.error(err)
        res.status(500).send({status:"500",message:'数据库查询出错'});
      }
      console.log(Password, user.Password)
      if (!user || !bcrypt.compareSync(Password, user.Password)) {
        return res.status(403).send({status:"403",message:'邮箱或密码错误'});
      }
      const token = jwt.sign({ id: user.UserID, name:user.UserName }, SECRET_KEY, { expiresIn: Expiration }); // token有效期
      res.send({status:"200",token,message:"登录成功"});
    });
  }catch(err){
    logger.error(err)
    console.error('Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}

exports.userInfoGet= async(req,res)=>{
  try{
    const db = await myPool.acquire()
    var { UserID } = req.query;
    if(!UserID){
      UserID = req.user.id
    }
    console.log(UserID)
    db.get('SELECT * FROM users WHERE UserID = ?', [UserID], (err, user) => {
      if (err) {
        logger.error(err)
        res.status(500).send({status:"500",message:'数据库查询出错'});
      }
      if(!user){
        res.status(404).send({status:"404",message:'未查找到该用户信息'})
      }
      delete user.Password
      res.send({status:"200",dada:user,message:"成功"});
    });
  }catch(err){
    logger.error(err)
    console.error('Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}
