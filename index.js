require('dotenv').config()
const logger = require('./common/log');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbFilePath = './SQLite.db';
const sqlFilePath = 'SQLite.sql';

// 检查数据库文件是否存在
if (!fs.existsSync(dbFilePath)) {
  console.log('未检测到SQLite数据库，正在初始化...');
  // 数据库不存在，执行 SQL 初始化脚本
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  // 创建数据库并执行 SQL 脚本
  let db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) {
      console.error('无法打开或创建数据库:', err.message);
      process.exit(1);
    } else {
      console.log('SQLite数据库已创建');
    }
  });

  // 单独执行 SQL 文件中的语句：检查SQL脚本语法问题
  db.serialize(async () => {
    sql.split(/;\s*/).forEach((stmt) => {
      if (stmt.trim()) {
        db.run(stmt, (err) => {
          if (err) {
            console.error(`执行 SQL 语句时出错: ${stmt}`);
            console.error(`错误: ${err.message}`);
          }
        });
      }
    });
    console.log('SQL 文件执行成功。')
  });

  db.close((err) => {
    if (err) {
      console.error('关闭数据库时出错:', err.message);
    } else {
      console.log('数据库已关闭');
    }
  });
} else {
  console.log('已检测到SQLite数据库，无需初始化。');
}




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

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的拒绝', { reason, promise });
  process.exit(1);
});