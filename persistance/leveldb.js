'use strict'

const level = require('level')
const levelup = require('levelup')
const path = require('path')
const HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

const db = level(path.join(HOME,'.doGit/mydb') )

module.exports = {

  return;



}
