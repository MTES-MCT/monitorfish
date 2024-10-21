export type LoadPathOptions = {
  isSuperUser?: boolean
  visitOptions?: Partial<Cypress.VisitOptions>
}
Cypress.Commands.add('loadPath', (path: string, options?: LoadPathOptions): void => {
  cy.visit(path)

  cy.wait(500)
  cy.url().then((url: string) => {
    if (url.includes('login')) {
      cy.clickButton('Se connecter avec Cerbère')

      // Login with Keycloak
      cy.get('[name="username"]').type(options?.isSuperUser ? 'superuser' : 'user')
      cy.get('[name="password"]').type('fish')
      cy.get('[name="login"]').click()

      // There is a redirect to `/` after successful login
      cy.wait(500)

      cy.visit(path, options?.visitOptions)
    }
  })

  cy.url().should('include', path)

  cy.wait(2000)
})
