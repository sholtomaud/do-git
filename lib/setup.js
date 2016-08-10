'use strict'

const debug = require('debug')('setup')
const fs = require('fs-extra')
const kgo = require('kgo')
const set = require('./set')
const colors = require('colors')

module.exports = function ( settings ) {
  kgo('npmsetup', function ( done) {
    debug('task: npm setup')
    console.log( colors.red('NPM'), 'set npm')
    set.npm(settings, function(error,data){
      done(error,data)
    })
  })('configsetup',['npmsetup'], function(npmsetup, done){
    let conf = {}
    debug('task: config setup')
    console.log( colors.green('CONFIG'), 'set config')
    set.config(settings, npmsetup, function(error,data){
      done(error,data)
    })
  })('gitsetup',['configsetup','npmsetup'], function(config, npmsetup, done){
    debug('kgo task: git setup')
    console.log( colors.blue('GIT'), 'set git')
    set.git(settings, function(error,data){
      done(error,data)
    })
  })('dockersetup',['gitsetup'], function(gitsetup, done){
    debug('kgo task: docker setup')
    console.log( colors.cyan('DOCKER'), 'set docker')
    set.docker(settings, function(error,data){
      debug('docker setup error',error)
      done(error,data)
    })
  })
  (['*'], function (err) {
    debug('Error: ' + err)
    if (!err) console.log('dogit setup complete')
    return
  })
}
