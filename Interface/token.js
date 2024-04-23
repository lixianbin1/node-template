const log4js = require('log4js');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const logger = log4js.getLogger('user');

//token刷新
exports.userJWTGet = async(req,res)=>{
  logger.info('userJWTGet: 刷新token')
  try{
    let { token } = req.query;
    if(!token){
      return res.status(400).send({ status:"400",message: '未填写Token' });
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err){ // token无效或已过期
        return res.status(403).send({status:"403",message:'token无效或已过期'})
      }
      req.user = user;
      const token = jwt.sign({ id: user.UserID, name:user.UserName }, SECRET_KEY, { expiresIn: Expiration });
      return res.status(200).send({status:"200",token,message:'token已刷新'})
    });
  }catch(err){
    logger.error('userCreatePost Error:' + err)
    console.error('userCreatePost Error:', err);
    res.status(500).send({status:"500",message:'无法获取数据库连接'});
  }
}
