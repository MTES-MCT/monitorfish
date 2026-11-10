import { browserTracingIntegration, replayIntegration } from '@sentry/react'

import { ROUTER_PATHS } from '../paths'

import type { BrowserOptions } from '@sentry/react'

type SentryEnv = {
  dsn: string
  environment: string
  pathname: string
  release: string
  tracingOrigins: string
}

/**
 * Each transaction and replay chunk is a request competing with the application's ones,
 * which matters on the satellite connections of the patrol vessels.
 */
export function getSentryOptions({ dsn, environment, pathname, release, tracingOrigins }: SentryEnv): BrowserOptions {
  const isInLightMode = pathname.startsWith(ROUTER_PATHS.light)

  return {
    dsn,
    environment,
    integrations: isInLightMode ? [browserTracingIntegration()] : [browserTracingIntegration(), replayIntegration()],
    release,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0,
    tracePropagationTargets: [tracingOrigins],
    tracesSampleRate: 0.1
  }
}
