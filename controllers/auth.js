const User = require('../models/user')
const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

exports.signup = (req, res) => {
    User.findOne({email: req.body.email}).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
        const {name, email, password} = req.body;

        let username = shortid.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;
        let newUser = new User({name, email, password, profile, username});

        newUser.save((err, success) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            res.json({
                message: 'Signup success! Please Signin!'
            });

        });
    });
}

exports.signin = (req, res) => {
    const {email, password} = req.body;
    // check if user exists
    User.findOne({email}).exec((err, user) => {
        if (err || !user) {
            return res().status(400).json({
                error: 'User with that email does not exists. please signup'
            });
        }

        //authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password does not match.'
            });
        }

        //generate a token and send to client
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.cookie('token', token, {expiresIn: '1d'});

        const {_id, username, name, email, role} = user;
        return res.json({
            token,
            user: {_id, username, name, email, role}
        })
    })
}

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Signout success.'
    })
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET
})


exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id
    User.findById({_id: authUserId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User Not Found'
            })
        }
        req.profile = user
        next()
    })
}

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id
    User.findById({_id: adminUserId}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User Not Found'
            })
        }
        if(user.role !== 1){
            return res.status(400).json({
                error: 'Admin Resource access denied'
            })
        }
        req.profile = user
        next()
    })
}
