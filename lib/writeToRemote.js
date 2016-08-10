'use strict'

const fs = require('fs-extra')
const debug = require('debug')('testSSH')
const path = require('path')
const util = require('util')
const spawn = require('child_process').spawn
const colors = require('colors')
const db = require('../persistence')

module.exports = function( options, cb){

  const write = spawn('ssh', [ last.host ,'-p',last.port, lastTouch] )

  write.on('close',function(error, data){
    if (error){
      console.log('Error writing to remote', error)
      cb(error)
    }
    else{
      console.log(colors.yellow('SSH TEST'),'Successful connection to', last.host);
      sshSuccess.push(last)
      if ( ( j + 1  >= remotesLength ) && (sshSuccess.length > 0) ) {
        db.put('lastSSHSuccess', JSON.stringify(sshSuccess), function (err) {
          if (err) debug('db problem with put: ', err)

          // db.close(function(err){
            debug('db get success. Closing down leveldb.')
            cb( null,  sshSuccess  )
          // })
        })
      }
    }
}
