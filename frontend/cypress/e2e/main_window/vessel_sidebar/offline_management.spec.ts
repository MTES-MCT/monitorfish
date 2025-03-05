/* eslint-disable no-undef */

import { openVesselBySearch } from '../utils'

context('Offline management', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('An error message should be showed in the vessel sidebar When a request has failed', () => {
    // Given
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
      { statusCode: 400 }
    ).as('openVessel')
    openVesselBySearch('Pheno')
    cy.wait('@openVessel')

    // When retrying request
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Resume tab
    cy.getDataCy('vessel-menu-summary').click()
    cy.wait('@openVessel')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Identity tab
    cy.getDataCy('vessel-menu-identity').click()
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Logbook tab
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST',
      {
        statusCode: 400
      }
    ).as('getLogbook')
    cy.getDataCy('vessel-menu-fishing').click()
    cy.wait('@getLogbook')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")

    // When clicking on Reporting tab
    cy.intercept('GET', '/bff/v1/vessels/reportings?*', { statusCode: 400 }).as('getReportings')
    cy.getDataCy('vessel-menu-reporting').click()
    cy.wait('@getReportings')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les signalements de ce navire")
    cy.clickButton('Réessayer')
    cy.wait('@getReportings')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les signalements de ce navire")

    // When clicking on Controls tab
    cy.getDataCy('vessel-menu-controls').click()
    cy.getDataCy('vessel-controls').contains('Nous n’avons trouvé aucun contrôle pour ce navire.')

    // When clicking on ERS/VMS tab
    cy.getDataCy('vessel-menu-ers-vms').click()
    cy.getDataCy('vessel-beacon-malfunctions').contains('Nous n’avons trouvé aucune balise VMS pour ce navire.')
  })

  it('Vessel sidebar tabs Should be shown When connexion is online back', () => {
    // Given
    cy.intercept(
      {
        method: 'GET',
        path:
          '/bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
          '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
          '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
        times: 2
      },
      { statusCode: 400 }
    ).as('openVesselStubbed')
    openVesselBySearch('Pheno')
    cy.wait('@openVesselStubbed')

    // When retrying request
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
    ).as('openVessel')
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST',
        times: 2
      },
      { statusCode: 400 }
    ).as('getLogbookFirstStubbed')
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.wait('@getLogbookFirstStubbed')
    cy.getDataCy('vessel-sidebar-error').should('not.exist')

    // When clicking on Resume tab
    cy.intercept(
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
      cy.spy().as('openVesselSpyed')
    )
    cy.getDataCy('vessel-menu-summary').click()
    cy.get('@openVesselSpyed').should('not.have.been.called')
    cy.getDataCy('vessel-sidebar-error').should('not.exist')

    // When clicking on Identity tab
    cy.getDataCy('vessel-menu-identity').click()
    cy.get('@openVesselSpyed').should('not.have.been.called')
    cy.getDataCy('vessel-sidebar-error').should('not.exist')

    // When clicking on Logbook tab
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST',
        times: 2
      },
      { statusCode: 400 }
    ).as('getLogbookStubbed')
    cy.getDataCy('vessel-menu-fishing').click()
    cy.wait('@getLogbookStubbed')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.intercept('bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST').as(
      'getLogbook'
    )
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.getDataCy('vessel-sidebar-error').should('not.exist')
    cy.getDataCy('vessel-fishing').should('exist')

    // When clicking on Reporting tab
    cy.intercept(
      {
        method: 'GET',
        pathname: '/bff/v1/vessels/reportings',
        times: 2
      },
      { statusCode: 400 }
    ).as('getReportingsStubbed')
    cy.getDataCy('vessel-menu-reporting').click()
    cy.wait('@getReportingsStubbed')
    cy.getDataCy('vessel-sidebar-error').contains("Nous n'avons pas pu récupérer les signalements de ce navire")
    cy.intercept('/bff/v1/vessels/reportings?*').as('getReportings')
    cy.clickButton('Réessayer')
    cy.wait('@getReportings')
    cy.getDataCy('vessel-sidebar-error').should('not.exist')

    // When clicking on Controls tab
    cy.getDataCy('vessel-menu-controls').click()
    cy.getDataCy('vessel-controls').should('not.contain', 'Nous n’avons trouvé aucun contrôle pour ce navire.')

    // When clicking on ERS/VMS tab
    cy.getDataCy('vessel-menu-ers-vms').click()
    cy.getDataCy('vessel-beacon-malfunctions').should(
      'not.contain',
      'Nous n’avons trouvé aucune balise VMS pour ce navire.'
    )
  })
})
