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
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Resume tab
    cy.get('*[data-cy="vessel-menu-summary"').click()
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Identity tab
    cy.get('*[data-cy="vessel-menu-identity"').click()
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Logbook tab
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST',
      {
        statusCode: 400
      }
    ).as('getLogbook')
    cy.get('*[data-cy="vessel-menu-fishing"').click()
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")

    // When clicking on Reporting tab
    cy.intercept('GET', '/bff/v1/vessels/reportings?*', { statusCode: 400 }).as('getReportings')
    cy.get('*[data-cy="vessel-menu-reporting"').click()
    cy.wait('@getReportings')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les signalements de ce navire")
    cy.clickButton('Réessayer')
    cy.wait('@getReportings')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les signalements de ce navire")

    // When clicking on Controls tab
    cy.get('*[data-cy="vessel-menu-controls"').click()
    cy.get('*[data-cy="vessel-controls"]').contains('Nous n’avons trouvé aucun contrôle pour ce navire.')

    // When clicking on ERS/VMS tab
    cy.get('*[data-cy="vessel-menu-ers-vms"').click()
    cy.get('*[data-cy="vessel-beacon-malfunctions"]').contains('Nous n’avons trouvé aucune balise VMS pour ce navire.')
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
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
    ).as('openVessel')
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Resume tab
    cy.intercept(
      'bff/v1/vessels/find?afterDateTime=&beforeDateTime=&externalReferenceNumber=DONTSINK' +
      '&internalReferenceNumber=FAK000999999&IRCS=CALLME&trackDepth=TWELVE_HOURS' +
      '&vesselId=1&vesselIdentifier=INTERNAL_REFERENCE_NUMBER',
      cy.spy().as('openVesselSpyed')
    )
    cy.get('*[data-cy="vessel-menu-summary"').click()
    cy.get('@openVesselSpyed').should('not.have.been.called')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Identity tab
    cy.get('*[data-cy="vessel-menu-identity"').click()
    cy.get('@openVesselSpyed').should('not.have.been.called')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Logbook tab
    cy.intercept(
      {
        method: 'GET',
        path: '/bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST',
        times: 2
      },
      { statusCode: 400 }
    ).as('getLogbookStubbed')
    cy.get('*[data-cy="vessel-menu-fishing"').click()
    cy.wait('@getLogbookStubbed')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.intercept('bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&tripNumber=&voyageRequest=LAST').as(
      'getLogbook'
    )
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Reporting tab
    cy.intercept(
      {
        method: 'GET',
        pathname: '/bff/v1/vessels/reportings',
        times: 2
      },
      { statusCode: 400 }
    ).as('getReportingsStubbed')
    cy.get('*[data-cy="vessel-menu-reporting"').click()
    cy.wait('@getReportingsStubbed')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les signalements de ce navire")
    cy.intercept('/bff/v1/vessels/reportings?*').as('getReportings')
    cy.clickButton('Réessayer')
    cy.wait('@getReportings')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Controls tab
    cy.get('*[data-cy="vessel-menu-controls"').click()
    cy.get('*[data-cy="vessel-controls"]').should('not.contain', 'Nous n’avons trouvé aucun contrôle pour ce navire.')

    // When clicking on ERS/VMS tab
    cy.get('*[data-cy="vessel-menu-ers-vms"').click()
    cy.get('*[data-cy="vessel-beacon-malfunctions"]').should(
      'not.contain',
      'Nous n’avons trouvé aucune balise VMS pour ce navire.'
    )
  })
})
