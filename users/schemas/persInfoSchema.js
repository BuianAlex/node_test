const mongoose = require('mongoose')
const scheme = mongoose.Schema({
  givenName: {
    type: String,
  },
  surname: {
    type: String,
  },
  job: {
    type: String,
  },
  nationality: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  homeAddress: {
    type: String,
  },
  city: {
    type: String,
  },
  postCode: {
    type: String,
  },
  country: {
    type: String,
  },
  passportStatus: {
    type: String,
  },
  passportNumber: {
    type: String,
  },
  passportExpectedDate: {
    type: String,
  },
  passportExpiryDate: {
    type: String,
  },
  isSectionStarted: {
    type: Boolean,
  },
  isSectionComplete: {
    type: Boolean,
  },
  isPage1Complete: {
    type: Boolean,
  },
  isPage2Complete: {
    type: Boolean,
  },
  isPage3Complete: {
    type: Boolean,
  },
  isPage4Complete: {
    type: Boolean,
  },
  isPage5Complete: {
    type: Boolean,
  },
})

const PersInfo = mongoose.model('personalInfo', scheme)
module.exports = PersInfo
