const fs = require('fs')
const path = require('path')
const del = require('del')

module.exports = (app, chai) => {
  const FileQuery = require('../files/filesScheme')
  const UserQuery = require('../users/schemas/userSchema')
  describe('Test /delete-photo route', () => {
    describe('delete photo without authentication', () => {
      it('without authentication -> 401', (done) => {
        chai
          .request(app)
          .post('/users/delete-photo')
          .send({})
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.text.should.be.equal('Unauthorized')
            done()
          })
      })
    })
    describe('delete photo  user authenticated', () => {
      const authenticatedUser = chai.request.agent(app)
      let user
      before((done) => {
        authenticatedUser
          .post('/users/login')
          .send({
            loginName: 'User_test',
            password: '12345q'
          })
          .end((err, res) => {
            if (err) console.error(err)
            user = res.body.result
            res.should.have.status(200)
            res.should.have.cookie('connect.sid')
            done()
          })
      })
      it('delete photo with current user number, status -> 200', (done) => {
        authenticatedUser
          .post('/users/delete-photo')
          .send({
            imgID: user.photo[0]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.result.should.be.equal(true)
            done()
          })
      })
      it('delete photo id not exist, status -> 400', (done) => {
        authenticatedUser
          .post('/users/delete-photo')
          .send({
            imgID: '5eb113fa32917a5b2e2aa'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('delete user photo by userNumber, status -> 200', (done) => {
        authenticatedUser
          .post('/users/delete-photo')
          .send({
            userNumb: user.userNumb,
            imgID: user.photo[1]
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.result.should.be.equal(true)
            done()
          })
      })
      it('delete user photo userNumb not exist -> status 400', (done) => {
        authenticatedUser
          .post('/users/delete-photo')
          .send({
            userNumb: 100,
            imgID: 'sdsdsdsds'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      after(() => {
        del.sync([path.join(
          __dirname,
                `./../views/public/img/users/${user.userNumb}`)])
        del.sync([path.join(
          __dirname,
          './../views/public/uploads/unnamed.jpg')])

        const cleanUser = UserQuery.findOne({ userNumb: user.userNumb }).then(user => {
          user.photo = undefined//
          return user.save()
        })
        const cleanPhoto = new Promise((resolve, reject) => {
          FileQuery.deleteMany({}, (err, doc) => {
            if (err) reject(err)
            resolve(true)
          })
        })
        return Promise.all([cleanUser, cleanPhoto])
      })
    })
  })
}
