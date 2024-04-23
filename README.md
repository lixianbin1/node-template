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

## 项目说明

 - 项目支持 `WebSocket` 服务

项目启动后，可以通过连接 `http://localhost:8889` 来访问项目的WebSocket。

 - 项目支持 `Swagger` 文档

项目启动后，可以通过访问 `http://localhost:8888/docs` 来访问项目的Swagger，查看接口文档。

### WebSocket服务

在用户登录后，可以在后台log记录查看用户的登录和下线信息，用户在发送消息的时候，WebSocket会同步推送消息给已登录用户并记录消息进数据库。

## 项目模块

### 登录系统

登录系统有token验证，登录成功后，会返回一个token，后续的请求都需要带上token。同时token只有一个小时的有效性（可以配置），超过一个小时，token失效。需要前端在请求接口时判断Header是否携带Refresh-Authorization，如果存在，则需要替换token。

 - 1. 用户登录 `/api/user/login`
 - 2. 退出登录 `/api/user/exit`


### 用户模块

由于是内部项目，所有用户都是由管理员进行创建，同时密码为默认密码（可以配置），用户模块有创建，详情，列表等相关接口。

在项目 `Interface` 和 `Router` 文件夹下，分别有 `user.js` 文件，分别对应用户模块的接口和路由。

 - 1. 获取用户列表 `/api/user/list`
 - 2. 获取用户详情 `/api/user/info`
 - 3. 创建用户 `/api/user/create`

...

### 消息模块

消息模块有发送消息，消息列表，创建群组，群组消息等相关接口。

在项目 `Interface` 和 `Router` 文件夹下，分别有 `message.js` 文件，分别对应消息模块的接口和路由。

 - 1. 发送消息 `/api/message/create`
 - 2. 获取消息列表 `/api/message/list`

...

### 权限模块

权限模块：角色管理，权限分配，权限详情，权限列表等。

### 管理模块

管理模块有：组织架构，部门管理，用户管理，系统管理等。
