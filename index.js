const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://localhost:3000/Schema')

const UserSchema = mongoose.Schema({
    name: String,
    email: String,
})

const UserModel = mongoose.model("users", UserSchema)

app.get("/getUsers/"), (req, res) => {'Schema'
    res.json(UserModel.find())
}

app.listen (3001, () => {
    console.log('Server is running')
});