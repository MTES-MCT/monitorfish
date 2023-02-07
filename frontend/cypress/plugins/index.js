/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.tsx can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const initCypressMousePositionPlugin = require('cypress-mouse-position/plugin')
const { initPlugin } = require('cypress-plugin-snapshots/plugin')

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  initCypressMousePositionPlugin(on)
  initPlugin(on, config)
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome' && browser.isHeadless) {
      // fullPage screenshot size is 1400x1200 on non-retina screens
      // and 2800x2400 on retina screens
      launchOptions.args.push('--window-size=1280,1024')

      // force screen to be non-retina (1280x1024 size)
      launchOptions.args.push('--force-device-scale-factor=1')

      // force screen to be retina (2800x2400 size)
      // launchOptions.args.push('--force-device-scale-factor=2')
    }

    if (browser.name === 'electron' && browser.isHeadless) {
      // fullPage screenshot size is 1280x1024
      launchOptions.preferences.width = 1280
      launchOptions.preferences.height = 1024
    }

    if (browser.name === 'firefox' && browser.isHeadless) {
      // menubars take up height on the screen
      // so fullPage screenshot size is 1280x1126
      launchOptions.args.push('--width=1280')
      launchOptions.args.push('--height=1024')
    }

    return launchOptions
  })

  return config
}
