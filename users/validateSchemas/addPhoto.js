const ajv = require('ajv')({ $data: true })
require('ajv-keywords')(ajv)

const schema = {
  type: 'object',
  properties: {
    newName: {
      type: 'string'
    },
    altText: {
      type: 'string'
    },
    imgWidth: {
      type: 'string'
    },
    imgHeigh: {
      type: 'string'
    },
    quality: {
      type: 'string'
    },
    fileName: {
      type: 'string',
      minLength: 3
    },
    userID: {
      type: 'string'
    },
    mime: {
      type: 'string'
    },
    type: {
      type: 'string'
    }
  },
  required: ['fileName', 'userID', 'type', 'mime'],
  additionalProperties: true
}

const validate = ajv.compile(schema)

module.exports = validate
