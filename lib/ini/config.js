'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('config setup')
const util = require('util')
const readline = require('readline')
const path = require('path')
const inquire = require('inquirer')

// fs.exists(path.join(config._dogitdir,'/lib/ini/questions.json'), function (exists) {
//   if (exists) const questions = require(path.join(config._dogitdir,'/lib/ini/questions.json'))
// })

module.exports = function(config, action, program, npmInit, cb){

  fs.exists(path.join(config.packageDir, '/config.json'), function (exists) {
    if (exists) const legacyConfig = require(path.join(config.packageDir, '/config.json'))
  })

  let data = {}

  data.production = {}
  data.staging = {}

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'do-git> '
  });

  kgo('production', function (done) {
    debug('serverType')
    rl.question('[PROD] What is the loginID for your production server? ', (answer) => {
      debug(`  loginID: ${answer}`);
      data.production.loginID = answer
      done(null,answer)
    })
  })('intranetIP',['production'], function (production,done) {
    rl.question('[PROD] What is the intranetIP for your production server? ', (answer) => {
      debug(`  intranetIP: ${answer}`);
      data.production.intranetIP = answer
      done(null,answer)
    })
  })('internetIP',['intranetIP'], function (intranetIP,done) {
    rl.question('[PROD] What is the internetIP for your production server? ', (answer) => {
      debug(`  internetIP: ${answer}`);
      data.production.internetIP = answer
      done(null,answer)
    })
  })('gitDir',['internetIP'], function (internetIP,done) {
    rl.question('[PROD] What is the gitDir for your production server? ', (answer) => {
      debug(`  gitDir: ${answer}`);
      data.production.gitDir = answer
      done(null,answer)
    })
  })('gitWorkDir',['gitDir'], function (gitDir,done) {
    rl.question('[PROD] What is the git working dir for your production server? ', (answer) => {
      debug(`  serverType configuring: ${answer}`);
      data.production.gitWorkDir = answer
      done(null,answer)
    })
  })('staging', ['gitWorkDir'], function (npmVersion, done) {
    debug('serverType')
    rl.question('[STAGE] What is the loginID for your staging server? ', (answer) => {
      debug(`  loginID: ${answer}`);
      data.staging.loginID = answer
      done(null,answer)
    })
  })('stageIntranetIP',['staging'], function (staging,done) {
    rl.question('[STAGE] What is the intranetIP for your staging server? ', (answer) => {
      debug(`  intranetIP: ${answer}`);
      data.staging.intranetIP = answer
      done(null,answer)
    })
  })('stageInternetIP',['stageIntranetIP'], function (stageIntranetIP,done) {
    rl.question('[STAGE] What is the internetIP for your staging server? ', (answer) => {
      debug(`  internetIP: ${answer}`);
      data.staging.internetIP = answer
      done(null,answer)
    })
  })('stageGitDir',['stageInternetIP'], function (internetIP,done) {
    rl.question('[STAGE] What is the gitDir for your staging server? ', (answer) => {
      debug(`  gitDir: ${answer}`);
      data.staging.gitDir = answer
      done(null,answer)
    })
  })('stageGitWorkDir',['stageGitDir'], function (gitDir,done) {
    rl.question('[STAGE] What is the git working dir for your staging server? ', (answer) => {
      debug(`  serverType configuring: ${answer}`);
      data.staging.gitWorkDir = answer
      done(null,answer)
    })
  })('nodeVersion',['stageGitWorkDir'], function (gitWorkDir,done) {
    rl.question('[NODE] What version of node do you want? ', (answer) => {
      debug(`  nodeVersion: ${answer}`);
      data.nodeVersion = answer
      done(null,answer)
    })
  })('npmVersion',['nodeVersion'], function (nodeVersion,done) {
    rl.question('[NPM] What version of npm do you want? ', (answer) => {
      debug(`  npmVersion: ${answer}`);
      data.npmVersion = answer
      done(null,answer)
    })
  })('write',['npmVersion'], function(npmVersion, done){
    debug('write data for npmVersion: ',npmVersion)
    let configFile = path.join(config.packageDir, '/config.json')

    var writeStream = fs.createWriteStream(configFile);
    writeStream.write(JSON.stringify(data, null, 4));
    writeStream.on('error', function (err) {
      debug('error in writing to file',err)
      done(err)
    });
    writeStream.end(function(){
      done(null,data)
    });
  })
  (['*','write'],cb)

}
