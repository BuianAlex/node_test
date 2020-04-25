const UserQuery = require('./../users/schemas/userSchema')
const PersInfoQuery = require('./../users/schemas/persInfoSchema')
const EvolutionQuery = require('./../users/schemas/evolutionScheme')
const HobbyQuery = require('./../users/schemas/hobbiesSchema')
const SkillQuery = require('./../users/schemas/skillsSchema')
const CoursesQuery = require('./../users/schemas/coursesSchema')
const dataSet = require('./files/test_data_set')
module.exports = (app, chai) => {
  describe('Test /users/personal-info route', () => {
    describe('add user personal info without authentication', () => {
      it('add personal info ->  401', (done) => {
        chai
          .request(app)
          .post('/users/personal-info/step-1')
          .send({ firstName: 'testfirstname1', surname: 'testfamilyname1', lastName: 'testlastname1' })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.body.message.should.be.equal('Unauthorized')
            done()
          })
      })
    })

    describe('add personal info - user authenticated', () => {
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
      it('add personal info step-1  ->  200', (done) => {
        authenticatedUser
          .post('/users/personal-info/step-1')
          .send({
            firstName: 'testfirstname1',
            surname: 'testfamilyname1',
            lastName: 'testlastname1'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add personal info step-2  ->  200', (done) => {
        authenticatedUser
          .post('/users/personal-info/step-2')
          .send({
            dob: '12/12/1900'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add personal info step-3  ->  200', (done) => {
        authenticatedUser
          .post('/users/personal-info/step-3')
          .send({
            nationality: 'ukrainian'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add personal info step-4  ->  200', (done) => {
        authenticatedUser
          .post('/users/personal-info/step-4')
          .send({
            phoneNumber: '345345345435',
            homeAddress: 'av.Shev',
            city: 'Cherkasy',
            postCode: '18000',
            country: 'Ukraine'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('add personal info big data  ->  200', (done) => {
        authenticatedUser
          .post('/users/personal-info/step-1')
          .send(dataSet)
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.equal(true)
            done()
          })
      })
      it('check user data in db', (done) => {
        UserQuery.findOne({ loginName: 'User_test' }, (err, user) => {
          if (err) console.error(err)
          user.should.have.property('personalInfo')
          user.personalInfo.should.be.a('Object')
          user.should.have.property('evolution')
          user.evolution.should.be.a('Object')
          done()
        })
      })
      after(() => {
        return UserQuery.findOne({ loginName: 'User_test' })
          .then(user => {
            const ifoClean = new Promise((resolve, reject) => {
              PersInfoQuery.findByIdAndDelete(user.personalInfo, (err, doc) => {
                if (err) reject(err)
                resolve(true)
              })
            })
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

            return Promise.all([ifoClean, evolutionClean, nobbyClean, skillClean, courseClean])
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
