export function login(user: string) {
  cy.session(user, () => {
    cy.visit('/login')
    cy.wait(500)

    cy.postLoginToKeycloak(user)

    cy.clickButton('Se connecter avec Cerbère')
    cy.wait(2000)
  })
}
