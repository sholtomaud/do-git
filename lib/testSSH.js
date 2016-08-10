'use strict'

const fs = require('fs-extra')
const debug = require('debug')('testSSH')
const path = require('path')
const util = require('util')
const spawn = require('child_process').spawn
const colors = require('colors')
const timeout = 2880
const level = require('level')

module.exports = function( settings, remotes, cb){
  const db = level(settings._dbdir)
  let remotesLength = remotes.length - 1
  let sshSuccess = []
  let sshSuccessLength

  // cache of last successful ssh with timeout
  db.get('lastSSHSuccess', function (err, lastSSHSuccess) {
    lastSSHSuccess = JSON.parse(lastSSHSuccess)
    if (err){
      debug('db problem with put: ', err)
      callSSH(0)
    }
    else{
      let lastSSHSuccessLength = lastSSHSuccess.length
      for (let j=0; j < lastSSHSuccessLength; ++j) {
        let last = lastSSHSuccess[j];
        if ( Date.now() > last.time + timeout) {
          sshSuccessLength = sshSuccess.length
          console.log(colors.yellow('SSH TEST'),'Using last SSH host', last.host)

          let lastTouch = `touch /home/${last.loginID}/apps/sshTest.txt`
          const testSSH = spawn('ssh', [ last.host ,'-p',last.port, lastTouch] )

          testSSH.on('close',function(error, data){
            if (error){
              console.log(colors.yellow('SSH TEST '),'Error connecting to last successful login. Testing all remotes');
              callSSH(0)
            }
            else{
              console.log(colors.yellow('SSH TEST'),'Successful connection to', last.host);
              sshSuccess.push(last)
              if ( ( j + 1  >= remotesLength ) && (sshSuccess.length > 0) ) {
                console.log('done db thinkgy')
                db.close(function(err){
                  debug('db get success. Closing down leveldb.')
                  cb( ( ( sshSuccess.length === 0)? 'Error, no ssh successes!':  null ),  sshSuccess  )
                })
              }
            }
          })
        }
        else{
          console.log(colors.green('SSH TEST'),'Last SSH out of date. Testing all remotes')
          callSSH(0)
        }
      }
    }
  })

  function callSSH(i){
    debug('callSSH: remotesLength: ', remotesLength, ' i: ',i)
    let remote = remotes[ i ]
    let testTouch = `touch /home/${remote.loginID}/apps/sshTest.txt`

    const testSSH = spawn('ssh', [ remote.host ,'-p',remote.port, testTouch] )

    testSSH.on('close', function(error, data){
      if (error){
        console.log(colors.red('SSH ERROR: '),' unable to connect to ', remote.host );
      }
      else{
        console.log(colors.green('SSH SUCCESS: '),' successful connection to ', remote.host);
        remote.time = Date.now()
        sshSuccess.push(remote)
      }

      if ( i + 1  > remotesLength ) {
        debug('kgo task: add git done, sshSuccess', sshSuccess )
        db.put('lastSSHSuccess', JSON.stringify(sshSuccess), function (err) {
          if (err) debug('db problem with put: ', err)

          db.close(function(err){
            debug('db get success. Closing down leveldb.')
            cb( ( ( sshSuccess.length === 0)? 'Error, no ssh successes!':  null ),  sshSuccess  )
          })
        })
      }
      else{
          callSSH( i+1 )
      }
    })
  }
}
