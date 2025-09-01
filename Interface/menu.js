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
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 动态菜单：/api/dynamic/menu`;
  console.log(logMessage);
  logger.info(logMessage);
  const db = await myPool.acquire();
  console.log(myPool.status())
  try {
    let UserID = req.user.id;
    //检查用户角色权限
    const roleIDs = await new Promise((resolve, reject) => {
      db.all(`SELECT RoleID FROM UserRoles WHERE UserID = ?`, [UserID], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const roleIDs = rows.map(role => role.RoleID);
          resolve(roleIDs);
        }
      });
    });
    if (roleIDs.length === 0) {
      return res.send({ code: 403, message: '无权限查询菜单数据' });
    }
    const map = {}; 
    let menusData = [];
    if (roleIDs.includes('admin')){ // 管理员权限
      menusData = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Menus`, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }else{ 
      // 非管理员权限
      // 获取角色的菜单权限
      const menusIDs = await new Promise((resolve, reject) => {
        db.all(`SELECT RoleID FROM RolePermissions WHERE RoleID IN (${roleIDs.map(() => '?').join(', ')})`, roleIDs, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      // 查询菜单
      menusData = await new Promise((resolve, reject) => {
        db.all(`SELECT MenuID, MenuName,ZhName, ParentID, Route, Icon, OrderIndex FROM Menus WHERE MenuID IN (${menusIDs.map(() => '?').join(', ')}) ORDER BY OrderIndex`, menusIDs, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        })
      })
    }

    //处理数据
    menusData.forEach(item => {
      map[item.MenuID] = { 
        ...item, 
        index: item.Route,
        title: item.ZhName,
        icon: item.Icon,
        children: [] 
      };
    });
    const tree = [];
    const builtMap = {};

    menusData.forEach(item => {
      // 如果已经构建过这个节点，直接使用已构建的节点
      if (!builtMap[item.MenuID]) {
        builtMap[item.MenuID] = { ...map[item.MenuID] };
      }
      const node = builtMap[item.MenuID];
      if (!item.ParentID) {
        // 如果是根节点，直接加入树
        tree.push(node);
      } else {
        // 如果不是根节点，找到其父节点并加入父节点的children中
        if (!builtMap[item.ParentID]) {
          builtMap[item.ParentID] = { ...map[item.ParentID], children: [] };
        }
        const parent = builtMap[item.ParentID];
        parent.children.push(node);
      }
    });
    res.send({ code: 200, data: tree });
  }catch (err) {
    console.log(err);
    logger.error(err);
    res.send({code:500,message:"服务器错误，请联系管理员"});
  }
  myPool.release(db);
};

//菜单列表
exports.menuListGet = async (req, res) => {
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 菜单列表：/api/menu/list`;
  console.log(logMessage);
  logger.info(logMessage);
  const db = await myPool.acquire();
  console.log(myPool.status())
  try {
    //获取请求参数并设置默认值
    let {MenuID,MenuName,ZhName,ParentID,Route,Icon,OrderIndex} = req.body;
    const current = parseInt(req.body.current, 10);
    const pageSize = parseInt(req.body.pageSize, 10);
    offSize = (current - 1) * pageSize;

    // 构造动态 SQL 查询
    let whereClauses = [];
    let params = [];
    const fields = {
      MenuID: "MenuID LIKE ?",
      MenuName: "MenuName LIKE ?",
      ZhName: "ZhName LIKE ?",
      ParentID: "ParentID LIKE ?",
      Route: "Route LIKE ?",
      Icon: "Icon LIKE ?",
      OrderIndex: "OrderIndex = ?"
    };
    // 遍历参数并构造动态 SQL
    for (let key in fields) {
      if (key === "OrderIndex") {
        if (OrderIndex !== undefined) {
          whereClauses.push(fields[key]);
          params.push(Number(OrderIndex));
        }
      } else {
        if (eval(key)) {
          whereClauses.push(fields[key]);
          params.push(`%${eval(key)}%`);
        }
      }
    }
    let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 获取总记录数
    const totalsql = `SELECT COUNT(*) AS total FROM Menus ${whereSql}`;
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
    const pagination = `SELECT * FROM Menus ${whereSql} LIMIT ? OFFSET ?`;
    params.push(pageSize,offSize);
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
      message:"请求成功"
    });
  }catch (err) { 
    console.log(err);
    logger.error(err);
    res.send({
      code:500,
      message:"服务器错误，请联系管理员"
    });
  }
  myPool.release(db);
};

//菜单树
exports.menuTreeGet = async (req, res) => {
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 菜单下拉：/api/menu/tree`;
  console.log(logMessage);
  logger.info(logMessage);
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
        if(!item.ParentID){
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
  }catch (err) {
    console.log(err);
    logger.error(err);
    res.send({code:500,message:"服务器错误，请联系管理员"});
  }
  myPool.release(db);
};

//添加菜单
exports.addMenuPost = async (req, res) => {
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 添加菜单：/api/menu/create`;
  console.log(logMessage);
  logger.info(logMessage);
  const db = await myPool.acquire();
  console.log(myPool.status())
  try{
    //解析参数
    let { MenuName, ZhName, ParentID, Route, Icon, OrderIndex } = req.body;
    if(!MenuName){
      return res.send({code:400,message:'MenuName 不能为空'}); 
    }
    if(!Route){
      return res.send({code:400,message:'Route 不能为空'}); 
    }

    //判断否路由重复
    const rowsResult = await SelectRoute(db,Route)
    if(rowsResult.length > 0){
      return res.send({code:400,message:'菜单已存在'});
    }

    // 查询分页数据
    const Insert = `insert into Menus ( MenuName, ZhName, ParentID, Route, Icon, OrderIndex) values (?, ?, ?, ?, ?, ?)`;
    const InsertRow = await new Promise((resolve, reject) => {
      db.all(Insert,[ MenuName, ZhName, ParentID, Route, Icon, OrderIndex], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    res.send({ code:200,message: '菜单创建成功' });
  }catch (err) { 
    console.log(err);
    logger.error(err);
    res.send({
      code:500,
      message:"服务器错误，请联系管理员"
    });
  }
  myPool.release(db);
};

//删除菜单
exports.deleteMenuPost = async (req, res) => { 
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 添加菜单：/api/menu/create`;
  console.log(logMessage);
  logger.info(logMessage);
  const db = await myPool.acquire();
  console.log(myPool.status())
  try{
    let { MenuID } = req.body;
    if(!MenuID){
      res.send({code:400,message:'MenuID 不能为空'}); 
    }
    const rowsResult = await SelectMenuID(db,MenuID)
    if(rowsResult.length === 0){
      return res.send({code:400,message:'菜单不存在'});
    }
    const rowsPrent = new Promise((resolve, reject) => { 
      db.all(`SELECT * FROM Menus WHERE ParentID = ?`,[MenuID], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    if(rowsPrent.length > 0){
      return res.send({code:400,message:'请先删除子菜单'});
    }

    const doDelete = new Promise((resolve, reject) => { 
      db.all(`delete from Menus where MenuID = ?`,[MenuID], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    res.send({ code:200,message: '菜单删除成功' });

  }catch (err) { 
    console.log(err);
    logger.error(err);
    res.send({code:500,message:"服务器错误，请联系管理员"});
  }
  myPool.release(db);
};

//修改菜单
exports.updateMenuPost = async (req, res) => { 
  // 插入日志
  const time = new Date().toLocaleString();
  const logMessage = `${time}: 添加菜单：/api/menu/create`;
  console.log(logMessage);
  logger.info(logMessage);
  const db = await myPool.acquire();
  console.log(myPool.status())
  try{
    let { MenuID, MenuName, ZhName, ParentID, Route, Icon, OrderIndex } = req.body;
    if(!MenuID){
      res.send({code:400,message:'菜单ID不能为空'}); 
    }
    if(!MenuName){
      res.send({code:400,message:'菜单名称不能为空'}); 
    }
    if(!Route){
      res.send({code:400,message:'路由不能为空'}); 
    }

    //判断否路由重复
    const rowsResult = await SelectRoute(db,Route)
    if(rowsResult.length > 1 || rowsResult.length === 1 && rowsResult[0].MenuID !== MenuID){
      res.send({code:400,message:'该路由已存在'});
      return;
    }

    //更新数据
    const sql = `update Menus set MenuName = ?, ZhName = ?, ParentID = ?, Route = ?, Icon = ?, OrderIndex = ? where MenuID = ?`;
    const updateMenu = new Promise((resolve, reject) => { 
      db.run(sql,[ MenuName, ZhName, ParentID, Route, Icon, OrderIndex, MenuID], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    res.send({ code:200,message: '菜单修改成功' });
  }catch (err) { 
    console.log(err);
    logger.error(err);
    res.send({code:500,message:"服务器错误，请联系管理员"});
  }
  myPool.release(db);
};

//判断否路由重复
const SelectRoute = async (db,Route) => { 
  const querySql = `SELECT * FROM Menus WHERE Route = ?`;
  return await new Promise((resolve, reject) => {
    db.all(querySql,[Route], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

//判断否MenuID重复
const SelectMenuID = async (db,MenuID) => { 
  const querySql = `SELECT * FROM Menus WHERE MenuID = ?`;
  return await new Promise((resolve, reject) => {
    db.all(querySql,[MenuID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}