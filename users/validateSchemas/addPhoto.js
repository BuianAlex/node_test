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
      type: 'number',
      minimum: 0
    },
    imgHeigh: {
      type: 'number',
      minimum: 0
    },
    quality: {
      type: 'number',
      maximum: 100,
      minimum: 0
    },
    greyscale: {
      type: 'boolean'
    },
    fileName: {
      type: 'string',
      minLength: 1
    },
    userNumb: {
      type: 'string'
    }
  },
  required: ['fileName'],
  additionalProperties: false
}

const validate = ajv.compile(schema)

module.exports = validate
