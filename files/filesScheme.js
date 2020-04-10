const mongoose = require('mongoose')

const filesScheme = mongoose.Schema(
  {
    fileName: {
      type: 'string',
      index: true,
      required: true
    },
    size: {
      type: 'string'
    },
    path: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string'
    },
    mime: {
      type: 'string'
    },
    altText: {
      type: 'string'
    }
  },
  { timestamps: true }
)

const FileQuery = mongoose.model('files', filesScheme)
module.exports = FileQuery
