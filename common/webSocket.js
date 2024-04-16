const WebSocket = require('ws');
const log4js = require('log4js'); //日志配置
const logger = log4js.getLogger();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
//验证token  
function verifyToken(token) {  
    var isValid = false
    var user = null;
    jwt.verify(token, SECRET_KEY, (err, _user) => {
        if (!err){
            isValid = true
            user = _user
        }
    });
    return {isValid,user};  
  }  

class WebSocketServer {  
    constructor(port) {  
        this.wss = new WebSocket.Server({ 
            port,
            verifyClient: (info, done) => {
                const token = info.req.headers.authorization || info.req.url.split('?')[1].split('=')[1];
                const { isValid, user } = verifyToken(token);
                if (isValid) {  
                    info.req.user = user; //将用户信息附加到请求对象上
                    done(true); //验证通过，允许连接  
                  } else {  
                    done(false, 401, 'Unauthorized'); //验证失败，拒绝连接并返回 401 状态码  
                  }  
            }
         }); 
        this.clients = new Map(); //使用Map来存储客户端连接  
        this.wss.on('connection', this.onConnection.bind(this));  
    }
    //监听客户端连接
    onConnection(ws,req) {
        const user = req.user
        this.clients.set(user.id, ws); 
        console.log("WebSocket :"+user.id+"用户已上线");
        logger.info("WebSocket :"+user.id+"用户已上线")
        ws.on('message', (messageBuffer) => {  
            //将Buffer解码为UTF-8字符串  
            const messageString = messageBuffer.toString('utf8');
            console.log('接受消息:', messageString);  
            ws.send('Message received: ' + messageString); 
            
        });
        //断开连接
        ws.on('close', () => {
            this.removeClient(ws)
        });
    }
    //广播消息给所有连接的客户端，除了指定的ws  
    broadcast(message, exceptWs){
        this.clients.forEach((client) => {  
            if (client !== exceptWs && client.readyState === WebSocket.OPEN) {  
                client.send(message);  
            }
        });  
    }
    //推送给特定人员
    sendMessageToUser(userId, message) {
        const ws = this.clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }else{
            console.log("WebSocket :"+userId+"用户不在线");
            logger.info("WebSocket :"+userId+"用户不在线")
        }
    }
    //从连接列表中移除指定的客户端  
    removeClient(userId) {  
        const ws = this.clients.get(userId);
        if (ws) {
            ws.close();
            this.clients.delete(userId);
            console.log("WebSocket :"+userId+"用户已下线");
            logger.info("WebSocket :"+userId+"用户已下线")
        }
    }  
    //启动服务
    start() { 
        console.log('WebSocket 服务启动,正在监听'+ this.wss.options.port +'端口');
        logger.info('./common/webSocket.js WebSocket服务启动,正在监听'+ this.wss.options.port +'端口');
    }  
}  

const WSPORT = process.env.WSPORT || 8889;
const WSdev = new WebSocketServer(WSPORT);

module.exports = WSdev;