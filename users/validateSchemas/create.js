const ajv = require("ajv")({ $data: true });

require("ajv-keywords")(ajv);

const schema = {
  type: "object",
  properties: {
    loginName: {
      type: "string",
      minLength: 3
    },
    password: {
      type: "string",
      minLength: 6
    },
    email: {
      type: "string"
    },
    phone: {
      type: "string"
    },
    usergroup: {
      type: "string"
    }
  },
  required: ["loginName", "password"],
  additionalProperties: true
};

const validate = ajv.compile(schema);

module.exports = validate;
