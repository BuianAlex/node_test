const LocalStrategy = require('passport-local').Strategy
const userQuery = require('./../users/schemas/userSchema')

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    console.log(username, password)

    userQuery
      .findOne({ loginName: username })
      // .populate("photo")
      // .then(user => {
      //   if (user) {
      //     user.lastVisit = Date.now();
      //     return user.save();
      //   }
      //   return user;
      // })
      .then(async user => {
        if (!user) {
          return done(null, false)
        }
        const validPass = await user.validatePassword(password)
        if (!validPass) {
          return done(null, false)
        }
        return done(null, user)
      })
      .catch(done => {
        console.log(done)
      })
  }

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'loginName',
        passwordField: 'password'
      },
      authenticateUser
    )
  )
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    userQuery
      .findOne({ _id: id })
      .then(user => {
        if (!user) {
          return done(null, false)
        }

        return done(null, user)
      })
      .catch(done)
  })
}

module.exports = initialize
