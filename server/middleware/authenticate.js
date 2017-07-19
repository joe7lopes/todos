var {User} = require('./../db/models/user');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth');
    
    User.findByToken(token).then( (user) => {
        if(!user){
            console.log("user not found");
            return Promiss.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch( e => {
        res.status(401).send();
    });
};

module.exports = {authenticate};