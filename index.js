const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));

// Parse requests of content-type - application/json
app.use(bodyParser.json());

// Database configuration to start please follow these steps
// open mongodb connect using the vs
// add admin and password followed by @cluster0 -->> now we are good to go
const dbConfig =
    'mongodb+srv://aman:kCSCNOKaWc0DOYg3@cluster0.pi6cul1.mongodb.net/test';

mongoose.Promise = global.Promise;

mongoose
    .connect(dbConfig, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((err) => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });

// Defined the comment schema for our database.

const commentSchema = mongoose.Schema(
    {
        feed_id: String,
        user_id: String,
        comment: String,
    },
    {
        timestamps: true,
    }
);


const Comment = mongoose.model('Comment', commentSchema);

// Created a new comment for a feed 
// sample link for new comment localhost:3000/commnets

app.post('/comments', (req, res) => {
    // added a new comment
    const comment = new Comment({
        feed_id: req.body.feed_id,
        user_id: req.body.user_id,
        comment: req.body.comment,
    });

    // Saved the comment to the database

    comment
        .save()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while creating the comment.',
            });
        });
});

// Read all comments of a user on a feed
// just add user_id and feed_id which we have already recieved by a comment api

app.get('/comments/:user_id/:feed_id', (req, res) => {
    Comment.find({ user_id: req.params.user_id, feed_id: req.params.feed_id })
        .then((comments) => {
            res.send(comments);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    'Some error occurred while retrieving comments.',
            });
        });
});

// Delete a comment posted by a _id
// Note we will get id after we fetch the comment

app.delete('/comments/:id', (req, res) => {
    Comment.findByIdAndRemove(req.params.id)
        .then((comment) => {
            if (!comment) {
                return res.status(404).send({
                    message: 'Comment not found with id ' + req.params.id,
                });
            }
            res.send({ message: 'Comment deleted successfully!' });
        })
        .catch((err) => {
            res.status(500).send({
                message: 'Could not delete comment with id ' + req.params.id,
            });
        });
});

// Start the server
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
