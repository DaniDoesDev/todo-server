const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TodoSchema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String, required: false,},
    dateCreated: {type: String, required: true},
    completed: {type: Boolean, required: true},
    dateCompleted: {type: String, required: false},
    author: {type: Schema.Types.ObjectId, ref: 'User'}
  }
);

//Export model
module.exports = mongoose.model('Todo', TodoSchema);

