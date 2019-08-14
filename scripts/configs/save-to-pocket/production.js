'use strict'

const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')

const eslintFormatter = require('react-dev-utils/eslintFormatter')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const WatchModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')

const path = require('path')
const webpack = require('webpack')

const getClientEnvironment = require('./env')
const paths = require('./paths')

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './'
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1)
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.')
}

// Note: defined here because it will be used more than once.
const cssFilename = 'styles/[name].css'

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {}

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  // The first two entry points enable "hot" CSS and auto-refreshes for JS.
  entry: {
    background: [paths.appBackground],
    options: [paths.appOptions],
    login: [paths.appLoginJs],
    logout: [paths.appLogoutJs],
    frame: [paths.appFrameJs],
    save: [paths.appSaveJs],
    twitter: [
      paths.appLegacyTwitterJs,
      paths.appTwitterJs
    ],
    hackernews: [paths.appHackerNewsJs],
    reddit: [paths.appReddit]
  },
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuildDefault,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'js/[name].bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {
      // @remove-on-eject-begin
      // Resolve Babel runtime relative to react-scripts.
      // It usually still works on npm 3 without this but it would be
      // unfortunate to rely on, as react-scripts could be symlinked,
      // and thus babel-runtime might not be resolvable from the source.
      'babel-runtime': path.dirname(
        require.resolve('babel-runtime/package.json')
      )
    },
    plugins: [new ModuleScopePlugin(paths.appSrc)]
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },

      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
              baseConfig: {
                extends: [require.resolve('eslint-config-react-app')],
                plugins: [
                  'react'
                ],
                settings: {
                  react: {
                    version: 'detect'
                  }
                },
              },
              ignore: false,
              useEslintrc: false
            },
            loader: require.resolve('eslint-loader')
          }
        ],
        include: paths.appSrc
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          // A missing `test` is equivalent to a match.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'media/[name].[hash:8].[ext]'
            }
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              // @remove-on-eject-begin
              babelrc: false,
              presets: [require.resolve('babel-preset-react-app')],
              // @remove-on-eject-end
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              compact: true
            }
          },
          // "postcss" loader applies autoprefixer to our CSS.
          // "css" loader resolves paths in CSS and adds assets as dependencies.
          // "style" loader turns CSS into JS modules that inject <style> tags.
          // In production, we use a plugin to extract that CSS to a file, but
          // in development "style" loader enables hot editing of CSS.
          {
            test: /\.scss$/,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[local]_[hash:base64:8]'
                }
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  // Necessary for external CSS imports to work
                  // https://github.com/facebookincubator/create-react-app/issues/2677
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9' // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009'
                    })
                  ]
                }
              },
              { loader: require.resolve('sass-loader') }
            ]
          },

          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: '[name].[hash:8].[ext]'
            }
          }
        ]
      }
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ]
  },
  plugins: [
    // new InterpolateHtmlPlugin(env.raw),
    // // Generates an `index.html` file with the <script> injected.
    // new HtmlWebpackPlugin({
    //   inject: true,
    //   template: paths.appHtml,
    // }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appOptionsHTML,
      filename: 'options.html',
      chunks: ['options'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appSaveHTML,
      filename: 'save.html',
      chunks: ['save'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebookincubator/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false
      },
      output: {
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebookincubator/create-react-app/issues/2488
        ascii_only: true
      },
      sourceMap: true
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Since we are developing an extension we need to write to file as we develop
    // in order to sideload the extension
    new WriteFilePlugin({ log: false })
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
