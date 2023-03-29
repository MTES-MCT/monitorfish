import { clickButton } from './commands/clickButton'
import { clickOutside } from './commands/clickOutside'
import { fill } from './commands/fill'
import { fillDateRangePicker } from './commands/fillDateRangePicker'
import { forceClick } from './commands/forceClick'
import { getComputedStyle } from './commands/getComputedStyle'
import { getDataCy } from './commands/getDataCy'

function unquote(str: string): string {
  return str.replace(/(^")|("$)/g, '')
}

Cypress.Commands.add(
  'before',
  {
    prevSubject: 'element'
  },
  (el: JQuery<Element>, property: string): string => {
    if (!el[0]) {
      throw new Error('`el[0]` is undefined.')
    }

    const win = el[0].ownerDocument.defaultView
    if (!win) {
      throw new Error('`win` is null.')
    }

    const before = win.getComputedStyle(el[0], 'before')

    return unquote(before.getPropertyValue(property))
  }
)

Cypress.Commands.add('cleanScreenshots', (fromNumber: number): void => {
  cy.exec(`cd cypress/e2e/__image_snapshots__/ && find . | grep -P "[${fromNumber}-7]\\.png" | xargs -i rm {}\n`)
})

Cypress.Commands.add('cleanFiles', () => {
  cy.exec(`rm -f cypress/downloads/*`)
})

// Cypress typings are wrong and only allow a boolean for `prevSubject` despite the doc:
// https://docs.cypress.io/api/cypress-api/custom-commands#Dual-Commands
Cypress.Commands.add('clickButton', { prevSubject: 'optional' } as any, clickButton)

Cypress.Commands.add('getComputedStyle', getComputedStyle)

Cypress.Commands.add(
  'clickLink',
  (linkText: string): Cypress.Chainable<JQuery<HTMLAnchorElement>> => cy.get('a').contains(linkText).click()
)

/**
 * @description
 * Useful to close modals.
 */
Cypress.Commands.add('clickOutside', clickOutside)

/**
 * @example
 * ```ts
 *   cy.fill('Password', 'P422W0Rd')
 * ```
 */
Cypress.Commands.add('fill', fill)

Cypress.Commands.add('fillDateRangePicker', fillDateRangePicker)

// Maybe because of https://github.com/cypress-io/cypress/issues/19564
Cypress.Commands.add('forceClick', { prevSubject: true }, forceClick)

Cypress.Commands.add('getDataCy', getDataCy)
