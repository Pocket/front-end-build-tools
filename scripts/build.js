// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const YAML = require('yamljs')
const utilities = require('./common/utilities')

const configDirectory = './configs/' + process.env.PROJECT
const config = require(configDirectory + '/production')
const paths = require(configDirectory + '/paths')

const useYarn = fs.existsSync(paths.yarnLockFile)

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
build().then(
  ({ stats, warnings }) => {
    if (warnings.length) {
      console.log(chalk.yellow('\n⚠ ... Compiled with warnings.\n'))
      console.log(warnings.join('\n\n'))
      console.log(
        'To ignore, add ' +
          chalk.cyan('// eslint-disable-next-line') +
          ' to the line before.\n'
      )
      console.log(chalk.red('... Canceling Deployment.'))
      process.exit(1)
    } else {
      console.log(chalk.green('✔ ... Compiled succesfully.'))
      deploy()
    }
  },
  err => {
    console.log(chalk.red('x ... Failed to compile.\n'))
    console.log((err.message || err) + '\n')
    process.exit(1)
  }
)

// Create the production build and print the deployment instructions.
function build() {
  console.log('\n🚜 ... Creating an optimized production build.')

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuildDefault)

  utilities.copyPublicFolder(paths)
  utilities.copyLocalesFolder(paths)

  let compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const messages = formatWebpackMessages(stats.toJson({}, true))
      if (messages.errors.length) {
        return reject(new Error(messages.errors.join('\n\n')))
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        )
        return reject(new Error(messages.warnings.join('\n\n')))
      }
      return resolve({
        stats,
        warnings: messages.warnings
      })
    })
  })
}

// Copy
function deploy() {
  console.log('🚀 ... Begin Deployment.')

  const keys = utilities.getKeys(paths)
  const manifest = YAML.load(paths.appManifest)

  Object.keys(keys).map(key => {
    fs.copySync(paths.appBuildDefault, path.join(paths.appBuild, key), {
      dereference: true
    })

    fs.outputFile(
      path.join(paths.appBuild, `${key}/js/key.js`),
      `const CONSUMER_KEY = '${keys[key]}'`
    )

    manifest.description = utilities.descriptionKey[key]

    fs.writeFileSync(
      path.join(paths.appBuild, `${key}/manifest.json`),
      JSON.stringify(manifest, null, 4)
    )

    console.log(`🎯 ... ${key} built.`)
  })

  console.log('🕸 ... Cleaning Up.')

  fs.remove(paths.appBuildDefault, err => {
    if (err) return console.error(err)

    console.log('👍 ... Deployment Complete.')
  })
}
