'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('config setup')
const util = require('util')
const path = require('path')
const inquire = require('inquirer')
const questions = require(path.join(config._dogitdir,'/lib/ini/questions.js'))

module.exports = function(config, action, program, npmInit, cb){

  fs.exists(path.join(config.packageDir, '/config.json'), function (exists) {
    if (exists) const legacyConfig = require(path.join(config.packageDir, '/config.json'))
  })

  inquirer.prompt(questions).then(function (answers) {
    console.log(JSON.stringify(answers, null, '  '));
    cb(answers)
  })
  
}
