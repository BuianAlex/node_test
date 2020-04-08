const ajv = require('ajv')({ $data: true })
require('ajv-keywords')(ajv)

const schema = {
  // type: 'object,
  // hobbies:
  //   { type: Array }, // ite
  // // {
  // //   type: Object
  // //   name: { type: String },
  // //   timeStarted: { type: String },
  // //   isKeepOnDoing: { type: Boolean }
  // // }

  // additionalProperties: false
}

const validate = ajv.compile(schema)

module.exports = validate
