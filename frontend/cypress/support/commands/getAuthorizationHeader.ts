import { User } from 'oidc-client-ts'

export function getAuthorizationHeader() {
  return getOIDCUser().then(user => {
    const token = user?.access_token

    // If we have a token set in state, we pass it.
    if (token) {
      return Promise.resolve(`Bearer ${token}`)
    }

    return Promise.resolve(undefined)
  })
}

function getOIDCUser() {
  const OIDC_AUTHORITY = Cypress.env('FRONTEND_OIDC_AUTHORITY')
  const OIDC_CLIENT_ID = Cypress.env('FRONTEND_OIDC_CLIENT_ID')
  const LOCALSTORAGE_URL = Cypress.config().baseUrl

  return cy.getAllLocalStorage().then(localStorages => {
    if (!LOCALSTORAGE_URL) {
      return Promise.resolve(undefined)
    }

    const testLocalStorage = localStorages[LOCALSTORAGE_URL]
    if (!testLocalStorage) {
      return Promise.resolve(undefined)
    }

    const oidcStorage = testLocalStorage[`oidc.user:${OIDC_AUTHORITY}:${OIDC_CLIENT_ID}`]
    if (!oidcStorage) {
      return Promise.resolve(undefined)
    }

    return Promise.resolve(User.fromStorageString(oidcStorage as string))
  })
}
