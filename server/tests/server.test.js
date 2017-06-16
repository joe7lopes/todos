const expect = require('expect');
const request = require('supertest');
const { app } = require('./../server');
const { Todo } = require('./../db/models/todo');


beforeEach( (done) => {

    Todo.remove({}).then( () => done() );

});

describe('POST /todos',()=>{

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
                Todo.find().then((todos)=>{
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch( err => {
                    done(err);
                });
            });
    });

});

// describe('PATCH /todos/:id',()=>{

//     it('should update de todo', (done)=>{
//         var hexId = todos[0]._id.toHexString();
//         var text = 'This should be a new text';

//         request(app)
//             .patch(`/todos/${hexId}`)
//             .send({
//                 completed: true,
//                 text: text
//                 })
//     });


// });

