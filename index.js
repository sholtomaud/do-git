#!/usr/bin/env node --harmony
'use strict'

const fs = require('fs-extra')
const debug = require('debug')('program')
// const config = require('./config')
const program = require('commander')
const path = require('path')
const packageDir = process.cwd()
const lib = require('./lib')
var conf = {}

conf.packageDir = packageDir
conf._dogitdir = __dirname

fs.exists(path.join(packageDir, '/package.json'), function (exists) {
  if (exists) conf.pack = require(path.join(packageDir, '/package.json'))
})

program
  .arguments('<action>')
  .option('--config <config>', 'config.json file')
  .option('--feature <feature>', 'git branch used for the development of a feature.')
  .action(function (action) {
    debug('action: ',action)
    debug('feature: ',program.feature)
    debug('config: ',program.config)
    debug('package: ',conf.pack)
    debug('packageDir: ',conf.packageDir)
    switch (action.trim()) {
      case 'init': lib.init(conf, action, program)
        break
      case 'deploy': lib.deploy(conf, action, program)
        break
      case 'stage': lib.stage(conf, action, program)
        break
      case 'clean': lib.clean()
        break
      default:
    }
  })

program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ dogit init');
  console.log('        - setsup the package.json and config.json files for your project');
  console.log('');
  console.log('    $ dogit deploy -c customConfigFile.json');
  console.log('        - pushes the project to your deployment server');
  console.log('');
  console.log('    $ dogit stage -f customConfigFile.json');
  console.log('        - pushes the project to your staging server');
  console.log('');
  console.log('    $ dogit -h');
  console.log('');
});

program.parse(process.argv);
