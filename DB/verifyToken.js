const jwt = require('jsonwebtoken');

function verifyToken(req,res,next) {
    if(req.headers.authorization != undefined){
        let token = req.headers.authorization.split(" ")[1]
        jwt.verify(token,"blog",(err)=>{
            if(!err){
                next();
            }
            else{
                res.send({message:"This is wrong Token"});
            }
        })
    }
    else{
        res.send({message:"Please send token"});
    }
}

module.exports = verifyToken