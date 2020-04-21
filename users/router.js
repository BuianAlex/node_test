const router = require('express').Router()
const passport = require('passport')
const service = require('./service')
const HttpError = require('../middleWare/errorMiddleware')
const checkPermissions = require('../middleWare/permissionsMiddleware')
const validate = require('../middleWare/validateMiddleware')
const validator = require('./validator')

const normalize = require('./normaliseUserData')

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
    .get()
    .then((data) => {
      res.render('usersList', { data: data })
    })
    .catch(next)
})

router.get('/get-one', (req, res, next) => {
  const userID = req.query.id
  if (/^[0-9]+$/g.test(userID)) {
    service
      .getOne(userID)
      .then((data) => {
        if (data) {
          res.render('userOne', { data })
        } else {
          next(new HttpError('', 404))
        }
      })
      .catch(next)
  } else {
    next(new HttpError('', 404))
  }
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
  validate(validator.addPhoto),
  async (req, res, next) => {
    try {
      const result = await service.addPhoto(req.body)
      res.send(result)
    } catch (error) {
      console.error('/add-photo', error)
      next(new HttpError(error.message, 400))
    }
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

router.post('/personal-info/:step', checkPermissions.updateByID, validate(validator.addPersonalInfo), async (req, res, next) => {
  try {
    await service.personalInfoByStep(req)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/evolution/:step', checkPermissions.onlyAuthenficated, validate(validator.addEvolution), (req, res, next) => {
  service.addEvolution(req.body, req.user.userNumb)
    .then(result => {
      res.send(result)
    })
    .catch(next)
})

module.exports = router
