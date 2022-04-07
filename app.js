const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/usersDB", {useNewUrlParser: true});

const usersSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = new mongoose.model("User", usersSchema);

app.get("/", function(req, res){
    User.find(function(err, result){
        res.send(result);
    });
});

app.post("/signup", function(req, res){

    User.findOne({email: req.body.email}, function(err, foundUser){
        if(foundUser){
            res.send("User Already Exists");
        }else{
            bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                const user = new User({
                    email: req.body.email,
                    password: hash,
                });
                user.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        res.send("Successfully registered");
                    }
                });
            });
        }
    });
});

app.post("/login", function(req, res){
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email}, function(err, foundUser){
        if(err){
            console.log(err);
        }else if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result===true){
                    User.find(function(err, result){
                        res.send(result);
                    });
                }else{
                    res.send("Wrong password");
                }
            });
        }
    });
});


app.listen(3000, function(){
    console.log("Server started on port 3000.");
});