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
    cy.get('*[data-cy^="side-window-sub-menu-NAMO-number"]').contains('3')
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 3)
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('MARIAGE ÎLE HASARD')
    cy.get('*[data-cy="side-window-current-reportings"]').last().contains('RENCONTRER VEILLER APPARTEMENT"')

    // When we re-order by date
    cy.get('[data-cy="table-order-by-validationDate"]').click()

    // Then it is re-ordered
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('RENCONTRER VEILLER APPARTEMENT"')
    cy.get('*[data-cy="side-window-current-reportings"]').last().contains('MARIAGE ÎLE HASARD')

    // When we search by vessel name
    cy.get('*[data-cy^="side-window-reporting-search"]').type('RENCONTRER')

    // Then there is only the searched vessel
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('RENCONTRER VEILLER APPARTEMENT"')
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)
  })

  it('Reportings Should be deleted', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/delete').as('deleteReportings')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.wait(200)
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 3)

    // When
    // Select and delete a reporting
    cy.get('.rs-checkbox-wrapper').eq(1).click()
    cy.get('.rs-checkbox-wrapper').last().click()
    cy.get('*[data-cy="delete-reporting-cards"]').click({ force: true })
    cy.wait('@deleteReportings').then(({ request, response }) => {
      expect(request.body.toString()).contains('1,7')
      expect(response && response.statusCode).equal(200)
    })

    // Then
    // Should delete the row
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)
  })

  it('A Reporting Should be edited', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)

    // When
    cy.get('[data-cy="side-window-edit-reporting"]').click()
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
      expect(request.body.natinfCode).contains('23581')
      expect(request.body.title).contains('Suspicion de chalutage dans les 3  km')
      expect(response && response.statusCode).equal(200)
    })
    cy.wait(200)

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)
    // The DML is modified as this is the DML fetched from the vessels table
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('DML 56')
    cy.get('*[data-cy="side-window-current-reportings"]').first().contains('23581')
  })

  it('A Reporting Should be edited with the reporting type modified ', () => {
    // Given
    cy.intercept('PUT', 'bff/v1/reportings/6/update').as('updateReporting')
    cy.get('*[data-cy="side-window-reporting-tab"]').click()
    cy.get('[data-cy="side-window-sub-menu-NAMO"]').click()
    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 1)

    // When
    cy.get('[data-cy="side-window-edit-reporting"]').click()
    cy.get('[data-cy="new-reporting-select-observation-reporting-type"]').click()
    cy.wait(500)
    cy.get('[data-cy="new-reporting-create-button"]').click()

    // Then
    cy.wait('@updateReporting').then(({ request, response }) => {
      expect(request.body.type).contains('OBSERVATION')
      expect(response && response.statusCode).equal(200)
    })
    cy.wait(50)

    cy.get('*[data-cy="side-window-current-reportings"]').should('have.length', 0)
  })
})
