/// <reference types="cypress" />

context('Reportings', () => {
  beforeEach(() => {
    cy.visit('/side_window')
  })

  it('Reportings Should be archived', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/archive').as('archiveReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)

    // When
    // Select and archive a reporting
    cy.get('.rs-checkbox-wrapper').first().click()
    cy.get('*[data-cy="archive-reporting-cards"]').click({ force: true })
    cy.wait('@archiveReportings').then(({ request, response }) => {
      expect(request.body.toString()).contains('5')
      expect(response && response.statusCode).equal(200)
    })

    // Then
    // Should delete the row
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 0)
  })

  it('Reportings Should be searched and ordered by date', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete').as('deleteReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)

    /**
     * We need to wrap this test as the reporting list might have 3 or 4 value, as another test might convert
     * an OBSERVATION to an INFRACTION_SUSPICION in the same running Cypress machine
     */
    cy.get('*[data-cy="side-window-current-reportings"]').then($reportingList => {
      const numberOfReportings = Cypress.$($reportingList).length
      cy.log(`${numberOfReportings} reportings found in the list`)

      assert(numberOfReportings === 3 || numberOfReportings === 4, 'There Should be 3 or 4 reportings')
      cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains(numberOfReportings)

      cy.wrap($reportingList).first().contains('MARIAGE ÎLE HASARD')
      cy.wrap($reportingList).last().contains('RENCONTRER VEILLER APPARTEMENT"')

      // When we re-order by date
      cy.get('[data-cy="table-order-by-validationDate"]').click()

      // Then it is re-ordered
      // We do not use `$reportingList` as we need to get the updated DOM element
      cy.get('*[data-cy="side-window-current-reportings"]').first().contains('RENCONTRER VEILLER APPARTEMENT"')
      cy.get('*[data-cy="side-window-current-reportings"]').last().contains('MARIAGE ÎLE HASARD')

      // When we search by vessel name
      cy.get('*[data-cy^="side-window-reporting-search"]').type('RENCONTRER')

      // Then there is only the searched vessel
      cy.get('*[data-cy="side-window-current-reportings"]').first().contains('RENCONTRER VEILLER APPARTEMENT"')
      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings === 4 ? 2 : 1)
    })
  })

  it('Reportings Should be deleted', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete').as('deleteReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)

    /**
     * We need to wrap this test as the reporting list might have 3 or 4 value, as another test might convert
     * an OBSERVATION to an INFRACTION_SUSPICION in the same running Cypress machine
     */
    cy.get('*[data-cy="side-window-current-reportings"]').then($reportingList => {
      const numberOfReportings = Cypress.$($reportingList).length
      cy.log(`${numberOfReportings} reportings found in the list`)
      assert(numberOfReportings === 3 || numberOfReportings === 4, 'There Should be 3 or 4 reportings')

      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings)

      // When
      // Select reporting
      cy.get('.rs-checkbox-wrapper').eq(1).click()
      // Select reporting
      cy.get('.rs-checkbox-wrapper').last().click()
      // Delete two reportings
      cy.get('*[data-cy="delete-reporting-cards"]').click({ force: true })
      cy.wait('@deleteReportings').then(({ request, response }) => {
        expect(request.body).to.have.length(2)
        expect(response && response.statusCode).equal(200)
      })

      // Then
      // Should delete the row
      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings - 2)
    })
  })

  it('A Reporting Should be edited', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()

    /**
     * We need to wrap this test as the reporting list might have 1 ou 2 value, as another test might convert
     * an OBSERVATION to an INFRACTION_SUSPICION in the same running Cypress machine
     */
    cy.get('*[data-cy="side-window-current-reportings"]').then($reportingList => {
      const numberOfReportings = Cypress.$($reportingList).length
      cy.log(`${numberOfReportings} reportings found in the list`)
      assert(numberOfReportings === 1 || numberOfReportings === 2, 'There Should be 1 or 2 reportings')

      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings)

      // When
      cy.get('[data-cy="side-window-edit-reporting"]').eq(0).click()
      cy.get('[data-cy="new-reporting-title"]').type(
        '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace} km'
      )
      cy.get('[data-cy="new-reporting-select-natinf"]').click()
      cy.wait(200)
      cy.get('.rs-picker-search-bar-input').type('maille{enter}')
      cy.wait(200)
      cy.get('[data-cy="new-reporting-create-button"]').click()

      // Then
      cy.wait('@updateReporting').then(({ request, response }) => {
        expect(request.body.natinfCode).equal(23581)
        expect(request.body.title).contains('Suspicion de chalutage dans les 3  km')
        expect(response && response.statusCode).equal(200)
      })
      cy.wait(200)

      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings)
      // The DML is modified as this is the DML fetched from the vessels table
      cy.get('*[data-cy="side-window-current-reportings"]').first().contains('DML 56')
      cy.get('*[data-cy="side-window-current-reportings"]').first().contains(23581)
    })
  })

  it('A Reporting Should be edited with the reporting type modified ', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()

    /**
     * We need to wrap this test as the reporting list might have 1 ou 2 value, as another test might convert
     * an OBSERVATION to an INFRACTION_SUSPICION in the same running Cypress machine
     */
    cy.get('*[data-cy="side-window-current-reportings"]').then($reportingList => {
      const numberOfReportings = Cypress.$($reportingList).length
      cy.log(`${numberOfReportings} reportings found in the list`)
      assert(numberOfReportings === 1 || numberOfReportings === 2, 'There Should be 1 or 2 reportings')

      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings)

      // When
      cy.get('[data-cy="side-window-edit-reporting"]').eq(0).click()
      cy.get('[data-cy="new-reporting-select-observation-reporting-type"]').click()
      cy.wait(500)
      cy.get('[data-cy="new-reporting-create-button"]').click()

      // Then
      cy.wait('@updateReporting').then(({ request, response }) => {
        expect(request.body.type).contains('OBSERVATION')
        expect(response && response.statusCode).equal(200)
      })
      cy.wait(50)

      cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', numberOfReportings - 1)
    })
  })

  it('A reporting Should be downloaded', () => {
    // Given
    cy.cleanFiles()
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-SA"]').click()
    cy.get('.rs-checkbox-checker').eq(0).click({ timeout: 10000 })

    // When
    cy.get('[title="Télécharger 1 signalement"]').click()

    // Then
    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should(
          'contains',
          'Ouvert le,DML concernée,Origine,Titre,Description,NATINF,Pavillon,Navire,CFR,Marquage ext.,C/S,Navire sous charte,Façade'
        )
        .should(
          'contains',
          '"Alerte auto.","12 milles - Pêche sans droits historiques","","2610","FR","PROMETTRE INTÉRIEUR SAINT","ABC000232227","ZJ472279","TMG5756","NON","SA"'
        )
    })
  })
})
