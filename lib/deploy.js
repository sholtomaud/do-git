'use strict'

const debug = require('debug')('deploy')
const spawn = require('child_process').spawn
const testSSH = require('./testSSH')
const kgo = require('kgo')
const colors = require('colors')

module.exports = function ( settings, cb ) {
  let cwd = settings.packageDir
  let options = settings._program.rawArgs
  options.shift()
  options.shift()
  console.log( colors.magenta('DOGIT DEPLOY'), 'testing SSH' )
  kgo('testSSH',function(done){
    console.log( colors.yellow('SSH'), 'Testing ssh settings')
    testSSH(settings,function(error,success){
      done(error,success)
    })
  })
  ('shrinkwrap',['testSSH'],function(testSSH,done){
    let shrink = spawn('npm',['shrinkwrap'],{cwd: cwd})
    shrink.on('close',function(error,data){
        done(error,null)
    })
  })
  ('deploySetup',['shrinkwrap'],function(success, done){
      console.log ('options',options, 'success', success)
  })
  (['*'], function (err) {
    debug('Error: ' + err)
    if (err) console.log('dogit deploy error', err)
    return
  })
}
  //git tag
  //git push deploy release
  //to production yaml.
  //docker compose
  //npm shrinkwrap
  //

  // let gitOptions = ['push',`${action}`,'release']
  // const deploy = spawn('git',gitOptions)
  //
  // deploy.stdout.on('data', (data) => {
  //   process.stdout.write(`${data}`)
  // })
  // deploy.stderr.on('data', (data) => {
  //   process.stdout.write(`stderr: ${data}`)
  // })
  // deploy.on('close', (code) => {
  //   console.log(`docu exited with code ${code}`)
  //   return code
  // })
