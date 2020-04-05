const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const autoIncrement = require('mongoose-auto-increment')
const fileStore = require('./../../files/filesScheme')
const personalInfo = require('./persInfoSchema')
const evolution = require('./evolutionScheme')

SALT_WORK_FACTOR = 10

const scheme = mongoose.Schema({
  loginName: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
  },
  photo: [{ type: mongoose.Schema.Types.ObjectId, ref: fileStore }],
  personalInfo: [{ type: mongoose.Schema.Types.ObjectId, ref: personalInfo }],
  evolution: [{ type: mongoose.Schema.Types.ObjectId, ref: evolution }],
})

scheme.pre('save', function (next) {
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

scheme.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password)
}

scheme.plugin(autoIncrement.plugin, { model: 'user', field: 'userNumb' })

const userScheme = mongoose.model('user', scheme)

module.exports = userScheme
