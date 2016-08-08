'use strict'

const debug = require('debug')('init')
const fs = require('fs-extra')
const kgo = require('kgo')
const init = require('./ini')

module.exports = function (settings ) {

  kgo('npmInit', function ( done) {
    debug('task: npm setup')
    init.npm(settings, function(error,data){
      done(error,data)
    })
  })('configInit',['npmInit'], function(npmInit, done){
    let conf = {}
    debug('task: config setup')
    init.config(settings, npmInit, function(error,data){
      done(error,data)
    })
  })('gitInit',['configInit','npmInit'], function(config, npmInit, done){
    debug('kgo task: git setup')
    init.git(settings, function(error,data){
      done(error,data)
    })
  })('dockerInit',['gitInit'], function(gitInit, done){
    debug('kgo task: docker setup')
    init.docker(settings, function(error,data){
      debug('docker setup error',error)
      done(error,data)
    })
  })
  (['*','dockerInit'], function (err) {
    debug('Error: ' + err)
    return
  })
}
