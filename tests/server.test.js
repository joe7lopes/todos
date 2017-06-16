

describe('PATCH /Todos/:id',()=>{

it('should update de todo', (done)=>{
    var hexId = todos[0]._id.toHexString();
    var text = 'This should be a new text';

    request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: true,
            text: text
            })
});


});