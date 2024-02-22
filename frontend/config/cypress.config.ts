import { defineConfig } from 'cypress'
import initCypressMousePositionPlugin from 'cypress-mouse-position/plugin'
import { initPlugin } from 'cypress-plugin-snapshots/plugin'

const IS_CI = Boolean(process.env.CI)
const DEFAULT_PORT = IS_CI ? 8880 : 3000

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${DEFAULT_PORT}`,
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    setupNodeEvents(on, config) {
      initCypressMousePositionPlugin(on)
      initPlugin(on, config)
    },
    specPattern: 'cypress/e2e/**/*.spec.ts'
  },
  env: {
    /**
     * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
     * instead of `import.meta.env` in application code.
     */
    FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: true,
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
