/// <reference types="cypress" />

context('VesselSidebar', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit('http://localhost:3000/#@-824534.42,6082993.21,8.70')
    cy.wait(1000)
  })

  it('Resume Should be opened When clicking on a vessel', () => {
    // When
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // Then
    cy.get('*[data-cy^="cfr"]').contains("GBR000B14430")
    cy.get('*[data-cy^="vessel-name"]').contains("CABO ORTEGAL (GB)")
  })

  it('Identity Should contain the vessel identity', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-identity"]').click()

    // Then
    cy.get('*[data-cy^="vessel-identity-gears"]').contains("Sennes danoises (SDN)")
  })

  it('Fishing Should contain the vessel fishing resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]').contains("Trémails et filets maillants combinés (GTN)")
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains("3 messages - 3791.5 kg pêchés au total")
  })

  it('Fishing Should contain the vessel DEP message', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click()
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click()

    // Then
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Départ")
    cy.get('*[data-cy^="vessel-fishing-dep-message"]').contains("Al Jazeera Port le 11/10/2019 à 01h40 (UTC)")

  })

  it.only('Controls Should contain the controls resume', () => {
    // Given
    cy.get('.vessels').click(460, 480)
    cy.wait(200)

    // When
    cy.get('*[data-cy^="vessel-menu-controls"]').click()

    // Then
    cy.get('*[data-cy^="vessel-controls-year"]').first().contains("2 contrôles, 2 infractions")

    // When
    cy.get('*[data-cy^="vessel-controls-year"]').first().click()

    // Then
    cy.get('*[data-cy^="vessel-controls-title"]').first().contains("CONTRÔLE DU 19/04/2021")
  })

})
