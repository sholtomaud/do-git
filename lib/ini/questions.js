const IPpass = '/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i'
const versionPass = '/^\d{1,2}\.\d{1,2}\.\d{1,2}$/i'

module.exports = [
  {
    type: "input",
    name: "productionLoginID",
    message: "[PROD] What is the loginID for your production server? "
  },
  {
    type: "input",
    name: "productionIntranetIP",
    message: "[PROD] What is the intranetIP for your production server? ",
    validate: function (value) {
      if ( value.match(IPpass) ) {
        return true;
      }
      return 'Please enter a valid IP address';
    }
  },
  {
    type: "input",
    name: "productionInternetIP",
    message: "[PROD] What is the internetIP for your production server? ",
    validate: function (value) {
      if ( value.match(IPpass) ) {
        return true;
      }
      return 'Please enter a valid IP address';
    }
  },
  {
    type: "input",
    name: "productionGitDir",
    message: "[PROD] What is the git dir for your production server? ",
    default: function () {
      return '/home/apps';
    }
  },
  {
    type: "input",
    name: "productionGitWorkingDir",
    message: "[PROD] What is the git *working* dir for your production server? ",
    default: function () {
      return '/var/www/html';
    }
  },
  {
    type: "input",
    name: "stagingLoginID",
    message: "[PROD] What is the loginID for your staging server? "
  },
  {
    type: "input",
    name: "stagingIntranetIP",
    message: "[PROD] What is the intranetIP for your staging server? ",
    validate: function (value) {
      if ( value.match(IPpass) ) {
        return true;
      }
      return 'Please enter a valid IP address';
    }
  },
  {
    type: "input",
    name: "stagingInternetIP",
    message: "[PROD] What is the internetIP for your staging server? ",
    validate: function (value) {
      if ( value.match(IPpass) ) {
        return true;
      }
      return 'Please enter a valid IP address';
    }
  },
  {
    type: "input",
    name: "stagingGitDir",
    message: "[PROD] What is the git dir for your staging server? ",
    default: function () {
      return '/home/apps';
    }
  },
  {
    type: "input",
    name: "stagingGitWorkingDir",
    message: "[PROD] What is the git *working* dir for your staging server? ",
    default: function () {
      return '/var/www/html';
    }
  },
  {
    type: "input",
    name: "nodeVersion",
    message: "[NODE] What version of node do you want? ",
    validate: function (value) {
      if ( value.match(versionPass) ) {
        return true;
      }
      return 'Please enter a valid NODE version';
    }
  },
  {
    type: "input",
    name: "npmVersion",
    message: "[NPM] What version of npm do you want? ",
    validate: function (value) {
      if ( value.match(versionPass) ) {
        return true;
      }
      return 'Please enter a valid NPM version';
    }
  }
];
