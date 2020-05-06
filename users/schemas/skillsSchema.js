const mongoose = require('mongoose')
const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    level: {
      type: String
    },
    improvements: {
      type: String
    }
  },
  { timestamps: true }
)

const SkillsQuery = mongoose.model('skills', schema)
module.exports = SkillsQuery
