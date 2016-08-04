'use strict'

const fs = require('fs-extra')
const kgo = require('kgo')
const debug = require('debug')('docker setup')
const util = require('util')
const readline = require('readline');
const path = require('path')
const YAML = require('json2yaml')

process.stdin.setEncoding('utf8');

module.exports = function(config, action, program, configInit, cb){

  kgo('dockerFile', function (done) {
    debug('dockerFile')

    let yml = `FROM node:${configInit.nodeVersion}\n\n\
RUN useradd --user-group --create-home --shell /bin/false app &&\n\
  npm install --global npm@${configInit.npmVersion}\n\n\
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

    fs.writeFile( path.join(config.packageDir, '/Dockerfile'), yml, function (err) {
      done(err,'done')
    });

  })('dockerComposeProd',['dockerFile'], function(dockerFile,done){
    debug('dockerComposeProd')

    let composeYML = `${pack.name}:\n\
  build: .\n\
    environment:\n\
      NODE_ENV: production\n\
    ports:\n\
      - ['3000:3000']`

    fs.writeFile( path.join(config.packageDir, '/docker-compose.prod.yml'), composeYML, function (err) {
      done(err,'done')
    });

  })
  // ('dockerComposeStaging',['dockerComposeProd'], function(dockerComposeProd,done){
  //   debug('dockerComposeStaging')
  //
  //
  // })
  // ('port',['ip'], function(ip,done){
  //   debug('loginID')
  //   rl.question('What is the port of your server? ', (answer) => {
  //     done(null,answer)
  //   })
  // })
  // ('write',['serverType','loginID','ip','port'], function(serverType,loginID, ip, port, done){
  //   debug('write',serverType,loginID)
  //   let configFile = path.join(config.packageDir, '/config.json')
  //   let data = {}
  //   data[serverType] = {}
  //   data[serverType]['loginID'] = loginID
  //   data[serverType]['ip'] = ip
  //   data[serverType]['port'] = port
  //
  //   var writeStream = fs.createWriteStream(configFile);
  //   writeStream.write(JSON.stringify(data));
  //   writeStream.on('error', function (err) {
  //     debug('error in writing to file',err)
  //     done(err)
  //   });
  //   writeStream.end(function(){
  //     done(null,'done')
  //   });
  // })
  (['*','dockerFile'],cb)

}
