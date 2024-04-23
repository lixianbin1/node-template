const express = require('express');
const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');
const WSdev = require('../common/webSocket');

//发送消息
exports.messageCreatePost = async(req,res)=>{
  logger.info('请求api/message/create接口')
  try{
    const { ToUserID,Content,GroupID,Times } = req.body;
    const FromUserID = req.user.id
    if(!ToUserID){
      return res.status(400).send({ status:"400",message: '未填写接收人ID' });
    }
    const db = await myPool.acquire()
    try{
      const MessageID = uuidv4()
      const Timestamp = new Date().toLocaleString('zh-CN')
      const stmt = db.prepare('INSERT INTO Messages (MessageID, FromUserID, ToUserID, GroupID,Content,Timestamp) VALUES (?, ?, ? ,?,?,?)');
      stmt.run(MessageID, FromUserID, ToUserID, GroupID,Content,Timestamp, (err) => {
        if (err) {
          logger.error('userCreatePost Error:' + err)
          res.status(500).send({status:"500",message:'发送消息失败'}); 
        } else {
          let obj = {MessageID, FromUserID, ToUserID, GroupID,Content,Timestamp}
          res.status(200).send({ data:{MessageID, FromUserID, ToUserID, GroupID,Content,Timestamp},status:"200",Times,message: '发送消息成功' });
          WSdev.sendMessageToUser(ToUserID, JSON.stringify(obj));
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

//查询消息
exports.messageListGet = async(req,res)=>{
  try{
    var { UserID } = req.query;
    if(!UserID){
      UserID = req.user.id
    }
    const db = await myPool.acquire()
    try{
      db.all('SELECT * FROM Messages WHERE FromUserID = ? OR ToUserID = ?', [UserID,UserID], (err, data) => {
        if (err) {
          logger.error('userloginPost Error:' + err)
          res.status(500).send({status:"500",message:'数据库查询出错'});
        } else {
          let Users=new Set([]) //所有接收消息用户
          for(let i in data){
            Users.add(data[i].ToUserID)
          }
          for(let i in Users){
            db.get('SELECT * FROM Users WHERE UserID = ?',[Users[i]],(err,data)=>{
              if(err){
                logger.error('userloginPost Error:' + err)
                res.status(500).send({status:"500",message:'数据库查询出错'});
              }else{
                Users[i] = data
              }
            })
          }
          let reData=[]
          for(let i in Users){
            Users[i].Messages=[]
            for(let k in data){
              if(data[k].UserID == Users[i].UserID){
                Users[i].Messages.push(data[k])
              }
            }
            reData.push(Users[i])
          }
          res.status(200).send({ data:reData,status:"200",message: '发送消息成功' });
        }
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
