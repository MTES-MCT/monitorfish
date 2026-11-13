import { describe, expect, it } from '@jest/globals'

const wait = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

/**
 * Replay only runs in a browser: Sentry detects Jest as Node.js, but an Electron renderer as a browser.
 * Sentry also takes the timers of a sandbox iframe when they are not native, as jsdom's ones: they never fire.
 * Sentry is imported after these patches, as it caches its timers, and `BrowserApiErrors` is removed, as it wraps them.
 */
async function importSentryAsInBrowser() {
  ;(process as NodeJS.Process & { type?: string }).type = 'renderer'
  const jsdomSetTimeout = window.setTimeout
  const nativeLookingSetTimeout = (...args: Parameters<typeof setTimeout>) => jsdomSetTimeout(...args)
  nativeLookingSetTimeout.toString = () => 'function setTimeout() { [native code] }'
  window.setTimeout = nativeLookingSetTimeout as unknown as typeof setTimeout

  return {
    ...(await import('@sentry/react')),
    createTransport: (await import('@sentry/core')).createTransport,
    getSentryOptions: (await import('../getSentryOptions')).getSentryOptions
  }
}

describe('getSentryOptions() replay', () => {
  it('Should send a single replay per error, not record the rest of the session', async () => {
    const { captureException, createTransport, getClient, getSentryOptions, init } = await importSentryAsInBrowser()
    const sentItemTypes: string[] = []
    const options = getSentryOptions({
      dsn: 'https://key@sentry.example/1',
      environment: 'test',
      pathname: '/',
      release: 'v1.0.0',
      tracingOrigins: 'https://monitorfish.example'
    })
    init({
      ...options,
      integrations: defaultIntegrations =>
        (options.integrations as (integrations: typeof defaultIntegrations) => typeof defaultIntegrations)(
          defaultIntegrations.filter(integration => integration.name !== 'BrowserApiErrors')
        ),
      transport: transportOptions =>
        createTransport(transportOptions, request => {
          const body = typeof request.body === 'string' ? request.body : new TextDecoder().decode(request.body)
          body
            .split('\n')
            .filter(line => line.startsWith('{"type":'))
            .forEach(line => sentItemTypes.push(JSON.parse(line).type))

          return Promise.resolve({ statusCode: 200 })
        })
    })
    document.body.innerHTML = '<div id="map"></div>'
    await wait(100)

    captureException(new Error('An error'))
    await wait(1000)
    // The page keeps changing after the error (the map moves, the vessels are refreshed)
    for (let index = 0; index < 8; index += 1) {
      document.getElementById('map')!.textContent = `Move ${index}`
      await wait(2000)
    }
    await getClient()?.flush(1000)
    expect(sentItemTypes.filter(type => type === 'replay_recording')).toHaveLength(1)

    captureException(new Error('Another error'))
    await wait(1000)
    await getClient()?.flush(1000)
    expect(sentItemTypes.filter(type => type === 'replay_recording')).toHaveLength(2)
  }, 30000)
})
