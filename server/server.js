require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongodb');
const { Todo } = require('./db/models/todo');
const { User } = require('./db/models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
app.use(bodyParser.json());
let PORT = process.env.PORT;

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if(!todo){
            res.status(404).send();
        }
        res.send({todo})
    }).catch(err =>{
        res.status(400).send(err);
    });
});

//POST ROUTE
app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then( (doc) => {
        res.send(doc);
    }).catch(err => {
        res.status(400).send(err);
    });

});

//DELETE ROUTE
app.delete('/todos/:id', (req,res) => {
    const id = req.params.id
    
    if(!ObjectID.isValid(id)){
        return res.send(404);
    }

    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo){
             res.status(404).send();
        }
        res.send();
    }).catch( err => {
        res.status(400).send();
    });
    
});

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    var body = _.pick(req.body, ['text', 'completed']);

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }else{
        body.completed = false;
        body.completedAt = null;
    }
    
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo){
            res.status(404).send();
        }
        res.send({todo});    
    }).catch( err => {
        res.status(400).send();
    });


});

//USERS ROUTES
app.post('/users', (req, res) => {

    var  body = _.pick(req.body,['email','password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then( (token) => {
        res.header('x-auth',token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me',authenticate,(req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.send();
    }, () => {
        res.status(400).send();
    });
    
});

app.listen(3000, () => { 
    console.log("server started!")
});

module.exports = {app};