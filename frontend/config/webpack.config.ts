/**
 * This file is a custom Webpack config used for Cypress component testing
 * in order to handle Typecript as well as CSS and fonts.
 *
 * It's included in `cypress.config.ts`.
 *
 * @see https://docs.cypress.io/guides/component-testing/react/overview#React-with-Webpack
 */

import type { Configuration } from 'webpack'

export const config: Configuration = {
  devtool: 'eval-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        // parser: { amd: false }
      },
      {
        // exclude: /(node_modules)/,
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // Skip type-checking for speed
            transpileOnly: true
          }
        }
      },
      {
        exclude: /(node_modules)/,
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    fallback: {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify')
    }
  }
}
