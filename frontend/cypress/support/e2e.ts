// Support file
// This file runs before every single spec file.
// https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Support-file
/// <reference path="../../node_modules/@mtes-mct/monitor-ui/cypress/global.d.ts" />

import 'cypress-mouse-position/commands'
import 'cypress-plugin-snapshots/commands'
import './commands'
import './commands/dragTo'
import './commands/loadPath'
import { runBeforeEachHook } from './utils'

declare global {
  namespace Cypress {
    interface Chainable {
      before(property: string): string
      cleanFiles(): void
      cleanScreenshots(fromNumber: number): void
      dragTo(
        selector: string,
        options?: Partial<{
          delay: number
          isSmooth: boolean
        }>
      ): void
      getComputedStyle(dataCy: string, backUpToParentNumber?: number): Cypress.Chainable<CSSStyleDeclaration>
      loadPath(path: string): void

      /* eslint-disable typescript-sort-keys/interface */
      toMatchSnapshot(
        options?: Partial<{
          ignoreExtralFields: boolean
          ignoreExtraArrayItems: boolean
          normalizeJson: boolean
          replace: any
          name: string
        }>
      ): Chainable<null>
      toMatchImageSnapshot(
        options?: Partial<{
          imageConfig: Partial<{
            createDiffImage: boolean
            threshold: number
            thresholdType: 'percent' | 'pixels'
            resizeDevicePixelRatio: boolean
          }>
          screenshotConfig: Partial<ScreenshotDefaultsOptions>
          name: string
          separator: string
        }>
      ): Chainable<null>
    }
  }
}

Cypress.on('uncaught:exception', err => {
  // We ignore uncaught exceptions `Error: ResizeObserver loop completed with undelivered notifications.`
  // since they only seem to happen (sporadically) within e2e tests
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications.')) {
    // eslint-disable-next-line no-console
    console.log(`Error skipped: ${err}`)

    return false
  }

  // We ignore uncaught exceptions `TypeError: NetworkError when attempting to fetch resource`
  // if (err.message.includes('NetworkError when attempting to fetch resource') ) {
  //  console.log(`Error skipped: ${err}`)
  //  return false // return false to make test continue
  // }

  // We ignore uncaught exceptions `AbortError: The operation was aborted`
  // This error happens after using `reload()` in Cypress
  if (err.message.includes('The operation was aborted')) {
    // eslint-disable-next-line no-console
    console.log(`Error skipped: ${err}`)

    return false
  }

  // This React error does not reproduce in real life
  // It might be a bug resolved in React 18 : https://github.com/facebook/react/issues/17355#issuecomment-1173055443
  if (err.message.includes('Should not already be working')) {
    // eslint-disable-next-line no-console
    console.log(`Error skipped: ${err}`)

    return false
  }

  return undefined
})

before(() => {
  runBeforeEachHook()

  // Warm up the app
  cy.visit('/#@-824534.42,6082993.21,8.70')
  cy.wait(30000)
})

// Run before each spec
beforeEach(() => {
  // We use a Cypress session to inject inject a Local Storage key
  // so that we can detect when the browser app is running in Cypress.
  // https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-preserve-cookies--localStorage-in-between-my-tests
  cy.session('cypress', () => {
    cy.window().then(window => {
      window.localStorage.setItem('IS_CYPRESS', 'true')
    })
  })

  // Fake Authorization
  cy.intercept('/bff/v1/authorization/current', {
    body: {
      isSuperUser: true
    },
    statusCode: 200
  })

  // DEV :: FRONTEND_SENTRY_DSN
  // PROD :: FRONTEND_SENTRY_DSN
  cy.intercept(
    { url: /^https:\/\/a5f3272efa794bb9ada2ffea90f2fec5@sentry\.incubateur\.net\/.*/ },
    {
      statusCode: 200
    }
  )

  // PROD :: SMALL CHAT
  cy.intercept(
    { url: /^https:\/\/embed\.small\.chat\/.*/ },
    {
      body: '',
      statusCode: 200
    }
  )
})
