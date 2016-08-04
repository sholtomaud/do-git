'use strict'

const debug = require('debug')('init')
const fs = require('fs-extra')
const kgo = require('kgo')
const init = require('./ini')

var dirs = ['assets', 'test']

module.exports = function (config, action, program) {

  debug('config: ', config)
  debug('action: ',action)

  kgo('npmInit', function ( done) {
    debug('npm setup')
    init.npm(config, action, program, function(error,data){
      done(error,data)
    })
  })('configInit',['npmInit'], function(npmInit, done){
    let conf = {}
    debug('config setup')
    init.config(config, action, program, npmInit, function(error,data){
      done(error,data)
    })
  })('gitInit',['configInit'], function(configInit, done){
    debug('git setup')
    init.git(config, action, program, configInit,function(error,data){
      done(null,'data')
    })
  })('dockerInit',['configInit','gitInit'], function(configInit, gitInit, done){
    debug('docker setup')
    init.docker(config, action, program, configInit, function(error,data){
      done(null,"data")
    })
  })
  (['*'], function (err) {
    debug('Error: ' + err)
    return
  })
}
