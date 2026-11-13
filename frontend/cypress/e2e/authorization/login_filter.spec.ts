/**
 * The local Keycloak mimics ProConnect: users have an `idp_id` (Cerbère or another identity provider)
 * and Cerbère users have an `organizational_unit` (see infra/dev/keycloak/realm-monitor-dev.json).
 */
function logInWithoutSession(username: string) {
  cy.clearAllCookies()
  cy.clearAllLocalStorage()
  cy.clearAllSessionStorage()

  cy.visit('/log_in')
  cy.clickButton("S'identifier avec ProConnect")

  cy.get('[name="username"]').type(username)
  cy.get('[name="password"]').type('fish')
  cy.get('[name="login"]').click()
}

context('Authorization > Login filter', () => {
  it('Should filter users by authorized service, administration list and identity provider', () => {
    logInWithoutSession('cerbereUser')
    cy.url().should('not.contain', '/register')
    cy.url().should('not.contain', '/log_in')

    logInWithoutSession('lambdaUser')
    cy.url().should('contain', '/register')

    logInWithoutSession('externalUnlisted')
    cy.url().should('contain', '/register')

    cy.login('superuser')
    cy.request('PUT', '/bff/v1/admin/users/administrations/GENDARMERIE_NATIONALE', { emails: ['someone@external.fr'] })

    logInWithoutSession('externalUnlisted')
    cy.url().should('not.contain', '/register')
    cy.url().should('not.contain', '/log_in')

    // `someone@external.fr` logs in with Extensso, whereas Douane users must log in with the DGDDI SSO
    cy.login('superuser')
    cy.request('PUT', '/bff/v1/admin/users/administrations/DOUANE', {
      emails: ['another@email.com', 'someone@external.fr']
    })

    logInWithoutSession('externalUnlisted')
    cy.url().should('contain', '/register')

    // Reset
    cy.login('superuser')
    cy.request('PUT', '/bff/v1/admin/users/administrations/DOUANE', { emails: ['another@email.com'] })
  })
})
