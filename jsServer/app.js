const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const compression = require('compression')
const errorhandler = require('errorhandler')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const passport = require('passport')
require('./passport')
const app = express()
const path = require('path')

// mongoose config
mongoose.connect('mongodb://127.0.0.1:27017/test', {useNewUrlParser: true})
mongoose.connection.on('error', () => {
    console.log('No mongodb server')
})

// redis config
const redis = require('redis')
const RedisStore = require('connect-redis')(session)
const redisClient = redis.createClient('6379', 'localhost')

// session config
const sessionSet = {
    name: "test.sid",
    resave: true,
    saveUninitialized: true,
    secret: 'testsecret',
    store: new RedisStore({
        client: redisClient,
        ttl: 99999999,
        auto_reconnect: true
    })
}

// models config
const User = require('../models/User')

// view engine config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade')
app.use(compression())
app.use(morgan('dev'))

// parser config
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true, limit: '30mb', parameterLimit: 30000}))
app.use(expressValidator())

// use session
app.use(session(sessionSet))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

// routes and controller
app.get('/', (req, res) => {
    console.log(req.user)
    if (req.user) {
        res.render('servers', {server: 'js', name: req.user.name})
    } else {
        res.render('reg')
    }
})
app.get('/js/servers', (req, res) => {
    if (!req.user) {
        res.render('login')
    } else {
        res.render('servers')
    }
})
app.get('/js/info', (req, res) => {
    return res.json({err: 0, name: req.user.name})
})
app.get('/js/cookie', (req, res) => {
    console.log(req)
    return res.json({err: 0, cookie: req.headers.cookie})
})
app.get('/js/signin', (req, res) => {
    if (req.user) {
        return res.redirect('/js/servers')
    }
    return res.render('login')
})
app.post('/js/reg', async (req, res) => {
    console.log('new reg: ' + req.body)
    const name = req.body.name
    const password = req.body.password
    await new User({name, password}).save()
    return res.json({err: 0})
})
app.post('/js/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        console.log(info)
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.send('Not Exist!')
        }
        req.logIn(user, (err) => {
            console.log(user)
            if (err) {
                return next(err)
            } else {
                return res.json({err: 0})
            }
        })
    })(req, res, next)
})

app.use(errorhandler())
const server = app.listen(3000, () => {
    console.log('listening at ', server.address().port)
})