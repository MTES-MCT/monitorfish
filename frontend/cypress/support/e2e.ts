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
    return false
  }

  // This React error does not reproduce in real life
  // It might be a bug resolved in React 18 : https://github.com/facebook/react/issues/17355#issuecomment-1173055443
  if (err.message.includes('Should not already be working')) {
    return false
  }

  return undefined
})
