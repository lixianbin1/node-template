# node-template

一个node项目,用于企业内部通讯的服务。配套有Electron客户端。模块有：消息模块，联系人模块，系统模块等

## 快速开始

启动服务项目

> yarn install
> yarn dev

## 项目结构

```m
  |—— common/       //公共模块
    |—— authenticate.js //认证管理
    |—— database.js     //数据库连接池
    |—— webSocket.js    //websocket服务
  |—— Interface/    //接口
    |—— user.js         //用户管理接口
    |—— ...
  |—— Logs/         //日志
    |—— info.log      //详细日志文件
    |—— error.log     //错误日志文件
    |—— ...
  |—— Routes/       //路由
  |—— SQLiteStudio/ //数据库管理工具（忽略该文件夹）
  |—— .env          //环境变量
  |—— .gitignore    //忽略文件
  |—— index.js      //入口文件
  |—— package.json  //项目配置文件
  |—— README.md     //项目说明
  |—— SQLite.db     //数据库文件
  |—— SQLite.sql    //数据库脚本
  |—— swaggerConfig.js //swagger配置文件
```

## 项目模块

项目启动后，可以通过访问 `http://localhost:8888/docs` 来访问项目的Swagger，查看接口文档。

### 用户模块

在项目 `Interface` 和 `Router` 文件夹下，分别有 `user.js` 文件，分别对应用户模块的接口和路由。

1. 用户登录

 - /api/user/login

method: POST
params: {
  Email: 'string',    //邮件地址
  Password: 'string'  //用户密码
}

...

### 消息模块

在项目 `Interface` 和 `Router` 文件夹下，分别有 `message.js` 文件，分别对应消息模块的接口和路由。

1. 发送消息

 - /api/user/login

method: POST
params: {
  Email: 'string',    //邮件地址
  Password: 'string'  //用户密码
}
...

