const { alias } = require('react-app-rewire-alias')
const path = require(`path`)
const webpack = require('webpack')

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {}
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    path: require.resolve('path-browserify')
  })
  config.resolve.fallback = fallback
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ])
  config.module.rules.unshift({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false // disable the behavior
    }
  })
  config.ignoreWarnings = [/Failed to parse source map/]

  alias({
    '@cache': path.resolve(__dirname, 'src/cache'),
    '@libraries': path.resolve(__dirname, 'src/libraries'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@datatypes': path.resolve(__dirname, 'src/types'),
    '@config': path.resolve(__dirname, 'src/config.ts'),
    '@nft': path.resolve(__dirname, 'src/components/nft'),
    '@nftcomponents': path.resolve(
      __dirname,
      'src/components/nft/nft-components'
    ),
    '@api': path.resolve(__dirname, 'src/api'),
    '@assets': path.resolve(__dirname, 'src/assets'),
    '@nftapi': path.resolve(__dirname, 'src/components/nft/nft-api'),
    '@artifacts': path.resolve(__dirname, 'src/artifacts')
  })(config)
  return config
}
