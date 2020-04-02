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

module.export = mongoose
