const mongoose = require('mongoose');

var Todo = mongoose.model('User', {
    email:{
        type: String,
        required: true,
        trim: true,
        minLenght: 1
    }

});