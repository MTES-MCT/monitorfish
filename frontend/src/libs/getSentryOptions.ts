import { browserTracingIntegration, captureSession, replayIntegration, startSession } from '@sentry/react'

import { ROUTER_PATHS } from '../paths'

import type { BrowserOptions } from '@sentry/react'

type SentryEnv = {
  dsn: string
  environment: string
  pathname: string
  release: string
  tracingOrigins: string
}

type Integration = Parameters<Extract<NonNullable<BrowserOptions['integrations']>, (...args: any[]) => any>>[0][number]

/**
 * Replaces the default `BrowserSession` integration, which starts a new session on each history change:
 * the map updates the URL hash on each move, which sent a session to Sentry for each move.
 */
const pageLoadSessionIntegration = (): Integration => ({
  name: 'PageLoadSession',
  setupOnce() {
    startSession({ ignoreDuration: true })
    captureSession()
  }
})

/**
 * Each transaction, session and replay chunk is a request competing with the application's ones,
 * which matters on the satellite connections of the patrol vessels.
 */
export function getSentryOptions({ dsn, environment, pathname, release, tracingOrigins }: SentryEnv): BrowserOptions {
  const isInLightMode = pathname.startsWith(ROUTER_PATHS.light)

  return {
    dsn,
    environment,
    integrations: defaultIntegrations => [
      ...defaultIntegrations.filter(integration => integration.name !== 'BrowserSession'),
      pageLoadSessionIntegration(),
      browserTracingIntegration(),
      ...(isInLightMode ? [] : [replayIntegration()])
    ],
    release,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0,
    tracePropagationTargets: [tracingOrigins],
    tracesSampleRate: 0.1
  }
}
