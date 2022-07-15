/* eslint-disable no-undef */
/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Vessel sidebar fishing tab', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(200)
  })

  it('FAR and DIS messages resume Should notify that all messages are not acknowledged', () => {
    // Given
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).click()
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 20000 }).type('U_W0')
    cy.get('*[data-cy^="vessel-search-item"]', { timeout: 20000 }).eq(1).click()
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]', { timeout: 20000 }).should('be.visible')
    // FAR messages are not acknowledged
    cy.get('*[data-cy="vessel-fishing-resume-title"]').eq(1).contains('aucune capture acquittée', { timeout: 20000 })
    // DIS messages are not acknowledged
    cy.get('*[data-cy="vessel-fishing-resume-title"]').eq(2).contains('aucun rejet acquitté', { timeout: 20000 })

    cy.get('*[data-cy="fishing-resume-not-acknowledged-icon"]').should('have.length', 2)
  })

  it('Fishing Should contain the vessel fishing resume', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-menu-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-gears"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-gears"]').contains('Trémails et filets maillants combinés (GTN)', { timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains('1 message - 2256 kg pêchés au total', { timeout: 20000 })
  })

  it('Fishing trips Should be walkable', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')

    // Then
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains('Marée n°9463715', { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains('Marée n°9463714', { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-resume-title"]').contains('1 message - aucune capture', { timeout: 20000 })

    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-trip-number"]').contains('Marée n°9463715', { timeout: 20000 })
  })

  it('Fishing Should contain the vessel ERS logbook messages', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="vessel-fishing-message"]').should('have.length', 12)
    cy.get('*[data-cy="vessel-fishing-message"]').first().contains('Départ', { timeout: 20000 })
    cy.get('*[data-cy="vessel-fishing-message"]').first().contains('Al Jazeera Port le 11/10/2019 à 01h40 (UTC)', { timeout: 20000 })

    cy.get('*[data-cy="vessel-fishing-message"]').eq(1).contains('Sortie d\'une zone d\'effort')
    cy.get('*[data-cy="vessel-fishing-message-body"]').eq(1).contains('Message envoyé via e-sacapt')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(2).contains('Traversée d\'une zone d\'effort')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(3).contains('Entrée dans une zone d\'effort')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(4).contains('Déclaration de capture')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(4).siblings().eq(1).contains('ANCIEN MESSAGE')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(5).contains('Déclaration de capture')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(5).siblings().eq(1).contains('MESSAGE CORRIGÉ')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(6).contains('Déclaration d\'inspection')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(6).siblings().eq(1).contains('MESSAGE CORRIGÉ')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(7).contains('Déclaration de rejets')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(8).contains('Fin de pêche')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(9).contains('Préavis (notification de retour au port)')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(10).contains('Retour au port')

    cy.get('*[data-cy="vessel-fishing-message"]').eq(11).contains('Débarquement')
    cy.get('*[data-cy="vessel-fishing-message"]').eq(11).siblings().eq(1).contains('MESSAGE SUPPRIMÉ')
  })

  it('Fishing Should contain the vessel FLUX logbook messages', () => {
    // Given
    cy.get('.vessels').click(460, 40, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy="vessel-fishing-message"]').should('have.length', 24)
    cy.get('*[data-cy="vessel-fishing-message"]').first().contains('Départ', { timeout: 20000 })
    cy.get('*[data-cy="vessel-fishing-message"]').first().contains('ESCAR le 06/05/2020 à 11h39 (UTC)', { timeout: 20000 })

    cy.get('*[data-cy="vessel-fishing-message"]').eq(4).contains('Déclaration de capture')
    cy.get('*[data-cy^="logbook-haul-number"]').should('have.length', 2)
  })

  it('Fishing activities Should be changed according to the actual trip When walking in fishing trips', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })

    // When
    cy.wait(200)
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('previousTripPositions')
    cy.get('*[data-cy^="vessel-fishing-previous-trip"]').click({ timeout: 20000 })

    // Then
    cy.wait('@previousTripPositions').its('response.url')
      .should('eq', 'http://localhost:8880/bff/v1/vessels/positions?internalReferenceNumber=FAK000999999' +
        '&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=CUSTOM' +
        '&afterDateTime=2019-02-16T21:05:00.000Z&beforeDateTime=2019-10-15T13:01:00.000Z')

    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 4)
    cy.get('*[data-cy="custom-dates-showed-text"]').contains('Piste affichée du 16/02/19 au 15/10/19')

    // Hide fishing activities
    cy.get('*[data-cy^="show-all-fishing-activities-on-map"]').click({ timeout: 20000 })
    cy.intercept('GET', '/bff/v1/vessels/positions*').as('previousTripPositions')
    cy.get('*[data-cy^="vessel-fishing-next-trip"]').click({ timeout: 20000 })
    cy.wait('@previousTripPositions').its('response.url')
      .should('eq', 'http://localhost:8880/bff/v1/vessels/positions?internalReferenceNumber=FAK000999999' +
        '&externalReferenceNumber=DONTSINK&IRCS=CALLME&vesselIdentifier=INTERNAL_REFERENCE_NUMBER&trackDepth=CUSTOM' +
        '&afterDateTime=2019-10-10T22:06:00.000Z&beforeDateTime=2019-10-22T12:06:00.000Z')
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
    cy.get('*[data-cy="custom-dates-showed-text"]').contains('Piste affichée du 10/10/19 au 22/10/19')

    // Go back to the default track depth
    cy.get('*[data-cy="custom-dates-show-last-positions"]').click()
    cy.get('*[data-cy="custom-dates-showed-text"]').should('not.exist')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-track-depth-twelve-hours"]').should('have.class', 'rs-radio-checked')
  })

  it('Single fishing activity Should be seen on map When clicking on the position icon', () => {
    // Given
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-sidebar"]', { timeout: 20000 }).should('be.visible')
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })
    cy.get('*[data-cy^="vessel-track-depth-three-days"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-track-depth-selection"]').click({ timeout: 20000, force: true })

    // When
    cy.get('*[data-cy^="vessel-menu-fishing"]').click({ timeout: 20000 })
    cy.get('*[data-cy^="vessel-fishing-see-all"]').click({ timeout: 20000 })
    cy.scrollTo(0, 380)
    cy.get('*[data-cy^="show-fishing-activity"]').eq(6).scrollIntoView().click({ timeout: 20000 })

    // Then
    cy.get('*[data-cy^="fishing-activity-name"]').should('exist').should('have.length', 1)

    // Then hide the fishing activity
    cy.get('*[data-cy^="hide-fishing-activity"]').eq(0).click({ timeout: 20000 })
    cy.get('*[data-cy^="fishing-activity-name"]').should('not.exist')
  })
})
