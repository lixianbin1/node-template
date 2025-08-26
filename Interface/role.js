// const express = require('express');
// const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');

//角色列表
exports.roleListGet = async(req, res)=>{
  try{
    const pageSize = parseInt(req.query.pageSize, 10);
    const current = parseInt(req.query.current, 10);

    let query = 'SELECT RoleID, RoleName FROM Roles';
    let queryParams = [];
    if (!isNaN(pageSize) && !isNaN(current)) {//如果传入了分页参数
      const offset = (pageSize - 1) * current;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(current, offset);
    }
    try{
      const db = await myPool.acquire();
      db.all(query, queryParams, (err, rows) => {
        if (err) {
          res.send({code:500,message:'无法获取数据库连接'});
        }
        res.send({code:200,message:'获取角色列表成功',data:rows});
      });
    }finally{
      myPool.release(db);
    }
  }catch(err){
    logger.error('roleListGet Error:' + err)
  }
}

//角色修改
exports.roleUpdate = async (req, res) => { 
  try{
    const db = await myPool.acquire();
    const query = 'UPDATE role SET name = ?, description = ? WHERE id = ?';
    const queryParams = [req.body.name, req.body.description, req.body.id];
    db.run(query, queryParams, (err) => {
      if (err) {
        res.send({code:500,message:'无法获取数据库连接'});
      }
    })
  }catch(err){
    res.send({code:500,message:'无法获取数据库连接'});
  }
}

//删除角色
exports.deleteRole = async (req, res) => { 
  try{
    //查询是否有用户使用角色
    const select = 'SELECT * FROM UserRoles WHERE RoleID = ?';
    db.all(select, req.body.RoleID, (err, rows) => {
      if (err) {
        res.send({code:500,message:'无法获取数据库连接'});
      }
      if(rows.length>0){
        res.send({code:500,message:'该角色正在被用户使用，请先删除用户'});
      }else{
        //删除角色
        const deleteStr = 'DELETE FROM Roles WHERE RoleID = ?';
        db.run(deleteStr, req.body.RoleID, (err) => {
          if (err) {
            res.send({code:500,message:'删除角色失败'});
          } else {
            res.send({code:200,message:'删除角色成功'});
          }
        })  
      }
    })
  }catch(err){
    res.send({code:500,message:'无法获取数据库连接'});
  }
}
