const HttpError = require('./errorMiddleware')

const validate = (validator, ...args) => (req, res, next) => {
  console.log(req.body)

  let validatorFnc
  if (args.length > 0) {
    validatorFnc = validator(...args.map(arg => arg(req)))
  } else {
    validatorFnc = validator
  }
  if (!validatorFnc(req.body)) {
    console.error('validator Error')
    next(new HttpError('', 400))
  } else {
    next()
  }
}

module.exports = validate
