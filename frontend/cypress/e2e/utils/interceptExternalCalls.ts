export function interceptExternalCalls() {
  // DEV :: VITE_MONITORENV_URL
  cy.intercept({ url: /^http:\/\/monitorenv\.kadata\.fr\/.*/ }, req => {
    req.redirect(req.url.replace('http://monitorenv.kadata.fr', 'http://0.0.0.0:8081'))
  })
  // PROD :: VITE_MONITORENV_URL
  cy.intercept({ url: /^http:\/\/monitorenv\.din\.developpement-durable\.gouv\.fr\/.*/ }, req => {
    req.redirect(req.url.replace('https://monitorenv.din.developpement-durable.gouv.fr', 'http://0.0.0.0:8081'))
  })

  // DEV :: VITE_SENTRY_DSN
  // PROD :: VITE_SENTRY_DSN
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
