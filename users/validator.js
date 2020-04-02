const create = require('./validateSchemas/create')
const login = require('./validateSchemas/login')
const edit = require('./validateSchemas/edit')
const deleteMany = require('./validateSchemas/deleteMany')
const addPhoto = require('./validateSchemas/addPhoto')
const deletePhoto = require('./validateSchemas/deletePhoto')
module.exports = { create, login, edit, deleteMany, deletePhoto, addPhoto }
