'use strict'

const debug = require('debug')('init')
const fs = require('fs-extra')
const kgo = require('kgo')
const init = require('./ini')

module.exports = function (settings ) {

  debug('settings: ', settings)

  kgo('npmInit', function ( done) {
    debug('npm setup')
    init.npm(settings, function(error,data){
      done(error,data)
    })
  })('configInit',['npmInit'], function(npmInit, done){
    let conf = {}
    debug('config setup')
    init.config(settings, npmInit, function(error,data){
      done(error,data)
    })
  })('gitInit',['configInit','npmInit'], function(config, npmInit, done){
    debug('git setup')
    init.git(settings, config,function(error,data){
      done(error,data)
    })
  })('dockerInit',['configInit','gitInit'], function(config, gitInit, done){
    debug('docker setup')
    init.docker(settings, config, function(error,data){
      done(error,data)
    })
  })
  (['*','dockerInit'], function (err) {
    debug('Error: ' + err)
    return
  })
}
