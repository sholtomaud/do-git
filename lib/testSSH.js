'use strict'

const fs = require('fs-extra')
const debug = require('debug')('testSSH')
const path = require('path')
const util = require('util')
const spawn = require('child_process').spawn
const colors = require('colors')

module.exports = function( settings, remotes, cb){
  let remotesLength = remotes.length - 1
  let sshSuccess = []

  callSSH(0)

  function callSSH(i){
    // let remote = remotes[ Math.floor(i/2) ]
    debug('callSSH: remotesLength: ', remotesLength, ' i: ',i)
    let remote = remotes[ i ]
    // let testText = Date.now() + ` User: ${stageProd.loginID}, successful test ${settings.pack.name}`
    //   let testEcho = `echo ${testText} >> /home/${stageProd.loginID}/apps/sshTest.txt`
    let testTouch = `touch /home/${remote.loginID}/apps/sshTest.txt`

    const testSSH = spawn('ssh', [ remote.host ,'-p',remote.port, testTouch],{ stdio: 'inherit' })

    testSSH.on('close', function(error, data){

      if (error){
        console.log(colors.red('SSH ERROR: '),' unable to connect to ', remote.host, ' : ', error);
      }
      else{
        console.log(colors.green('SSH SUCCESS: '),' successful connection to ', remote.host);
        sshSuccess.push(remote)
      }

      if ( i + 1  > remotesLength ) {
        debug('kgo task: add git done, sshSuccess', sshSuccess )

        cb( ( ( sshSuccess.length > 0)? 'Error, no ssh successes!':  null ),  sshSuccess  )
      }
      else{
          callSSH( i+1 )
      }
    })
  }
}
