import { registerMonitorUiCustomCommands } from '@mtes-mct/monitor-ui/cypress'

import { cleanDownloadedFiles } from './commands/cleanDownloadedFiles'
import { countRequestsByAlias, resetCountRequestsByAlias } from './commands/countRequestsByAlias'
import { getComputedStyle } from './commands/getComputedStyle'
import { getDownloadedFileContent } from './commands/getDownloadedFileContent'

registerMonitorUiCustomCommands()

function unquote(str: string): string {
  return str.replace(/(^")|("$)/g, '')
}

export const stubSideWindowOptions = {
  onBeforeLoad(window) {
    cy.stub(window, 'open', () => window).as('windowOpen')
  }
}

Cypress.Commands.add(
  'before',
  {
    prevSubject: 'element'
  },
  (el: JQuery<Element>, property: string): string => {
    if (!el[0]) {
      throw new Error('`el[0]` is undefined.')
    }

    const win = el[0].ownerDocument.defaultView
    if (!win) {
      throw new Error('`win` is null.')
    }

    const before = win.getComputedStyle(el[0], 'before')

    return unquote(before.getPropertyValue(property))
  }
)

Cypress.Commands.add('cleanScreenshots', (fromNumber: number): void => {
  cy.exec(`cd cypress/e2e/__image_snapshots__/ && find . | grep -P "[${fromNumber}-7]\\.png" | xargs -i rm {}\n`)
})

Cypress.Commands.add('cleanDownloadedFiles', cleanDownloadedFiles)
Cypress.Commands.add('countRequestsByAlias', countRequestsByAlias)
Cypress.Commands.add('getComputedStyle', getComputedStyle)
Cypress.Commands.add('getDownloadedFileContent', getDownloadedFileContent)
Cypress.Commands.add('resetCountRequestsByAlias', resetCountRequestsByAlias)

// @ts-ignore
Cypress.Commands.add('waitForLastRequest', (alias, partialRequest, maxRequests, level = 0) => {
  if (level === maxRequests) {
    throw new Error(`${maxRequests} requests exceeded`)
  }

  // @ts-ignore
  return cy.wait(alias).then(interception => {
    // @ts-ignore
    const isMatch = Cypress._.isMatch(interception.request, partialRequest)
    if (isMatch) {
      return interception
    }

    // eslint-disable-next-line no-console
    cy.log('Intercepted request', JSON.stringify(interception.request))

    // @ts-ignore
    return cy.waitForLastRequest(alias, partialRequest, maxRequests, level + 1)
  })
})

Cypress.Commands.add('kcLogin', (user: string) => {
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
      .then(response => {
        if (!response.headers.location) {
          return
        }

        const code = getAuthCodeFromLocation(response.headers.location)

        cy.request({
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
        }).its('body')
      })
  })
})

export function getAuthCodeFromLocation(location: string): string | undefined {
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
