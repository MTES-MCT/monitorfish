/* eslint-disable no-undef */

context('Authorization', () => {
  beforeEach(() => {
    cy.loadPath('/#@-824534.42,6082993.21,8.70')
  })

  it('Should redirect to login page if an API request is Unauthorized', () => {
    // When
    cy.intercept('GET', `/bff/v1/vessels/search*`, { statusCode: 401 }).as('searchVessel')
    cy.get('*[data-cy^="vessel-search-input"]', { timeout: 10000 }).type('Pheno')
    cy.wait('@searchVessel')

    // Then
    cy.location('pathname').should('eq', '/login')
  })
})
