module.exports = (app, chai) => {
  describe('Test /users/get-one route', () => {
    describe('Get user personal info without authentication', () => {
      it('without authentication', (done) => {
        chai
          .request(app)
          .get('/users/get-one')
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.body.message.should.be.equal('Unauthorized')
            done()
          })
      })
      it('without authentication by id', (done) => {
        chai
          .request(app)
          .get('/users/get-one?id=0')
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.body.message.should.be.equal('Unauthorized')
            done()
          })
      })
    })
    describe('Get user personal info - authenticated user', () => {
      const authenticatedUser = chai.request.agent(app)
      let userNumb
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
            userNumb = res.body.result.userNumb
            done()
          })
      })
      it('get personal info current user', (done) => {
        authenticatedUser
          .get('/users/get-one')
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.text.should.have.lengthOf(7785)
            done()
          })
      })
      it('get personal info by user number', (done) => {
        authenticatedUser
          .get(`/users/get-one?id=${userNumb}`)
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.text.should.have.lengthOf(7785)
            done()
          })
      })
      it('get personal info by not valid user number - data type -> status 400', (done) => {
        authenticatedUser
          .get('/users/get-one?id=rere')
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.body.message.should.be.equal('BadRequest')
            done()
          })
      })
      it('get personal info by not valid user number - user not exist -> status 400', (done) => {
        authenticatedUser
          .get('/users/get-one?id=1000000')
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.body.message.should.be.equal('BadRequest')
            done()
          })
      })
    })
  })
}
