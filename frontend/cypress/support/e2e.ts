// Support file
// This file runs before every single spec file.
// https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Support-file
/// <reference path="../../node_modules/@mtes-mct/monitor-ui/cypress/global.d.ts" />
import 'cypress-axe'

import './commands'
import './commands/dragTo'
import './commands/login'

import type { Coordinate } from 'ol/coordinate'
import type { FeatureType } from 'ol/format/WFS'

declare global {
  namespace Cypress {
    interface Chainable {
      before(property: string): string

      cleanDownloadedFiles(): void

      countRequestsByAlias(alias: string, waitForInMs?: number): Cypress.Chainable<number>

      dragTo(
        selector: string,
        options?: Partial<{
          delay: number
          isSmooth: boolean
        }>
      ): void

      hoverVesselByName(vesselName: string): Cypress.Chainable

      getComputedStyle(dataCy: string, backUpToParentNumber?: number): Cypress.Chainable<CSSStyleDeclaration>

      getDownloadedFileContent(callback: (content: Cypress.Chainable<any>) => void): void

      getFeaturesFromLayer(layerName: string): Cypress.Chainable<Array<FeatureType>>

      getViewCenter(): Cypress.Chainable<Coordinate | undefined>

      login(user: string): void

      postLoginToKeycloak(user: string): void

      resetCountRequestsByAlias(alias: string): void

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

// Run before each spec
beforeEach(() => {
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
