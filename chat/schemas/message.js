const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const schema = mongoose.Schema(
  {
    name: {
      type: String
    },
    time: {
      type: Date
    },
    text: {
      type: String
    }
  },
  { timestamps: true }
)
schema.plugin(mongoosePaginate)
const SkilsQuery = mongoose.model('messages', schema)
module.exports = SkilsQuery
