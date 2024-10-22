import { registerMonitorUiCustomCommands } from '@mtes-mct/monitor-ui/cypress'

import { cleanDownloadedFiles } from './commands/cleanDownloadedFiles'
import { cleanScreenshots } from './commands/cleanScreenshots'
import { countRequestsByAlias, resetCountRequestsByAlias } from './commands/countRequestsByAlias'
import { getComputedStyle } from './commands/getComputedStyle'
import { getDownloadedFileContent } from './commands/getDownloadedFileContent'
import { login } from './commands/login'
import { postLoginToKeycloak } from './commands/postLoginToKeycloak'

registerMonitorUiCustomCommands()

export const stubSideWindowOptions = {
  onBeforeLoad(window) {
    cy.stub(window, 'open', () => window).as('windowOpen')
  }
}

Cypress.Commands.add('cleanDownloadedFiles', cleanDownloadedFiles)
Cypress.Commands.add('cleanScreenshots', cleanScreenshots)
Cypress.Commands.add('countRequestsByAlias', countRequestsByAlias)
Cypress.Commands.add('getComputedStyle', getComputedStyle)
Cypress.Commands.add('getDownloadedFileContent', getDownloadedFileContent)
Cypress.Commands.add('resetCountRequestsByAlias', resetCountRequestsByAlias)
Cypress.Commands.add('postLoginToKeycloak', postLoginToKeycloak)
Cypress.Commands.add('login', login)
