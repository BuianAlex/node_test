const path = require('path')
const fs = require('fs')
const util = require('util')
const FileType = require('file-type')
const Jimp = require('jimp')
const HttpError = require('../middleWare/errorMiddleware')
const fileQuery = require('./filesScheme')
const unlink = util.promisify(fs.unlink)
const uploadPath = './../views/public/uploads/'

function uploadFile (req) {
  const regexp = /filename="(.*)[.]/gi
  const filename = regexp.exec(req.headers['content-disposition'])[1]
  return new Promise((resolve, reject) => {
    return FileType.stream(req).then(read => {
      if (
        read.fileType &&
            (read.fileType.ext === 'png' ||
            read.fileType.ext === 'jpg')
      ) {
        const write = fs.createWriteStream(
          path.join(
            __dirname,
            uploadPath,
          `${filename}.${read.fileType.ext}`
          )
        )
        read.pipe(write)
        write.on('close', () => {
          resolve({
            path: `/uploads/${filename}.${read.fileType.ext}`,
            ext: read.fileType.ext,
            mime: read.fileType.mime
          })
        })
      } else {
        reject(new HttpError('FIELD_VALIDATION', 400))
      }
    })
  })
}

function saveFile (savePath, fileData) {
  const uploadedFilePath = path.join(
    __dirname,
    './../views/public/uploads/',
    fileData.fileName
  )
  const fileExt = path.extname(uploadedFilePath)
  const nameToSave = fileData.newName
    ? fileData.newName + fileExt
    : fileData.fileName
  const saveFilePath = path.join(
    __dirname,
    `./../views/public/${savePath}/`,
    nameToSave
  )
  return new Promise((resolve, reject) => {
    if (fs.existsSync(saveFilePath)) {
      reject(new HttpError('FIELD_VALIDATION', 400))
    } else {
      if (fs.existsSync(uploadedFilePath)) {
        return Jimp.read(uploadedFilePath)
          .then(imgFile => {
            if (fileData.imgWidth || fileData.imgHeigh) {
              const width = parseInt(fileData.imgWidth, 10) || Jimp.AUTO
              const higth = parseInt(fileData.imgHeigh, 10) || Jimp.AUTO
              return imgFile
                .resize(width, higth)
            }
            return imgFile
          })
          .then(imgFile => {
            if (fileData.quality) {
              const quality = parseInt(fileData.quality, 10) || 100
              return imgFile
                .quality(quality)
            }
            return imgFile
          })
          .then(imgFile => {
            if (fileData.greyscale) {
              return imgFile.greyscale()
            }
            return imgFile
          })
          .then(imgFile => {
            return imgFile.writeAsync(saveFilePath)
          })
          .then(imgFile => {
            resolve(fileQuery.create({
              fileName: nameToSave,
              size: fs.statSync(saveFilePath).size,
              path: savePath,
              type: fileExt,
              mime: imgFile.getMIME(),
              altText: fileData.altText
            }))
          })
          .catch(reject)
      } else {
        reject(new HttpError(`file with name ${nameToSave} not uploaded`, 400))
      }
    }
  })
}

function deleteFile (fileID) {
  return new Promise((resolve, reject) => {
    fileQuery.findOne({ _id: fileID })
      .then(file => {
        if (!file) return reject(new HttpError('FIELD_VALIDATION', 400, 'id not found'))

        const filePath = path.join(
          __dirname,
      `./../views/public/${file.path}/`,
      file.fileName
        )
        return unlink(filePath)
          .then(result => {
            file.remove()
              .then(result => {
                return resolve(true)
              })
          })
          .catch(error => {
            reject(new HttpError('FILE_NOT_FOUND', 400, error))
          })
      })
      .catch(reject)
  })
}

module.exports = {
  saveFile,
  deleteFile,
  uploadFile
}
