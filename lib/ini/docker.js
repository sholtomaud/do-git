'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('docker setup')
const util = require('util')
const path = require('path')
const level = require('level')


module.exports = function(settings, cb){
  const db = level(settings._dbdir)

  kgo('pack', function (done) {
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
  ('data',['pack'],function(pack, done){
    debug('kgo task: get data')
    db.get(settings.pack.name, function (err, data) {
      if (err) return console.log('Ooops!', err)

      db.close(function(err){
        debug('db get success. Closing down leveldb.')
        done(err, JSON.parse(data))
      })
    })
  })
  ('dockerFile', ['data','pack'], function (data, pack, done) {
    debug('kgo task: write Dockerfile')
    let archiveLength = data.length -1;

    writeDockerfile(0, 'internet')
    function writeDockerfile(i, comms){
      debug('kgo task: writeDockerfile ', i , 'length ',archiveLength, 'node version', data[i]['nodeVersion'] )

      let yml = `FROM node:${data[i]['nodeVersion']}\n\n\
RUN useradd --user-group --create-home --shell /bin/false app &&\n\
  npm install --global npm@${data[i]['npmVersion']}\n\n\
ENV HOME=/home/apps/\n\
COPY package.json npm-shrinkwrap.json $HOME/${pack.name}/\n\n\
RUN chown -R app:app $HOME/\*\n\n\
USER app\n\
WORKDIR $HOME/${pack.name}\n\
RUN npm install\n\n\
USER root\n\
COPY . $HOME/${pack.name}\n\
RUN chown -R app:app $HOME/\*\n\
USER app\n\n\
CMD ["node", "index.js"]`

let dockerfile = '/Dockerfile.' + data[i]['deploy']

      fs.writeFile( path.join(settings.packageDir, dockerfile ), yml, function (err) {
        if ( i + 1  > archiveLength ) {
          debug('kgo task: add git done')
          done(err,'done')
        }
        else{
            writeDockerfile( i+1 )
        }
      });
    }
  })
  ('dockerComposeProd',['data','pack','dockerFile'], function(data, pack, dockerFile,done){
    debug('kgo task: write docker-compose.prod.yml')

    let archiveLength = data.length -1;
    writeDockerComposeFile(0)

    function writeDockerComposeFile(i, comms){

    let composeYML = `${pack.name}:\n\
  build: .\n\
    environment:\n\
      NODE_ENV: ${data[i]['deploy']}\n\
    ports:\n\
      - ['3000:3000']`

      fs.writeFile( path.join(settings.packageDir, '/docker-compose.'+data[i]['deploy']+'.yml'), composeYML, function (err) {

        if ( i + 1  > archiveLength ) {
          debug('kgo task: add git done')
          done(err,'done')
        }
        else{
            writeDockerComposeFile( i+1 )
        }
      });
    }
  })
  (['*','dockerFile'], cb )
}
