import { describe, expect, it } from '@jest/globals'

import { getSentryOptions } from '../getSentryOptions'

import type { BrowserOptions } from '@sentry/react'

const getIntegrationNames = (options: BrowserOptions) =>
  (options.integrations as Array<{ name: string }>).map(integration => integration.name)

const ENV = {
  dsn: 'https://key@sentry.example/1',
  environment: 'test',
  release: 'v1.0.0',
  tracingOrigins: 'https://monitorfish.example'
}

describe('getSentryOptions()', () => {
  it('Should sample a small part of the transactions to spare low-bandwidth connections', () => {
    const options = getSentryOptions({ ...ENV, pathname: '/' })

    expect(options.tracesSampleRate).toBeLessThanOrEqual(0.1)
  })

  it('Should only send replays when an error occurs', () => {
    const options = getSentryOptions({ ...ENV, pathname: '/' })

    expect(options.replaysSessionSampleRate).toBe(0)
    expect(options.replaysOnErrorSampleRate).toBe(1)
    expect(getIntegrationNames(options)).toContain('Replay')
  })

  it('Should not record replays in the light (low-bandwidth) mode', () => {
    const options = getSentryOptions({ ...ENV, pathname: '/light' })

    expect(getIntegrationNames(options)).not.toContain('Replay')
  })
})
