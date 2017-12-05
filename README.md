# Pocket Front End Build Tools

## Introduction

Build tools are often ubiquitous save for some minor deviations.  They also have tendency to clutter and obfuscate the structure of a project.  This repo aims to keep our build tooling out of the source files for our various web based front end projects

## About this Repository

[Create React App](https://github.com/facebookincubator/create-react-app) leveraged modules to keep these files seperate from the production source and this repo borrows heavily from that.

At present it is used to build the [Save To Pocket Extension](https://github.com/Pocket/extension-save-to-pocket) and the [Pocket New Tab Extension](https://github.com/Pocket/extension-pocket-new-tab)

At this time it is set up to use the following:

- Jest for testing
- Eslint for JS linting
- Babel for ES6/7
- Stylelint for Style linting
- SASS
- CSS modules
- Webpack for compiling
- YAML for generating manifests

## Getting Started

### Setup

This is a dev dependency for both [Save To Pocket Extension](https://github.com/Pocket/extension-save-to-pocket) and the [Pocket New Tab Extension](https://github.com/Pocket/extension-pocket-new-tab).
At this time since it is mostly borrowed from [Create React App](https://github.com/facebookincubator/create-react-app) and is very specific to Pocket, it is not practical for use outside of that context.


### Third Party Tools Licenses
