# Node项目的搭建

打算做一个企业内部使用的通讯软件的Node项目,这是搭建文档;

## 项目的开启

目标明确,直接开搞

> npm init

### 安装热更新模块

> npm install nodemon 

```json
"scripts": {
  "serve": "nodemon index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
},
```

### 安装 Express 模块

> npm install express --save

安装中间件

body-parser: 用于处理 JSON, Raw, Text 和 URL 编码的数据
cookie-parser: 用于解析Cookie
multer: 用于处理 enctype="multipart/form-data"（设置表单的MIME编码）的表单数据
bcrypt: 加密库
dotenv: 设置全局环境变量
jsonwebtoken: 

> npm install body-parser --save
> npm install cookie-parser --save
> npm install multer --save
> npm install bcrypt --save
> npm install dotenv --save
> npm install jsonwebtoken --save
> npm install log4js --save
> npm install uuid --save

### 数据库的选择

这次我就打算搞个小型的,就不上MySQL了, 上 SQlite 就好了.安装 sqlite3 库.

> npm install sqlite --save
> npm install sqlite3 --save

### 接口文档自动生成

> npm install express-jsdoc-swagger --save
> npm install swagger-jsdoc --save
> npm install swagger-ui-express --save
