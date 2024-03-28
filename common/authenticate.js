const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const log4js = require('log4js');
const logger = log4js.getLogger('user');
exports.authenticateToken=(req, res, next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null){
        return res.status(401).send({status:"401",message:'无权限访问'})
    } 
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err){ // token无效或已过期
            console.log(err)
            return res.status(403).send({status:"403",message:'token无效或已过期'})
        }
        req.user = user;
        next();
    });
}