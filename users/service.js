const UserQuery = require('./schemas/userSchema')
const HobbiQuery = require('./schemas/hobbiesSchema')
const SkillQuery = require('./schemas/skillsSchema')
const CoursesQuery = require('./schemas/coursesSchema')
const PersInfoQuery = require('./schemas/persInfoSchema')
const EvolutionQuery = require('./schemas/evolutionScheme')
const { saveFile, deleteFile } = require('../files/services')
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
    .then((data) => {
      return data
    })
    .catch((err) => ({ status: 0, errorMessage: 'Not found' }))

const create = async (body) => {
  return new Promise((resolve, reject) => {
    UserQuery.find({ loginName: body.loginName }, (err, adventure) => {
      if (err) reject(err)
      if (adventure.length > 0) {
        reject(new HttpError('', 409))
      } else {
        UserQuery(body).save((err) => {
          if (err) return reject(err)
          resolve(true)
        })
      }
    })
  })
}

const remove = (id) => UserQuery.findByIdAndRemove(id)

const deleteMany = (idS) => UserQuery.deleteMany({ userNumb: idS })

async function addPhoto (fileData) {
  const savePath = `img/users/${fileData.userNumb}`
  try {
    const file = await saveFile(savePath, fileData)
    const user = await UserQuery.findOne({ userNumb: fileData.userNumb })
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

async function deletePhoto (fileData) {
  try {
    const user = await UserQuery.findOne({ userNumb: fileData.userID })
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
    return new Promise((resolve, reject) => {
      reject(new HttpError(error.message, 400))
    })
  }
}

async function personalInfoByStep (req) {
  const { body: dataObject } = req
  const { userNumb, personalInfo, evolution, ...rest } = dataObject

  let userId = {}
  if (userNumb) {
    userId = userNumb
  } else {
    userId = req.user.userNumb
  }
  try {
    const userData = await UserQuery.findOne({ userNumb: userId })
    const userInfo = await PersInfoQuery.findOne(userData.personalInfo) || new PersInfoQuery()
    Object.keys(rest).forEach(key => {
      userInfo[key] = rest[key]
    })
    if (personalInfo) {
      Object.keys(personalInfo).forEach(key => {
        userInfo[key] = personalInfo[key]
      })
    }
    await userInfo.save()
    userData.personalInfo = userInfo._id

    if (evolution) {
      const userEvolution = await EvolutionQuery.findOne(userData.evolution) || new EvolutionQuery()
      const { hobbies, courses, skills, ...rest } = evolution
      if (hobbies) {
        const resHobbi = await HobbiQuery.insertMany(hobbies)
        const hobbiesIds = resHobbi.map((item) => item.id)
        userEvolution.hobbies = [...hobbiesIds]
      }
      if (courses) {
        const resCourses = await CoursesQuery.insertMany(courses)
        const coursesIds = resCourses.map((item) => item.id)
        userEvolution.courses = [...coursesIds]
      }
      if (skills) {
        const resSkills = await SkillQuery.insertMany(skills)
        const skillsIds = resSkills.map((item) => item.id)
        userEvolution.skills = [...skillsIds]
      }
      Object.keys(rest).forEach(key => {
        userEvolution[key] = rest[key]
      })
      await userEvolution.save()
      userData.evolution = userEvolution._id
    }
    return userData.save()
  } catch (error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }
}

function SaveEvolution (dataArr, type, userEvolution) {
  return new Promise((resolve, reject) => {
    const evolutionTypes = {
      hobbies: { query: HobbiQuery, page: 'isPage1Complete' },
      courses: { query: CoursesQuery, page: 'isPage2Complete' },
      skills: { query: SkillQuery, page: 'isPage3Complete' }
    }
    evolutionTypes[type].query.insertMany(dataArr)
      .then(savedData => {
        const dataIds = savedData.map((item) => item.id)
        userEvolution[type].push([...dataIds])
        userEvolution[evolutionTypes[type].page] = true
        return resolve()
      })
      .catch(reject)
  })
}

function addEvolution (reqBody, userId) {
  return new Promise((resolve, reject) => {
    const { hobbies, courses, skills } = reqBody
    UserQuery.findOne({ userNumb: userId })
      .then(async (userData) => {
        let userEvolution = {}
        if (userData.evolution) {
          userEvolution = await EvolutionQuery.findById(userData.evolution)
        } else {
          userEvolution = new EvolutionQuery()
        }
        if (hobbies && hobbies.length > 0) {
          await SaveEvolution(hobbies, 'hobbies', userEvolution)
        }
        if (courses && courses.length > 0) {
          await SaveEvolution(courses, 'courses', userEvolution)
        }
        if (skills && skills.length > 0) {
          await SaveEvolution(skills, 'skills', userEvolution)
        }
        if (userEvolution.isPage1Complete || userEvolution.isPage2Complete || userEvolution.isPage3Complete) {
          userEvolution.isSectionStarted = true
        }
        if (userEvolution.isPage1Complete && userEvolution.isPage2Complete && userEvolution.isPage3Complete) {
          userEvolution.isSectionComplete = true
        }
        userData.evolution = userEvolution._id
        await userEvolution.save()
        return userData
      })
      .then(userData => {
        return userData.save()
      })
      .then(resolve)
      .catch(reject)
  })
}

module.exports = {
  get,
  getOne,
  create,
  remove,
  deleteMany,
  addPhoto,
  deletePhoto,
  personalInfoByStep,
  addEvolution
}
