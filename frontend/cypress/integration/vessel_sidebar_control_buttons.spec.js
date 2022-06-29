/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel sidebar controls buttons', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('Vessel track depth Should be changed', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })

    // Then
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains('0 nds', { timeout: 20000 })

    // And click on a position to zoom in
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="1"] > .rs-table-cell-content').trigger('pointermove', { pointerId: 1, force: true })
    cy.get('[aria-rowindex="6"] > .rs-table-cell-group > [aria-colindex="1"] > .rs-table-cell-content').click({ force: true })

    // The table should be sorted in ascending datetime order
    cy.get('.rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content').click({ timeout: 20000 })
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content').contains('8.7 nds', { timeout: 20000 })
  })

  it('Vessel track dates Should be changed When walking in fishing trips', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })

    // Then
    // cy.get('.rs-picker-toggle-value').contains('16-02-2019')
    // cy.get('.rs-picker-toggle-value').contains('15-10-2019')
    // cy.get('*[data-cy^="vessel-track-depth-three-days"]').should('not.have.class', 'rs-radio-checked')

    // Then, back to another trip depth of three days
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Vessel track dates Should be changed from the agenda', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000 })
    cy.get('.rs-picker-daterange').click({ timeout: 20000 })
    cy.get('.rs-calendar-table-cell')
      .contains('14')
      .click({ timeout: 20000 })
    cy.get('.rs-calendar-table-cell')
      .contains('26')
      .click({ timeout: 20000 })

    cy.intercept('GET', '/bff/v1/vessels/positions*').as('getPositions')
    cy.get('.rs-picker-daterange-panel').within(() => {
      cy.get('button').contains('OK').click({ timeout: 20000 })
    })

    // Then
    cy.wait('@getPositions')
      .then(({ request, response }) => {
        expect(request.url).contains('14T00:00:00.000Z')
        expect(request.url).contains('26T23:59:59.000Z')
      })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').should('not.have.class', 'rs-radio-checked')
    cy.get('.rs-picker-daterange').within(() => {
      cy.get('.rs-picker-toggle-value').contains(/14-\d{2}-\d{4}/)
      cy.get('.rs-picker-toggle-value').contains(/26-\d{2}-\d{4}/)
    })
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })

    cy.get('*[data-cy^="custom-dates-showed-text"]').contains(/^14\/\d{2}\/\d{2}/)
    cy.get('*[data-cy^="custom-dates-showed-text"]').contains(/^26\/\d{2}\/\d{2}/)
  })

  it('Fishing activities Should be seen on the vessel track and showed from the map', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })

    // Then
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy^="fishing-activity-name"]').eq(2).scrollIntoView().click({ force: true, timeout: 20000 })
    cy.get('#OOF20191030059909').should('be.visible')
    cy.get('#OOF20190627059908').should('not.be.visible')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })

  it('Vessel track Should fit the view box When I click on animate to track', () => {
    cy.cleanScreenshots(1)

    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="animate-to-track"]').click({ timeout: 20000 })
    cy.wait(1500)

    // Then, the last position should be positioned in the bottom of the window
    cy.get('.vessels').eq(0).toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 210, y: 0, width: 500, height: 840 }
      }
    })

    cy.cleanScreenshots(1)
  })
})
