'use strict'

const path = require('path')
const fs = require('fs-extra')
const colors = require('colors/safe')
const debug = require('debug')('system questions')
const IPpass = new RegExp('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$','i')
const versionPass =  new RegExp('^(?:[0-9]{1,2}\.){2}[0-9]{1,2}$','i')

module.exports = function(data){

  let systemMsg = ( data['deploy'] === 'production')? colors.red(data['deploy']): colors.blue(data['deploy']) ;
  // let commsMsg = ( data['comms'] === 'intranet')? colors.green(data['comms']): colors.blue(data['comms']) ;

  let defaultLoginID = ( data.loginID )? data.loginID : null;
  let defaultIntranetIP = ( data.intranet.ip )? data.intranet.ip : null;
  let defaultIntranetPort = ( data.intranet.port )? data.intranet.port : null;
  let defaultInternetIP = ( data.internet.ip )? data.internet.ip : null;
  let defaultInternetPort = ( data.internet.port )? data.internet.port : null;
  let defaultNPMVersion = ( data.npmVersion )? data.npmVersion : null;
  let defaultNodeVersion = ( data.nodeVersion )? data.nodeVersion : null;
  let defaultGitDir = ( data.gitDir )? data.gitDir : null;
  let defaultGitWorkTree = ( data.gitWorkTree )? data.gitWorkTree : null;

  let loginIDMessage = "["+ systemMsg + "] "+ " What is the login ID for your "+ data['deploy'] + " server? ";

  let intranetIPMessage = "["+ systemMsg + "] "+ " What is the " + colors.cyan("intranet") + " IP for your "+ data['deploy'] +" server? ";
  let intranetPortMessage = "["+ systemMsg + "] "+ " What is the " + colors.cyan("intranet") + " PORT for your "+ data['deploy'] +" server? ";

  let internetIPMessage = "["+ systemMsg + "] "+ " What is the " + colors.blue("internet") + " IP for your "+ data['deploy'] +" server? ";
  let internetPortMessage = "["+ systemMsg + "] "+ " What is the " + colors.blue("internet") + " PORT for your "+ data['deploy'] +" server? ";

  let nodeVersionMessage = "["+ systemMsg + "] "+ " What is the " + colors.green("node") + " version for your "+ data['deploy'] +" server? ";
  let npmVersionMessage = "["+ systemMsg + "] "+ " What is the " + colors.red("npm") + " version for your "+ data['deploy'] +" server? ";

  let gitDirMessage = "["+ systemMsg + "] What is the main Git Directory? ";
  let gitWorkTreeMessage = "["+ systemMsg + "] What is the " + colors.yellow("working") + " Git Directory? ";

  return [
    {
      type: "input",
      name: "loginID",
      message: loginIDMessage,
      default: defaultLoginID
    },
    {
      type: "input",
      name: "internetIp",
      message: internetIPMessage,
      default: defaultInternetIP,
      validate: function (value) {
        if ( value.match(IPpass) ) {
          return true;
        }
        return 'Please enter a valid IP';
      }
    },
    {
      type: "input",
      name: "internetPort",
      message: internetPortMessage,
      default: defaultInternetPort
    },
    {
      type: "input",
      name: "intranetIp",
      message: intranetIPMessage,
      default: defaultIntranetIP,
      validate: function (value) {
        if ( value.match(IPpass) ) {
          return true;
        }
        return 'Please enter a valid IP';
      }
    },
    {
      type: "input",
      name: "intranetPort",
      message: intranetPortMessage,
      default: defaultIntranetPort
    },
    {
      type: "input",
      name: "nodeVersion",
      message: nodeVersionMessage,
      default: defaultNodeVersion,
      validate: function (value) {
        if ( value.match(versionPass) ) {
          return true;
        }
        return 'Please enter a valid NODE version following semver guidelines';
      }
    },
    {
      type: "input",
      name: "npmVersion",
      message: npmVersionMessage,
      default: defaultNPMVersion,
      validate: function (value) {
        if ( value.match(versionPass) ) {
          return true;
        }
        return 'Please enter a valid NPM version following semver guidelines';
      }
    },
    {
      type: "input",
      name: "gitDir",
      message: gitDirMessage,
      default: defaultGitDir
    },
    {
      type: "input",
      name: "gitWorkTree",
      message: gitWorkTreeMessage,
      default: defaultGitWorkTree
    }
  ];
}
