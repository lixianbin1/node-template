const express = require('express');
const router = express.Router();
const User = require('../Interface/user')
const Message = require('../Interface/message')
const {authenticateToken} = require('../common/authenticate')


/**
 * 用户登录的请求对象
 * @typedef {object} Login
 * @property {string} Email.required - 用户邮件
 * @property {string} Password.required - 用户密码
 */
/**
 * POST /api/user/login
 * @summary 用户的登录接口
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
router.post('/api/user/login', (req, res) => {
  User.userloginPost(req, res)
})

/**
 * GET /api/user/exit
 * @summary 用户的退出接口
 * @tags User
 * @security BearerAuth
 * @return {object} 200 - 退出成功 - application/json
 * @return 403 - token无效或已过期
 * @return 500 - 错误的查询
 * @example response - 200 - 退出成功示例 - application/json
 * {
 *     "status": 200,
 *     "message": "退出成功"
 * }
 */
router.get('/api/user/exit',authenticateToken,(req,res)=>{
  User.userExitget(req,res)
})

/**
 * 创建用户的请求对象
 * @typedef {object} Register
 * @property {string} UserName.required - 用户名称
 * @property {string} Email.required - 用户邮箱
 */
/**
 * POST /api/user/create
 * @summary 用户的创建接口
 * @tags User
 * @param {Register} request.body - 用户信息 - application/json
 * @return {object} 200 - 注册成功 - application/json
 * @return 409 - 用户名已存在
 * @return 500 - 错误的查询
 * @example response - 200 - 注册成功示例 - application/json
 * {
 *     "id": "XXXXXXXXX",
 *     "UserName": "XXXXXXXXXX",
 *     "status": 200,
 *     "message": "用户注册成功"
 * }
 */
router.post('/api/user/create',authenticateToken,(req,res)=>{
  User.userCreatePost(req,res)
})

/**
 * GET /api/user/info
 * @summary 用户的详情接口
 * @tags User
 * @param {string} UserID.query - 用户ID，如不传，则默认查询当前用户信息
 * @return {object} 200 - 请求成功 - application/json
 * @return 404 - 未查找到该用户信息
 * @return 500 - 错误的查询
 * @example response - 200 - 登录成功示例 - application/json
 * {
 *     "data": {
 *         "UserID": "XXXXXXXXX",
 *         "UserName": "XXXXXXXXXX",
 *         "Email": "XXXXXXXXXX",
 *         "CreateTime": "XXXXXXXXXX"
 *     },
 *     "status": 200,
 *     "message": "成功"
 * }
 */
router.get('/api/user/info',authenticateToken,(req,res)=>{
  User.userInfoGet(req,res)
})

/**
 * GET /api/user/list
 * @summary 用户的列表接口
 * @tags User
 * @param {number} current.query - 当前页，如不传，则默认查询第一页
 * @param {number} pageSize.query - 当前页数目，如不传，则默认以10条数据为一页
 * @return {object} 200 - 请求成功 - application/json
 * @return 500 - 错误的查询
 * @example response - 200 - 登录成功示例 - application/json
 * {
 *     "data": [{
 *         "UserID": "XXXXXXXXX",
 *         "UserName": "XXXXXXXXXX",
 *         "Email": "XXXXXXXXXX",
 *         "CreateTime": "XXXXXXXXXX"
 *     }],
 *     "current" : 1,
 *     "pageSize": 10,
 *     "status": 200,
 *     "message": "成功"
 * }
 */
router.get('/api/user/list',authenticateToken,(req,res)=>{
  User.userListGet(req,res)
})


router.post('/api/user/delete',authenticateToken,(req,res)=>{
  User.userDelete(req,res)
})

module.exports = router;