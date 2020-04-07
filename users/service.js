const _ = require('lodash')
const UserQuery = require('./schemas/userSchema')
const HobbiQuery = require('./schemas/hobbiesSchema')
const SkillQuery = require('./schemas/skillsSchema')
const CoursesQuery = require('./schemas/coursesSchema')
const PersInfoQuery = require('./schemas/persInfoSchema')
const EvolutionQuery = require('./schemas/evolutionScheme')
const { saveFile, deleteFile } = require('../files/service')
const normalise = require('./normaliseUserData')
const HttpError = require('../middleWare/errorMiddleware')

const get = async () => {
  try {
    const users = await UserQuery.find({}).populate('photo')
    let usersNormal = []
    if (users.length) {
      usersNormal = users.map((item) => normalise(item))
    }
    const resultDB = { usersList: usersNormal }
    return resultDB
  } catch (error) {
    console.error(`getUsers${error}`)
  }
}

const getOne = (id) =>
  UserQuery.findOne({ userNumb: id })
    .populate('photo')
    .populate('evolution')
    .populate('personalInfo')

    .then((data) => data)
    .catch((err) => ({ status: 0, errorMessage: 'Not found' }))

const update = (id, body) =>
  new Promise((resolve, reject) => {
    UserQuery.findOne({ userId: id })
      .then(async (data) => {
        if (data) {
          if (body.photo) {
            if (!data.photo.length) {
              const fileData = await fileQuery.saveFile(body)
              data.photo.push(fileData._id)
            }
            if (data.photo.length && data.photo[0].fileName !== body.photo) {
              const fileData = await fileQuery.saveFile(body)
              data.photo = fileData._id
            }
          }

          Object.keys(body).forEach(async (key) => {
            if (key !== 'password' && key !== 'photo') {
              data[key] = body[key]
            }
          })
          return data.save()
        }
        return null
      })
      .then(resolve)
      .catch(reject)
  })

const create = async (body) => {
  const testIfExist = await UserQuery.find({ loginName: body.loginName })
  if (testIfExist.length > 0) {
    return new Promise((resolve, reject) => {
      reject(new HttpError('', 409))
    })
  }
  body.registrated = Date.now()

  if (!body.usergroup) {
    body.usergroup = 'user'
  }

  const newUser = new UserQuery(body)
  return new Promise((resolve, reject) => {
    newUser.save((err) => {
      if (err) return reject(err)
      resolve()
      // saved!
    })
  })
}

const remove = (id) => UserQuery.findByIdAndRemove(id)

const deleteMany = (idS) => UserQuery.deleteMany({ userId: idS })

function calcObjectValue(holder, kayName, object) {
  let value = holder[object[kayName]]
  if (!value) {
    value = 0
  }
  value += 1
  holder[object[kayName]] = value
}

async function addPhoto(fileData) {
  const savePath = `img/users/${fileData.userID}`
  try {
    const file = await saveFile(savePath, fileData)
    const user = await UserQuery.findOne({ userId: fileData.userID })
    user.photo.push(file._id)
    await user.save()
    return new Promise((resolve, reject) => {
      resolve(file)
    })
  } catch (error) {
    console.error('serv addPhoto', error)
    return new Promise((resolve, reject) => {
      reject(new HttpError(error.message, 400))
    })
  }
}

async function deletePhoto(fileData) {
  try {
    const user = await UserQuery.findOne({ userId: fileData.userID })
    await deleteFile(fileData.imgID)
    const userImages = [...user.photo]
    const restImg = userImages.filter(
      (img) => img._id.toString() !== fileData.imgID
    )
    user.photo = restImg
    await user.save()
    return new Promise((resolve, reject) => {
      resolve(true)
    })
  } catch (error) {
    console.error(error)
    return new Promise((resolve, reject) => {
      reject(new HttpError(error.message, 400))
    })
  }
}

async function userInfoStepOne(req) {
  const { body: dataObject } = req
  const { userNumb, personalInfo, evolution } = dataObject

  let userId = {}
  if (userNumb) {
    userId = userNumb
  } else {
    userId = req.user.userNumb
  }
  const userTmp = {}
  try {
    const userData = await UserQuery.findOne({ userNumb: userId })
    console.log(userData)

    if (personalInfo) {
      const userInfo = await PersInfoQuery.create(dataObject.personalInfo)
      userData.personalInfo = userInfo._id
    }
    if (evolution) {
      const tempEvolution = { hobbies: [], courses: [], skills: [] }
      const { hobbies, courses, skills, ...rest } = evolution
      if (hobbies) {
        const resHobbi = await HobbiQuery.insertMany(hobbies)
        const hobbiesIds = resHobbi.map((item) => item.id)
        tempEvolution.hobbies = [...hobbiesIds]
      }
      if (courses) {
        const resCourses = await CoursesQuery.insertMany(courses)
        const coursesIds = resCourses.map((item) => item.id)
        tempEvolution.courses = [...coursesIds]
      }
      if (skills) {
        const resSkills = await SkillQuery.insertMany(skills)
        const skillsIds = resSkills.map((item) => item.id)
        tempEvolution.skills = [...skillsIds]
      }

      const userEvolution = await EvolutionQuery.create({
        ...tempEvolution,
        ...rest,
      })
      userData.evolution = userEvolution._id
    }

    console.log(userData)
    return userData.save()
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  get,
  getOne,
  create,
  update,
  remove,
  deleteMany,
  addPhoto,
  deletePhoto,
  userInfoStepOne,
}
