const mongoose = require('mongoose')

const schema = mongoose.Schema({
  hobbies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'hobbies',
      autopopulate: true,
    },
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courses',
      autopopulate: true,
    },
  ],
  skills: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'skils', autopopulate: true },
  ],
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
schema.plugin(require('mongoose-autopopulate'))
const EvolutionQuery = mongoose.model('evolution', schema)
module.exports = EvolutionQuery
