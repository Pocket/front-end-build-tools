/* globals chrome, __webpack_hash__ *//* eslint no-console: 0*/

/*
    MODIFIED VERSION BASED ON ORIGINAL WORK HERE:
    https://github.com/webpack/webpack/blob/master/hot/dev-server.js

    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
    Modified Joel Kelly @collectedmind
*/

// BEGIN DEV ONLY
if(module.hot) {
    var lastHash

    var upToDate = function upToDate() {
        return lastHash.indexOf(__webpack_hash__) >= 0
    }

    var clientEmitter = require('webpack/hot/emitter')

    clientEmitter.on('webpackHotUpdate', function(currentHash) {
        lastHash = currentHash
        if(upToDate()) return

        console.log('%c Reloading Extension', 'color: #9932CC')
        chrome.runtime.reload()
    })
}
// END DEV ONLY
