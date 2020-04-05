const mongoose = require('mongoose')
const hobbiesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    timeStarted: {
      type: String,
    },
    isKeepOnDoing: {
      type: String,
    },
  },
  { timestamps: true }
)

const HobbiesQuery = mongoose.model('hobbies', hobbiesSchema)
module.exports = HobbiesQuery
