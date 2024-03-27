const express = require('express');
const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');

exports.userRegisterPost = async(req,res)=>{
  logger.info('请求api/user/create接口')
  try{
    const { username, password } = req.body;
    if(username && password){
      const db = await myPool.acquire()
      db.get('SELECT id FROM users WHERE username = ?',[username],async(err,row)=>{
        if(err){
          logger.error(err)
          res.status(500).send({status:"500",message:'数据库查询出错'});
        }else if(row){
          res.status(409).send({status:"409",message:'用户名已存在'})
        }else{
          const id = uuidv4()
          const stmt = db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)');
          stmt.run(id, username, password, (err) => {
            if (err) {
              logger.error(err)
              res.status(500).send({status:"500",message:'创建用户失败'}); 
            } else {
              res.status(200).send({ id, username,status:"200",message: '用户注册成功' });
            }
          })
        }
      })
    }else{
      res.status(400).send({ status:"400",message: '参数校验失败' });
    }
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
    if(!Email && !Password){
      return res.status(403).send({status:"403",message:'邮箱或密码错误'});
    }
    db.get('SELECT * FROM users WHERE Email = ?', [Email], (err, user) => {
      if (err) {
        logger.error(err)
        res.status(500).send({status:"500",message:'数据库查询出错'});
      }
      if (!user || !bcrypt.compareSync(Password, user.Password)) {
        return res.status(403).send({status:"403",message:'邮箱或密码错误'});
      }
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: Expiration }); // token有效期
      res.send({status:"200",token,message:"登录成功"});
    });
  }catch(err){
    logger.error(err)
    console.error('Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}