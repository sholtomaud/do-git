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
  kgo
  // ('gitInit',function(done){
  //   debug('kgo task: git init')
  //   console.log( '---> Re-initializing local Git repository')
  //   let gitCL = spawn('git',['init'])
  //   gitCL.on('close', function (error, data) {
  //     done(error,data)
  //   })
  // })
  // ('data',['gitInit'],function(gitInit, done){
  ('data',function( done){
    debug('kgo task: get data')
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success.')
        done(err, JSON.parse(data))
    })
  })
  ('remote',['data'],function( data,done){
    debug('kgo task: add git remotes')
    let stageProdLength = 1;
    callGit(0, 'internet')
    function callGit(i, comms){

      let stageProd = data[ Math.floor(i/2) ]
      let remoteDestination =  `${stageProd.deploy}_${comms}`
      let userHost = `${stageProd.loginID}@${stageProd[comms]['ip']}`
      let port = stageProd[comms]['port']
      let projectName = settings.pack.name
      let projectDir = `/home/${stageProd.loginID}/apps/${settings.pack.name}`
      let pem = `~/.ssh/cloud.key`
      let SSH = 'ssh://' + userHost + ':'+ port + projectDir;

      let gitAddRemote = spawn('git', ['remote','add', remoteDestination, SSH] )

      gitAddRemote.on('close', function (error, data) {
        if (error && error != '128'){
           console.log('git set-url error',error)
        }
        else{
          console.log( '---> Git set-url remote ', remoteDestination)
        }

        if ( i + 1  > stageProdLength ) {
          debug('kgo task: add git done')
          done( null, null )
        }
        else{
            callGit( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
        }
      })
    }
  })
  ('testSSH',['remote'], function(remote,done){
    console.log( colors.yellow('SSH'), 'Testing ssh settings')
    testSSH(settings,function(error,success){
      done(error,success)
    })
  })
  ('bareGit',['testSSH'], function(remoteSetup,done){
    console.log( colors.blue('GIT'), 'Setting up bare git repo on ',remoteSetup.host)
    debug('remoteSetup',remoteSetup)

    console.log( colors.blue('GIT'), `git init --bare ${remoteSetup.projectDir}`)
    let bareRemoteGitInit = `git init --bare ${remoteSetup.projectDir}`

    let bareGitSSH = spawn('ssh',['-i',remoteSetup.i,remoteSetup.host,'-p',remoteSetup.port, bareRemoteGitInit])

    bareGitSSH.on('close', function(error, data){
      if (error) console.log('bare gitssh error',error);
      console.log( '---> Setting up post-receive hook')

      let text = `"#!/bin/bash\n\
while read oldrev newrev ref\n\
do\n\
    if [[ \\$ref =~ .*/master$ ]];\n\
    then\n\
        echo "Master ref received. Deploying master branch to production..."\n\
        WORKDIR=${remoteSetup.gitWorkTree}\n\
        git --work-tree=\\$WORKDIR --git-dir=${remoteSetup.projectDir} checkout -f\n\
        cd \\$WORKDIR && docker-compose up -d --build --force-recreate\n\
    else\n\
        echo "Ref \\$ref successfully received.  Doing nothing: only the master branch may be deployed on this server."\n\
    fi\n\
done"`

//***
// need to do a spawn chmod +x hooks/post-receive
//***
      let postReceiveFile = `${remoteSetup.projectDir}/hooks/post-receive`
      let echo = `echo ${text} > ${postReceiveFile} && chmod +x ${postReceiveFile}`
      debug('echo',echo)
      const hook = spawn('ssh', ['-i',remoteSetup.i,remoteSetup.host, '-p', remoteSetup.port, echo] )

      hook.on('close',function(error, data){
        if (!error){
          let chmod = `chmod +x hooks/post-receive`
          const chMod = spawn('ssh', ['-i',remoteSetup.i,remoteSetup.host, '-p', remoteSetup.port, chmod])
          chMod.on('close',function(error, data){
            debug('kgo task: create post-receive git hook for: ', remoteSetup.projectName )
            console.log( '---> Created post-receive git hook')
            done( null, remoteSetup )
          })
        }
        else{
          console.log(console.red('---> Problem in creating git hook'))
          done(error,'probs')
        }
      })
    })
  })
  ('mkdir',['bareGit','testSSH'],function(bareGit, remoteSetup, done){
    let rmDir = `rm -rf ${remoteSetup.gitWorkTree}`
    let mkDir = `mkdir  ${remoteSetup.gitWorkTree} -p`
    const rm = spawn('ssh', [remoteSetup.host, '-p', remoteSetup.port, rmDir])

    rm.on('close',function(error, data){
      if (error) console.log('Oops! Problem removing working Git directory', error)
      console.log( `---> Successful removal of Git working directory ${remoteSetup.gitWorkTree}`)
      const mk = spawn('ssh', ['-i',remoteSetup.i, remoteSetup.host, '-p', remoteSetup.port, mkDir])
      mk.on('close',function(error, data){
        if (error) console.log('Oops! Problem creating Git WOrking Dir', error)
        debug('kgo task: added Dockerfile')
        console.log( `---> Created directory ${remoteSetup.gitWorkTree}`)
        cb(error,'done')
      })
    })
  })
  (['*'], function(error,data){
      console.log( '--->  - errors', error, data)
      cb(error,data)
  })
}
