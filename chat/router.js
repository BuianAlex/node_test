const router = require('express').Router()

router.get('/', (req, res, next) => {
  res.render('chat')
})

module.exports = router
