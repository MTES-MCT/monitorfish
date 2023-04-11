/* eslint-disable no-undef */

context('Vessels list', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,7.70')
  })

  it('Vessels Should be filtered and previewed on the map', () => {
    // Given
    cy.get('*[data-cy^="vessel-labels"]').click({ scrollBehavior: false, timeout: 10000 })
    cy.get('*[data-cy^="map-property-trigger"]').filter(':contains("étiquettes des navires")').click({ timeout: 10000 })

    cy.wait(200)
    cy.get('*[data-cy="vessel-list"]').click({ timeout: 20000 })
    cy.wait(200)
    cy.get('*[data-cy="vessel-list-country-filter"]').click({ force: true })
    cy.get('*[data-cy="select-picker-menu-item-France"]').scrollIntoView().click()
    // Close the tag picker
    cy.get('.rs-modal-title').click()
    cy.wait(200)
    cy.get('*[data-cy^="vessels-list-box-filter"]').click({ timeout: 10000 })
    cy.wait(200)
    cy.get('body').click(60, 230, { timeout: 10000 })
    cy.wait(200)
    cy.get('body').click(700, 650, { timeout: 10000 })
    cy.wait(200)
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('12 navires')

    // When
    cy.get('*[data-cy^="preview-filtered-vessels"]').click({ timeout: 10000 })
    cy.wait(500)
    cy.get('*[data-cy^="vessel-label-text"]').should('have.length', 12)
    cy.get('.VESSELS_POINTS').click(63, 456, { force: true })
    cy.get('*[data-cy^="vessel-summary-latitude"]', { timeout: 10000 }).should('not.exist')

    // Back to vessels list
    cy.get('*[data-cy^="back-to-vessels-list"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="vessel-list-table-count"]').contains('12 navires')
  })

  it('Vessels Should be filtered based on their location at port', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 10000 })
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
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 10000 })
    cy.get('*[data-cy^="download-vessels-modal"]').should('be.disabled')

    // When
    cy.get(
      '[aria-rowindex="2"] > .rs-table-cell-group-fixed-left > .table-content-editing ' +
        '> .rs-table-cell-content > .rs-checkbox > .rs-checkbox-checker'
    ).click({ timeout: 10000 })

    // Then
    cy.get('*[data-cy^="download-vessels-modal"]').should('not.be.disabled')
    cy.get('*[data-cy^="download-vessels-modal"]').click()
  })

  it('Vessels Should be downloaded When a vessel is selected', () => {
    // Given
    cy.get('*[data-cy^="vessel-list"]').click({ timeout: 10000 })
    cy.get(
      '[aria-rowindex="2"] > .rs-table-cell-group-fixed-left > .table-content-editing ' +
        '> .rs-table-cell-content > .rs-checkbox > .rs-checkbox-checker'
    ).click({ timeout: 10000 })
    cy.get('*[data-cy="download-vessels-modal"]').click()

    // When
    cy.get('*[data-cy="download-vessels"]').click()

    // Then
    cy.wait(400)
    cy.exec('cd cypress/downloads && ls').then(result => {
      const downloadedCSVFilename = result.stdout

      return cy
        .readFile(`cypress/downloads/${downloadedCSVFilename}`)
        .should('contains', 'Quartier,CFR,C/S,Nom,GDH (UTC),MMSI,Latitude,Longitude,Cap,Vitesse')
        .should('contains', '"Duval","ABC000021309","","GENS SAISON PARMI"')
        .should('contains', '"","48°43′41″N","002°44′53″W"')
    })
  })
})
