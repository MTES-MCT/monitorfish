import { afterAll, beforeAll, describe, expect, it } from '@jest/globals'

import { BASE_URL, launchChrome, login, navigateAndWaitForVessels, wait } from './utils'

import type { Browser, HTTPResponse, Page } from 'puppeteer'

const VERSIONED_REFERENTIAL_PATHS = [
  '/api/v1/infractions',
  '/bff/v1/gears',
  '/bff/v1/regulations/catalogue',
  '/bff/v1/species'
]

function recordReferentialResponses(page: Page): HTTPResponse[] {
  const responses: HTTPResponse[] = []
  page.on('response', response => {
    if (VERSIONED_REFERENTIAL_PATHS.includes(new URL(response.url()).pathname)) {
      responses.push(response)
    }
  })

  return responses
}

describe('Referentials kept by the browser between sessions (non-super-user)', () => {
  let browser: Browser
  let page: Page

  beforeAll(async () => {
    browser = await launchChrome()
    page = await browser.newPage()
    await login(page)
  })

  afterAll(async () => {
    await browser.close()
  })

  it('serves the unchanged referentials from the browser cache on the next loads', async () => {
    const firstLoadResponses = recordReferentialResponses(page)
    await navigateAndWaitForVessels(page, () => page.goto(BASE_URL))
    await wait(4000)

    expect(firstLoadResponses.map(response => new URL(response.url()).pathname).sort()).toEqual(
      VERSIONED_REFERENTIAL_PATHS
    )
    firstLoadResponses.forEach(response => {
      expect(new URL(response.url()).searchParams.get('v')).toBeTruthy()
      expect(response.headers()['cache-control']).toBe('max-age=31536000, private, immutable')
    })

    page.removeAllListeners('response')
    const nextLoadResponses = recordReferentialResponses(page)
    await navigateAndWaitForVessels(page, () => page.reload())
    await wait(4000)

    expect(nextLoadResponses).toHaveLength(VERSIONED_REFERENTIAL_PATHS.length)
    nextLoadResponses.forEach(response => {
      expect(response.fromCache()).toBe(true)
    })
  })
})
