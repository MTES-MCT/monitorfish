/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel sidebar reporting tab', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
  })

  it('Reporting Should contain the current reporting, archive or delete a reporting', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 20000 }).type('MARIAGE île')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.intercept('GET', `/bff/v1/vessels/reporting?internalReferenceNumber=ABC000180832&externalReferenceNumber=VP374069&IRCS=CG1312&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*`).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 20000 }).should('be.visible')
    cy.wait('@reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(2)
    cy.wait(100)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('ALERTE / 3 milles - Chaluts')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 7059')
    cy.get('*[data-cy="archive-reporting-card"]').eq(0).click()

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="reporting-card"]').should('not.exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history-button"]').click()
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history"]').should('exist')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-archive-year"]').eq(0).contains('2 suspicions d\'infractions')
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-archive-year"]').eq(0).click()
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('ALERTE / 3 milles - Chaluts')
    cy.get('*[data-cy="reporting-card"]').eq(1).contains('ALERTE / 3 milles - Chaluts')
    cy.get('*[data-cy^="vessel-search-selected-vessel-close-title"]', { timeout: 20000 }).click()

    // Reporting Should be deleted and not found in the archived reporting nor in the map
    cy.get('*[data-cy^="vessel-labels"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="map-property-trigger"]', { timeout: 20000 })
      .filter(':contains("de risque des navires")')
      .click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('not.exist')
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 20000 }).type('PROMETTRE')
    cy.intercept('GET', '/bff/v1/vessels/reporting?internalReferenceNumber=ABC000232227&externalReferenceNumber=ZJ472279&IRCS=TMG5756&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*').as('reportingTwo')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 20000 }).should('be.visible')
    cy.wait('@reportingTwo')
    cy.wait(100)
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(2)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('ALERTE / 12 milles - Pêche sans droits historiques')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 2610')
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).click()
    // First, we do not confirm the reporting deletion
    cy.get('*[data-cy="close-reporting-deletion-modal"]').click()
    cy.get('*[data-cy="delete-reporting-card"]').eq(0).click()
    // Then, we confirm the reporting deletion
    cy.get('*[data-cy="confirm-reporting-deletion-button"]').click()

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(1)
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-history-button"]').click()
    cy.get('*[data-cy="vessel-sidebar-reporting-tab-archive-year"]').eq(0).contains('Pas de signalement')
    cy.get('*[data-cy="reporting-card"]').should('not.exist')
  })

  it('An infraction suspicion reporting Should be added from the reporting form', () => {
    // Given
    cy.get('*[data-cy="vessel-search-input"]', { timeout: 20000 }).type('MARIAGE île')
    cy.get('*[data-cy="vessel-search-item"]', { timeout: 20000 }).eq(0).click()
    cy.get('*[data-cy="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.intercept('GET', `/bff/v1/vessels/reporting?internalReferenceNumber=ABC000180832&externalReferenceNumber=VP374069&IRCS=CG1312&vesselIdentifier=INTERNAL_REFERENCE_NUMBER*`).as('reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').click({ timeout: 20000 })
    cy.get('*[data-cy="vessel-reporting"]', { timeout: 20000 }).should('be.visible')
    cy.wait('@reporting')
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(2)
    cy.wait(100)

    cy.get('*[data-cy="vessel-sidebar-open-reporting"]').click()
    cy.get('*[data-cy="new-reporting-reporting-actor-UNIT"]').click()
    cy.get('*[data-cy="new-reporting-select-unit"]').click()
    cy.get('[data-key="ULAM 56"] > .rs-picker-select-menu-item').click()
    cy.get('*[data-cy="new-reporting-author-contact"]').type('Jean Bon (0612365896)')
    cy.get('*[data-cy="new-reporting-title"]').type('Sortie non autorisée')
    cy.get('*[data-cy="new-reporting-description"]').type('Ce navire ne devrait pas être en mer, il n\'a plus de points sur son permis')
    cy.get('*[data-cy="new-reporting-select-natinf"]').click()
    cy.get('[data-key="2608"] > .rs-picker-select-menu-item').click()
    cy.get('*[data-cy="new-reporting-select-dml"]').click()
    cy.get('[data-key="DML 22"] > .rs-picker-select-menu-item').click()
    cy.get('*[data-cy="new-reporting-create-button"]').scrollIntoView().click()

    // Then
    cy.get('*[data-cy="vessel-menu-reporting"]').contains(3)
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('ULAM 56 / Sortie non autorisée')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Ce navire ne devrait pas être en mer, il n\'a plus de points sur son permis')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('Émetteur: Jean Bon (0612365896)')
    cy.get('*[data-cy="reporting-card"]').eq(0).contains('NATINF 2608')
  })
})
