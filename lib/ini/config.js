'use strict'

const fs = require('fs-extra')
const debug = require('debug')('config setup')
const path = require('path')
const inquirer = require('inquirer')
const kgo = require('kgo')

module.exports = function(settings, npmInit, cb){


  kgo('staging',function(done){
    const stagingSystem = require( path.join(settings._dogitdir,'/lib/ini/systemQuestions.js') )
    let stagingQuestions = stagingSystem('STAGING',settings)

    inquirer.prompt(stagingQuestions).then(function (answers) {
      console.log(JSON.stringify(answers, null, '  '));
      done(null, answers)
    })

  })
  ('production',['staging'],function(staging,done){
    const productionSystem = require( path.join(settings._dogitdir,'/lib/ini/systemQuestions.js') )
    let productionQuestions = productionSystem('PRODUCTION', settings)

    inquirer.prompt(productionQuestions).then(function (answers) {
      console.log(JSON.stringify(answers, null, '  '));
      done(null, answers)
    })
  })
  ('npm',['production'],function(production,done){
    const npmSetup = require( path.join(settings._dogitdir,'/lib/ini/npmQuestions.js') )
    let npmQuestions = npmSetup(settings)

    inquirer.prompt(npmQuestions).then(function (answers) {
      console.log(JSON.stringify(answers, null, '  '));
      done(null, answers)
    })
  })
  (['*','npm'],function(error,data){
    cb(error,data)
  })

}
