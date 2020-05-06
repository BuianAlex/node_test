const ajv = require('ajv')({ $data: true })
require('ajv-keywords')(ajv)

const schema = {
  type: 'object',
  properties: {
    userNumb: {
      type: 'number'
    },
    imgID: {
      type: 'string'
    }
  },
  required: ['imgID'],
  additionalProperties: false
}

const validate = ajv.compile(schema)

module.exports = validate
