const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataBaseConnection = require('./DB/database');
const userModal = require('./modals/userModal');
const cors = require('cors');
const PostModel = require('./modals/postModal');
const verifyToken = require('./DB/verifyToken');
const commentModal = require('./modals/commentModal');
require('dotenv').config()

const app = express();
app.use(express.json())
app.use(cors());
dataBaseConnection();
// register

app.get('/', (req, res) => {
    res.send({message : 'Hello'})
})

app.post("/register", (req, res) => {
    let userData = req.body
    bcrypt.genSalt(10, (err, salt) => {
        if (!err) {
            bcrypt.hash(userData.password, salt, async (err, hash) => {
                userData.password = hash
                try {
                    let data = await userModal.create(userData)
                    res.status(201).send({ status: "success", message: "registration Sucess" })
                    // console.log(data);
                }
                catch (err) {
                    res.send({ message: { status: "exist", message: "some err happened while genarating hash" } })
                }
            })
        }
        else {
            res.status(403).send({ stutus: "error", message: "some err happened in the gen solt" })
        }
    })
})

// login

app.post("/login", async (req, res) => {
    try {
        let loginData = req.body
        let data = await userModal.findOne({ email: loginData.email })
        if (data != null) {
            bcrypt.compare(loginData.password, data.password, (err, result) => {
                if (result == true) {
                    jwt.sign({ email: data.email }, process.env.TOKEN, (err, token) => {
                        if (!err) {
                            res.status(201).send({ message: "Login sucess", token: token, user_id: data._id, user_name: data.name })
                        }
                        else {
                            res.status(401).send({ message: "token not generated" })
                        }
                    })
                }
                else {
                    res.status(404).send({ message: "password is incorrect" })
                }
            })
        }
        else {
            res.status(404).send({ message: "Email not found" })
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: "send proper data" })
    }
})

// all blogs 

app.get("/allblogs", verifyToken, async (req, res) => {
    try {
        let blogs = await PostModel.find().populate("userId")
        res.status(201).send(blogs)
        // console.log(blogs);
    }
    catch (err) {
        res.status(500).send({ message: "some err happened by the gettind the food" })
    }
})

// post

app.post('/post', verifyToken, async (req, res) => {
    try {
        let data = await PostModel.create(req.body);
        res.status(201).send({ message: "Post Created", data });
        // console.log(data);
    } catch (err) {
        res.status(404).send({ message: "Data can't be added", err });
        console.log(err);
    }
});

// find single blog

app.get("/singlePost/:id", async (req, res) => {
    try {
        let post = await PostModel.find({ userId: req.params.id }).populate("userId")
        res.status(201).send(post)
        // console.log(post);
    }
    catch (err) {
        res.status(500).send({ message: "some err happened in he getting single post", err })
    }
})

// delete single post

app.delete("/deletepost/:id", verifyToken, (req, res) => {
    PostModel.deleteOne({ _id: req.params.id }).populate("userId")
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "Data successfully deleted" })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Some err happend in the Deleting POST" })
        })
})

// users 

app.get('/users', (req, res) => [
    userModal.find()
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "We get All users", data: data })
        })
        .catch((err) => {
            res.status(500).send({ message: "some err happened in the getting users" })
        })
])

// search users 

app.get("/userSearch/:id", (req, res) => {
    userModal.find({ name: { $regex: req.params.id, $options: "i" } })
        .then((data) => {
            // console.log(data);
            res.status(201).send({ data: data })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "err" })
        })
})

// particular user posts 

app.get('/userPost/:id', verifyToken, (req, res) => {
    PostModel.find({ userId: req.params.id }).populate("userId")
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "You get the user posts", data: data })
        })
        .catch((err) => {
            // console.log(err);    
            res.status(500).send({ message: "Some err happened" })
        })
})

// serch posts 

app.get("/search/:name", verifyToken, (req, res) => {
    PostModel.find({ category: { $regex: req.params.name, $options: "i" } }).populate("userId")
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "You get search results", data })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "some err happened in the search" })
        })
})

// update post 

app.put('/updatePost/:id', verifyToken, (req, res) => {
    let updateData = req.body
    PostModel.updateOne({ _id: req.params.id }, updateData)
        .then((data) => {
            res.status(201).send({ message: "Data Updated", data })
            // console.log(data);
        })
        .catch((err) => {
            res.status(500).send({ message: "some err happened in the update data" })
            console.log(err);
        })
})

// watch-Blog

app.get("/seePost/:id", verifyToken, (req, res) => {
    PostModel.find({ _id: req.params.id }).populate("userId")
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "This is your post data", data: data })
        })
        .catch((err) => {
            res.status(500).send({ message: "you get some err" })
            console.log(err);
        })
})

// add comment 

app.post("/addComment/:postId", verifyToken, (req, res) => {
    commentModal.create(req.body)
        .then((data) => {
            // console.log(data);
            res.status(201).send({ message: "Comment added", comment: data })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Some problem happened" })
        })
})

// getComment

app.get("/getComment/:postId", verifyToken, async (req, res) => {
    try {
        let userComments = await commentModal.find({ postId: req.params.postId }).populate("postId").populate("userId")
        res.status(201).send({ message: "You get All the comments", data: userComments })
        // console.log(data);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ message: "some err happened" })
    }
})

app.listen(8000,()=>{
    console.log('Server Running');
})