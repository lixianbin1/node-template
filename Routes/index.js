const express = require('express');
const router = express.Router();
const User = require('../Interface/user')

/**
 * 注册的请求对象
 * @typedef {object} Register
 * @property {string} username.required - 用户名称
 * @property {string} password.required - 用户密码
 */
/**
 * POST /api/user/register
 * @summary 用户的注册接口
 * @tags user
 * @param {Register} request.body - 用户信息 - application/json
 * @return {object} 200 - 注册成功 - application/json
 * @return 409 - 用户名已存在
 * @return 500 - 错误的查询
 * @example response - 200 - 注册成功示例 - application/json
 * {
 *     "id": "XXXXXXXXX",
 *     "username": "XXXXXXXXXX",
 *     "status": "200",
 *     "message": "用户注册成功"
 * }
 */
router.post('/api/user/register',(req,res)=>{
  User.userRegisterPost(req,res)
})

module.exports = router;