'use strict'

const IPpass = new RegExp('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$','i')
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

  const loginIDMessage = "["+ system + "] "+ "What is the " + colors.black("loginID") + " for your "+ system +" server? ";
  const intranetIPMessage = "["+ system + "] "+ "What is the " + colors.blue("intranetIP") + " for your "+ system +" server? ";
  const internetIPMessage = "["+ system + "] "+ "What is the " + colors.cyan("internetIP") + " for your "+ system +" server? ";
  const gitDirMessage = "["+ system + "] "+ "What is the Git Directory for your "+ system +" server? ";
  const gitWorkingDirMessage = "["+ system + "] "+ "What is the " + colors.yellow("working") + " Git Directory for your "+ system +" server? ";


  return [
    {
      type: "input",
      name: "loginID",
      message: loginIDMessage
    },
    {
      type: "input",
      name: "intranetIP",
      message: intranetIPMessage,
      validate: function (value) {
        if ( value.match(IPpass) ) {
          return true;
        }
        return 'Please enter a valid IP address';
      }    },
    {
      type: "input",
      name: "internetIP",
      message: internetIPMessage,
      validate: function (value) {
        if ( value.match(IPpass) ) {
          return true;
        }
        return 'Please enter a valid IP address';
      }
    },
    {
      type: "input",
      name: "gitDir",
      message: gitDirMessage,
      default: function () {
        return '/home/apps';
      }
    },
    {
      type: "input",
      name: "gitWorkingDir",
      message: gitWorkingDirMessage,
      default: function () {
        return '/var/www/html';
      }
    }
  ];
}
