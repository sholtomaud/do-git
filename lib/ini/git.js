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
    let stageProdLength = 1;
    let sshSuccess = {}

    callGit(0, 'internet')
    function callGit(i, comms){

      let stageProd = data[ Math.floor(i/2) ]
      console.log(stageProd)
      let remoteDestination =  `${stageProd.deploy}_${comms}`
      let userHost = `${stageProd.loginID}@${stageProd[comms]['ip']}`
      let port = stageProd[comms]['port']
      let project = `/home/${stageProd.loginID}/apps/${settings.pack.name}`

      let SSH = 'ssh://' + userHost + ':'+ port + project;

      let gitInit = `git init --bare ${project}`
      let gitPort = `-p`

      let gitIntranet = spawn('git', ['remote','add', remoteDestination, SSH],{ stdio: 'inherit' } )

      gitIntranet.on('close', function (error, data) {
        if (error) console.log(error)
        console.log(`testing ssh ${userHost}. Setting up a bare git repo`)

        // "git init --bare /mnt/foo/bar/my-project.git"
        let bareGitSSH = spawn('ssh',[userHost,'-p',port,gitInit],{ stdio: 'inherit' })

        bareGitSSH.on('close', function(error, data){

          if (error){
            console.log('bare gitssh error',error);
          }
          else{
            console.log('no error');
            sshSuccess.host = userHost
            sshSuccess.port = port
            sshSuccess.project = project
          }

          if ( i + 1  > stageProdLength ) {
            debug('kgo task: add git done, sshSuccess', sshSuccess )
            done( null, sshSuccess )
          }
          else{
              callGit( i+1 , ( (comms == 'internet')? 'intranet': 'internet' ) )
          }

        })
      })
    }
  })
  ('hooks',['remote'], function(remote, done){
    debug('hook file remote',remote)
    let text = `"#!/bin/bash\n\
while read oldrev newrev ref\n\
do\n\
    if [[ $ref =~ .*/master$ ]];\n\
    then\n\
        echo "Master ref received.  Deploying master branch to production..."\n\
        git --work-tree=/var/www/html --git-dir=/home/demo/proj checkout -f\n\
    else\n\
        echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."\n\
    fi\n\
done"`

    let echo = `echo ${text} > ${remote.project}/hooks/post-commit`
    debug('echo',echo)
    const hook = spawn('ssh', [remote.host, '-p', remote.port, echo],{ stdio: 'inherit' })

    hook.on('close',function(error, data){
        debug('hook file error',error)
        done(error,data)
    })
  })
  (['*','hooks'], cb )
}
