'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('git setup')
const util = require('util')
const spawn = require('child_process').spawn
const level = require('level')
const levelup = require('levelup')

// ########
// Inspiration from : Justin Ellingwood
// https://twitter.com/jmellingwood
//
// Ref:
// https://www.digitalocean.com/community/tutorials/how-to-use-git-hooks-to-automate-development-and-deployment-tasks
//
// #!/bin/bash
// while read oldrev newrev ref
// do
//     if [[ $ref =~ .*/master$ ]];
//     then
//         echo "Master ref received.  Deploying master branch to production..."
//         git --work-tree=/var/www/html --git-dir=/home/demo/proj checkout -f
//     else
//         echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
//     fi
// done
//
// #######

module.exports = function(settings, cb){
  const db = level(settings._dbdir)

  kgo('gitInit',function(done){
    debug('kgo task: git init')
    let gitCL = spawn('git',['init'], { stdio: 'inherit' })
    gitCL.on('close', function (error, data) {
      done(error,data)
    })
  })
  ('data',['gitInit'],function(gitInit, done){
    debug('kgo task: get data')
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)

      db.close(function(err){
        debug('db get success. Closing down leveldb.')
        done(err, JSON.parse(data))
      })
    })
  })
  ('remote',['gitInit','data'],function(gitInit,data,done){
    debug('kgo task: add git remotes')
    let stageProdLength = 3;

    callGit(0, 'internet')
    function callGit(i, comms){
      debug('kgo task: add git remotes number ', i , 'length ',stageProdLength )

      let stageProd = data[ Math.floor(i/2) ]
      let remoteDestination =  stageProd.deploy + "_" + comms

      let SSH = 'ssh://' + stageProd.loginID + '@' + stageProd[comms]['ip'] + ':'+ stageProd[comms]['port'] + '/home/' + stageProd.loginID + '/dev/' + settings.pack.name;

      let gitIntranet = spawn('git',['remote','add', remoteDestination, SSH])

      gitIntranet.on('close', function (error, data) {
        if (error) console.log(error)

        if ( i + 1  > stageProdLength ) {
          debug('kgo task: add git done')
          done( null, data )
        }
        else{
            callGit( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
        }
      })
    }
  })
  (['*','remote'], cb )
}
