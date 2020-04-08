const ajv = require('ajv')({ $data: true })
require('ajv-keywords')(ajv)

const schema = {
  type: 'object',
  properties: {
    hobbies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          timeStarted: { type: 'string' },
          isKeepOnDoing: { type: 'boolean' }
        },
        additionalProperties: false
      }
    },
    courses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          timeStarted: { type: 'string' },
          timeEnd: { type: 'string' },
          isKeepOnDoing: { type: 'boolean' },
          doYouLikeIt: { type: 'boolean' }
        },
        additionalProperties: false
      }
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          level: { type: 'string' },
          improvements: { type: 'string' }
        }
      }
    },
    isSectionStarted: { type: 'boolean' },
    isSectionComplete: { type: 'boolean' },
    isPage1Complete: { type: 'boolean' },
    isPage2Complete: { type: 'boolean' },
    isPage3Complete: { type: 'boolean' }
  },
  additionalProperties: false
}

const validate = ajv.compile(schema)

module.exports = validate
