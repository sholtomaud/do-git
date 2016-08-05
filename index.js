#!/usr/bin/env node --harmony
'use strict'

const fs = require('fs-extra')
const debug = require('debug')('program')
const program = require('commander')
const path = require('path')

const db = require('./persistance')
const lib = require('./lib')

const packageDir = process.cwd()

let settings = {}

settings.packageDir = packageDir
settings._dogitdir = __dirname

fs.exists(path.join(packageDir, '/package.json'), function (exists) {
  if (exists) settings.pack = require(path.join(packageDir, '/package.json'))
})

program
  .arguments('<action>')
  .option('--config <config>', 'config.json file')
  .option('--feature <feature>', 'git branch used for the development of a feature.')
  .action(function (action) {
    debug('action: ', action)
    debug('feature: ',program.feature)
    debug('config: ',program.config)
    debug('package: ',settings.pack)
    debug('packageDir: ',settings.packageDir)
    settings._action = action
    settings._program = program
    // settings.db = db
    switch (action.trim()) {
      case 'init': lib.init(settings)
        break
      case 'deploy': lib.deploy(settings)
        break
      case 'stage': lib.stage(settings)
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
