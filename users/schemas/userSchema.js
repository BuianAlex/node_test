const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const autoIncrement = require('mongoose-auto-increment')
// const fileStore = require('./../../files/filesScheme')
// const personalInfo = require('./persInfoSchema')
// const evolution = require('./evolutionScheme')

SALT_WORK_FACTOR = 10

const schema = mongoose.Schema({
  loginName: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
  },
  photo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'files' }],
  personalInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'personalInfo' },
  evolution: { type: mongoose.Schema.Types.ObjectId, ref: 'evolution' },
})

schema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

schema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password)
}

schema.plugin(autoIncrement.plugin, { model: 'user', field: 'userNumb' })
schema.plugin(require('mongoose-autopopulate'))
const userScheme = mongoose.model('user', schema)

module.exports = userScheme
