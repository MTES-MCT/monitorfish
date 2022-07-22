import { defineConfig } from 'cypress'

const IS_CI = Boolean(process.env.CI)

export default defineConfig({
  projectId: '9b7q8z',
  e2e: {
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}'
  },
  env: {
    'cypress-plugin-snapshots': {
      imageConfig: {
        threshold: 20,
        thresholdType: 'pixel'
      },
      updateSnapshots: false
    }
  },
  retries: {
    runMode: 5,
    openMode: 0
  },
  screenshotOnRunFailure: true,
  scrollBehavior: false,
  video: !IS_CI,
  viewportWidth: 1280,
  viewportHeight: 1024,
  waitForAnimations: true
})
