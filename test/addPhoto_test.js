const fs = require('fs')
const path = require('path')
module.exports = (app, chai) => {
  describe('Test /add-photo route', () => {
    describe('add user photo without authentication', () => {
      it('without authentication -> 401', (done) => {
        chai
          .request(app)
          .post('/users/add-photo')
          .send({})
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(401)
            res.body.message.should.be.equal('Unauthorized')
            done()
          })
      })
    })

    describe('add photo  user authenticated', () => {
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
            const inFile = fs.createReadStream(path.join(
              __dirname,
              './files/test_photo.png'
            ))
            const outFile = fs.createWriteStream(path.join(
              __dirname,
              './../views/public/uploads/test_photo.png'
            ))

            inFile.pipe(outFile)

            outFile.on('error', (err) => {
              console.log(err)
            })
            outFile.on('close', function () {
              res.should.have.status(200)
              res.should.have.cookie('connect.sid')
              done()
            })
          })
      })
      it('add photo with minimum required parameters (fileName,mime,type) -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            altText: '',
            fileName: 'test_photo.png',
            imgHeigh: '',
            imgWidth: '',
            mime: 'image/png',
            newName: '',
            quality: '',
            type: 'png',
            userNumb: ''
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.have.property('fileName')
            done()
          })
      })
      afterEach(() => {
        fs.unlinkSync(path.join(
          __dirname,
          `./../views/public/img/users/${user.userNumb}/test_photo.png`
        ))
        fs.rmdirSync(path.join(
          __dirname,
          `./../views/public/img/users/${user.userNumb}`
        ))
      })
    })
  })
}
