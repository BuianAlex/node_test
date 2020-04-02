module.exports = data => {
  const {
    userId,
    loginName,
    email,
    phone,
    photo,
    usergroup,
    lastVisit,
    registrated,
    online
  } = data;
  return {
    userId,
    loginName,
    email,
    phone,
    photo,
    usergroup,
    lastVisit,
    registrated,
    online
  };
};
