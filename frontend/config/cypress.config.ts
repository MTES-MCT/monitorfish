import {defineConfig} from 'cypress'

const IS_CI = Boolean(process.env.CI)

export default defineConfig({
  e2e: {
    baseUrl: `http://${IS_CI ? 'localhost:8880' : 'localhost:3000'}`,
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    specPattern: 'cypress/e2e/**/*.spec.ts'
  },
  env: {
    /**
     * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
     * instead of `import.meta.env` in application code.
     */
    FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED: true,
  },
  projectId: '9b7q8z',
  retries: {
    openMode: 0,
    runMode: 5
  },
  pageLoadTimeout: 120000,
  screenshotOnRunFailure: true,
  scrollBehavior: false,
  video: false,
  viewportHeight: 1024,
  viewportWidth: 1280,
  waitForAnimations: true
})
