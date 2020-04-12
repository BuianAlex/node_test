const path = require('path')
const fs = require('fs')
const FileType = require('file-type')
const Jimp = require('jimp')
const HttpError = require('../middleWare/errorMiddleware')
const fileQuery = require('./filesScheme')

const uploadPath = './../views/public/uploads/'

const uploadFile = async (req) => {
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

const saveFile = (savePath, fileData) => {
  const uplodedFilePath = path.join(
    __dirname,
    './../views/public/uploads/',
    fileData.fileName
  )
  const nameToSave = fileData.newName
    ? `${fileData.newName}.${fileData.type}`
    : fileData.fileName
  const saveFilePath = path.join(
    __dirname,
    `./../views/public/${savePath}/`,
    nameToSave
  )

  return new Promise((resolve, reject) => {
    if (fs.existsSync(saveFilePath)) {
      reject(new HttpError(`file with name ${nameToSave} exist already `, 400))
    }
    if (fs.existsSync(uplodedFilePath)) {
      const quality = fileData.quality ? parseInt(fileData.quality, 10) : 100
      return Jimp.read(uplodedFilePath)
        .then(imgFile => {
          if (fileData.imgWidth || fileData.imgHeigh) {
            const width = parseInt(fileData.imgWidth, 10) || Jimp.AUTO
            const higth = parseInt(fileData.imgHeigh, 10) || Jimp.AUTO
            return imgFile
              .resize(width, higth)
              .quality(quality)
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
          return imgFile.write(saveFilePath)
        })
        .then(imgFile => {
          resolve(fileQuery.create({
            fileName: nameToSave,
            size: fs.statSync(saveFilePath).size,
            path: savePath,
            type: fileData.fileExt,
            mime: fileData.mime,
            altText: fileData.altText
          }))
        })
        .catch(reject)
    } else {
      reject(new HttpError(`file with name ${nameToSave} not uploaded`, 400))
    }
  })

  // // if file exist

  // if (fs.existsSync(uplodedFilePath)) {
  //   try {
  //     // modification file
  //     await Jimp.read(uplodedFilePath).

  //     // save to db
  //     fs.unlinkSync(uplodedFilePath) // delere file from upload folder
  //     fileSize = fs.statSync(saveFilePath).size // get new file size

  //     return fileQuery.create({
  //       fileName: nameToSave,
  //       size: fileSize,
  //       path: savePath,
  //       type: fileData.fileExt,
  //       mime: fileData.mime,
  //       altText: fileData.altText
  //     })
  //   } catch (error) {
  //     console.error('err', error)
  //     return new Promise((resolve, reject) => {
  //       reject(new HttpError('File save ERROR', 400))
  //     })
  //   }
  // } else {
  //   return new Promise((resolve, reject) => {
  //
  //   })
  // }
}

async function deleteFile (fileID) {
  try {
    const file = await fileQuery.findOne({ _id: fileID })
    const filePath = path.join(
      __dirname,
      `./../public/${file.path}/`,
      file.fileName
    )
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath) // delere file from file sys
      await file.remove() // delere file from db
      return new Promise((resolve, reject) => {
        resolve(true)
      })
    } else {
      console.error('deleteFile', 'File not found on the fileSys')
      return new Promise((resolve, reject) => {
        reject(new HttpError('File not found on the fileSys', 400))
      })
    }
  } catch (error) {
    console.error('deleteFile', error)
    return new Promise((resolve, reject) => {
      reject(new HttpError(error.message, 400))
    })
  }
}

module.exports = {
  saveFile,
  deleteFile,
  uploadFile
}
