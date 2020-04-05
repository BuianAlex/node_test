const mongoose = require('mongoose')
const coursesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    timeStarted: {
      type: String,
    },
    timeEnd: {
      type: String,
    },
    isKeepOnDoing: {
      type: Boolean,
    },
    doYouLikeIt: {
      type: Boolean,
    },
  },
  { timestamps: true }
)

const CopursesQuery = mongoose.model('courses', coursesSchema)
module.exports = CopursesQuery
