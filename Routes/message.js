const express = require('express');
const router = express.Router();
const User = require('../Interface/user')
const Message = require('../Interface/message')
const {authenticateToken} = require('../common/authenticate')


/**
 * 创建消息的请求对象
 * @typedef {object} Create
 * @property {string} ToUserID.required - 消息接收人
 * @property {string} Content.required - 消息内容
 * @property {string} GroupID - 接收群组ID
 * @property {string} Times - 时间戳
 */
/**
 * POST /api/message/create
 * @summary 消息的创建接口
 * @tags Message
 * @param {Create} request.body - 请求参数 - application/json
 * @return {object} 200 - 登录成功 - application/json
 * @return 500 - 错误的查询
 * @example response - 200 - 发送消息成功示例 - application/json
 * {
 *     "data": {
 *         "MessageID": "XXXXXXXXX",
 *         "ToUserID": "XXXXXXXXX",
 *         "Content": "XXXXXXXXX",
 *         "GroupID": "XXXXXXXXX",
 *         "Timestamp": "XXXXXXXXX",
 *         "FromUserID": "XXXXXXXXX",
 *         "UserID": "XXXXXXXXX"
 *     },
 *     "Times": "XXXXXXXXXX",
 *     "status": 200,
 *     "message": "发送消息成功"
 * }
 */
router.post('/api/message/create',authenticateToken,(req,res)=>{
  Message.messageCreatePost(req,res)
})

/**
 * GET /api/message/list
 * @summary 消息的列表接口
 * @tags Message
 * @security BearerAuth
 * @param {string} UserID.query - 用户ID，如不传，则默认查询当前用户信息
 * @return {object} 200 - 请求成功 - application/json
 * @return 404 - 未查找到该用户信息
 * @return 500 - 错误的查询
 * @example response - 200 - 登录成功示例 - application/json
 * {
 *     "data": [],
 *     "status": 200,
 *     "message": "成功"
 * }
 */
router.get('/api/message/list',authenticateToken,(req,res)=>{
  Message.messageListGet(req,res)
})

module.exports = router;