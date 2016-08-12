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
  ('lastSSHSuccess',['packg'],function(packg, done){
    debug('kgo task: get data')
    db.get('lastSSHSuccess', function (err, data) {
      if (err) return console.log('Ooops!', err)
        debug('db get success. Closing down leveldb.')
        let success = JSON.parse(data)
        done(err, success[settings.pack.name])
    })
  })
  ('dockerFile', ['packg','lastSSHSuccess'], function (packg, lastRemote, done) {
    debug('kgo task: write Dockerfile')
      let yml = `"FROM node:${lastRemote.nodeVersion}\n\n\
ENV HOME=/usr/src/apps/\n\
RUN mkdir -p \\$HOME\n\
WORKDIR \\$HOME\n\
COPY package.json \\$HOME\n\n\
RUN npm install \n\
COPY . \\$HOME\n\
EXPOSE 8080\n\
CMD [ \\"npm\\", \\"start\\" ]"`

// COPY package.json npm-shrinkwrap.json \\$HOME\n\n\
// RUN npm install --global npm@${lastRemote.npmVersion}\n\n\

      let echo = `echo  ${yml} > ${lastRemote.gitWorkTree}/Dockerfile`

      const dockerfile = spawn('ssh', [lastRemote.host, '-p', lastRemote.port, echo])
      dockerfile.on('close',function(error, data){
        if (error) console.log('Oops! Problem creagin Dockerfile', error)
        debug('kgo task: added Dockerfile')
        console.log( '---> created Dockerfile')
        done(error,'done')
      })
  })
  ('dockerComposeProd',['packg','dockerFile','lastSSHSuccess'], function(packg, dockerFile, lastRemote, done){
    debug('kgo task: write docker-compose.prod.yml')

      let composeYML = `"version: '2'\n\
services: \n\
  ${packg.name}: \n\
    build: "."\n\
    mem_limit: 128m\n\
    container_name: ${packg.name}\n\
    image: ${lastRemote.loginID}/${packg.name}\n\
    ports: \n\
      - 8080"`

      let echoyml = `echo  ${composeYML} > ${lastRemote.gitWorkTree}/docker-compose.yml`
      debug('echoyml',echoyml)

      const dockerCompose = spawn('ssh', [lastRemote.host, '-p', lastRemote.port, echoyml] )
      dockerCompose.on('close',function(error, data){
        if (error) console.log('Opps!. Problem creating Dockerfile', error)
        debug('kgo task: added Dockerfile')
        console.log( '---> created docker-compose.yml')
        done(error,'done')
      })
  })
  (['*'], cb )
}
