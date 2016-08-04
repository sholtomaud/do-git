'use strict'

const debug = require('debug')('stage')
const fs = require('fs-extra')
const json2md = require('json2md')
const spawn = require('child_process').spawn

const packageVersion = process.env.npm_package_version
const packageName = process.env.npm_package_name
const ASSETS = '/Users/chr/dev/' + packageName
const TARGET = '/usr/src'
const CONTAINER_NAME = packageName + '-' + packageVersion

function autoPort () {
  const info = spawn('docker', ['info'])
  // console.log(info)
    // info.stdout.pipe(grep.stdin)
    // var containers =
}

module.exports = function (config, action, program) {
  var devPort = program.devPort || autoPort()
  var containerPort = program.containerPort || '8080'
  var os = program.os || 'centos7'
  // var packg = package || require( __dirname + '/package.json')

  spawn('docker', ['stop', `${CONTAINER_NAME}`])
  spawn('docker', ['rm', `${CONTAINER_NAME}`])

  const runDocker = spawn('docker', [`${action}`, '-v', `${ASSETS}/${program.type}:${TARGET}/${program.type}`, '-p', `${devPort}:${containerPort}`, '--name', `${CONTAINER_NAME}`, '-t', `${program.type}/node${program.node}:test`])

  runDocker.stdout.on('data', (data) => {
    process.stdout.write(`${data}`)
  })

  runDocker.stderr.on('data', (data) => {
    process.stdout.write(`stderr: ${data}`)
  })

  runDocker.on('close', (code) => {
    console.log(`docu exited with code ${code}`)
  })
}
