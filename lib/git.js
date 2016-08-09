'use strict'

const fs = require('fs-extra')
const debug = require('debug')('git')
const path = require('path')
const util = require('util')
const spawn = require('child_process').spawn
const colors = require('colors')

module.exports = function ( settings ){
  let options = settings._program.rawArgs
  let cwd = settings.packageDir
  options.shift()
  options.shift()

  debug('in git with options:',options )

  const git = spawn('git', options, {stdio: 'inherit', cwd: cwd } )
  git.on('close',function(error,data){
    if (error) console.log(error)
    return;
  })

}
