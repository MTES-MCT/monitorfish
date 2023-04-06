/// <reference types="cypress" />

context('Favorite Vessel', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Opening the box Should close other boxes', () => {
    cy.get('*[data-cy="favorite-vessels"]').click()
    cy.get('*[data-cy="layers-sidebar-box"]').should('be.not.visible')

    // Open the layers box
    cy.get('*[data-cy="layers-sidebar"]').click()
    cy.get('*[data-cy="favorite-vessels-box"]').should('be.not.visible')

    // Re-open the favorite vessels box
    cy.get('*[data-cy="favorite-vessels"]').click()
    cy.get('*[data-cy="layers-sidebar-box"]').should('be.not.visible')
  })

  it('A favorite vessel Should be added to the list from the map', () => {
    // Given
    cy.get('*[data-cy="favorite-vessels"]').click()
    cy.get('*[data-cy="favorite-vessels-number"]').contains(0)
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')

    // When
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()

    // Then
    cy.get('*[data-cy="favorite-vessels-number"]').contains(1)
    cy.get('*[data-cy="favorite-vessel-name"]').contains('PHENOMENE')

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[data-cy="favorite-vessels-number"]').contains(0)
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.get('*[data-cy="favorite-vessels"]').click()
  })

  it('A favorite vessel Should be added to the list from the vessel sidebar', () => {
    // Given
    cy.get('*[data-cy="favorite-vessels"]').click()
    cy.get('*[data-cy="favorite-vessels-number"]').contains(0)
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')

    // When
    cy.get('.VESSELS_POINTS').click(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').children().should('have.css', 'fill', 'rgb(229, 229, 235)')

    // Then
    cy.get('*[data-cy="favorite-vessels-number"]').contains(1)
    cy.get('*[data-cy="favorite-vessel-name"]').contains('PHENOMENE')

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[data-cy="favorite-vessels-number"]').contains(0)
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.get('*[data-cy="favorite-vessels"]').click()
  })

  it('A favorite vessel track Should be shown and then the vessel sidebar opened', () => {
    // Given
    cy.get('*[data-cy="favorite-vessels"]').click()
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').click()
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 1)

    // When
    cy.get('*[data-cy="favorite-vessel-show-vessel-sidebar"]').click()

    // Then
    cy.get('*[data-cy="close-vessel-track"]').should('have.length', 0)
    cy.get('*[data-cy="vessel-search-selected-vessel-close-title"]').click()

    // Delete the vessel
    cy.get('*[data-cy="favorite-vessel-delete-vessel"]').click()
    cy.get('*[data-cy="favorite-vessels-number"]').contains(0)
    cy.get('*[data-cy="favorite-vessel-name"]').should('not.exist')
    cy.get('*[data-cy="favorite-vessels"]').click()
  })

  it('A favorite vessel track Should be seen on the map and the global track depth Should update the track', () => {
    cy.cleanScreenshots(2)

    // Given
    cy.get('*[data-cy="vessel-visibility"]').click()
    cy.get('[data-cy="global-vessel-track-depth-twelve-hours"] input').click()
    cy.get('*[data-cy="vessel-visibility"]').click()
    cy.get('.VESSELS_POINTS').rightclick(460, 480, { force: true, timeout: 10000 })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="favorite-vessels"]').click()

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

    cy.get('*[data-cy="vessel-visibility"]').click()
    cy.get('*[data-cy="global-vessel-track-depth-one-week"]').click()
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

    cy.get('*[data-cy^="close-vessel-track"]').click()
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')

    cy.cleanScreenshots(2)
  })
})
