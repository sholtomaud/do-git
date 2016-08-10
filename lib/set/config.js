'use strict'

const fs = require('fs-extra')
const debug = require('debug')('config setup')
const path = require('path')
const inquirer = require('inquirer')
const kgo = require('kgo')
const colors = require('colors')
const db = require('../persistence')

module.exports = function(settings, npmInit, cb){
  const systemQuestions = require(  path.join(settings._dogitdir,'/lib/set/systemQuestions.js') )

  kgo('archive',function(done){
    debug('task: get archive')
    db.get(settings.pack.name, function ( err, archive ) {
      if (err || !archive ){
        debug('error reading from archive using defaults, ', (err || '') )
        done(null, require( path.join(settings._dogitdir,'/lib/set/defaults.json') ) )
      }
      else{
        debug('success reading from archive' )
        done(null, JSON.parse(archive) )
      }
    })
  })
  ('systemQuestions',['archive'],function( archive, done ){
    debug('task: get CL input')
    console.log( colors.green('CONFIG'), ' setting up comms')
    let archiveLength = archive.length -1;
    let data = []
    callInquirer(0)

    function callInquirer(i){
      debug('length',archiveLength,' i ',i)

      inquirer.prompt(
        systemQuestions(archive[i])
      ).then(function (answers) {
        answers.deploy = archive[i].deploy
        answers.comms = archive[i].comms
        let internet = {}
        let intranet = {}
        internet.ip = answers.internetIp
        internet.port = answers.internetPort
        intranet.ip = answers.intranetIp
        intranet.port = answers.intranetPort

        answers.internet = internet
        answers.intranet = intranet

        delete answers.internetIp
        delete answers.internetPort
        delete answers.intranetIp
        delete answers.intranetPort

        data.push(answers)

        if ( i + 1 > archiveLength ) {
          done( null, data )
        }
        else{
          callInquirer( i+1 )
        }
      })
    }
  })
  ('put',['systemQuestions'],function(data, done){
    debug('task: put data ')

    db.put(settings.pack.name, JSON.stringify(data), function (err) {
      if (err) debug('db problem with put: ', err)
        debug('db put success. Closing down leveldb.')
        console.log( colors.green('CONFIG'), '- done' )
        done(err, data)
    })
  })
  (['*','put'],function(error,data){
      cb(error,data)
  })

}
