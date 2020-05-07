const path = require('path')
const fs = require('fs')
module.exports = (app, chai) => {
  describe('Test /files/upload route', () => {
    it('Send valid file -> 200', done => {
      chai
        .request(app)
        .post('/files/upload')
        .set('Content-Type', 'image/jpeg')
        .set('Content-Disposition',
          'attachment; filename="unnamed.jpg"')
        .send(fs.readFileSync(path.join(__dirname, './files/unnamed.jpg')))
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(200)
          res.body.should.have.property('path').and.to.be.equal('/uploads/unnamed.jpg')
          done()
        })
    })
    it('Send not valid file type', done => {
      chai
        .request(app)
        .post('/files/upload')
        .set('Content-Type', 'image/jpeg')
        .set('Content-Disposition',
          'attachment; filename="unnamed.jpg"')
        .send(fs.readFileSync(path.join(__dirname, './files/test_data_set.js')))
        .end((err, res) => {
          if (err) console.log(err)
          res.should.have.status(400)
          res.text.should.be.equal('FIELD_VALIDATION')
          done()
        })
    })
  })
}
