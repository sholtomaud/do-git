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
    // let shrink = spawn('npm',['shrinkwrap'],{cwd: cwd})
    // shrink.on('close',function(error,data){
        console.log( colors.red('NPM'), 'shrinkwrap')
        done(null,null)
    // })
  })
  ('deployType',['shrinkwrap'],function(success, done){
    let deployType = options[1].trim()
    console.log( colors.cyan('GIT'), 'type')
    switch (deployType) {
      case ( (deployType.match(/^p.*/ig) )? deployType : undefined ) :
        done(null,'production')
        break
      case ( (deployType.match(/^s.*/ig) )? deployType : undefined ) :
        done(null,'staging')
        break
      case ( (deployType.match(/^d.*/ig) )? deployType : undefined ) :
        done(null,'development')
        break
      default: lib.git(settings)
    }
  })
  ('deploy',['testSSH','deployType'],function(testSSH, type, done){
    let gitOrigin = `${type}_${testSSH.comms}`
    // GIT_SSH_COMMAND="ssh -v" git push staging_internet master -v
    //
    console.log('gitOrigin',gitOrigin)
    let deploy = spawn('git',['push',gitOrigin,'master','-v'],{cwd: cwd, stdio:'inherit'})
    deploy.on('close',function(error,data){
      if(error) console.log(colors.red('unsuccessful deploy'),error)
        done(error,null)
    })
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
