const router = require('express').Router()
const services = require('./services')

router.get('/', (req, res, next) => {
  res.render('text')
})

router.post('/upload', async (req, res, next) => {
  services.handler(req)
    .then(result => {
      res.send(result)
    })
    .catch(next())
})

module.exports = router
