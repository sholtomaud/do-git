'use strict'

const spawn = require('child_process').spawn
const kgo = require('kgo')
const json2md = require('json2md')
const debug = require('debug')('npm setup')
const fs = require('fs-extra')
const path = require('path')
const colors = require('colors')

module.exports = function(settings, cb){

  kgo('npm', function (done) {
    let npmCL = spawn('npm', ['init'], { stdio: 'inherit' })
    npmCL.on('close', function (error, data) {
      done(error,data)
    })
  })
  ('pack', ['npm'], function (npm, done) {
    debug('Creating Markdown')
    console.log( '---> Writing README.md from package.json')
    var pack = require( path.join(settings.packageDir, '/package.json') )
    done(null,pack)
  })
  ('write', ['pack'], function (pack, done) {
    var mdob = [
      { h1: pack.name },
      { blockquote: pack.description },
      { h1: 'Authors'},
      { ul: [pack.author]}
    ]
    debug('Writing Markdown to README.md')
    fs.writeFile('README.md',  json2md(mdob), function (error) {
      if (error) done(error)
      console.log( '---> done')
      cb(null,pack)
    })
  })
  (['*','write'],cb)
}
