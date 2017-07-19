const expect = require('expect');
const request = require('supertest');
const { app } = require('./../server');
const { Todo } = require('./../db/models/todo');
const { ObjectID } = require('mongodb');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const {User} = require('./../db/models/user');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('GET /todos', () => {

    it('should return all the todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });


    it('should find todo by id', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return a todo by id', (done) => {
        request(app)
            .get('/todos/{}')
            .expect(404)
            .end(done);
    });


});

describe('POST /todos',() => {

    it('should create a new Todo', (done) => {
        const text = "a new text";
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((req) => {
                expect(req.body.text).toBe(text);
            }).end( (err) => {
                if(err){
                    return done(err);
                }

                //we can do more assertions against de DB.
                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err)=>{
                    done(err);
                });
                
            });
    });

    it('should not create a todo with invalid data', (done) =>{
        request(app)
            .post('/todos')
            .send()
            .expect(400)
            .end( (err,res) => {
                if(err){
                    return done(err)
                }
                // Check that no todo was created in DB
                Todo.find().then( (todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch( err => {
                    done(err);
                });
            });
    });

});


describe('DELETE /todos/:id', () => {

    it('should delete todo by id', (done) => {

        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .end((err, res) => {
                //Check agains DB
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                }).catch( err => {
                    done(err);
                });
            });
    });


});

describe('PATCH /todos/:id',() => {

    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString();
        var text = 'This should be a new text';
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed: true,
                text: text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completeAt when todo is not completed', (done) => {
        const id = todos[1]._id.toHexString();
        const text = "bla bla";
        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });

});

describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
        const token = users[0].tokens[0].token;
        request(app)
            .get('/users/me')
            .set('x-auth', token)
            .expect(200)
            .expect(res =>{
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            }).end(done);
    });

    it('should return 401 if not authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res =>{
                expect(res.body).toEqual({});
            }).end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) =>{
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end(err =>{
                if(err){
                    return done(err);
                }

                User.findOne({email}).then(user => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                });

            });
    });

    it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

   it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

