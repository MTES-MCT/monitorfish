// Support file
// This file runs before every single spec file.
// https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Support-file

import 'cypress-mouse-position/commands'
import 'cypress-plugin-snapshots/commands'
import './commands'
import './commands/dragTo'
import './commands/loadPath'

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
      /* eslint-enable typescript-sort-keys/interface */

      // eslint-disable-next-line typescript-sort-keys/interface
      clickButton(
        label: string,
        options?: Partial<{
          index: number
          withinSelector: string
        }>
      ): Chainable<JQuery<HTMLButtonElement>>
      clickLink(linkText: string): Chainable<JQuery<HTMLAnchorElement>>
      clickOutside(xPosition?: number, yPosition?: number): void
      fill(
        label: string,
        value:
          | boolean
          | number
          | string
          | string[]
          | (DateTuple | DateWithTimeTuple)
          | ([Cypress.DateTuple, Cypress.DateTuple] | [Cypress.DateWithTimeTuple, Cypress.DateWithTimeTuple])
          | undefined
      ): Chainable<Element>
      forceClick(): Chainable<JQuery<HTMLElement>>
      getDataCy(dataCy: string): Chainable<JQuery<HTMLElement>>
    }

    type DateTuple = [number, number, number]
    type DateWithTimeTuple = [number, number, number, number, number]
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

  // DEV :: VITE_GEOSERVER_LOCAL_URL
  // PROD :: VITE_GEOSERVER_LOCAL_URL
  cy.intercept({ url: /^https?:\/\/10\.56\.205\.25:808(1|2)\/.*/ }, req => {
    req.redirect(
      req.url
        .replace('http://10.56.205.25:8081', 'http://0.0.0.0:8081')
        .replace('http://10.56.205.25:8082', 'http://0.0.0.0:8081')
        .replace('https://10.56.205.25:8081', 'http://0.0.0.0:8081')
        .replace('https://10.56.205.25:8082', 'http://0.0.0.0:8081')
    )
  })

  // DEV :: VITE_GEOSERVER_REMOTE_URL
  cy.intercept({ url: /^https?:\/\/monitorfish-test\.csam\.e2\.rie\.gouv\.fr\/.*/ }, req => {
    req.redirect(
      req.url
        .replace('http://monitorfish-test.csam.e2.rie.gouv.fr', 'http://0.0.0.0:8081')
        .replace('https://monitorfish-test.csam.e2.rie.gouv.fr', 'http://0.0.0.0:8081')
    )
  })
  // PROD :: VITE_GEOSERVER_REMOTE_URL
  cy.intercept({ url: /^https?:\/\/monitorfish\.din\.developpement-durable\.gouv\.fr\/.*/ }, req => {
    req.redirect(
      req.url
        .replace('http://monitorfish.din.developpement-durable.gouv.fr', 'http://0.0.0.0:8081')
        .replace('https://monitorfish.din.developpement-durable.gouv.fr', 'http://0.0.0.0:8081')
    )
  })

  // DEV :: VITE_MONITORENV_URL
  cy.intercept({ url: /^https?:\/\/monitorenv\.kadata\.fr\/.*/ }, req => {
    req.redirect(
      req.url
        .replace('http://monitorenv.kadata.fr', 'http://0.0.0.0:8081')
        .replace('http://monitorenv.kadata.fr', 'https://0.0.0.0:8081')
    )
  })
  // PROD :: VITE_MONITORENV_URL
  cy.intercept({ url: /^https?:\/\/monitorenv\.din\.developpement-durable\.gouv\.fr\/.*/ }, req => {
    req.redirect(
      req.url
        .replace('http://monitorenv.din.developpement-durable.gouv.fr', 'http://0.0.0.0:8081')
        .replace('https://monitorenv.din.developpement-durable.gouv.fr', 'http://0.0.0.0:8081')
    )
  })

  // DEV :: VITE_SENTRY_DSN
  // PROD :: VITE_SENTRY_DSN
  cy.intercept(
    { url: /^https:\/\/a5f3272efa794bb9ada2ffea90f2fec5@sentry\.incubateur\.net\/.*/ },
    {
      statusCode: 200
    }
  )

  // PROD :: VITE_SMALL_CHAT_SNIPPET
  cy.intercept(
    { url: /^https:\/\/embed\.small\.chat\/.*/ },
    {
      body: '',
      statusCode: 200
    }
  )
})
