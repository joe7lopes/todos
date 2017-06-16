const express = require('express');
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const { Todo } = require('./db/models/todo');
const { User } = require('./db/models/user');

const app = express();
app.use(bodyParser.json());
let PORT = process.env.PORT || 3000;

app.get('/todos', (req, res) => {
    res.send("working");
});

app.post('/todos', (req, res) => {

    console.log("request body",req.body);

    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then( (doc) => {
        res.send(doc);
    }).catch(err => {
        res.status(400).send(err);
    });

});

app.listen(3000, () => { 
    console.log("server started!")
});