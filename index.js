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

const server=app.listen(8888,()=>{
  console.log('服务器启动,正在监听8888端口');
  logger.info('服务器启动,正在监听8888端口');
})