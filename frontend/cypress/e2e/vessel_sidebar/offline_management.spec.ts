/* eslint-disable no-undef */

context('Offline management', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('An error message should be showed in the vessel sidebar When a request has failed', () => {
    // Given
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
        '&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime=',
      { statusCode: 400 }
    ).as('openVessel')
    cy.get('.VESSELS_POINTS').click(460, 460, { force: true })
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar"]').should('be.visible')

    // When retrying request
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Resume tab
    cy.get('*[data-cy="vessel-menu-resume"').click()
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Identity tab
    cy.get('*[data-cy="vessel-menu-identity"').click()
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")

    // When clicking on Logbook tab
    cy.intercept(
      'GET',
      'bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&voyageRequest=LAST&tripNumber=',
      { statusCode: 400 }
    ).as('getLogbook')
    cy.get('*[data-cy="vessel-menu-fishing"').click()
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")

    // When clicking on Reporting tab
    cy.intercept(
      'GET',
      '/bff/v1/vessels/reporting?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*',
      { statusCode: 400 }
    ).as('getReportings')
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
          '/bff/v1/vessels/find?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
          '&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime=',
        times: 1
      },
      { statusCode: 400 }
    ).as('openVesselStubbed')
    cy.get('.VESSELS_POINTS').click(460, 460, { force: true })
    cy.wait('@openVesselStubbed')
    cy.get('*[data-cy="vessel-sidebar"]').should('be.visible')

    // When retrying request
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les informations du navire")
    cy.intercept(
      'GET',
      'bff/v1/vessels/find?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
        '&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime='
    ).as('openVessel')
    cy.clickButton('Réessayer')
    cy.wait('@openVessel')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Resume tab
    cy.intercept(
      'bff/v1/vessels/find?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK' +
        '&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=TWELVE_HOURS&afterDateTime=&beforeDateTime=',
      cy.spy().as('openVesselSpyed')
    )
    cy.get('*[data-cy="vessel-menu-resume"').click()
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
        path: '/bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&voyageRequest=LAST&tripNumber=',
        times: 1
      },
      { statusCode: 400 }
    ).as('getLogbookStubbed')
    cy.get('*[data-cy="vessel-menu-fishing"').click()
    cy.wait('@getLogbookStubbed')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les messages JPE de ce navire")
    cy.intercept('bff/v1/vessels/logbook/find?internalReferenceNumber=FAK000999999&voyageRequest=LAST&tripNumber=').as(
      'getLogbook'
    )
    cy.clickButton('Réessayer')
    cy.wait('@getLogbook')
    cy.get('*[data-cy="vessel-sidebar-error"]').should('not.exist')

    // When clicking on Reporting tab
    cy.intercept(
      {
        method: 'GET',
        pathname: '/bff/v1/vessels/reporting',
        times: 1
      },
      { statusCode: 400 }
    ).as('getReportingsStubbed')
    cy.get('*[data-cy="vessel-menu-reporting"').click()
    cy.wait('@getReportingsStubbed')
    cy.get('*[data-cy="vessel-sidebar-error"]').contains("Nous n'avons pas pu récupérer les signalements de ce navire")
    cy.intercept(
      '/bff/v1/vessels/reporting?vesselId=1&internalReferenceNumber=FAK000999999&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*'
    ).as('getReportings')
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
