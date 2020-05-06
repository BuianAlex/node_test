const moment = require('moment')
const UserQuery = require('./../users/schemas/userSchema')
const MsgQuery = require('./schemas/message')

module.exports = function (io) {
  const socketsIDs = {}
  let usersList = []
  io.on('connection', (socket) => {
    socket.join('chat_room')
    if (!socket.request.user.logged_in) {
      io.to(socket.id).emit('not_authorized')
      io.sockets.sockets[socket.id].disconnect(true)
    } else {
      socketsIDs[socket.id] = socket.request.user
      usersList = []
      UserQuery.find({})
        .populate('photo')
        .then(data => {
          data.forEach(item => {
            let onLine
            const res = Object.values(socketsIDs).filter(onUser => item.userNumb === onUser.userNumb)
            const { photo, loginName, userNumb } = item
            if (res.length === 1) {
              onLine = true
            } else {
              onLine = false
            }
            usersList.push({ photo, loginName, userNumb, onLine })
          })
          io.to('chat_room').emit('people online', usersList)
        })
      MsgQuery.find({}).then(
        msg => {
          msg.forEach(item => {
            io.to(socket.id).emit('chat_message', item)
          })
        }
      ).catch(console.error)

      io.to('chat_room').emit(
        'chat_message', { time: moment(), text: `Welcome ${socket.request.user.loginName}` }
      )
    }

    socket.on('disconnect', () => {
      usersList.find((item, i) => {
        if (item.userNumb === socketsIDs[socket.id].userNumb) {
          usersList[i].onLine = false
        }
      })
      delete socketsIDs[socket.id]
      io.to('chat_room').emit('people online', usersList)
    })

    socket.on('get_oldest_messages', (range) => {
      MsgQuery.countDocuments({}, function (err, count) {
        if (err) throw err
        // console.log('there are msg', count)
      })
    })

    socket.on('hint', () => {
      io.to('chat_room')
        .to()
        .emit('chat_message', { text: 'FOR ADMIN: KICK>"userName">reason for kick' })
      io.to('chat_room').to().emit('chat_message', { text: ' FOR ALL: EXIT> to exit' })
    })

    socket.on('chat_message', (msg) => {
      let chatMsg = msg.trim()
      // EXIT
      const reg = /(EXIT)(>)/gm
      const exitAction = reg.exec(msg)
      let hasCommand = false
      if (exitAction && exitAction[1] === 'EXIT') {
        hasCommand = true
        io.to(socket.id).emit('logout')
        io.sockets.sockets[socket.id].disconnect(true)
      }
      // ADMIN action
      if (socket.request.user.isAdmin) {
        const reg = /(KICK)(>)(.*)(>)(.*)/gm
        const adminAction = reg.exec(msg)

        if (adminAction) {
          hasCommand = true
          let userSidID = ''
          switch (adminAction[1]) {
            case 'KICK':
              chatMsg = `User ${adminAction[3]} kick out from chat`
              if (adminAction[5]) {
                chatMsg += `because ${adminAction[5]}`
              }
              userSidID = Object.keys(socketsIDs).filter(
                (item) => socketsIDs[item].loginName === adminAction[3]
              )
              if (io.sockets.sockets[userSidID]) {
                io.to(userSidID).emit('not_authorized')
                io.sockets.sockets[userSidID].disconnect(true)
              }
              break
            default:
              break
          }
        }
      }
      if (!hasCommand) {
        const sendMsg = { time: moment(), name: socket.request.user.loginName, text: chatMsg }
        new MsgQuery(sendMsg).save().then(() => {
          io.to('chat_room')
            .to()
            .emit('chat_message', sendMsg)
        }).catch(console.error)
      }
    })
  })
}
