const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const path = require('path')
const redis = require('redis')
const passportSocketIo = require('passport.socketio')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redisClient = redis.createClient()
const cookieParser = require('cookie-parser')
const passport = require('passport')
require('dotenv').config()
require('./db/conectDB')
const { SERVER_PORT, NODE_ENV } = process.env
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const initPassport = require('./middleWare/passportConfig')
app.use(compression())
app.set('views', './views')
app.set('view engine', 'pug')
const sessionStore = new RedisStore({ client: redisClient })
app.use(
  session({
    store: sessionStore,
    secret: 'keyboard cat',
    name: 'connect.sid',
    resave: false,
    cookie: { secure: false },
    saveUninitialized: true
  })
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))
initPassport(passport)
redisClient.on('error', console.error)
redisClient.on('ready', () => console.log('redis ok'))

app.get('/', (req, res) => {
  res.render('index')
})

// or
// This function accepts every client unless there's an error
function onAuthorizeFail(data, message, error, accept) {
  console.log(message)
  accept(null, !error)
}

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io')

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true)
}

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

io.use((socket, next) => {
  console.log('socket')
  next()
})
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

io.on('connection', socket => {
  console.log(io.sockets.connected)
  socket.join('some_room')
  if (!socket.request.user.logged_in) {
    io.to('some_room')
      .to(socket.id)
      .emit('not_aut')
    // io.sockets.connected[socket.id].disconnect()
    // socket.disconnect(true)
  }

  // socket.on('disconnect', () => {
  //   delete usersList[socket.id]
  // })

  socket.on('new-user', () => {
    io.to('some_room').emit('people online', usersList)
    io.to('some_room').emit(
      'chat_message',
      `Welcome ${socket.request.user.loginName}`
    )
  })

  socket.on('chat_message', msg => {
    console.log(io.sockets.clients())

    // passportSocketIo
    //   .filterSocketsByUser(io, function(user) {
    //     return user.loginName === 'Alex'
    //   })
    //   .forEach(function(socket) {
    //     socket.emit('chat_message', 'hello, woman!')
    //   })
    io.to('some_room').emit(
      'chat_message',
      `${socket.request.user.loginName}: ${socket.id}`
    )
  })

  // setTimeout(function run() {
  //   io.to('some_room').emit('people online', usersList)
  //   setTimeout(run, 60000)
  // }, 60000)
})

app.get('*', (req, res) => {
  res.sendStatus(404)
})

app.use((error, req, res, next) => {
  NODE_ENV === 'dev' && console.error('use', error)
  if (error) {
    res.status(error.status)
    res.send(error)
  } else {
    const answer = new Error()
    answer.message = 'Uncaught exeption!'
    res.status(500).send(answer)
  }
})

http.listen(SERVER_PORT, () =>
  console.log(`Server listening on port ${SERVER_PORT}!`)
)

module.exports = { app, io }
