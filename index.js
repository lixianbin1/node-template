require('dotenv').config()
const express=require('express')
const Routes=require('./Routes')  //路由文件
const bodyParser = require('body-parser')
const swaggerConfig = require('./swaggerConfig')

const log4js = require('log4js'); //日志配置
log4js.configure({
  appenders: {
    errorFile: { type: 'file', filename: './Logs/errors.log' },
    debugFile: { type: 'file', filename: './Logs/debugs.log' },
    infoFile: { type: 'file', filename: './Logs/info.log' },
    error: { type: 'logLevelFilter', level: 'error', appender: 'errorFile' },
    debug: { type: 'logLevelFilter', level: 'debug', appender: 'debugFile', maxLevel: 'debug' },
    info: { type: 'logLevelFilter', level: 'info', appender: 'infoFile', maxLevel: 'info' }
  },
  categories: {
    default: { appenders: ['info', 'debug', 'error'], level: 'trace' }
  }
});
const logger = log4js.getLogger();

// 检测SQLite数据库
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./SQLite.db', (err) => {
  if (err) {
    logger.error(err.message)
  } else {
    logger.info('已连接到SQLite数据库');
  }
});
db.close();

const app = express(); //express配置

//自动生成Swagger配置
const expressJSDocSwagger = require('express-jsdoc-swagger');
expressJSDocSwagger(app)(swaggerConfig);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/',Routes) //挂载路由

const PORT = process.env.PORT || 8888;
const WSPORT = process.env.WSPORT || 8889;

// 启动 WebSocket 服务
const WSdev = require('./common/webSocket');
WSdev.start();
 
// 启动 Express 服务 
const c  = require('child_process')
const server=app.listen(PORT,()=>{
  console.log('  Express 服务启动,正在监听'+ PORT +'端口');
  logger.info('/index.js Express服务启动,正在监听'+ PORT +'端口');
  // c.exec('start http://localhost:8888/docs')
})