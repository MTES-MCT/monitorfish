import { openVesselBySearch } from './utils'

/**
 * The `superuser` profile is seeded (see `V666.43__Insert_dummy_favorite_vessels`) with two favorite
 * vessels: MALOTRU and PHENOMENE. Each test restores that baseline so specs stay order-independent.
 */
context('Favorite Vessel', () => {
  beforeEach(() => {
    cy.intercept('GET', '/bff/v1/favorite_vessels').as('getFavoriteVessels')
    cy.intercept('PUT', '/bff/v1/favorite_vessels').as('addFavoriteVessel')
    cy.intercept('DELETE', '/bff/v1/favorite_vessels').as('deleteFavoriteVessel')

    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)
  })

  it('The favorite vessels saved on the user profile Should be listed', () => {
    /**
     * Opening the box Should close other boxes
     */
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
    cy.get('*[data-cy="layers-sidebar-box"]').should('not.exist')

    // Open the layers box
    cy.clickButton('Arbre des couches', { withoutScroll: true })
    cy.get('*[data-cy="favorite-vessels-box"]').should('not.exist')

    // Re-open the favorite vessels box
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
    cy.get('*[data-cy="layers-sidebar-box"]').should('not.exist')

    /**
     * The vessels seeded on the user profile Should be listed, sorted by name
     */
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 2)
    cy.get('*[data-cy="favorite-vessel-name"]').eq(0).should('contain', 'MALOTRU')
    cy.get('*[data-cy="favorite-vessel-name"]').eq(1).should('contain', 'PHENOMENE')
    cy.get('*[title="Mes navires suivis"]').prev().contains(2)
  })

  it('A favorite vessel Should be removed with the delete button and re-added from the map', () => {
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 2)

    // When removing PHENOMENE (last row, list is sorted by name)
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').last().click()
    cy.wait('@deleteFavoriteVessel')

    // Then only MALOTRU remains
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 1)
    cy.get('*[data-cy="favorite-vessel-name"]').should('contain', 'MALOTRU')
    cy.get('*[title="Mes navires suivis"]').prev().contains(1)

    // When re-adding PHENOMENE from the map right-click menu
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.wait('@addFavoriteVessel')

    // Then it is back in the list
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 2)
    cy.get('*[data-cy="favorite-vessel-name"]').eq(1).should('contain', 'PHENOMENE')
    cy.get('*[title="Mes navires suivis"]').prev().contains(2)
  })

  it('A favorite vessel Should be toggled from the vessel sidebar star', () => {
    cy.clickButton('Mes navires suivis', { withoutScroll: true })

    // Given PHENOMENE is a favorite, its sidebar star is filled
    openVesselBySearch('Pheno')
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').children().should('have.css', 'fill', 'rgb(229, 229, 235)')

    // When un-starring it
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.wait('@deleteFavoriteVessel')

    // Then it is removed from the list and the star is empty
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').children().should('have.css', 'fill', 'none')
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 1)
    cy.get('*[title="Mes navires suivis"]').prev().contains(1)

    // When re-starring it
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.wait('@addFavoriteVessel')

    // Then it is back in the list and the star is filled
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').children().should('have.css', 'fill', 'rgb(229, 229, 235)')
    cy.get('*[data-cy="favorite-vessel-name"]').should('have.length', 2)
    cy.get('*[title="Mes navires suivis"]').prev().contains(2)
  })

  it('A favorite vessel track Should be shown and then the vessel sidebar opened', () => {
    cy.clickButton('Mes navires suivis', { withoutScroll: true })

    // PHENOMENE is the last row (list is sorted by name)
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').last().click()
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 1)

    // When opening its sidebar
    cy.get('*[data-cy="favorite-vessel-show-vessel-sidebar"]').last().click()

    // Then the track is replaced by the sidebar
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 0)
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()
  })

  it('A favorite vessel track Should be seen on the map and the global track depth Should update the track', () => {
    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.fill('Afficher depuis', '12 heures')
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.clickButton('Mes navires suivis', { withoutScroll: true })

    // When (PHENOMENE is the last row, list is sorted by name)
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').last().click()
    cy.wait(1500)

    // Then
    cy.getFeaturesFromLayer('VESSEL_TRACK').then(features => {
      expect(features.length).to.be.equal(7)
    })

    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.fill('Afficher depuis', '1 semaine')
    cy.wait(1500)

    cy.getFeaturesFromLayer('VESSEL_TRACK').then(features => {
      expect(features.length).to.be.equal(28)
    })

    cy.get('*[data-cy^="close-vessel-track"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
    cy.getFeaturesFromLayer('VESSEL_TRACK').then(features => {
      expect(features.length).to.be.equal(0)
    })
  })
})
