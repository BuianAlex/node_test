const ajv = require("ajv")({ $data: true });

require("ajv-keywords")(ajv);

const schema = {
  type: "object",
  properties: {
    loginName: {
      type: "string"
    },
    email: {
      type: "string"
    },
    phone: {
      type: "string"
    },
    usergroup: {
      type: "string"
    },
    photo: {
      type: "string"
    }
  },
  required: ["loginName"],
  additionalProperties: false
};

const validate = ajv.compile(schema);

module.exports = validate;
