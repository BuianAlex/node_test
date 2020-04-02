const HttpError = require("./errorMiddleware");

const onlyAuthenficated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    next(new HttpError("", 401));
  }
};

const onlyAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.usergroup !== process.env.USER_ADMIN) {
      next(new HttpError("", 403));
    }
    next();
  } else {
    next(new HttpError("Forbidden", 403));
  }
};

const userCreate = (req, res, next) => {
  if (req.body.hasOwnProperty("usergroup")) {
    onlyAdmin(req, res, next);
  } else {
    next();
  }
};
module.exports = { onlyAdmin, userCreate, onlyAuthenficated };
