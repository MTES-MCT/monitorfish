import {defineConfig} from 'cypress'

import {clearBackendCaches, restoreDatabase, snapshotDatabase} from './cypressSpecIsolation'

const IS_CI = Boolean(process.env.CI)
/**
 * Reset the database and backend caches before each spec (run mode only), so that specs don't depend on each other.
 * Always enabled in CI. Locally, set `CYPRESS_SPEC_ISOLATION=true` (the backend also needs
 * `MONITORFISH_E2E_CACHE_RESET_ENABLED=true`).
 */
const IS_SPEC_ISOLATION_ENABLED = IS_CI || process.env.CYPRESS_SPEC_ISOLATION === 'true'

export default defineConfig({
  e2e: {
    baseUrl: `http://${IS_CI ? 'localhost:8880' : 'localhost:3000'}`,
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
    setupNodeEvents(on, config) {
      if (!IS_SPEC_ISOLATION_ENABLED) {
        return
      }

      let isDatabasePristine = false

      on('before:run', async () => {
        await snapshotDatabase()
        isDatabasePristine = true
      })

      on('before:spec', async () => {
        if (!isDatabasePristine) {
          await restoreDatabase()
        }
        isDatabasePristine = false

        await clearBackendCaches(config.baseUrl!)
      })
    },
    specPattern: 'cypress/e2e/**/*.spec.ts'
  },
  env: {
    /**
     * When running Cypress tests, we modify this env var in spec file, so we use `window.Cypress.env()`
     * instead of `import.meta.env` in application code.
     */
    FRONTEND_E_ISR_CONTROL_UNITS_FOR_TEST: '10499',
    FRONTEND_E_ISR_ENABLED: true,
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
