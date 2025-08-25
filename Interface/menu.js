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
          res.status(500).send({ status: "500", message: '数据库查询出错' });
          return;
        }
        const roleIDs = rolesRow.map(role => role.RoleID);

        // 查询角色的权限
        db.all(`SELECT PermissionID FROM RolePermissions WHERE RoleID IN (${roleIDs.map(() => '?').join(', ')})`, roleIDs, (err, permissionsRows) => {
          if (err) {
            logger.error('dynamicMenu Error:', err);
            res.status(500).send({ status: "500", message: '数据库查询出错' });
            return;
          }
          const permissionIDs = permissionsRows.map(permission => permission.PermissionID);

          // 查询权限对应的菜单
          db.all(`SELECT MenuID FROM MenuPermissions WHERE PermissionID IN (${permissionIDs.map(() => '?').join(', ')})`, permissionIDs, (err, menusRows) => {
            if (err) {
              logger.error('dynamicMenu Error:', err);
              res.status(500).send({ status: "500", message: '数据库查询出错' });
              return;
            }
            const menus =  menusRows.map(menu => menu.MenuID)

            // 查询菜单
            db.all(`SELECT MenuID, MenuName,ZhName, ParentID, Route, Icon, OrderIndex FROM Menus WHERE MenuID IN (${menus.map(() => '?').join(', ')}) ORDER BY OrderIndex`, menus, (err, menuDetailsRows) => {
              if (err) {
                logger.error('dynamicMenu Error:', err);
                res.status(500).send({ status: "500", message: '数据库查询出错' });
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
              res.send({status:"200",data,message:"请求成功"});
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
    res.status(500).send({ status: "500", message: '无法获取数据库连接' });
  }
};