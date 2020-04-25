module.exports = (app, chai) => {
  describe('Test /users route', () => {
    it('get users list -> status 200', done => {
      chai
        .request(app)
        .get('/users')
        .end((err, res) => {
          err && console.log(err)
          res.should.have.status(200)
          done()
        })
    })
  })
}
