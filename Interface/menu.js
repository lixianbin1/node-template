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
          res.status(500).send({ code: 500, message: '数据库查询出错' });
          return;
        }
        const roleIDs = rolesRow.map(role => role.RoleID);

        // 查询角色的权限
        db.all(`SELECT PermissionID FROM RolePermissions WHERE RoleID IN (${roleIDs.map(() => '?').join(', ')})`, roleIDs, (err, permissionsRows) => {
          if (err) {
            logger.error('dynamicMenu Error:', err);
            res.status(500).send({ code: 500, message: '数据库查询出错' });
            return;
          }
          const permissionIDs = permissionsRows.map(permission => permission.PermissionID);
          // 查询权限对应的菜单
          db.all(`SELECT MenuID FROM MenuPermissions WHERE PermissionID IN (${permissionIDs.map(() => '?').join(', ')})`, permissionIDs, (err, menusRows) => {
            if (err) {
              logger.error('dynamicMenu Error:', err);
              res.status(500).send({ code: 500, message: '数据库查询出错' });
              return;
            }
            const menus =  menusRows.map(menu => menu.MenuID)

            // 查询菜单
            db.all(`SELECT MenuID, MenuName,ZhName, ParentID, Route, Icon, OrderIndex FROM Menus WHERE MenuID IN (${menus.map(() => '?').join(', ')}) ORDER BY OrderIndex`, menus, (err, menuDetailsRows) => {
              if (err) {
                logger.error('dynamicMenu Error:', err);
                res.status(500).send({ code: 500, message: '数据库查询出错' });
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
    res.status(500).send({ code: 500, message: '无法获取数据库连接' });
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
  try {
    //获取请求参数并设置默认值
    let { 
      current = 1, 
      pageSize = 10,
      MenuID,
      MenuName,
      ZhName,
      ParentID,
      Route,
      Icon,
      OrderIndex
    } = req.query;
    current = Number(current);
    pageSize = Number(pageSize);
    offSize = (current - 1) * pageSize;

    // 构造动态 SQL 查询
    let whereClauses = [];
    let params = [];
    if (MenuID) {
      whereClauses.push("MenuID LIKE ?");
      params.push(`%${MenuID}%`);
    }
    if (MenuName) {
      whereClauses.push("MenuName LIKE ?");
      params.push(`%${MenuName}%`);
    }
    if (ZhName) {
      whereClauses.push("ZhName LIKE ?");
      params.push(`%${ZhName}%`);
    }
    if (ParentID) {
      whereClauses.push("ParentID LIKE ?");
      params.push(`%${ParentID}%`);
    }
    if (Route) {
      whereClauses.push("Route LIKE ?");
      params.push(`%${Route}%`);
    }
    if (Icon) {
      whereClauses.push("Icon LIKE ?");
      params.push(`%${Icon}%`);
    }
    if (OrderIndex !== undefined) {
      whereClauses.push("OrderIndex = ?");
      params.push(Number(OrderIndex));
    }
    let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 获取总记录数
    const totalsql = `
      SELECT COUNT(*) AS total
      FROM Menus
      ${whereSql}
    `;
    const total = await new Promise((resolve, reject) => {
      db.get(totalsql,params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total);
        }
      })
    })

    // 查询分页数据
    const pagination = `
      SELECT *
      FROM Menus
      ${whereSql}
      LIMIT ?
      OFFSET ?
    `;
    params.push(pageSize);
    params.push(offSize);
    const rowsResult = await new Promise((resolve, reject) => {
      db.all(pagination,params, (err, rows) => {
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

//菜单树
exports.menuTreeGet = async (req, res) => {
  const db = await myPool.acquire();
  try {
    db.all(`SELECT * FROM Menus`, (err, rows) => { 
      const map = {};
      rows.forEach(item => { 
        map[item.MenuID] = {
          label: item.MenuName,
          value: item.MenuID,
          children: []}
      });
      const menuTree = []
      rows.forEach(item => { 
        if(item.ParentID === null){
          menuTree.push(map[item.MenuID])
        }else{
          const parent = map[item.ParentID]
          if(parent){
            parent.children.push(map[item.MenuID]);
          }
        }
      });
      res.send({code:200,data:menuTree});
    }); 
  } catch (err) { 
    logger.error('menuTreeGet Error:', err);
    console.error('menuTreeGet Error:', err);
  }
};

//添加菜单
exports.addMenuPost = async (req, res) => { 
  const user = req.user.name;
  const time = new Date().toLocaleString();
  try{ 
    let { MenuName, ZhName, ParentID, Route, Icon, OrderIndex } = req.body;
    if(!MenuName){
      res.send({code:400,message:'MenuName 不能为空'}); 
    }
    if(!Route){
      res.send({code:400,message:'Route 不能为空'}); 
    }
    ZhName = ZhName || '';
    ParentID = ParentID || null;
    Icon = Icon || '';
    OrderIndex = OrderIndex || 0;
    //插入日志
    console.log(`${time}'：${user} 请求添加菜单：/api/menu/create `);
    logger.info(`${time}'：${user} 请求添加菜单：/api/menu/create `);

    const db = await myPool.acquire();
    try{
      //判断否路由重复
      const rowsResult = await SelectRoute(db,Route)
      if(rowsResult.length > 0){
        res.send({code:400,message:'菜单已存在'});
        return;
      }

      const sql = `insert into Menus ( MenuName, ZhName, ParentID, Route, Icon, OrderIndex) values (?, ?, ?, ?, ?, ?)`;
      db.run(sql,[ MenuName, ZhName, ParentID, Route, Icon, OrderIndex],(err)=>{
        if (err) {
          console.log(`${time}'：${user} 请求添加菜单：/api/menu/create Error`, err);
          logger.error(`${time}'：${user} 请求添加菜单：/api/menu/create Error`, err);
          res.send({code:500,message:'菜单创建失败'}); 
        } else {
          res.send({ code:200,message: '菜单创建成功' });
        }
      });
    }finally{
      myPool.release(db);
    }
  }catch (err) { 
    console.log(`${time}'：${user} 请求添加菜单：/api/menu/create Error`, err);
    logger.error(`${time}'：${user} 请求添加菜单：/api/menu/create Error`, err);
  }
};

//删除菜单
exports.deleteMenuPost = async (req, res) => { 
  const user = req.user.name;
  const time = new Date().toLocaleString();
  const db = await myPool.acquire();
  try{
    let { MenuID } = req.body;
    if(!MenuID){
      res.send({code:400,message:'MenuID 不能为空'}); 
    }
    //插入日志
    console.log(`${time}'：${user} 删除菜单：/api/menu/delete `);
    logger.info(`${time}'：${user} 删除菜单：/api/menu/delete `);
    
    //存在菜单存在子集。则修改为null

    db.run(`delete from Menus where MenuID = ?`,[MenuID],(err)=>{ 
      if (err) {
        console.log(`${time}'：${user} 删除菜单 Error`, err);
        logger.error(`${time}'：${user} 删除菜单 Error`, err);
        res.send({code:500,message:'菜单删除失败'}); 
      } else {
        res.send({ code:200,message: '菜单删除成功' });
      }
    });

  }catch (err) { 
    console.log(`${time}'：${user} 删除菜单：/api/menu/delete Error`, err);
    logger.error(`${time}'：${user} 删除菜单：/api/menu/delete Error`, err);
  }
};

//修改菜单
exports.updateMenuPost = async (req, res) => { 
  const user = req.user.name;
  const time = new Date().toLocaleString();
  const db = await myPool.acquire();
  try{
    let { MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex } = req.body;
    if(!MenuID){
      res.send({code:400,message:'MenuID 不能为空'}); 
    }
    if(!MenuName){
      res.send({code:400,message:'MenuName 不能为空'}); 
    }
    if(!Route){
      res.send({code:400,message:'Route 不能为空'}); 
    }
    ZhName = ZhName || '';
    ParentID = ParentID || null;
    Icon = Icon || '';
    OrderIndex = OrderIndex || 0;
    //插入日志
    console.log(`${time}'：${user} 修改菜单：/api/menu/update `);
    logger.info(`${time}'：${user} 修改菜单：/api/menu/update `);

    //判断否路由重复
    const rowsResult = await SelectRoute(db,Route)
    if(rowsResult.length > 1 || rowsResult.length === 1 && rowsResult[0].MenuID !== MenuID){
      res.send({code:400,message:'菜单已存在'});
      return;
    }

    const sql = `update Menus set MenuName = ?, ZhName = ?, ParentID = ?, Route = ?, Icon = ?, OrderIndex = ? where MenuID = ?`;
    db.run(sql,[ MenuName, ZhName, ParentID, Route, Icon, OrderIndex, MenuID],(err)=>{ 
      if (err) {
        console.log(`${time}'：${user} 修改菜单 Error`, err);
        logger.error(`${time}'：${user} 修改菜单 Error`, err);
        res.send({code:500,message:'菜单修改失败'}); 
      } else {
        res.send({ code:200,message: '菜单修改成功' });
      }
    })
  }catch (err) { 
    console.log(`${time}'：${user} 修改菜单：/api/menu/update Error`, err);
    logger.error(`${time}'：${user} 修改菜单：/api/menu/update Error`, err);
  }finally{ 
    myPool.release(db);
  }
};

//判断否路由重复
const SelectRoute = async (db,Route) => { 
  const querySql = `SELECT * FROM Menus WHERE Route = ?`;
  const rowsResult = await new Promise((resolve, reject) => {
    db.all(querySql,[Route], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
  return rowsResult
}