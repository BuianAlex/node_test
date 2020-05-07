const router = require('express').Router()
const passport = require('passport')
const service = require('./service')
const HttpError = require('../middleWare/errorMiddleware')
const checkPermissions = require('../middleWare/permissionsMiddleware')
const validate = require('../middleWare/validateMiddleware')
const validator = require('./validator')

const normalize = require('./normalizeUserData')

router.post(
  '/login',
  validate(validator.login),
  passport.authenticate('local', { failWithError: true }),
  (req, res, next) => {
    if (req.user) {
      res.status(200).send({ result: normalize(req.user) })
    }
  },
  (err, req, res, next) => {
    if (err.status === 401) {
      err.message = 'FIELD_VALIDATION'
    }
    next(new HttpError(err.message, err.status))
  }
)

router.get('/logout', (req, res) => {
  req.logout()
  res.send({ result: 'Bye' })
})

router.get('/', (req, res, next) => {
  service
    .getSome()
    .then((data) => {
      let currentUser = false
      if (req.user) {
        currentUser = true
      }
      res.render('usersList', { data, currentUser })
    })
    .catch(next)
})

router.get('/get-one', checkPermissions.onlyAuthenticated, (req, res, next) => {
  let userID
  let onlyRead = false
  const currentUser = req.user.userNumb
  if (req.query.id !== undefined) {
    const reqUserNumber = parseInt(req.query.id, 10)
    if (!isNaN(reqUserNumber)) {
      userID = reqUserNumber
      if (reqUserNumber !== currentUser) {
        onlyRead = true
      }
    } else {
      next(new HttpError('', 400))
    }
  } else {
    userID = currentUser
  }
  service
    .getOne(userID)
    .then((data) => {
      if (data) {
        if (onlyRead) {
          res.render('userOneRead', { data })
        } else {
          res.render('userOne', { data })
        }
      } else {
        next(new HttpError('', 400))
      }
    })
    .catch(err => {
      console.log(err)

      next()
    }
    )
})

router.post(
  '/create',
  validate(validator.create),
  (req, res, next) => {
    service
      .create(req.body)
      .then((data) => {
        next()
      })
      .catch((err) => {
        next(err)
      })
  },
  passport.authenticate('local', { failWithError: true }),
  (req, res, next) => {
    res.status(200).send(req.user)
  }
)

router.post(
  '/add-photo',
  checkPermissions.onlyAuthenticated,
  validate(validator.addPhoto),
  (req, res, next) => {
    const photoData = req.body
    if (!photoData.userNumb) {
      photoData.userNumb = req.user.userNumb
    }
    service.addPhoto(req.body)
      .then(result => {
        res.send(result)
      })
      .catch(next)
  }
)

router.post(
  '/delete-photo',
  checkPermissions.onlyAuthenticated,
  validate(validator.deletePhoto),
  (req, res, next) => {
    service.deletePhoto(req)
      .then(result => {
        res.send(result)
      })
      .catch(next)
  }
)

router.post('/personal-info/:step', checkPermissions.updateByID, validate(validator.addPersonalInfo), (req, res, next) => {
  service.personalInfoByStep(req)
    .then(result => {
      res.send(result)
    })
    .catch(next)
})

router.post('/evolution/:step', checkPermissions.onlyAuthenticated, validate(validator.addEvolution), (req, res, next) => {
  service.addEvolution(req.body, req.user.userNumb)
    .then(result => {
      res.send(result)
    })
    .catch(next)
})

module.exports = router
