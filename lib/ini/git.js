'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('git setup')
const util = require('util')
const spawn = require('child_process').spawn

module.exports = function(settings, config, cb){

  kgo('gitInit',function(done){
    let gitCL = spawn('git',['init'], { stdio: 'inherit' })
    gitCL.on('close', function (error, data) {
      done(error,data)
    })
  })
  ('productionIntranet',['gitInit'],function(gitInit,done){
    if (config.production){
      let prodSSH = 'ssh://' + config.production.loginID + '@' + config.production.intranetIP + ':' + '/home/' + config.production.loginID + '/dev/' + settings.project;
      let gitIntranet = spawn('git',['remote','add', 'deployIntranet', prodSSH])
        //ssh://joel@192.168.1.12:50000/home/joel/dev/gitHooks]
      gitIntranet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production settings. Skipping. Re-run if you want to setup production server configs')
        done(null,'no prod')
    }
  })('productionInternet',['productionIntranet'], function(productionIntranet,done){
    if (config.production){
      let prodInternetSSH = 'ssh://' + config.production.loginID + '@' + config.production.internetIP + ':' + '/home/' + config.production.loginID + '/dev/' + settings.project;

      let gitInternet = spawn('git',['remote','add', 'deployInternet', prodInternetSSH])

      gitInternet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production settings. Skipping. Re-run if you want to setup production server configs')
        done(null,'no prod')
    }
  })
  ('stageInternet',['productionInternet'],function(productionInternet,done){
    if (config.staging){
      let stageInternetSSH = 'ssh://' + config.staging.loginID + '@' + config.staging.internetIP + ':' + '/home/' + config.staging.loginID + '/dev/' + settings.project;

      let gitStageInternet = spawn('git',['remote','add', 'stageInternet', stageInternetSSH])

      gitStageInternet.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production settings. Skipping. Re-run if you want to setup production server configs')
        done(null,'no staging')
    }
  })
  ('stageIntranet',['stageInternet'],function(stageInternet,done){
    if (config.staging){
      let stageIntranetSSH = 'ssh://' + config.staging.loginID + '@' + config.staging.internetIP + ':' + '/home/' + config.staging.loginID + '/dev/' + settings.project;

      let gitStageIntranetSSH = spawn('git',['remote','add', 'stageIntranet', stageIntranetSSH])

      gitStageIntranetSSH.on('close', function (error, data) {
        done(error, data)
      })
    }
    else{
        console.log('no production settings. Skipping. Re-run if you want to setup production server configs')
        done(null,'no staging')
    }
  })
  (['*','stageIntranet'],function(error,data){
    cb(error,data)
  })
}
