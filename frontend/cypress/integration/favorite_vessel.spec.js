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

  it('A favorite vessel track Should be seen on the map', { retries: { runMode: 0, openMode: 0 }},() => {
    // Given
    cy.get('.vessels').rightclick(460, 480, { timeout: 20000, force: true })
    cy.get('*[data-cy="add-vessel-to-favorites"]').click()
    cy.get('*[data-cy="favorite-vessels"]').click()

    // When
    cy.get('*[data-cy="favorite-vessel-show-vessel-track"]').click()
    cy.wait(1500)

    // Then
    cy.get('.vessels').toMatchImageSnapshot({
      screenshotConfig: {
        clip: { x: 300, y: 100, width: 400, height: 500 }
      }
    })
    cy.get('*[data-cy^="close-vessel-track"]').click()
    cy.get('*[data-cy^="close-vessel-track"]').should('not.exist')
  })
})
