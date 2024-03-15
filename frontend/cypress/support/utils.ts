export function runBeforeEachHook() {
  // We use a Cypress session to inject inject a Local Storage key
  // so that we can detect when the browser app is running in Cypress.
  // https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-preserve-cookies--localStorage-in-between-my-tests
  cy.session('cypress', () => {
    cy.window().then(window => {
      window.localStorage.setItem('IS_CYPRESS', 'true')
    })
  })

  // Fake Authorization
  cy.intercept('/bff/v1/authorization/current', {
    body: {
      isSuperUser: true
    },
    statusCode: 200
  })

  // DEV :: FRONTEND_SENTRY_DSN
  // PROD :: FRONTEND_SENTRY_DSN
  cy.intercept(
    { url: /^https:\/\/a5f3272efa794bb9ada2ffea90f2fec5@sentry\.incubateur\.net\/.*/ },
    {
      statusCode: 200
    }
  )

  // PROD :: VITE_SMALL_CHAT_SNIPPET
  cy.intercept(
    { url: /^https:\/\/embed\.small\.chat\/.*/ },
    {
      body: '',
      statusCode: 200
    }
  )
}
