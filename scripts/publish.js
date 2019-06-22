const program = require('commander')
program
  .version('1.0.0')
  .option('-p, --pull-request', 'publish as pull request')
  .parse(process.argv)
const { pullRequest: isPullRequest } = program
const fs = require('fs')
const path = require('path')
const throttle = require('lodash.throttle')
const fetch = require('isomorphic-fetch')
const Dropbox = require('dropbox').Dropbox
const BUILD_DIR = './_build'
const { POCKET_DROP_BOX_TOKEN, PROJECT, CI } = process.env
const { version: VERSION } = JSON.parse(
  fs.readFileSync(BUILD_DIR + '/chrome/manifest.json')
)
const folder = PROJECT
const subFolder = isPullRequest ? `${folder}/pull-requests` : `${folder}/stable`
const dbxRootPath = `/ci-releases/${subFolder}`
if(!CI && !POCKET_DROP_BOX_TOKEN) {
  console.log('Cannot authenticate to publish to dropbox')
  console.log('You need to set the env var POCKET_DROP_BOX_TOKEN with a dropbox auth token: https://www.dropbox.com/developers/apps')
  process.exit(0)
}
const dbx = new Dropbox({
  accessToken: POCKET_DROP_BOX_TOKEN,
  fetch: fetch
})
const browserDirs = fs.readdirSync(BUILD_DIR)
const uploadFileThrottled = throttle(uploadFile, 1000)
browserDirs.forEach(browserName => {
  const dirPath = path.join(BUILD_DIR, browserName)
  const isDirectory = fs.statSync(dirPath).isDirectory()
  let fileName = VERSION
  if (isPullRequest) {
    fileName = `pull-request-${VERSION}`
  }
  if (isDirectory) {
    uploadFileThrottled({
      savePath: `${dbxRootPath}/${browserName}/${fileName}.zip`,
      contents: getZip({ dirPath })
    })
  }
})
function getZip({ dirPath }) {
  return fs.readFileSync(path.join(dirPath, 'manifest.json'))
}
function uploadFile({ savePath, contents }) {
  dbx
    .filesUpload({
      path: savePath,
      contents,
      autorename: true,
      strict_conflict: false,
      mute: false,
      mode: 'overwrite'
    })
    .then(function(response) {
      console.log(`Publish succesful to ${savePath}`)
      console.log(response)
    })
    .catch(function({ status, error: { error_summary } }) {
      // dropbox sdk uses error.error_summary for error messages
      console.log(`Unable to publish to ${savePath}`)
      console.log(`Dropbox Error: ${error_summary}`)
      console.log(`Dropbox Status: ${status}`)
      process.exit(1)
    })
}
