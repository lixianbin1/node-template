// const express = require('express');
// const router = express.Router();
const myPool = require('../common/database.js');
const log4js = require('log4js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid')
const logger = log4js.getLogger('user');

//菜单权限
exports.dynamicMenu = async (req, res) => {
  logger.info('请求api/dynamic/menu接口');
  try {
    const db = await myPool.acquire();
    try {
      let UserID = req.user.id;

      // 查询用户的角色
      db.all(`SELECT RoleID FROM UserRoles WHERE UserID = ?`, [UserID], (err, rolesRow) => {
        if (err) {
          logger.error('dynamicMenu Error:', err);
          res.code(500).send({ code: 500, message: '数据库查询出错' });
          return;
        }
        const roleIDs = rolesRow.map(role => role.RoleID);

        // 查询角色的权限
        db.all(`SELECT PermissionID FROM RolePermissions WHERE RoleID IN (${roleIDs.map(() => '?').join(', ')})`, roleIDs, (err, permissionsRows) => {
          if (err) {
            logger.error('dynamicMenu Error:', err);
            res.code(500).send({ code: 500, message: '数据库查询出错' });
            return;
          }
          const permissionIDs = permissionsRows.map(permission => permission.PermissionID);
          // 查询权限对应的菜单
          db.all(`SELECT MenuID FROM MenuPermissions WHERE PermissionID IN (${permissionIDs.map(() => '?').join(', ')})`, permissionIDs, (err, menusRows) => {
            if (err) {
              logger.error('dynamicMenu Error:', err);
              res.code(500).send({ code: 500, message: '数据库查询出错' });
              return;
            }
            const menus =  menusRows.map(menu => menu.MenuID)

            // 查询菜单
            db.all(`SELECT MenuID, MenuName,ZhName, ParentID, Route, Icon, OrderIndex FROM Menus WHERE MenuID IN (${menus.map(() => '?').join(', ')}) ORDER BY OrderIndex`, menus, (err, menuDetailsRows) => {
              if (err) {
                logger.error('dynamicMenu Error:', err);
                res.code(500).send({ code: 500, message: '数据库查询出错' });
                return;
              }
              const data = menuDetailsRows.map(menu => ({
                id: menu.MenuID,
                name: menu.MenuName,
                zhName: menu.ZhName,
                parentID: menu.ParentID,
                route: menu.Route,
                icon: menu.Icon,
                index: menu.OrderIndex
              }));
              res.send({code:200,data,message:"请求成功"});
            });
          });
        });
      });
    } finally {
      try {
        myPool.release(db); // 释放连接
      } catch (releaseErr) {
        logger.error('dynamicMenu Error:', releaseErr);
        console.error('dynamicMenu Error:', releaseErr);
      }
    }
  } catch (err) {
    logger.error('dynamicMenu Error:', err);
    console.error('dynamicMenu Error:', err);
    res.code(500).send({ code: 500, message: '无法获取数据库连接' });
  }
};

//菜单列表
exports.menuListGet = async (req, res) => {
  
  //插入日志
  const user = req.user.name;
  const time = new Date().toLocaleString();
  console.log(`${time}'：${user} 请求菜单列表：/api/menu/list `);
  logger.info(`${time}'：${user} 请求菜单列表：/api/menu/list `);
  const db = await myPool.acquire();


  console.log(myPool.state)

  try {
    //获取请求参数并设置默认值
    let { current = 1, pageSize = 10 } = req.query;
    current = Number(current);
    pageSize = Number(pageSize);
    offSize = (current - 1) * pageSize;

    // 查询总记录数
    const total = await new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) AS total FROM menus`, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total);
        }
      });
    });

    // 查询分页数据
    const rowsResult = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM menus LIMIT ? OFFSET ?`, [pageSize, offSize], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    res.send({
      code:200,
      data:rowsResult,
      current,
      pageSize,
      total,
      message:"成功"
    });

  }catch (err) { 
    console.log(`${time}'：${user} 请求菜单列表：/api/menu/list Error`, err);
    logger.error(`${time}'：${user} 请求菜单列表：/api/menu/list Error`, err);
  }finally{
    myPool.release(db);
  }
};

//添加菜单
exports.addMenuPost = async (req, res) => { 
  try{ 
    const { MenuName, ZhName, ParentID, Route, Icon, OrderIndex } = req.body;
    const db = await myPool.getConnection();
    try{
      const MenuID = uuidv4();
      const stmt = db.prepare('insert into Menus (MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex) values (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex,(err)=>{ 
        if (err) {
          logger.error('userCreatePost Error:' + err)
          logger.error(req.body)
          res.code(500).send({code:500,message:'菜单创建失败'}); 
        } else {
          res.code(200).send({ UserID, UserName,code:200,message: '菜单创建成功' });
        }
      });
    }finally{
      myPool.release(db);
    }
  }catch (err) { 
    logger.error('addMenuPost Error:', err);
    console.error('addMenuPost Error:', err);
  }
};