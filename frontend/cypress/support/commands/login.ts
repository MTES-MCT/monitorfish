export function login(user: string) {
  cy.session(user, () => {
    cy.visit('/login')
    cy.wait(500)

    cy.clickButton('Se connecter avec Cerbère')

    // Login with Keycloak
    cy.get('[name="username"]').type(user)
    cy.get('[name="password"]').type('fish')
    cy.get('[name="login"]').click()

    cy.wait(5000)
  })
}
