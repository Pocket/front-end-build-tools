#!/usr/bin/env node
'use strict'

const spawn = require('cross-spawn')
const chalk = require('chalk')

const args = process.argv.slice(2)

const projectIndex = args.findIndex(
  x => x === 'save-to-pocket' || x === 'pocket-new-tab'
)

if (projectIndex === -1) {
  console.log(chalk.red('\nOops! Incorrect Project Specified'))
  console.log(chalk.green('\nValid options are:'))
  console.log(chalk.cyan('1) save-to-pocket'))
  console.log(chalk.blue('2) pocket-new-tab'))
  process.exit(1)
}

const project = args[projectIndex]
process.env.PROJECT = project

const scriptIndex = args.findIndex(
  x => x.match(/build|start|test|publish/)
)

const script = scriptIndex === -1 ? args[0] : args[scriptIndex]
const nodeArgs = scriptIndex > 0 ? args.slice(0, projectIndex) : []

switch (script) {
  case 'publish':
  case 'build':
  case 'start':
  case 'test': {
    const result = spawn.sync(
      'node',
      nodeArgs
        .concat(require.resolve('../scripts/' + script))
        .concat(args.slice(scriptIndex + 1)),
      { stdio: 'inherit' }
    )
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        )
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        )
      }
      process.exit(1)
    }
    process.exit(result.status)
    break
  }
  default: {
    console.log(chalk.red('\nOops! Unknown script "' + script + '".'))
    console.log(chalk.green('\nValid options are:'))
    console.log(chalk.cyan('1) start (development)'))
    console.log(chalk.blue('2) test (testing)'))
    console.log(chalk.magenta('3) build (production)'))
    break
  }
}
