'use strict'

const fs = require('fs-extra')
const debug = require('debug')('testSSH')
const path = require('path')
const util = require('util')
const spawn = require('child_process').spawn
const colors = require('colors')
const timeout = 259200000
const db = require('./persistence')
const kgo = require('kgo')

module.exports = function( settings, cb){
  kgo('lastPackageSuccess',function(done){
    db.get('lastSSHSuccess', function (err, lastSSHSuccess) {
      if (err ){
        debug('db problem with put: ', err)
        done(null,{})
      }
      else {
        let last = JSON.parse(lastSSHSuccess)
        if ( last && last.hasOwnProperty(settings.pack.name) ){
          let lastPackage = last[settings.pack.name];
          last.success = lastPackage
          done(null , last)
        }
        else{
          done(null, null)
        }
      }
    })
  })
  ('test',['lastPackageSuccess'],function(last, done){
    if (last &&  last.hasOwnProperty('success') ){
      if ( last.success.time + timeout > Date.now() ) {
        console.log('---> Testing last successful SSH host', last.success.host)

        let lastTouch = `touch /home/${last.success.loginID}/apps/sshTest.txt`

        const testSSH = spawn('ssh', [ last.success.host ,'-p',last.success.port, lastTouch] )

        testSSH.on('close',function(error, data){
          if (error){
            console.log('---> Error connecting to last successful login. Testing all remotes');
            done(null,{})
          }
          else{
            console.log('---> Successful connection to', last.success.host);
            let success = last.success
            last[settings.pack.name] = last.success
            delete last.success
            db.put('lastSSHSuccess', JSON.stringify(last), function (err) {
              if (err) debug('db problem with put: ', err)
              debug('db get success. Closing down leveldb.')
              cb( null,  success  )
            })
          }
        })
      }
      else{
        console.log('---> Last successful SSH out of date. Testing all remotes')
        done(null,{})
      }
    }
    else{
      console.log('---> No last successful SSH')
      done(null,{})
    }
  })
  ('getAllRemotes',['test'],function(test,done){
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success.')
        done(err, JSON.parse(data))
    })
  })
  ('testAllRemotes',['getAllRemotes','lastPackageSuccess'],function(remotes,last,done){
    console.log('---> Testing all remotes')

    let remotesLength = remotes.length - 1
    callSSH(0,'internet')

    function callSSH(i, comms){
      debug('callSSH: remotesLength: ', remotesLength, ' i: ',i)
      let remote = remotes[ Math.floor(i/2)]
      let testTouch = `touch /home/${remote.loginID}/apps/sshTest.txt`
      let userHost = `${remote.loginID}@${remote[comms]['ip']}`
      let port = remote[comms]['port']
      let projectName = settings.pack.name
      let projectDir = `/home/${remote.loginID}/apps/${settings.pack.name}`

      let sshSuccess = {}
      sshSuccess.loginID = remote.loginID
      sshSuccess.host = userHost
      sshSuccess.port = port
      sshSuccess.gitWorkTree = remote.gitWorkTree
      sshSuccess.gitDir = remote.gitDir
      sshSuccess.projectDir = projectDir
      sshSuccess.projectDir = projectDir
      sshSuccess.projectName = projectName
      sshSuccess.nodeVersion = remote.nodeVersion
      sshSuccess.npmVersion = remote.npmVersion
      sshSuccess.comms = comms

      const testSSH = spawn('ssh', [ sshSuccess.host ,'-p',sshSuccess.port, testTouch] )

      testSSH.on('close', function(error, data){
        if (error){
          console.log('--->',colors.red('unable to connect to'), sshSuccess.host );
          callSSH( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
        }
        else{
          console.log('--->',colors.green('successful connection to'), sshSuccess.host);
          sshSuccess.time = Date.now()
          last[settings.pack.name] = sshSuccess

          if ( i + 1  > remotesLength ) {
            debug('kgo task: add git done, sshSuccess', last )
            db.put('lastSSHSuccess', JSON.stringify(last), function (err) {
              if (err) debug('db problem with put: ', err)
              debug('db put success. Closing down leveldb.')

              cb( null, sshSuccess  )
            })
          }
          else{
              callSSH( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
          }
        }
      })
    }
  })
  (['*'], function(error,data){
      console.log( colors.yellow('SSH TEST'), ' - errors', error, data)
      cb(error,data)
  })
}
