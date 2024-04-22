require('dotenv').config()
const logger = require('./common/log');

// 检测SQLite数据库
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./SQLite.db', (err) => {
  if (err) {
    logger.error(err.message)
  } else {
    logger.info('已检测到SQLite数据库');
  }
});
db.close();

//express配置
const express=require('express')
const app = express();

//数据处理
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//自动生成Swagger配置
const expressJSDocSwagger = require('express-jsdoc-swagger');
const swaggerConfig = require('./swaggerConfig')
expressJSDocSwagger(app)(swaggerConfig);

//挂载路由
const userRoutes=require('./Routes/user')
const messageRoutes=require('./Routes/message')
app.use('/',userRoutes)
app.use('/',messageRoutes)

const PORT = process.env.PORT || 8888;

// 启动 WebSocket 服务
const WSdev = require('./common/webSocket');
WSdev.start();
 
// 启动 Express 服务 
const c  = require('child_process')
const server=app.listen(PORT,()=>{
  console.log('  Express 服务启动,正在监听'+ PORT +'端口');
  logger.info('/index.js Express服务启动,正在监听'+ PORT +'端口');
  console.log('  Swagger 文档地址:http://localhost:8888/docs')
  // c.exec('start http://localhost:8888/docs')
})