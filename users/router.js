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
      err.message = `Sorry, the member name and password
    you entered do not match. Please try again`
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
      res.render('usersList', { data: data })
    })
    .catch(next)
})

router.get('/get-one', checkPermissions.onlyAuthenticated, (req, res, next) => {
  let userID
  if (req.query.id) {
    if (/^[0-9]+$/g.test(req.query.id)) {
      userID = req.query.id
    } else {
      next(new HttpError('', 400))
    }
  } else {
    userID = req.user.userNumb
  }
  service
    .getOne(userID)
    .then((data) => {
      if (data) {
        res.render('userOne', { data })
      } else {
        next(new HttpError('', 400))
      }
    })
    .catch(next)
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
      .catch(err => {
        console.error(err)
        next(err)
      })
  }
)

router.post(
  '/delete-photo',
  validate(validator.deletePhoto),
  async (req, res, next) => {
    try {
      const result = await service.deletePhoto(req.body)
      res.send(result)
    } catch (error) {
      console.error('/delete-photo', error)
      next(new HttpError(error.message, 400))
    }
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
