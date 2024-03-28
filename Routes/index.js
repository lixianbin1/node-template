const express = require('express');
const router = express.Router();
const User = require('../Interface/user')
const {authenticateToken} = require('../common/authenticate')

/**
 * 创建用户的请求对象
 * @typedef {object} Register
 * @property {string} UserName.required - 用户名称
 * @property {string} Password.required - 用户密码
 */
/**
 * POST /api/user/create
 * @summary 用户的创建接口
 * @tags user
 * @param {Register} request.body - 用户信息 - application/json
 * @return {object} 200 - 注册成功 - application/json
 * @return 409 - 用户名已存在
 * @return 500 - 错误的查询
 * @example response - 200 - 注册成功示例 - application/json
 * {
 *     "id": "XXXXXXXXX",
 *     "UserName": "XXXXXXXXXX",
 *     "status": "200",
 *     "message": "用户注册成功"
 * }
 */
router.post('/api/user/create',authenticateToken,(req,res)=>{
  User.userCreatePost(req,res)
})

/**
 * 用户登录的请求对象
 * @typedef {object} Login
 * @property {string} Email.required - 用户名称
 * @property {string} Password.required - 用户密码
 */
/**
 * POST /api/user/login
 * @summary 用户的登录接口
 * @tags user
 * @param {Login} request.body - 用户信息 - application/json
 * @return {object} 200 - 登录成功 - application/json
 * @return 403 - 邮箱或密码错误
 * @return 500 - 错误的查询
 * @example response - 200 - 登录成功示例 - application/json
 * {
 *     "token": "XXXXXXXXXX",
 *     "status": "200",
 *     "message": "登录成功"
 * }
 */
router.post('/api/user/login',(req,res)=>{
  User.userloginPost(req,res)
})

router.get('/api/user/info',authenticateToken,(req,res)=>{
  User.userInfoGet(req,res)
})

module.exports = router;