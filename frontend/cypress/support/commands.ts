import { registerMonitorUiCustomCommands } from '@mtes-mct/monitor-ui/cypress'

import { cleanDownloadedFiles } from './commands/cleanDownloadedFiles'
import { countRequestsByAlias, resetCountRequestsByAlias } from './commands/countRequestsByAlias'
import { getComputedStyle } from './commands/getComputedStyle'
import { getDownloadedFileContent } from './commands/getDownloadedFileContent'
import { getFeaturesFromLayer } from './commands/getFeaturesFromLayer'
import { getViewCenter } from './commands/getViewCenter'
import { hoverVesselByName } from './commands/hoverVesselByName'
import { injectAxe } from './commands/injectAxe'
import { login } from './commands/login'

registerMonitorUiCustomCommands()

export const stubSideWindowOptions = {
  onBeforeLoad(window) {
    cy.stub(window, 'open', () => window).as('windowOpen')
  }
}

Cypress.Commands.add('getFeaturesFromLayer', getFeaturesFromLayer)
Cypress.Commands.add('getViewCenter', getViewCenter)
Cypress.Commands.add('cleanDownloadedFiles', cleanDownloadedFiles)
Cypress.Commands.add('countRequestsByAlias', countRequestsByAlias)
Cypress.Commands.add('getComputedStyle', getComputedStyle)
Cypress.Commands.add('getDownloadedFileContent', getDownloadedFileContent)
Cypress.Commands.add('hoverVesselByName', hoverVesselByName)
Cypress.Commands.add('resetCountRequestsByAlias', resetCountRequestsByAlias)
Cypress.Commands.add('login', login)
Cypress.Commands.add('injectAxe', injectAxe)
