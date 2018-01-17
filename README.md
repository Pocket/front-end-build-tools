# Pocket Front End Build Tools

## Introduction

Build tools are often ubiquitous save for some minor deviations.
They also have tendency to clutter and obfuscate the structure of a project.
This repository aims to keep our build tooling out of the source files for our
various web based front end projects.

## About this Repository

[Create React App](https://github.com/facebookincubator/create-react-app)
leveraged modules to keep these files separate from the production source and
this repository borrows heavily from that.

At present it is used to build the
[Save To Pocket Extension](https://github.com/Pocket/extension-save-to-pocket)
and the
[Pocket New Tab Extension](https://github.com/Pocket/extension-pocket-new-tab)

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

#### *IMPORTANT*

*This repository is pulled in as a dependency for
[Save To Pocket Extension](https://github.com/Pocket/extension-save-to-pocket)
and
[Pocket New Tab Extension](https://github.com/Pocket/extension-pocket-new-tab).
There is no need to download it directly from this repository unless you are
interested in making improvements to the build process itself.*

## Setup

If you are just interested in working on one of the Pocket extensions:

1. Clone the repository you are interested in.
   - [Save To Pocket Extension](https://github.com/Pocket/extension-save-to-pocket)
   - [Pocket New Tab Extension](https://github.com/Pocket/extension-pocket-new-tab)
2. Run `npm install` OR `yarn install`.

After following the steps above, this repository will be automatically pulled
in as a dependency and will be available for use. __There is no need to download
this repository directly__. Since it is very specific to Pocket it is not
practical for use outside of that context.
