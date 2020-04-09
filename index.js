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
    cookie: { secure: true, maxAge: 60000 },
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

function onAuthorizeFail (data, message, error, accept) {
  NODE_ENV === 'dev' && console.log(message)
  accept(null, !error)
}

function onAuthorizeSuccess (data, accept) {
  NODE_ENV === 'dev' &&
    console.log(data.user.loginName, 'successful connection to socket.io')
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

const userList = {}

io.on('connection', (socket) => {
  socket.join('some_room')
  if (!socket.request.user.logged_in) {
    io.to(socket.id).emit('not_aut')
    io.sockets.sockets[socket.id].disconnect(true)
  } else {
    userList[socket.id] = socket.request.user
    io.to('some_room').emit(
      'chat_message',
      `Welcome ${socket.request.user.loginName}`
    )
    io.to('some_room').emit('people online', userList)
  }

  socket.on('disconnect', () => {
    delete userList[socket.id]
  })

  socket.on('hint', () => {
    io.to('some_room')
      .to()
      .emit('chat_message', 'FOR ADMIN: KICK>"userName">reason for kick')
    io.to('some_room').to().emit('chat_message', ' FOR ALL: EXIT> to exit')
  })

  socket.on('chat_message', (msg) => {
    let chatMsg = msg.trim()
    // EXIT
    const reg = /(EXIT)(>)/gm
    const exitAction = reg.exec(msg)
    if (exitAction && exitAction[1] === 'EXIT') {
      io.sockets.sockets[socket.id].disconnect(true)
    }
    // ADMIN action
    if (socket.request.user.isAdmin) {
      const reg = /(KICK)(>)(.*)(>)(.*)/gm
      const adminAction = reg.exec(msg)
      if (adminAction) {
        let userSidID = ''
        switch (adminAction[1]) {
          case 'KICK':
            chatMsg = `User ${adminAction[3]} kick out from chat`
            if (adminAction[5]) {
              chatMsg += `because ${adminAction[5]}`
            }
            userSidID = Object.keys(userList).filter(
              (item) => userList[item].loginName === adminAction[3]
            )
            if (io.sockets.sockets[userSidID]) {
              io.sockets.sockets[userSidID].disconnect(true)
            }
            break
          default:
            break
        }
      }
    }

    io.to('some_room')
      .to()
      .emit('chat_message', `${socket.request.user.loginName}: ${chatMsg}`)
  })

  setTimeout(function run () {
    io.to('some_room').emit('people online', userList)
    setTimeout(run, 60000)
  }, 60000)
})

app.get('*', (req, res) => {
  res.status(404).send('Forbidden/Not found')
})

app.post('*', (req, res) => {
  res.status(404).send('Forbidden/Not found')
})

app.use((error, req, res, next) => {
  NODE_ENV === 'dev' && console.error('Main error handler', error)
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
