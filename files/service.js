const path = require('path')
const fs = require('fs')
const Jimp = require('jimp')
const HttpError = require('../middleWare/errorMiddleware')
const fileQuery = require('./filesScheme')

const saveFile = async (savePath, fileData) => {
  const uplodedFilePath = path.join(
    __dirname,
    './../public/uploads/',
    fileData.fileName
  )
  const nameToSave = fileData.newName
    ? `${fileData.newName}.${fileData.type}`
    : fileData.fileName
  let fileSize = ''
  const saveFilePath = path.join(
    __dirname,
    `./../public/${savePath}/`,
    nameToSave
  )
  // if file exist
  if (fs.existsSync(saveFilePath)) {
    return new Promise((resolve, reject) => {
      reject(new HttpError(`file with name ${nameToSave} exist already `, 400))
    })
  }
  if (fs.existsSync(uplodedFilePath)) {
    try {
      // modification file
      await Jimp.read(uplodedFilePath).then(imgFile => {
        if (fileData.imgWidth || fileData.imgHeigh) {
          const width = parseInt(fileData.imgWidth, 10)
          const higth = parseInt(fileData.imgHeigh, 10)
          imgFile.resize(width || Jimp.AUTO, higth || Jimp.AUTO)
        }
        if (fileData.quality) {
          const quality = parseInt(fileData.quality, 10)
          imgFile.quality(quality || 100)
        }
        if (fileData.greyscale) {
          imgFile.greyscale()
        }
        imgFile.write(saveFilePath) // save
      })
      // save to db
      fs.unlinkSync(uplodedFilePath) // delere file from upload folder
      fileSize = fs.statSync(saveFilePath).size // get new file size

      return fileQuery.create({
        fileName: nameToSave,
        size: fileSize,
        path: savePath,
        type: fileData.fileExt,
        mime: fileData.mime,
        altText: fileData.altText
      })
    } catch (error) {
      console.error('err', error)
      return new Promise((resolve, reject) => {
        reject(new HttpError('File save ERROR', 400))
      })
    }
  } else {
    return new Promise((resolve, reject) => {
      reject(new HttpError(`file with name ${nameToSave} not uploaded`, 400))
    })
  }
}

async function deleteFile(fileID) {
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
  deleteFile
}
