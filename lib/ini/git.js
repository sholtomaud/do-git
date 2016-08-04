'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('git setup')
const util = require('util')
const spawn = require('child_process').spawn

module.exports = function(config, action, program, configInit, cb){

  kgo('gitInit',function(done){
    let gitCL = spawn('git',['init'], { stdio: 'inherit' })
    gitCL.on('close', function (error, data) {
      done(error,data)
    })
  })
  ('productionIntranet',['gitInit'],function(gitInit,done){
    if (configInit.production){
      let prodSSH = 'ssh://' + configInit.production.loginID + '@' + configInit.production.intranetIP + ':' + '/home/' + configInit.production.loginID + '/dev/' + config.project;
      let gitIntranet = spawn('git',['remote','add', 'deployIntranet', prodSSH])
        //ssh://joel@192.168.1.12:50000/home/joel/dev/gitHooks]
      gitIntranet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production config. Skipping. Re-run if you want to setup production server configs')
        done(null,'no prod')
    }
  })('productionInternet',['productionIntranet'], function(productionIntranet,done){
    if (configInit.production){
      let prodInternetSSH = 'ssh://' + configInit.production.loginID + '@' + configInit.production.internetIP + ':' + '/home/' + configInit.production.loginID + '/dev/' + config.project;

      let gitInternet = spawn('git',['remote','add', 'deployInternet', prodInternetSSH])

      gitInternet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production config. Skipping. Re-run if you want to setup production server configs')
        done(null,'no prod')
    }
  })
  ('stageInternet',['productionInternet'],function(productionInternet,done){
    if (configInit.staging){
      let stageInternetSSH = 'ssh://' + configInit.staging.loginID + '@' + configInit.staging.internetIP + ':' + '/home/' + configInit.staging.loginID + '/dev/' + config.project;

      let gitStageInternet = spawn('git',['remote','add', 'stageInternet', stageInternetSSH])

      gitStageInternet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production config. Skipping. Re-run if you want to setup production server configs')
        done(null,'no staging')
    }
  })
  ('stageIntranet',['stageInternet'],function(stageInternet,done){
    if (configInit.staging){
      let stageIntranetSSH = 'ssh://' + configInit.staging.loginID + '@' + configInit.staging.internetIP + ':' + '/home/' + configInit.staging.loginID + '/dev/' + config.project;

      let gitStageIntranetSSH = spawn('git',['remote','add', 'stageIntranet', stageIntranetSSH])

      gitStageIntranetSSH.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production config. Skipping. Re-run if you want to setup production server configs')
        done(null,'no staging')
    }
  })
  (['*','stageIntranet'],cb)
}
