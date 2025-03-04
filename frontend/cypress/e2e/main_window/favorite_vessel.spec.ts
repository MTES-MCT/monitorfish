import { openVesselBySearch } from './utils'

context('Favorite Vessel', () => {
  beforeEach(() => {
    cy.login('superuser')
    cy.visit('/#@-824534.42,6082993.21,8.70')
    cy.wait(3000)
  })

  it('A favorite vessel Should be added to the list from the map', () => {
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
     * A favorite vessel Should be added to the list from the map
     */
    // Given
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')

    // When
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()

    // Then
    cy.get('*[title="Mes navires suivis"]').parent('div').contains(1)
    cy.get('*[data-cy="favorite-vessel-name"]').contains('PHENOMENE')

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[title="Mes navires suivis"]').parent('div').should('not.contain', '1')
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.clickButton('Mes navires suivis', { withoutScroll: true })

    /**
     * A favorite vessel Should be added to the list from the vessel sidebar
     */
    // Given
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
    cy.get('*[title="Mes navires suivis"]').parent('div').should('not.contain', '1')
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')

    // When
    openVesselBySearch('Pheno')
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').children().should('have.css', 'fill', 'rgb(229, 229, 235)')

    // Then
    cy.get('*[title="Mes navires suivis"]').parent('div').contains(1)
    cy.get('*[data-cy="favorite-vessel-name"]').contains('PHENOMENE')

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[title="Mes navires suivis"]').parent('div').should('not.contain', '1')
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
  })

  it('A favorite vessel track Should be shown and then the vessel sidebar opened', () => {
    // Given
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
    openVesselBySearch('Pheno')
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').click()
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 1)

    // When
    cy.get('*[data-cy="favorite-vessel-show-vessel-sidebar"]').click()

    // Then
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 0)
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.clickButton('Mes navires suivis', { withoutScroll: true })
  })

  it('A favorite vessel track Should be seen on the map and the global track depth Should update the track', () => {
    cy.cleanScreenshots(2)

    // Given
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.fill('Afficher depuis', '12 heures')
    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.clickButton('Mes navires suivis', { withoutScroll: true })

    // When
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').click()
    cy.wait(1500)

    // Then
    cy.get('.VESSELS_POINTS').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { height: 900, width: 400, x: 300, y: 50 }
      }
    })

    cy.clickButton('Affichage des dernières positions', { withoutScroll: true })
    cy.fill('Afficher depuis', '1 semaine')
    cy.wait(1500)

    cy.get('.VESSELS_POINTS').toMatchImageSnapshot({
      imageConfig: {
        threshold: 0.05,
        thresholdType: 'percent'
      },
      screenshotConfig: {
        clip: { height: 900, width: 400, x: 300, y: 50 }
      }
    })

    cy.get('*[data-cy^="close-vessel-track"]').click({ force: true })
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')

    cy.cleanScreenshots(2)
  })
})
