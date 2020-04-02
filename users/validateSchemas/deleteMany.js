const ajv = require("ajv")({ $data: true });

require("ajv-keywords")(ajv);

const schema = {
  type: "array",
  items: {
    type: "integer",
    minItems: 1,
    uniqueItems: true
  },
  additionalItems: false
};

const validate = ajv.compile(schema);

module.exports = validate;
