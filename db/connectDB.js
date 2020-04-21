const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV, TEST_DB } = process.env
let dbName = DB_NAME
if (NODE_ENV === 'test') {
  dbName = TEST_DB
}
const url = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${dbName}`

console.log(NODE_ENV)
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
})
mongoose.set('useCreateIndex', true)
const { connection } = mongoose

connection.on('error', console.error.bind(console, 'connection error:'))

connection.once('open', () => {
  if (NODE_ENV === 'dev' || NODE_ENV === 'test') {
    console.log(`db  ${dbName} connected!`)
  }
})

autoIncrement.initialize(connection)

module.export = mongoose
