const fs = require('fs')
const path = require('path')
const del = require('del')
module.exports = (app, chai) => {
  const FileQuery = require('../files/filesScheme')
  const UserQuery = require('../users/schemas/userSchema')
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
            res.text.should.be.equal('Unauthorized')
            done()
          })
      })
    })

    describe('add photo  user authenticated', () => {
      const authenticatedUser = chai.request.agent(app)
      let user
      beforeEach(function (done) {
        const inFile = fs.createReadStream(path.join(
          __dirname,
          './files/unnamed.jpg'
        ))
        const outFile = fs.createWriteStream(path.join(
          __dirname,
          './../views/public/uploads/unnamed.jpg'
        ))
        inFile.pipe(outFile)
        outFile.on('error', (err) => {
          console.log(err)
        })
        outFile.on('close', function () {
          done()
        })
      })

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
      it('add photo with minimum required parameters (fileName) -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.fileName.should.be.equal('unnamed.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('50011')
            fs.statSync(path.join(
              __dirname,
                  `./../views/public/img/users/${user.userNumb}/unnamed.jpg`
            )).should.have.property('size')
            done()
          })
      })
      it('file exist already -> 400', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg'
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('add photo change the name to "newName" -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'newName'
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/newName.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('newName.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('50011')
            done()
          })
      })
      it('add photo change the name to "" -> 400', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: ''
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('add photo with change quality 40% 50011 to 9797 -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'compress40',
            quality: 40
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/compress40.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('compress40.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('9797')
            done()
          })
      })
      it('add photo with change quality -1%  -> 400', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'error',
            quality: -1
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('add photo with change quality 101%  -> 400', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'error',
            quality: 101
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('add photo change width and heigh  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'small',
            quality: 40,
            imgHeigh: 150,
            imgWidth: 150
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/small.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('small.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('4066')
            done()
          })
      })
      it('add photo and change width to -100px  -> 400', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'smallError',
            quality: 40,
            imgHeigh: 150,
            imgWidth: -100
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.should.have.status(400)
            res.text.should.be.equal('FIELD_VALIDATION')
            done()
          })
      })
      it('add photo and change width to 0px  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'nullWidth',
            quality: 40,
            imgHeigh: 150,
            imgWidth: 0
          })
          .end((err, res) => {
            if (err) console.error(err)
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('nullWidth.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('4066')
            done()
          })
      })
      it('add photo change only width  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'onlyWidth',
            imgWidth: 150
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/onlyWidth.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('onlyWidth.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('21420')
            done()
          })
      })
      it('add photo change only heigh  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'onlyHeigh',
            imgHeigh: 150
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/onlyHeigh.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('onlyHeigh.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('21420')
            done()
          })
      })
      it('add photo change alt text  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'smile',
            altText: 'smile'
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/smile.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('smile.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('50011')
            done()
          })
      })
      it('add photo in grey scale  -> 200', (done) => {
        authenticatedUser
          .post('/users/add-photo')
          .send({
            fileName: 'unnamed.jpg',
            newName: 'smileGrey',
            altText: 'smileGrey',
            greyscale: true
          })
          .end((err, res) => {
            if (err) console.error(err)
            fs.statSync(path.join(
              __dirname,
                    `./../views/public/img/users/${user.userNumb}/smileGrey.jpg`
            )).should.have.property('size')
            res.body.should.be.a('object')
            res.should.have.status(200)
            res.body.fileName.should.be.equal('smileGrey.jpg')
            res.body.path.should.be.equal('img/users/1')
            res.body.size.should.be.equal('25580')
            done()
          })
      })
      // after(() => {
      //   del.sync([path.join(
      //     __dirname,
      //         `./../views/public/img/users/${user.userNumb}`)])
      //   del.sync([path.join(
      //     __dirname,
      //     './../views/public/uploads/unnamed.jpg')])

      //   const cleanUser = UserQuery.findOne({ userNumb: user.userNumb }).then(user => {
      //     user.photo = undefined//
      //     return user.save()
      //   })
      //   const cleanPhoto = new Promise((resolve, reject) => {
      //     FileQuery.deleteMany({}, (err, doc) => {
      //       if (err) reject(err)
      //       resolve(true)
      //     })
      //   })
      //   return Promise.all([cleanUser, cleanPhoto])
      // })
    })
  })
}
