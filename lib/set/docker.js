'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('docker setup')
const util = require('util')
const path = require('path')
const db = require('../persistence')
const colors = require('colors')
const spawn = require('child_process').spawn

module.exports = function(settings, cb){
  kgo('packg', function (done) {
    debug('kgo task: get package.json')
    fs.exists(path.join(settings.packageDir, '/package.json'), function (exists) {
      if (exists){
        done(null, require( path.join(settings.packageDir, '/package.json') ))
      }
      else{
        done('package file does not exist. Please check for package.json and restart. exiting.' )
      }
    })
  })
  ('data',['packg'],function(packg, done){
    debug('kgo task: get data')
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success. Closing down leveldb.')
        done(err, JSON.parse(data))
    })
  })
  ('lastSSHSuccess',['data'],function(packg, done){
    debug('kgo task: get data')
    db.get('lastSSHSuccess', function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success. Closing down leveldb.')
        done(err, JSON.parse(data))
    })
  })
  ('dockerFile', ['data','packg','lastSSHSuccess'], function (dat, packg, lastSSHSuccess, done) {
    debug('kgo task: write Dockerfile')
    let archiveLength = dat.length -1;
    writeDockerfile(0)

    function writeDockerfile(i){
      let data = dat[i]
      let remoteSetup = lastSSHSuccess[0]
      debug('kgo task: writeDockerfile ', i , 'length ',archiveLength, 'node version', data.nodeVersion )

      let yml = `"FROM node:${data.nodeVersion}\n\n\
RUN useradd --user-group --create-home --shell /bin/false app &&\n\
  npm install --global npm@${data.npmVersion}\n\n\
ENV HOME=/home/${data.loginID}/apps/\n\
COPY package.json npm-shrinkwrap.json $HOME/${packg.name}/\n\n\
RUN chown -R app:app $HOME/\*\n\n\
USER app\n\
WORKDIR $HOME/${packg.name}\n\
RUN npm install\n\n\
USER root\n\
COPY . $HOME/${packg.name}\n\
RUN chown -R app:app $HOME/\*\n\
USER app\n\n\
CMD ['node', 'index.js']"`

      let echo = `echo  ${yml} > /home/${data.loginID}/apps/${packg.name}/Dockerfile`
      debug('echo',echo)

      const dockerfile = spawn('ssh', [remoteSetup.host, '-p', remoteSetup.port, echo] )
      dockerfile.on('close',function(error, data){
        if ( i + 1  > archiveLength ) {
          debug('kgo task: added Dockerfile')
          console.log( colors.cyan('DOCKER'), ' - done')
          done(error,'done')
        }
        else{
            writeDockerfile( i+1 )
        }
      })
    }
  })
  ('dockerComposeProd',['data','packg','dockerFile','lastSSHSuccess'], function(dat, packg, dockerFile, lastSSHSuccess,done){
    debug('kgo task: write docker-compose.prod.yml')

    let archiveLength = dat.length -1;
    writeDockerComposeFile(0)

    function writeDockerComposeFile(i, comms){
      let remoteSetup = lastSSHSuccess[0]
      let data = dat[i]
      let composeYML = `"${packg.name}:\n\
  build: .\n\
    environment:\n\
      NODE_ENV: ${data.deploy}\n\
    ports:\n\
      - ['3000:3000']"`

      let echoyml = `echo  ${composeYML} > /home/${data.loginID}/apps/${packg.name}/docker-compose.yml`
      debug('echoyml',echoyml)
      console.log('echoyml',echoyml)
      const dockerCompose = spawn('ssh', [remoteSetup.host, '-p', remoteSetup.port, echoyml] )
      dockerCompose.on('close',function(error, data){
        if ( i + 1  > archiveLength ) {
          debug('kgo task: added Dockerfile')
          console.log( colors.cyan('DOCKER'), ' - done docker-compose')
          done(error,'done')
        }
        else{
                writeDockerComposeFile( i+1 )
        }
      })
    }
  })
  (['*'], cb )
}
