'use strict'
const passport = require('passport')
const User = require('../models/User')
const LocalStrategy = require('passport-local').Strategy

// user._id <=> User

passport.serializeUser((user, done) =>{
    done(null, user.id);
})
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

// Check Password
passport.use(new LocalStrategy({usernameField: 'name'}, function (name, password, done) {
    User.findOne({name}, (err, user) => {
        if (!user) return done(null, false, {message: 'Not Exist'})
        user.comparePassword(password, (err, isMatch) => {
            if (isMatch) {
                delete user.password;
                return done(null, user);
            } else {
                return done('not match', false, {message: 'PWD Not Right'});
            }
        })
    })
}))


