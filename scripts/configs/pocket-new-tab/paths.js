// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
    dotenv:         resolveApp('.env'),
    appPath:        resolveApp('.'),
    appBuild:       resolveApp('_build'),
    appPublic:      resolveApp('public'),
    appHtml:        resolveApp('public/index.html'),
    appIndexJs:     resolveApp('src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc:         resolveApp('src'),
    appKey:         resolveApp('src/common/keys.js'),
    appBackground:  resolveApp('src/containers/background/background'),
    appNewtab:      resolveApp('src/containers/newtab/newtab'),
    appNewtabHTML:  resolveApp('src/containers/newtab/newtab.html'),
    appOptions:     resolveApp('src/containers/options/options'),
    appOptionsHTML: resolveApp('src/containers/options/options.html'),
    appLoginJs:     resolveApp('src/containers/auth/login'),
    appLogoutJs:    resolveApp('src/containers/auth/logout'),
    appManifest:    resolveApp('src/manifest.yml'),
    yarnLockFile:   resolveApp('yarn.lock'),
    testsSetup:     resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    publicUrl:      getPublicUrl(resolveApp('package.json')),
    servedPath:     getServedPath(resolveApp('package.json')),
  // These properties only exist before ejecting:
    ownPath:        resolveOwn('.'),
    ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
};
