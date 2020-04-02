const router = require('express').Router()

// const service = require('./services')

router.get('/', (req, res, next) => {
  res.render('chat')
})

module.exports = router
