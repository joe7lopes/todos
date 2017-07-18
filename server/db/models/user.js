const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        minLenght: 1,
        unique: true,
        validate:{ 
            validator: validator.isEmail,
            message: `{VALUE} is not a valid email`
        }
    },
    password: {
        type: String,
        require: true,
        minLenght: 3
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token:{
            type: String,
            required: true
        } 
    }]

});

UserSchema.method.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    return __dirname.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id:user._id.toHexString(),
        access
    },'abc123').toString();

    user.tokens.push({access,token});
    return user.save().then( () => {
        return token;
    });
};

UserSchema.statics.findByToken = function(token){
    let User = this;
    let decoded;
    try{
        decoded = jwt.verify(token,'abc123');
    } catch(error){
        return Promise.reject();
    }
    
    return User.findOne({
        "_id": decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User}