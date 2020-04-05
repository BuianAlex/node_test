const mongoose = require('mongoose')
const skilsSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
    },
    improvements: {
      type: String,
    },
  },
  { timestamps: true }
)

const SkilsQuery = mongoose.model('skils', skilsSchema)
module.exports = SkilsQuery
