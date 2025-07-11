// import { encodeUriObject } from '../../src/utils/encodeUriObject'

const CUSTOM_ZONES_LOCALSTORAGE_KEY = 'persist:mainPersistorCustomZone'

context('Sidebars > Custom Zones', () => {
  it('A custom zone Should be showed and hidden', () => {
    cy.login('superuser')
    cy.visit('/#@-9649561.29,3849836.62,7.84')
    cy.wait(500)

    cy.get('*[title="Arbre des couches"]').click()
    cy.get('*[data-cy="custom-zones-toggle"]').click()

    // When it displays the zone at init
    cy.getFeaturesFromLayer('CUSTOM').then((features) => {
      expect(features.length).to.be.equal(1)
    })

    // Display the zone from the button
    cy.get('*[data-cy="custom-zone-display-button"]')
      .click()
      .then(() => {
        const customZonesItem = JSON.parse(localStorage.getItem(CUSTOM_ZONES_LOCALSTORAGE_KEY) ?? '')
        const zones = JSON.parse(customZonesItem.zones)
        expect(zones['b2f8aea3-7814-4247-98fa-ddc58c922d09'].isShown).equal(false)
      })
    cy.getFeaturesFromLayer('CUSTOM').then((features) => {
      expect(features.length).to.be.equal(0)
    })

    cy.get('*[data-cy="custom-zone-display-button"]').click()
    cy.getFeaturesFromLayer('CUSTOM').then((features) => {
      expect(features.length).to.be.equal(1)
    })

    cy.get('*[data-cy="custom-zone-zoom-button"]').click()

    // Remove the zone
    cy.get('*[data-cy="custom-zone-name"]').should('have.length', 1)
    cy.get('*[data-cy="custom-zone-remove-button"]').click()
    cy.get('*[data-cy="custom-zone-name"]').should('have.length', 0)
  })

  it('A custom zone Should be edited', () => {
    cy.login('superuser')
    cy.visit('/#@-9649561.29,3849836.62,7.84')
    cy.wait(500)
    cy.get('[title="Arbre des couches"]').click()
    cy.get('*[data-cy="custom-zones-toggle"]').click()

    // When
    cy.get('*[data-cy="custom-zone-edit-button"]').click()
    cy.fill('Nom de la zone', 'Une zone REG')
    cy.clickButton('Enregistrer')

    // Then
    cy.get('*[data-cy="custom-zone-name"]').scrollIntoView()
    cy.get('*[data-cy="custom-zone-name"]').contains('Une zone REG')
  })
})
