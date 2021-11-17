var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo')

const privateKey = process.env.JWT_PRIVATE_KEY;

router.get('/', async function(req, res, next) {
    const todos = await Todo.find().exec()
    return res.status(200).json({"todos": todos})
});

router.get('/:authorId', async function(req, res, next) {
    const todos = await Todo.find().where('author').equals(req.params.authorId).exec()
    console.log("CHECKED TODOS BY AUTHOR")
    return res.status(200).json({"todos": todos})
});

// Validate before moving on
router.use(function(req, res, next) {
      console.log(req.header("Authorization"))
      if (req.header("Authorization")) {
          try {
              req.payload = jwt.verify(req.header("Authorization"), privateKey, { algorithms: ['RS256'] })
              console.log(req.payload)
          } catch(error) {
              return res.status(401).json({"error": error.message});
          }
      } else {
          return res.status(401).json({"error": "Unauthorized"});
      }
      next()
  })

// router.get('/', async function(req, res, next) {
//     const todos = await Todo.find().exec()
//     return res.status(200).json({"todos": todos})
// });

router.delete('/:id', async function(req, res, next) {
    const todo = await Todo.findByIdAndRemove(req.params.id).exec()
    console.log("GOT A DELETE REQ")
    return res.status(200).json(todo)
});

router.post('/', async function (req, res) {
  const todo = new Todo({
    "title": req.body.title,
    "description": req.body.description,
    "dateCreated": req.body.dateCreated,
    "completed": req.body.completed,
    "dateCompleted": req.body.dateCompleted,
    "author": req.body.author
    })

    await todo.save().then( savedTodo => {
        return res.status(201).json({
            "id": savedTodo._id,
            "title": savedTodo.title,
            "description": savedTodo.description,
            "dateCreated": savedTodo.dateCreated,
            "completed": savedTodo.completed,
            "dateCompleted": savedTodo.dateCompleted,
            "author": savedTodo.author
        })
    }).catch( error => {
        return res.status(500).json({"error": error.message})
    });
})

module.exports = router;
