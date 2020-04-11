const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const redis = require('redis')
const passportSocketIo = require('passport.socketio')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redisClient = redis.createClient()
const cookieParser = require('cookie-parser')
const passport = require('passport')
require('dotenv').config()
require('./db/connectDB')
const { SERVER_PORT, NODE_ENV } = process.env
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const initPassport = require('./middleWare/passportConfig')
const HttpError = require('./middleWare/errorMiddleware')
app.use(compression())
app.set('views', './views')
app.set('view engine', 'pug')
const sessionStore = new RedisStore({ client: redisClient })

if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'))
}
const errorLog = fs.createWriteStream(path.join(__dirname, 'logs/error.log'), { flags: 'a' })

app.use(
  session({
    store: sessionStore,
    secret: 'keyboard cat',
    name: 'connect.sid',
    resave: false,
    // cookie: { secure: false },
    saveUninitialized: true
  })
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'views/public')))
initPassport(passport)
redisClient.on('error', console.error)
redisClient.on('ready', () => console.log('redis ok'))

app.get('/', (req, res) => {
  res.render('index')
})

const text = require('./text/router')
app.use('/text', text)

const chat = require('./chat/router')
app.use('/chat', chat)

const users = require('./users/router')
app.use('/users', users)

const photo = require('./files/router')
app.use('/photo', photo)

const files = require('./files/router')
app.use('/files', files)

function onAuthorizeFail (data, message, error, accept) {
  NODE_ENV === 'dev' && console.log(message)
  accept(null, !error)
}

function onAuthorizeSuccess (data, accept) {
  NODE_ENV === 'dev' &&
    console.log(data.user.loginName, 'successful connection to socket.io')
  accept(null, true)
}

io.use(
  passportSocketIo.authorize({
    key: 'connect.sid',
    secret: 'keyboard cat',
    store: sessionStore,
    passport: passport,
    cookieParser: cookieParser,
    success: onAuthorizeSuccess, // *optional* callback on success
    fail: onAuthorizeFail // *optional* callback on fail/error
  })
)

require('./io')(io)

app.get('*', (req, res, next) => {
  next(new HttpError('Forbidden/Not found', 404))
})

app.post('*', (req, res, next) => {
  next(new HttpError('Forbidden/Not found', 404))
})

app.use((error, req, res, next) => {
  NODE_ENV === 'dev' && console.error('Main error handler', error)
  errorLog.write(`${JSON.stringify({
    time: Date.now(),
    url: req.url,
    method: req.method,
    message: error.message,
    stack: error.stack
  })}\n`)
  if (error && error.status) {
    res.status(error.status)
    res.send(error)
  } else {
    const answer = new Error()
    answer.message = 'Uncaught exeption!'
    res.status(500).send(answer)
  }
})

http.listen(
  SERVER_PORT,
  () =>
    NODE_ENV === 'dev' &&
    console.log(`Server listening on port ${SERVER_PORT}!`)
)

module.exports = { app, io }
