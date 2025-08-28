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
  //插入日志
  const user = req.user.name;
  const time = new Date().toLocaleString();
  console.log(`${time}'：${user} 请求角色列表：/api/role/list `);
  logger.info(`${time}'：${user} 请求角色列表：/api/role/list `);
  const db = await myPool.acquire();
  try{
    const current = parseInt(req.query.current, 10);
    const pageSize = parseInt(req.query.pageSize, 10);

    // 获取总记录数
    const totalsql = `SELECT COUNT(*) AS total FROM Roles`;
    const total = await new Promise((resolve, reject) => {
      db.get(totalsql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total);
        }
      })
    })

    // 查询分页数据
    let query = 'SELECT * FROM Roles';
    let queryParams = [];
    if (!isNaN(pageSize) && !isNaN(current)) {
      const offset = (current - 1) * pageSize;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(pageSize, offset);
    }
    const roles = await new Promise((resolve, reject) => {
      db.all(query, queryParams,(err, row)=>{
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      })
    });
    res.send({
      code:200,
      message:'获取角色列表成功',
      data:roles,
      current,
      pageSize,
      total
    });
  }catch(err){
    console.log(`${time}'：${user} 请求角色列表 Error：${err} `);
    logger.info(`${time}'：${user} 请求角色列表 Error：${err}  `);
    logger.error('roleListGet Error:' + err)
  }finally{
    myPool.release(db);
  }
}

//角色添加
exports.roleCreate = async (req, res) => { 
  const user = req.user.name;
  const time = new Date().toLocaleString();
  const db = await myPool.acquire();
  try{
    //插入日志
    console.log(`${time}'：${user} 请求角色添加：/api/role/create `);
    logger.info(`${time}'：${user} 请求角色添加：/api/role/create `);
    let { RoleID, RoleName, checkedKeys } = req.body;
    
    if(!RoleID || !RoleName) {
      res.send({code:405,message:'请填写完整信息'});
    }

    //查询是否存在同ID角色
    const isTrue = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Roles WHERE RoleID = ?', [RoleID], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row !== undefined);
        }
      })
    });
    if (isTrue) {
      res.send({code:500,message:'角色ID已存在'});
    }

    //插入角色
    const Insert = await new Promise((resolve, reject) => {
      db.run('INSERT INTO Roles (RoleID, RoleName) VALUES (?, ?)', [RoleID,RoleName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      })
    });

    console.log(Insert)
    
    //插入权限
    for (let i = 0; i < checkedKeys.length; i++) {
      const MenuID = checkedKeys[i];
      const insertSql = 'INSERT INTO RolePermissions (RoleID, MenuID) VALUES (?, ?)';
      const insertParams = [RoleID, MenuID];
      await new Promise((resolve, reject) => {
        db.run(insertSql, insertParams, (err) => {
          if (err) {
            reject(err);
          }else{
            resolve();
          }
        })
      })
    }
    res.send({code:200,message:'角色添加成功'});

  }catch(err){ 
    console.log(`${time}'：${user} 请求角色添加 Error`, err);
    logger.error(`${time}'：${user} 请求角色添加 Error`, err);
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
  const user = req.user.name;
  const time = new Date().toLocaleString();
  const db = await myPool.acquire();
  try{
    //插入日志
    console.log(`${time}'：${user} 删除角色：/api/role/delete `);
    logger.info(`${time}'：${user} 删除角色：/api/role/delete `);

    const RoleID = req.body.RoleID;
    if(!RoleID) {
      res.send({code:405,message:'RoleID 不能为空'});
    }

    //查询是否有用户使用角色
    const doRun = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM UserRoles WHERE RoleID = ?', [RoleID], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row !== undefined);
        }
      })
    });
    if(doRun){
      res.send({code:500,message:'该角色正在被用户使用，请先解除角色使用'});
    }

    //删除角色
    const deleteRun = await new Promise((resolve, reject) => {
      db.run('DELETE FROM Roles WHERE RoleID = ?', [RoleID], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
    
    //删除权限
    const deletePerm = await new Promise((resolve, reject) => {
      db.run('DELETE FROM RolePermissions WHERE RoleID = ?', [RoleID], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    });
    res.send({code:200,message:'删除角色成功'});
  }catch(err){
    res.send({code:500,message:'无法获取数据库连接'});
  }
}

//查询角色权限
const SelectRole = async (db,[RoleID]) => {
  try{
    const querySql = 'SELECT * FROM RolePermissions WHERE RoleID = ?';
    db.all(query, [RoleID], (err, rows) => {
      if (err) {
        res.send({code:500,message:'无法获取数据库连接'});
      }
      res.send({code:200,message:'获取角色权限成功',data:rows});
    })
  }catch(err){
    res.send({code:500,message:'无法获取数据库连接'});
  }
}
