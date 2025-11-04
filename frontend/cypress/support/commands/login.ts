export function login(user: string) {
  cy.session(user, () => {
    // We use a Cypress session to inject a Local Storage key
    // so that we can detect when the browser app is running in Cypress.
    // https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-preserve-cookies--localStorage-in-between-my-tests
    cy.window().then(window => {
      window.localStorage.setItem('IS_CYPRESS', 'true')
    })
    cy.wait(100)

    cy.visit('/log_in')
    cy.wait(500)

    cy.clickButton("S'identifier avec ProConnect")

    // Login with Keycloak
    cy.get('[name="username"]').type(user)
    cy.get('[name="password"]').type('fish')
    cy.get('[name="login"]').click()

    cy.wait(5000)
  })
}
