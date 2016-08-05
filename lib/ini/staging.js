'use strict'

const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const colors = require('colors/safe')

const versionPass =  new RegExp('^(?:[0-9]{1,2}\.){2}[0-9]{1,2}$','i')
const IPpass = new RegExp('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$','i')

const messages = {
  loginID : colors.gray("[STAGING] ") + colors.gray("loginID") + ": ",
  intranet : colors.gray("[STAGING] ") + colors.magenta("intranetIP") + ": ",
  internet : colors.gray("[STAGING] ") + colors.cyan("internetIP") + ": "
}

module.exports = function(settings){
  let legacySettings = {}
  fs.exists(path.join(settings.packageDir, '/settings.json'), function (exists) {
    if (exists) {
      legacySettings = require(path.join(settings.packageDir, '/settings.json'))
    }
  })

  return [
    {
      type: "input",
      name: "loginID",
      message: messages.loginID
    },
    {
      type: "input",
      name: "intranetIP",
      message: messages.intranetIP,
      validate: function (value) {
        if ( value.match(IPpass) ) {
          return true;
        }
        return 'Please enter a valid IP address';
      }
    },
    {
      type: "input",
      name: "internetIP",
      message: messages.internetIP,
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
      message: messages.gitDir,
      default: function () {
        return '/home/apps';
      }
    },
    {
      type: "input",
      name: "gitWorkingDir",
      message: messages.gitWorkingDir,
      default: function () {
        return '/var/www/html';
      }
    }
  ];
}
