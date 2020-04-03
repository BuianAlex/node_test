process.env.SERVER_PORT = 8080
process.env.DB_HOSTNAME = '127.0.0.1'
process.env.DB_PORT = 27017
process.env.DB_NAME = 'chat'

const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env
const url = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
})
mongoose.set('useCreateIndex', true)
const { connection } = mongoose

connection.on('error', console.error.bind(console, 'connection error:'))

connection.once('open', () => {
  NODE_ENV === 'dev' && console.log(`db  ${DB_NAME} connected!`)
})

autoIncrement.initialize(connection)

const userQuery = require('./../users/userSchema')

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function userName() {
  return new Promise(resolve => {
    rl.question('Set user name (min: 3 letters): ', name => {
      resolve(name)
    })
  })
}

function userPassword() {
  return new Promise(resolve => {
    rl.question('Set user password (min: 6 characters): ', pass => {
      resolve(pass)
    })
  })
}

function userGroup() {
  return new Promise(resolve => {
    rl.question('Set user group user(U), admin(A): ', group => {
      resolve(group)
    })
  })
}

function toSave(name) {
  return new Promise(resolve => {
    rl.question(`Save to db new user with login: ${name} (y/n):`, ans => {
      resolve(ans)
    })
  })
}

async function saveNewUser() {
  const user = {}
  do {
    user.loginName = await userName()
  } while (user.loginName.length < 3)
  do {
    user.password = await userPassword()
  } while (user.password.length < 6)
  user.usergroup = await userGroup()

  const save = await toSave(user.loginName)
  if (save === 'y') {
    switch (user.usergroup) {
      case 'U':
        user.isAdmin = false
        break
      case 'A':
        user.isAdmin = true
        break
      default:
        user.usergroup = false
        break
    }
    const newUser = new userQuery(user)
    try {
      const res = await newUser.save()
      process.stdout.write('New user was created: \n' + res)
    } catch (error) {
      process.stdout.write(`Error ${error.message} \n`)
    }

    connection.close()
    process.exit(0)
  } else {
    connection.close()
    process.exit(0)
  }
}
saveNewUser()
