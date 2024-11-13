/* eslint-disable no-undef */

context('BackOffice > Producer Organization Membership > Table', () => {
  beforeEach(() => {
    cy.intercept('GET', `/bff/v1/producer_organization_memberships`).as('memberships')

    cy.login('superuser')

    cy.visit('/backoffice/producer_organization_membership')
    cy.wait('@memberships')
  })

  it('Should render the membership table', () => {
    // Then
    cy.get('[data-cy="producer_organization_memberships_results"]').contains('12 résultats')
    cy.get('.Table-SimpleTable tr').should('have.length', 13)

    cy.fill('Rechercher...', 'FAK')
    cy.get('[data-cy="producer_organization_memberships_results"]').contains('1 résultat')
    cy.get('.Table-SimpleTable tr').should('have.length', 2)
  })
})
