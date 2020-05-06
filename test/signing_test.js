const UserQuery = require('./../users/schemas/userSchema')
module.exports = (app, chai) => {
  describe('Test /user/create route', () => {
    it('Signing user -> status 200', done => {
      chai
        .request(app)
        .post('/users/create')
        .send({
          loginName: 'Test',
          password: '12345q'
        })
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(200)
          res.should.have.cookie('connect.sid')
          res.body.should.be.a('object')
          res.body.should.have.property('loginName')
          done()
        })
    })
    it('LoginName is exist in db - status 409 (if test starts first time should be fall)', done => {
      chai
        .request(app)
        .post('/users/create')
        .send({
          loginName: 'User_test',
          password: '12345q',
          isAdmin: true
        })
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(409)
          res.text.should.eql('Conflict')
          done()
        })
    })

    it('No password - status 400', done => {
      const testUserData = {
        loginName: 'User_test'
      }
      chai
        .request(app)
        .post('/users/create')
        .send(testUserData)
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(400)
          res.text.should.eql('FIELD_VALIDATION')
          done()
        })
    })

    it('No loginName - status 400', done => {
      chai
        .request(app)
        .post('/users/create')
        .send({
          loginName: '',
          password: '12345q'
        })
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(400)
          res.text.should.eql('FIELD_VALIDATION')
          done()
        })
    })

    it('LoginName wrong length - status 400', done => {
      chai
        .request(app)
        .post('/users/create')
        .send({
          loginName: 'Q',
          password: '12345q'
        })
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(400)
          res.text.should.eql('FIELD_VALIDATION')
          done()
        })
    })

    it('Password wrong length - status 400', done => {
      chai
        .request(app)
        .post('/users/create')
        .send({
          loginName: 'Qerty',
          password: '11'
        })
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(400)
          res.text.should.eql('FIELD_VALIDATION')
          done()
        })
    })

    after(() => {
      UserQuery.findOneAndRemove({ loginName: 'Test' })
        .catch(console.log)
    })
  })
}
