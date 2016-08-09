'use strict'

const debug = require('debug')('setup')
const fs = require('fs-extra')
const kgo = require('kgo')
const set = require('./set')

module.exports = function ( settings ) {
  kgo('npmsetup', function ( done) {
    debug('task: npm setup')
    set.npm(settings, function(error,data){
      done(error,data)
    })
  })('configsetup',['npmsetup'], function(npmsetup, done){
    let conf = {}
    debug('task: config setup')
    set.config(settings, npmsetup, function(error,data){
      done(error,data)
    })
  })('gitsetup',['configsetup','npmsetup'], function(config, npmsetup, done){
    debug('kgo task: git setup')
    set.git(settings, function(error,data){
      done(error,data)
    })
  })('dockersetup',['gitsetup'], function(gitsetup, done){
    debug('kgo task: docker setup')
    set.docker(settings, function(error,data){
      debug('docker setup error',error)
      done(error,data)
    })
  })
  (['*','dockersetup'], function (err) {
    debug('Error: ' + err)
    if (!err) console.log('dogit setup complete')
    return
  })
}
