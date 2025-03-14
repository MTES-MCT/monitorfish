import { openVesselBySearch } from '../main_window/utils'

context('Vessel visibility', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-487249.11,6076055.47,15.77')
    cy.wait(1000)
  })

  it('Vessels at port Should be hidden and showed', () => {
    // Given
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 1)

    // When
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.get('*[data-cy="map-property-trigger"]')
      .filter(':contains("les navires au port")')
      .click({ force: true, timeout: 10000 })
    cy.wait(500)
    cy.get('#root').dblclick(560, 620, { timeout: 10000 })

    // Then
    cy.get('*[data-cy^="vessel-label-risk-factor"]').should('have.length', 12)
  })

  it('Vessels default track depth Should be taken into account', () => {
    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.fill('Afficher depuis', '1 semaine')
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })

    // When
    openVesselBySearch('Pheno')

    // Then
    cy.get('[title="Paramétrer l\'affichage de la piste VMS"]').click()
    cy.get('[name="vessel-track-depth"]').should('have.value', 'ONE_WEEK')
  })
})
