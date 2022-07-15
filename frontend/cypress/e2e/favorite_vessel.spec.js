/// <reference types="cypress" />

const port = Cypress.env('PORT') ? Cypress.env('PORT') : 3000

context('Favorite Vessel', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024)
    cy.visit(`http://localhost:${port}/#@-824534.42,6082993.21,8.70`)
    cy.get('*[data-cy^="first-loader"]', { timeout: 20000 }).should('not.exist')
    cy.url().should('include', '@-82')
    cy.wait(100)
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
    cy.get('.vessels').rightclick(460, 480, { timeout: 20000, force: true })
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
    cy.get('.vessels').click(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="sidebar-add-vessel-to-favorites"]')
      .should('have.css', 'background', 'rgb(107, 131, 158) none repeat scroll 0% 0%')

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
    cy.get('.vessels').rightclick(460, 480, { timeout: 20000, force: true })
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

  it('A favorite vessel track Should be seen on the map and the global track depth Should update the track',() => {
    cy.cleanScreenshots(2)

    // Given
    cy.get('*[data-cy="open-vessels-visibility"]').click()
    cy.get('*[data-cy="global-vessel-track-depth-twelve-hours"]').click()
    cy.get('*[data-cy="open-vessels-visibility"]').click()
    cy.get('.vessels').rightclick(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="favorite-vessels"]').click()

    // When
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').click()
    cy.wait(1500)

    // Then
    cy.get('.vessels').toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 300, y: 50, width: 400, height: 900 }
      }
    })

    cy.get('*[data-cy="open-vessels-visibility"]').click()
    cy.get('*[data-cy="global-vessel-track-depth-one-week"]').click()
    cy.wait(1500)

    cy.get('.vessels').toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 300, y: 50, width: 400, height: 900 }
      }
    })

    cy.get('*[data-cy^="close-vessel-track"]').click()
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')

    cy.cleanScreenshots(2)
  })
})
