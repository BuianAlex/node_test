const router = require('express').Router()
// const fs = require('fs')
// const path = require('path')
// const FileType = require('file-type')
// const HttpError = require('../middleWare/errorMiddleware')
const services = require('./services')

router.get('/', (req, res, next) => {
  res.render('photo')
})

router.post('/upload', (req, res, next) => {
  services.uploadFile(req)
    .then(data => {
      res.send(data)
    })
    .catch(err => {
      next(err)
    })
})

module.exports = router
