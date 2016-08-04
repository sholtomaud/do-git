'use strict'

const debug = require('debug')('deploy')
const spawn = require('child_process').spawn

module.exports = function (config, action, program) {
  let gitOptions = ['push',`${action}`,'release']
  const deploy = spawn('git',gitOptions)

  deploy.stdout.on('data', (data) => {
    process.stdout.write(`${data}`)
  })
  deploy.stderr.on('data', (data) => {
    process.stdout.write(`stderr: ${data}`)
  })
  deploy.on('close', (code) => {
    console.log(`docu exited with code ${code}`)
    return code
  })
}

//git tag
//git push deploy release
//to production yaml.
//docker compose
//npm shrinkwrap
// 
