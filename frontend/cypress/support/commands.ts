import { registerMonitorUiCustomCommands } from '@mtes-mct/monitor-ui/cypress'

import { cleanDownloadedFiles } from './commands/cleanDownloadedFiles'
import { countRequestsByAlias, resetCountRequestsByAlias } from './commands/countRequestsByAlias'
import { getComputedStyle } from './commands/getComputedStyle'
import { getDownloadedFileContent } from './commands/getDownloadedFileContent'

registerMonitorUiCustomCommands()

function unquote(str: string): string {
  return str.replace(/(^")|("$)/g, '')
}

export const stubSideWindowOptions = {
  onBeforeLoad(window) {
    cy.stub(window, 'open', () => window).as('windowOpen')
  }
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

Cypress.Commands.add('cleanDownloadedFiles', cleanDownloadedFiles)
Cypress.Commands.add('countRequestsByAlias', countRequestsByAlias)
Cypress.Commands.add('getComputedStyle', getComputedStyle)
Cypress.Commands.add('getDownloadedFileContent', getDownloadedFileContent)
Cypress.Commands.add('resetCountRequestsByAlias', resetCountRequestsByAlias)

// @ts-ignore
Cypress.Commands.add('waitForLastRequest', (alias, partialRequest, maxRequests, level = 0) => {
  if (level === maxRequests) {
    throw new Error(`${maxRequests} requests exceeded`)
  }

  // @ts-ignore
  return cy.wait(alias).then(interception => {
    // @ts-ignore
    const isMatch = Cypress._.isMatch(interception.request, partialRequest)
    if (isMatch) {
      return interception
    }

    // eslint-disable-next-line no-console
    cy.log('Intercepted request', JSON.stringify(interception.request))

    // @ts-ignore
    return cy.waitForLastRequest(alias, partialRequest, maxRequests, level + 1)
  })
})
