const express = require('express');
const router = express.Router();
const Role = require('../Interface/role')
const Message = require('../Interface/message')
const {authenticateToken} = require('../common/authenticate')

router.get('/api/role/list',authenticateToken,(req,res)=>{
  Role.roleListGet(req,res)
})

router.post('/api/role/delete',authenticateToken,(req,res)=>{
  Role.deleteRole(req,res)
})
module.exports = router;