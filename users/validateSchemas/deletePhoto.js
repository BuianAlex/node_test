const ajv = require('ajv')({ $data: true })
require('ajv-keywords')(ajv)

const schema = {
  type: 'object',
  properties: {
    userID: {
      type: 'string'
    },
    imgID: {
      type: 'string'
    }
  },
  required: ['imgID', 'userID'],
  additionalProperties: true
}

const validate = ajv.compile(schema)

module.exports = validate
