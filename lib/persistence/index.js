'use strict'

const fs = require('fs-extra')
const level = require('level')
const config = require('../config')
// const logger = require('../logger')

fs.mkdirs(config.dbDir,function(err){
  console.log(err)
})

// let GET = function(key,cb){
//   db.get(key, function (err, data) {
//     if (err) logger.fatal(err);
//     cb(err,JSON.parse(data) )
//   })
// }
//
// let PUT = function(key,data,cb){
//   db.put(key, data, function (err) {
//     if (err) logger.fatal(err);
//     cb(err)
//   })
// }

module.exports = level(config.dbDir)

// {
//   Get: GET,
//   Put: PUT
//
// }
