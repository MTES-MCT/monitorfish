/* eslint-disable no-undef */
/// <reference types="cypress" />
const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessels list', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,7.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Vessels Should be filtered and previewed on the map', () => {
    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ scrollBehavior: false, timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]')
      .filter(':contains("étiquettes des navires")')
      .click({ timeout: 20000 })

    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[class^="rs-picker-tag-wrapper"]').eq(0).type('France{enter}')
    cy.get('*[data-cy^="vessels-list-box-filter"]').click({ timeout: 20000 })
    cy.wait(200)
    cy.get('body').click(60, 230, { timeout: 20000 })
    cy.wait(200)
    cy.get('body').click(700, 650, { timeout: 20000 })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('12 navires')

    // When
    cy.get('*[data-cy^="preview-filtered-vessels"]').click({ timeout: 20000 })
    cy.wait(500)
    cy.get('*[data-cy^="vessel-label-text"]').should('have.length', 12)
    cy.get('.vessels').click(63, 456, { force: true })
    cy.get('*[data-cy^="vessel-summary-latitude"]', { timeout: 20000 }).contains('-')

    // Back to vessels list
    cy.get('*[data-cy^="back-to-vessels-list"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('12 navires')
  })

  it('Vessels Should be filtered based on their location at port', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('960 navires')

    // When
    cy.get('*[data-cy^="filter-vessel-at-port"]').click()
    cy.wait(500)

    // Then
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('803 navires')

    // Then re-show the vessels at port
    cy.get('*[data-cy^="filter-vessel-at-port"]').click()
    cy.wait(500)

    cy.get('*[data-cy^="vessel-list-table-count"]').contains('960 navires')
  })

  it('Vessels Should not be downloadable When no vessels selected', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="download-vessels-modal"]').should('be.disabled')

    // When
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group-fixed-left > .table-content-editing ' +
      '> .rs-table-cell-content > .rs-checkbox > .rs-checkbox-checker').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="download-vessels-modal"]').should('not.be.disabled')
    cy.get('*[data-cy^="download-vessels-modal"]').click()
  })

  it('Vessels Should be downloaded When a vessel is selected', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 20000 })
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group-fixed-left > .table-content-editing ' +
      '> .rs-table-cell-content > .rs-checkbox > .rs-checkbox-checker').click({ timeout: 20000 })
    cy.get('*[data-cy="download-vessels-modal"]').click()

    // When
    cy.get('*[data-cy="download-vessels"]').click()

    // Then
    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout
      return cy.readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should('contains', 'Quartier,CFR,C/S,Nom,GDH (UTC),MMSI,Latitude,Longitude,Cap,Vitesse')
        .should('contains', '"Duboisdan","ABC000342127","KJ8767","PITIÉ LUI RÊVE"')
        .should('contains', '"210825304","49° 21′ 50″ N","000° 04′ 48″ E"')
    })
  })
})
