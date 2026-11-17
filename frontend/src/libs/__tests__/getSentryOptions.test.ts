import { describe, expect, it } from '@jest/globals'

import { getSentryOptions } from '../getSentryOptions'

import type { BrowserOptions } from '@sentry/react'

type Integration = Parameters<Extract<NonNullable<BrowserOptions['integrations']>, (...args: any[]) => any>>[0][number]

// A subset of the default integrations of `@sentry/react`
const DEFAULT_INTEGRATIONS = [
  { name: 'BrowserSession' },
  { name: 'Dedupe' },
  { name: 'GlobalHandlers' }
] as Integration[]

const getIntegrationNames = (options: BrowserOptions) => {
  const integrations =
    typeof options.integrations === 'function' ? options.integrations(DEFAULT_INTEGRATIONS) : options.integrations

  return (integrations ?? []).map(integration => integration.name)
}

const ENV = {
  dsn: 'https://key@sentry.example/1',
  environment: 'test',
  release: 'v1.0.0',
  tracingOrigins: 'https://monitorfish.example'
}

describe('getSentryOptions()', () => {
  it('Should sample a small part of the transactions to spare low-bandwidth connections', () => {
    const options = getSentryOptions(ENV)

    expect(options.tracesSampleRate).toBeLessThanOrEqual(0.1)
  })

  it('Should only send replays when an error occurs', () => {
    const options = getSentryOptions(ENV)

    expect(options.replaysSessionSampleRate).toBe(0)
    expect(options.replaysOnErrorSampleRate).toBe(1)
    expect(getIntegrationNames(options)).toContain('Replay')
  })

  it('Should track a single session per page load, not one per map move (the URL hash changes)', () => {
    const options = getSentryOptions(ENV)

    expect(getIntegrationNames(options)).not.toContain('BrowserSession')
    expect(getIntegrationNames(options)).toContain('PageLoadSession')
    expect(getIntegrationNames(options)).toEqual(expect.arrayContaining(['Dedupe', 'GlobalHandlers']))
  })
})
