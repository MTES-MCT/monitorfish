import {defineConfig} from 'cypress'
import initCypressMousePositionPlugin from 'cypress-mouse-position/plugin'
import {initPlugin} from 'cypress-plugin-snapshots/plugin'

const IS_CI = Boolean(process.env.CI)

export default defineConfig({
  e2e: {
    baseUrl: `http://${IS_CI ? '0.0.0.0:8880' : 'localhost:3000'}`,
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    setupNodeEvents(on, config) {
      initCypressMousePositionPlugin(on)
      initPlugin(on, config)
    },
    specPattern: 'cypress/e2e/**/*.spec.ts'
  },
  env: {
    "FRONTEND_OIDC_AUTHORITY": `http://${IS_CI ? '0.0.0.0:8880' : 'localhost:8880'}/realms/monitor`,
    "FRONTEND_OIDC_CLIENT_ID": "monitorfish",
    "LOCALSTORAGE_URL": `http://${IS_CI ? '0.0.0.0:8880' : 'localhost:3000'}`,
    'cypress-plugin-snapshots': {
      imageConfig: {
        threshold: 20,
        thresholdType: 'pixel'
      },
      updateSnapshots: false
    },
    /**
     * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
     * instead of `import.meta.env` in application code.
     */
    FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: true
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
