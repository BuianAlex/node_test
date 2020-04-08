const HttpError = require('./errorMiddleware')

const onlyAuthenficated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    next(new HttpError('Unauthorized', 401))
  }
}

const onlyAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (!req.user.isAdmin) {
      next(new HttpError('Forbidden/Not found', 403))
    }
    next()
  } else {
    next(new HttpError('Unauthorized', 401))
  }
}

const userCreate = (req, res, next) => {
  if (req.body.hasOwnProperty('usergroup')) {
    onlyAdmin(req, res, next)
  } else {
    next()
  }
}

const updateByID = (req, res, next) => {
  const { userNumb } = req.body
  if (userNumb) {
    onlyAdmin(req, res, next)
  } else {
    next()
  }
}
module.exports = { onlyAdmin, userCreate, onlyAuthenficated, updateByID }
