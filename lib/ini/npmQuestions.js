'use strict'

const versionPass =  new RegExp('^(?:[0-9]{1,2}\.){2}[0-9]{1,2}$','i')
const path = require('path')
const fs = require('fs-extra')
const colors = require('colors/safe')

module.exports = function(system, settings){
  let legacySettings = {}
  fs.exists(path.join(settings.packageDir, '/settings.json'), function (exists) {
    if (exists) {
      legacySettings = require(path.join(settings.packageDir, '/settings.json'))
    }
  })

  system = ( system === 'PRODUCTION')? colors.red(system): colors.green(system)

  const nodeVersionMessage = "["+ system + "] "+ "What is the " + colors.cyan("node") + " version for your "+ system +" server? ";
  const npmVersionMessage = "["+ system + "] "+ "What is the " + colors.blue("npm") + " version for your "+ system +" server? ";


  return [
    {
      type: "input",
      name: "nodeVersion",
      message: nodeVersionMessage,
      validate: function (value) {
        if ( value.match(versionPass) ) {
          return true;
        }
        return 'Please enter a valid IP address';
      }
    },
    {
      type: "input",
      name: "npmVersion",
      message: npmVersionMessage,
      validate: function (value) {
        if ( value.match(versionPass) ) {
          return true;
        }
        return 'Please enter a valid IP address';
      }
    }
  ];
}
