module.exports = (data) => {
  const { userNumb, loginName, photo, isAdmin } = data
  return {
    userNumb,
    loginName,
    isAdmin,
    photo,
  }
}
