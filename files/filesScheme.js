const mongoose = require('mongoose')

const filesScheme = mongoose.Schema(
  {
    fileName: {
      type: String,
      index: true,
      required: true
    },
    size: {
      type: String
    },
    path: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    mime: {
      type: String
    },
    altText: {
      type: String
    }
  },
  { timestamps: true }
)

const FileQuery = mongoose.model('files', filesScheme)
module.exports = FileQuery
