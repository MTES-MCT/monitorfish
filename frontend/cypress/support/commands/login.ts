Cypress.Commands.add('login', (user: string): void => {
  cy.session(user, () => {
    cy.visit('/login')
    cy.wait(500)

    cy.kcLogin(user)

    cy.clickButton('Se connecter avec Cerbère')
    cy.wait(2000)
  })
})
