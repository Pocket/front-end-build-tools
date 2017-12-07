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
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const YAML = require('yamljs')

const configDirectory = './configs/' + process.env.PROJECT
const config = require(configDirectory + '/production')
const paths = require(configDirectory + '/paths')

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const useYarn = fs.existsSync(paths.yarnLockFile)

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// Warn and crash if required files are missing
// if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
//   process.exit(1);
// }

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild)
  .then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild)
    // Merge with the public folder
    copyPublicFolder()
    // Copy the manifest file
    generateManifest()
    // Copy the _locales folder (for browser usage)
    copyLocalesFolder()
    // Start the webpack build
    return build(previousFileSizes)
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('\n⚠ Compiled with warnings.\n'))
        console.log(warnings.join('\n\n'))
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        )
      } else {
        console.log(chalk.green('\n✔ Compiled in a successfull way.\n'))
      }

      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      console.log()
    },
    err => {
      console.log(chalk.red('\n✘Failed to compile.\n'))
      console.log((err.message || err) + '\n')
      process.exit(1)
    }
  )

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('\n🚀 ...Creating an optimized production build...')

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
        previousFileSizes,
        warnings: messages.warnings
      })
    })
  })
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  })
}

function copyLocalesFolder() {
  fs.copySync(paths.appLocales, paths.appLocalesDest, {
    dereference: true,
    filter: file =>
      !(file.includes('strings.json') || file.includes('locales.js'))
  })
}

function generateManifest() {
  // Generate the manifest for a chrome extension
  const manifest = YAML.load(paths.appManifest)
  fs.writeFileSync(
    path.join(paths.appBuild, 'manifest.json'),
    JSON.stringify(manifest, null, 4)
  )
}
