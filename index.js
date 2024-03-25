const express=require('express')
const Routes=require('./Routes')  //路由文件
const User = require('./Interface/user')
const bodyParser = require('body-parser')
const dashboard = require('express-sqlite3-dashboard');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig')


const log4js = require('log4js'); //日志配置
log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
  categories: { default: { appenders: ['cheese'], level: 'trace' } }
});
const logger = log4js.getLogger();

const app = express(); //express配置
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use('/dashboard', dashboard({
    connection: {
      filename: dbPath
    },
    root: '/dashboard',
    table: 'your_table_name', // 指定要管理的表名
    // 其他可选配置...
  }));
  app.use('/',Routes) //挂载路由
  app.use('/user',User)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); //挂载Swagge文档

const server=app.listen(8888,()=>{
  console.log('服务器启动,正在监听8888端口');
  logger.trace('服务器启动,正在监听8888端口');
})