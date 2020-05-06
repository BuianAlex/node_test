const path = require('path')
const fs = require('fs')
module.exports = (app, chai) => {
  describe('Upload photo', () => {
    it('Send valid file', done => {
      chai
        .request(app)
        .post('/files/upload')
        .set('Content-Type', 'image/jpeg')
        .set('Content-Disposition',
          'attachment; filename="unnamed.jpg"')
        .attach('file', fs.readFileSync(path.join(__dirname, './files/unnamed.jpg')))
        .end((err, res) => {
          console.log(res.text)
          done()
        })
    })
  })
}
