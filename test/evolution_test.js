const HobbyQuery = require('./../users/schemas/hobbiesSchema')
const SkillQuery = require('./../users/schemas/skillsSchema')
const CoursesQuery = require('./../users/schemas/coursesSchema')

const EvolutionQuery = require('./../users/schemas/evolutionScheme')
module.exports = (app, chai) => {
  const UserQuery = require('./../users/schemas/userSchema')
  describe('Test /users/evolution/ route', () => {
    describe('Test add user evolution without registration', () => {
      it('without registration -  401', (done) => {
        chai
          .request(app)
          .post('/users/evolution/step-1')
          .send({ hobbies: [{ name: '2', timeStarted: '11/03/2020', isKeepOnDoing: true }, { name: 'Eat', timeStarted: '11/03/2020', isKeepOnDoing: true }] })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.body.message.should.be.equal('Unauthorized')
            done()
          })
      })
    })

    describe('Test add user evolution', () => {
      const authenticatedUser = chai.request.agent(app)
      before((done) => {
        authenticatedUser
          .post('/users/login')
          .send({
            loginName: 'User_test',
            password: '12345q'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.should.have.cookie('connect.sid')
            done()
          })
      })
      it('add hobbies  -  200', (done) => {
        authenticatedUser
          .post('/users/evolution/step-1')
          .send({
            hobbies: [
              {
                name: 'Survival',
                timeStarted: '11/03/2020',
                isKeepOnDoing: true
              }]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add courses  -  200', (done) => {
        authenticatedUser
          .post('/users/evolution/step-2')
          .send({
            courses: [
              {
                name: 'Survival',
                timeStarted: '11/03/2020',
                timeEnd: '11/03/2020',
                isKeepOnDoing: false,
                doYouLikeIt: false
              }]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add skills  -  200', (done) => {
        authenticatedUser
          .post('/users/evolution/step-3')
          .send({
            skills: [{ name: 'Greed', level: 'High', improvements: 'More Gold' }]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add skills incorrect data  -  400', (done) => {
        authenticatedUser
          .post('/users/evolution/step-3')
          .send({
            skills: [
              {
                name: '',
                level: 'h',
                improvements: 'sa'
              }]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.body.message.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })

      after(() => {
        return UserQuery.findOne({ loginName: 'User_test' })
          .then(user => {
            const evolutionClean = new Promise((resolve, reject) => {
              EvolutionQuery.findByIdAndDelete(user.evolution, (err, doc) => {
                if (err) reject(err)
                resolve(true)
              })
            })

            const nobbyClean = new Promise((resolve, reject) => {
              HobbyQuery.deleteMany({}, (err, doc) => {
                if (err) reject(err)
                resolve(true)
              })
            })

            const skillClean = new Promise((resolve, reject) => {
              SkillQuery.deleteMany({}, (err, doc) => {
                if (err) reject(err)
                resolve(true)
              })
            })

            const courseClean = new Promise((resolve, reject) => {
              CoursesQuery.deleteMany({}, (err, doc) => {
                if (err) reject(err)
                resolve(true)
              })
            })

            return Promise.all([evolutionClean, nobbyClean, skillClean, courseClean])
              .then(res => {
                user.personalInfo = undefined
                user.evolution = undefined
                return user.save()
              })
          })
          .catch(console.log)
      })
    })
  })
}
