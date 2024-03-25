const express = require('express');
const router = express.Router();

// 用户数据，实际应用中应该从数据库中获取
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

router.get('/', (req, res) => {
  res.json(users);
});

// 获取所有用户的接口
router.get('/users', (req, res) => {
  res.json(users);
});

// 获取单个用户的接口
router.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('用户未找到');
  }
});

// 创建新用户的接口
router.post('/users', (req, res) => {
  // 在实际应用中，您需要验证和处理输入数据
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).send(newUser);
});

module.exports = router;