const mongoose = require('mongoose')
const hobbies = require('./hobbiesSchema')
const courses = require('./coursesSchema')
const skills = require('./skillsSchema')

const evolutionSchema = mongoose.Schema({
  hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: hobbies }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: courses }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: skills }],
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
})

const EvolutionQuery = mongoose.model('evolution', evolutionSchema)
module.exports = EvolutionQuery
