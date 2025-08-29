const express = require('express');
const router = express.Router();
const Menu = require('../Interface/menu')
const Message = require('../Interface/message')
const {authenticateToken} = require('../common/authenticate')


/**
 * 用户登录的请求对象
 * @typedef {object} Login
 * @property {string} Email.required - 用户邮件
 * @property {string} Password.required - 用户密码
 */
/**
 * POST /api/dynamic/menu
 * @summary 动态菜单接口
 * @tags User
 * @param {Login} request.body - 用户信息
 * @return {object} 200 - 登录成功 - application/json
 * @return {object} 403 - 邮箱或密码错误 - application/json
 * @return 500 - 错误的查询
 * @example request - 登录请求示例
 * {
 *     "Email": "xianbin@qq.com",
 *     "Password": "123456"
 * }
 * @example response - 200 - 登录成功示例 - application/json
 * {
 *     "token": "XXXXXXXXXX",
 *     "status": 200,
 *     "message": "登录成功"
 * }
 * @example response - 403 - 登录失败示例 - application/json
 * {
 *     "status": "403",
 *     "message": "邮箱或密码错误"
 * }
 */
router.get('/api/dynamic/menu',authenticateToken, (req, res) => {
  Menu.dynamicMenu(req, res)
})


/**
 * 查询用户列表参数
 * @typedef {object} UserQuery
 * 
 * @property {string} MenuID - 菜单ID
 * @property {string} MenuName - 菜单名称
 * @property {string} ZhName - 中文名称
 * @property {string} ParentID - 父级菜单ID
 * @property {string} Route - 菜单路由
 * @property {string} Icon - 菜单图标
 * @property {number} OrderIndex - 排序
 */
/**
 * POST /api/menu/list
 * @summary 菜单列表接口
 * @tags Menu
 * @security BearerAuth
 * @param {UserQuery} request.body - 查询用户列表参数
 * @return {object} 200 - 请求成功 - application/json
 * @return 500 - 错误的查询
 * @example request - 请求示例
 * {
 *     "current": 1,
 *     "pageSize": 10
 * }
 * @example response - 200 - 成功示例 - application/json
 * {
 *     "token": "XXXXXXXXXX",
 *     "status": 200,
 *     "message": "登录成功"
 * }
 * @example response - 403 - 失败示例 - application/json
 * {
 *     "status": "403",
 *     "message": "邮箱或密码错误"
 * }
 */
router.post('/api/menu/list',authenticateToken, (req, res) => {
  Menu.menuListGet(req, res)
})

router.get('/api/menu/tree', (req, res) => {
  Menu.menuTreeGet(req, res)
})

router.post('/api/menu/create',authenticateToken, (req, res) => {
  Menu.addMenuPost(req, res)
})

router.post('/api/menu/delete',authenticateToken, (req, res) => {
  Menu.deleteMenuPost(req, res)
})

router.post('/api/menu/update',authenticateToken, (req, res) => {
  Menu.updateMenuPost(req, res)
})
module.exports = router;