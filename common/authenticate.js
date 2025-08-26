const jwt = require('jsonwebtoken');
const myPool = require('../common/database.js');
const SECRET_KEY = process.env.SECRET_KEY;
const log4js = require('log4js');
const logger = log4js.getLogger('authenticate');
exports.authenticateToken=(req, res, next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null){
        return res.code(401).send({code:"401",message:'无权限访问'})
    } 
    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if (err){
            logger.error('001 Error：' + err)
            return res.code(403).send({code:"403",message:'token无效或已过期'})
        }
        const db = await myPool.acquire()
        try{
            db.get('SELECT Token FROM LoseToken WHERE Token = ?',[token],async(err,row)=>{
                if(err){
                    logger.error('002 Error:' + err)
                    return res.code(500).send({code:500,message:'数据库查询出错'});
                }else if(row){
                    return res.code(403).send({code:"403",message:'token无效或已过期'})
                }
                let Expiration = process.env.Expiration
                let exp = user.exp * 1000
                let now = new Date().getTime()
                if (exp - now <= 60 * 1000) {
                    const newToken = jwt.sign({ id: user.UserID, name:user.UserName }, SECRET_KEY, { expiresIn: Expiration });
                    res.setHeader('Refresh-Authorization',newToken );
                }
                req.user = user;
                next();
            })
        }catch(err){
            logger.error('003 Error:' + err) 
        }finally{
            myPool.release(db); //释放连接 
        }
    });
}