const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const FileType = require('file-type')
const HttpError = require('../middleWare/errorMiddleware')
// const service = require('./services')

router.get('/', (req, res, next) => {
  res.render('photo')
})

router.post('/upload', async (req, res, next) => {
  const regexp = /filename="(.*)[.]/gi
  const filename = regexp.exec(req.headers['content-disposition'])[1]
  const fileTypeStream = await FileType.stream(req)
  if (
    fileTypeStream.fileType &&
    (fileTypeStream.fileType.ext === 'png' ||
      fileTypeStream.fileType.ext === 'jpg')
  ) {
    const write = fs.createWriteStream(
      path.join(
        __dirname,
        '../public/uploads/',
        `${filename}.${fileTypeStream.fileType.ext}`
      )
    )
    fileTypeStream.pipe(write)
    write.on('close', () => {
      res.send({
        path: `/uploads/${filename}.${fileTypeStream.fileType.ext}`,
        ext: fileTypeStream.fileType.ext,
        mime: fileTypeStream.fileType.mime
      })
    })
  } else {
    next(new HttpError('', 400))
  }
})

module.exports = router
