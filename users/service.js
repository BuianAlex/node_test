const UserQuery = require('./schemas/userSchema')
const HobbyQuery = require('./schemas/hobbiesSchema')
const SkillQuery = require('./schemas/skillsSchema')
const CoursesQuery = require('./schemas/coursesSchema')
const PersInfoQuery = require('./schemas/persInfoSchema')
const EvolutionQuery = require('./schemas/evolutionScheme')
const { saveFile, deleteFile } = require('../files/services')
const normalize = require('./normalizeUserData')
const HttpError = require('../middleWare/errorMiddleware')

function getSome () {
  return UserQuery.find({})
    .populate('photo')
    .then(userList => {
      const result = {
        usersList: userList.map((item) => normalize(item))
      }
      return result
    })
}

function getOne (userNumb) {
  return UserQuery.findOne({ userNumb: userNumb })
    .populate('photo')
    .populate('evolution')
    .populate('personalInfo')
    .then((data) => {
      return data
    })
}

function create (body) {
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

function addPhoto (fileData) {
  return new Promise((resolve, reject) => {
    UserQuery.findOne({ userNumb: fileData.userNumb })
      .then(user => {
        if (!user) reject(new HttpError('', 400))
        const savePath = `img/users/${fileData.userNumb}`
        return saveFile(savePath, fileData)
          .then(file => {
            user.photo.push(file._id)
            return user.save().then(res => resolve(file))
          })
      })
      .catch(reject)
  })
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

function SaveEvolution (dataArr, type, userEvolution) {
  return new Promise((resolve, reject) => {
    const evolutionTypes = {
      hobbies: { query: HobbyQuery, page: 'isPage1Complete' },
      courses: { query: CoursesQuery, page: 'isPage2Complete' },
      skills: { query: SkillQuery, page: 'isPage3Complete' }
    }
    if (dataArr && dataArr.length > 0) {
      evolutionTypes[type].query.insertMany(dataArr)
        .then(savedData => {
          const dataIds = savedData.map((item) => item.id)
          userEvolution[type].push([...dataIds])
          userEvolution[evolutionTypes[type].page] = true
          return resolve()
        })
        .catch(reject)
    } else {
      resolve(false)
    }
  })
}

function personalInfoByStep (req) {
  const { body: dataObject } = req
  const { userNumb, personalInfo, evolution, ...rest } = dataObject

  let userId = {}
  if (userNumb) {
    userId = userNumb
  } else {
    userId = req.user.userNumb
  }
  return new Promise((resolve, reject) => {
    UserQuery.findOne({ userNumb: userId }, (err, user) => {
      if (err) reject(err)
      if (!user) reject(err)
      const persInfo = new Promise((resolve, reject) => {
        PersInfoQuery.findOne(user.personalInfo, (err, userInfo) => {
          const steps = {
            'step-1': 'isPage1Complete',
            'step-2': 'isPage2Complete',
            'step-3': 'isPage3Complete',
            'step-4': 'isPage4Complete',
            'step-5': 'isPage5Complete'
          }
          if (err) reject(err)
          if (!userInfo) {
            userInfo = PersInfoQuery()
          }
          Object.keys(rest).forEach(key => {
            userInfo[key] = rest[key]
          })
          if (personalInfo) {
            Object.keys(personalInfo).forEach(key => {
              userInfo[key] = personalInfo[key]
            })
          }
          userInfo[steps[req.params.step]] = true
          userInfo.save().then(info => {
            resolve(userInfo._id)
          })
        })
      })
      const addEvolution = new Promise((resolve, reject) => {
        if (evolution) {
          const { hobbies, courses, skills, ...rest } = evolution
          EvolutionQuery.findOne(user.evolution, (err, userEvolution) => {
            if (err) reject(err)
            if (!userEvolution) {
              userEvolution = new EvolutionQuery()
            }
            const hobbiesPromise = SaveEvolution(hobbies, 'hobbies', userEvolution)
            const coursesPromise = SaveEvolution(courses, 'courses', userEvolution)
            const skillsPromise = SaveEvolution(skills, 'skills', userEvolution)
            Promise.all([hobbiesPromise, coursesPromise, skillsPromise])
              .then(result => {
                Object.keys(rest).forEach(key => {
                  userEvolution[key] = rest[key]
                })
                userEvolution.save()
                  .then(res => {
                    resolve(userEvolution._id)
                  })
              })
          })
        } else {
          resolve(false)
        }
      })
      Promise.all([persInfo, addEvolution]).then(values => {
        user.personalInfo = values[0]
        if (values[1]) {
          user.evolution = values[1]
        }
        user.save().then(res => {
          resolve(true)
        })
      })
    })
  })
}

function addEvolution (reqBody, userId) {
  return new Promise((resolve, reject) => {
    const { hobbies, courses, skills } = reqBody
    UserQuery.findOne({ userNumb: userId })
      .then(userData => {
        return EvolutionQuery.findById(userData.evolution, (err, userEvolution) => {
          if (err) reject(err)
          if (!userEvolution) {
            userEvolution = new EvolutionQuery()
          }
          const hobbiesPromise = SaveEvolution(hobbies, 'hobbies', userEvolution)
          const coursesPromise = SaveEvolution(courses, 'courses', userEvolution)
          const skillsPromise = SaveEvolution(skills, 'skills', userEvolution)
          return Promise.all([hobbiesPromise, coursesPromise, skillsPromise])
            .then(result => {
              if (userEvolution.isPage1Complete || userEvolution.isPage2Complete || userEvolution.isPage3Complete) {
                userEvolution.isSectionStarted = true
              }
              if (userEvolution.isPage1Complete && userEvolution.isPage2Complete && userEvolution.isPage3Complete) {
                userEvolution.isSectionComplete = true
              }
              return userEvolution.save()
            })
            .then(result => {
              userData.evolution = userEvolution._id
              return userData.save()
            })
        })
      })
      .then(resolve(true))
      .catch(reject)
  })
}

module.exports = {
  getSome,
  getOne,
  create,
  remove,
  deleteMany,
  addPhoto,
  deletePhoto,
  personalInfoByStep,
  addEvolution
}
