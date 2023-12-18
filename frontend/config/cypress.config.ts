import { defineConfig } from 'cypress'
import initCypressMousePositionPlugin from 'cypress-mouse-position/plugin'
import { initPlugin } from 'cypress-plugin-snapshots/plugin'
import { platform } from 'os'

const IS_CI = Boolean(process.env.CI)
const IS_DARWIN = platform() === 'darwin'
const DEFAULT_PORT = IS_CI ? 8880 : 3000

export default defineConfig({
  e2e: {
    baseUrl: `http://${IS_DARWIN ? '0.0.0.0' : 'localhost'}:${DEFAULT_PORT}`,
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    setupNodeEvents(on, config) {
      initCypressMousePositionPlugin(on)
      initPlugin(on, config)
    },
    specPattern: 'cypress/e2e/**/*.spec.ts'
  },
  env: {
    FRONTEND_MISSION_AUTO_SAVE_ENABLED: true,
    'cypress-plugin-snapshots': {
      imageConfig: {
        threshold: 20,
        thresholdType: 'pixel'
      },
      updateSnapshots: false
    }
  },
  projectId: '9b7q8z',
  retries: {
    openMode: 0,
    runMode: 5
  },
  screenshotOnRunFailure: true,
  scrollBehavior: false,
  video: false,
  viewportHeight: 1024,
  viewportWidth: 1280,
  waitForAnimations: true
})
