'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('git setup')
const util = require('util')
const spawn = require('child_process').spawn
const db = require('../persistence')
const levelup = require('levelup')
const colors = require('colors/safe')
const testSSH = require('../testSSH.js')

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
  kgo('gitInit',function(done){
    debug('kgo task: git init')
    console.log( colors.blue('GIT'), 'Re-initializing local Git repository')
    let gitCL = spawn('git',['init'])
    gitCL.on('close', function (error, data) {
      done(error,data)
    })
  })
  ('data',['gitInit'],function(gitInit, done){
    debug('kgo task: get data')
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success. Closing down leveldb.')
        done(err, JSON.parse(data))
    })
  })
  ('remote',['gitInit','data'],function(gitInit,data,done){
    debug('kgo task: add git remotes')
    let stageProdLength = 1;
    let remotes = []

    callGit(0, 'internet')
    function callGit(i, comms){

      let stageProd = data[ Math.floor(i/2) ]
      // console.log(stageProd)
      let remoteDestination =  `${stageProd.deploy}_${comms}`
      let userHost = `${stageProd.loginID}@${stageProd[comms]['ip']}`
      let port = stageProd[comms]['port']
      let projectName = settings.pack.name
      let projectDir = `/home/${stageProd.loginID}/apps/${settings.pack.name}`

      let SSH = 'ssh://' + userHost + ':'+ port + projectDir;

      let gitAddRemote = spawn('git', ['remote','set-url', remoteDestination, SSH] )

      console.log( colors.blue('GIT'), 'Git set-url remote ', remoteDestination)

      gitAddRemote.on('close', function (error, data) {
        if (error && error != '128') console.log('git set-url error',error)
        let ssh = {}
        ssh.loginID = stageProd.loginID
        ssh.host = userHost
        ssh.port = port
        ssh.projectDir = projectDir
        ssh.projectName = projectName
        remotes.push(ssh)

        if ( i + 1  > stageProdLength ) {
          debug('kgo task: add git done', remotes )
          done( null, remotes )
        }
        else{
            callGit( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
        }
      })
    }
  })
  ('testSSH',['remote'], function(remotes,done){
    console.log( colors.yellow('SSH'), 'Testing ssh settings')
    testSSH(settings, remotes,function(error,success){
      done(error,success)
    })
  })
  ('bareGit',['testSSH'], function(successRemotes,done){
    let remoteLength = successRemotes.length - 1;

    debug('successRemotes',successRemotes, 'remoteLength', remoteLength)
    callBareGit(0, 'internet')

    function callBareGit(i){
      let remoteSetup = successRemotes[i]
      console.log( colors.blue('GIT'), ' setting up bare git repo on ',remoteSetup.host)
      debug('remoteSetup',remoteSetup)
      let bareRemoteGitInit = `git init --bare ${remoteSetup.projectDir}`

      let bareGitSSH = spawn('ssh',[remoteSetup.host,'-p',remoteSetup.port, bareRemoteGitInit])

      bareGitSSH.on('close', function(error, data){
        if (error) console.log('bare gitssh error',error);
        console.log( colors.blue('GIT'), ' setting up post-commit hook')

        let text = `"#!/bin/bash\n\
while read oldrev newrev ref\n\
do\n\
    if [[ \\$ref =~ .*/master$ ]];\n\
    then\n\
        echo "Master ref received.  Deploying master branch to production..."\n\
        git --work-tree=/var/www/html --git-dir=${remoteSetup.projectDir} checkout -f\n\
    else\n\
        echo "Ref \\$ref successfully received.  Doing nothing: only the master branch may be deployed on this server."\n\
    fi\n\
done"`

        let echo = `echo ${text} > ${remoteSetup.projectDir}/hooks/post-commit`
        debug('echo',echo)
        const hook = spawn('ssh', [remoteSetup.host, '-p', remoteSetup.port, echo] )

        hook.on('close',function(error, data){
          if ( i + 1  > remoteLength ) {
            debug('kgo task: add git bare remote, created bare git for: ', remoteSetup.projectName )
            console.log( colors.blue('GIT'), ' - done')
            cb( null, successRemotes )
          }
          else{
            callBareGit( i+1 )
          }
        })
      })
    }
  })
  (['*'], function(error,data){
      console.log( colors.blue('GIT'), ' - errors', error, data)
      cb(error,data)
  })
}
