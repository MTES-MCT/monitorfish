export function postLoginToKeycloak(user: string) {
  Cypress.log({ name: 'Login' })

  cy.fixture(`users/${user}`).then((userData: { password: string; username: string }) => {
    const authBaseUrl = Cypress.env('auth_base_url')
    const realm = Cypress.env('auth_realm')
    const client_id = Cypress.env('auth_client_id')

    cy.request({
      followRedirect: false,
      qs: {
        approval_prompt: 'auto',
        client_id,
        redirect_uri: Cypress.config('baseUrl'),
        response_type: 'code',
        scope: 'openid'
      },
      url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/auth`
    })
      .then(response => {
        const html = document.createElement('html')
        html.innerHTML = response.body

        const form = html.getElementsByTagName('form')[0]
        const url = form?.action

        if (!url) {
          return Promise.reject(new Error('`url` is undefined.'))
        }

        return cy.request({
          body: {
            password: userData.password,
            username: userData.username
          },
          followRedirect: false,
          form: true,
          method: 'POST',
          url
        })
      })
      .then((response: Cypress.Response<any>) => {
        if (!response.headers.location) {
          return Promise.reject(new Error('`location` is undefined.'))
        }

        const code = getAuthCodeFromLocation(response.headers.location as string)

        return cy
          .request({
            body: {
              client_id,
              code,
              grant_type: 'authorization_code',
              redirect_uri: Cypress.config('baseUrl')
            },
            followRedirect: false,
            form: true,
            method: 'post',
            url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/token`
          })
          .its('body')
      })
  })
}

function getAuthCodeFromLocation(location: string): string | undefined {
  const url = new URL(location)
  const params = url.search.substring(1).split('&')

  // eslint-disable-next-line no-restricted-syntax
  for (const param of params) {
    const [key, value] = param.split('=')
    if (key === 'code') {
      return value
    }
  }

  return undefined
}
