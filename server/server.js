const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongoose');
const { Todo } = require('./db/models/todo');
const { User } = require('./db/models/user');

const app = express();
app.use(bodyParser.json());
let PORT = process.env.PORT || 3000;

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }).catch((err) => {
        res.status(400).send(err);
    });
});

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

app.delete('/todos/:id', (req,res) => {
    const idParam = req.params.id
    const id = new ObjectID(idParam);
    
});



app.listen(3000, () => { 
    console.log("server started!")
});

module.exports = {app};