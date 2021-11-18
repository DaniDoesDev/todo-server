var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo')

const privateKey = process.env.JWT_PRIVATE_KEY;

router.get('/', async function (req, res, next) {
    const todos = await Todo.find().exec()
    return res.status(200).json({ "todos": todos })
});

router.get('/:authorId', async function (req, res, next) {
    const todos = await Todo.find().where('author').equals(req.params.authorId).exec()
    console.log("CHECKED TODOS BY AUTHOR")
    return res.status(200).json({ "todos": todos })
});

// Validate before moving on
router.use(function (req, res, next) {
    console.log(req.header("Authorization"))
    if (req.header("Authorization")) {
        try {
            req.payload = jwt.verify(req.header("Authorization"), privateKey, { algorithms: ['RS256'] })
            console.log(req.payload)
        } catch (error) {
            return res.status(401).json({ "error": error.message });
        }
    } else {
        return res.status(401).json({ "error": "Unauthorized" });
    }
    next()
})

// router.get('/', async function(req, res, next) {
//     const todos = await Todo.find().exec()
//     return res.status(200).json({"todos": todos})
// });

router.delete('/:id', async function (req, res, next) {
    if (req.body.username && req.body.author) {
        if (req.body.username === req.body.author) {
            const todo = await Todo.findByIdAndRemove(req.params.id).exec()
            console.log("GOT A DELETE REQ")
            return res.status(200).json(todo)
        }
        res.status(400).json({"error": "Not authorized to delete this post"})
    } else {
        res.status(400).json({"error": "Missing username or author in req body"})
    }
});

router.patch('/:id', async function (req, res, next) {
    if (req.body.username && req.body.author) {
        if (req.body.username === req.body.author) {
            const todo = await Todo.findByIdAndUpdate(req.params.id, {
                completed: req.body.completed,
                dateCompleted: req.body.dateCompleted
            }).exec()
            console.log("GOT A TOGGLE REQ")
            return res.status(200).json(todo)
        }
        res.status(400).json({"error": "Not authorized to toggle this post"})
    } else {
        res.status(400).json({"error": "Missing username or author in req body"})
    }
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

    await todo.save().then(savedTodo => {
        return res.status(201).json({
            "id": savedTodo._id,
            "title": savedTodo.title,
            "description": savedTodo.description,
            "dateCreated": savedTodo.dateCreated,
            "completed": savedTodo.completed,
            "dateCompleted": savedTodo.dateCompleted,
            "author": savedTodo.author
        })
    }).catch(error => {
        return res.status(500).json({ "error": error.message })
    });
})

module.exports = router;
