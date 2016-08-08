'use strict'

const fs = require('fs-extra')
const level = require('level')
const levelup = require('levelup')
const path = require('path')
const HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const DOGITDIR = path.join(HOME,'/.dogit')

let db

fs.mkdirs(DOGITDIR,function(err){
  db = level(DOGITDIR)
})

module.exports = db
