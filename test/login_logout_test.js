module.exports = (app, chai) => {
  const queryRight = {
    loginName: 'User_test',
    password: '12345q'
  }
  const queryWrong = {
    loginName: 'alex',
    password: 'werewrewrwe'
  }
  const queryWrong2 = {
    loginName: 'alex'
  }

  describe('Test "/login"  route', () => {
    it('User should be logined -  status 200', done => {
      chai.request(app)
        .post('/users/login')
        .send(queryRight)
        .end((err, res) => {
          if (err) console.error(err)
          res.should.have.status(200)
          res.should.have.cookie('connect.sid')
          res.body.should.be.a('object')
          res.body.should.have.property('result')
          done()
        })
    })

    it('Not valid password - should be rejected staus 401', done => {
      chai.request(app)
        .post('/users/login')
        .send(queryWrong)
        .end((err, res) => {
          if (err) console.error(err)
          res.should.have.status(401)
          res.body.should.be.a('object')
          res.body.should.have.property('message')
          done()
        })
    })

    it('Send only loginName - should be rejected status 400', done => {
      chai
        .request(app)
        .post('/users/login')
        .send(queryWrong2)
        .end((err, res) => {
          if (err) console.error(err)
          res.should.have.status(400)
          res.body.should.be.a('object')
          res.body.should.have.property('message')
          done()
        })
    })
  })

  describe('Test user logout', () => {
    const authenticatedUser = chai.request.agent(app)
    before((done) => {
      authenticatedUser
        .post('/users/login')
        .send(queryRight)
        .end((err, res) => {
          if (err) console.error(err)
          res.should.have.status(200)
          res.should.have.cookie('connect.sid')
          done()
        })
    })

    it('User logout -  200', (done) => {
      authenticatedUser
        .get('/users/logout')
        .end((err, res) => {
          if (err) console.error(err)
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('result')
          res.body.result.should.be.equal('Bye')
          done()
        })
    })
  })
}
