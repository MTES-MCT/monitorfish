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
  it('Should allow a Cerbère user within an authorized organizational unit', () => {
    logInWithoutSession('cerbereUser')

    cy.url().should('not.contain', '/register')
    cy.url().should('not.contain', '/log_in')
  })

  it('Should reject a Cerbère user outside the authorized organizational units', () => {
    logInWithoutSession('lambdaUser')

    cy.url().should('contain', '/register')
  })

  it('Should only allow an external user once added to an administration', () => {
    logInWithoutSession('externalUnlisted')
    cy.url().should('contain', '/register')

    cy.login('superuser')
    cy.request('PUT', '/bff/v1/admin/users/administrations/GENDARMERIE_NATIONALE', { emails: ['someone@external.fr'] })

    logInWithoutSession('externalUnlisted')
    cy.url().should('not.contain', '/register')
    cy.url().should('not.contain', '/log_in')

    // Reset
    cy.login('superuser')
    cy.request('PUT', '/bff/v1/admin/users/administrations/GENDARMERIE_NATIONALE', {
      emails: [],
      isEmptyListConfirmed: true
    })
  })

  it('Should reject a listed external user logging in with another identity provider than its administration', () => {
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
