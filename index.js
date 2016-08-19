#!/usr/bin/env node --harmony
'use strict'

const fs = require('fs-extra')
const debug = require('debug')('program')
const program = require('commander')
const path = require('path')
const packageDir = process.cwd()
const lib = require('./lib')

let settings = {}
settings.packageDir = packageDir
settings._dogitdir = __dirname
settings.spawnStdio = process.env.DEBUG

fs.exists(path.join(packageDir, '/package.json'), function (exists) {
  if (exists) settings.pack = require(path.join(packageDir, '/package.json'))
  // let name = settings.pack.name;
  // let camelName = name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
  // settings.pack.name = camelName;
})

program
  .arguments('<action>')
  .option('--config <config>', 'config.json file')
  .option('--feature <feature>', 'git branch used for the development of a feature.')
  .action(function (action) {
    settings._action = action
    settings._program = program
    switch (action.trim()) {
      case 'setup': lib.setup(settings)
        break
      case 'deploy': lib.deploy(settings)
        break
      case 'stage': lib.stage(settings)
        break
      case 'clean': lib.clean()
        break
      default: lib.git(settings)
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
