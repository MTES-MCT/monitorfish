/* eslint-disable no-restricted-globals */
import type { Env } from '../domain/types/env'
import type { Self } from '../domain/types/self'

/**
 * Get the environment variable:
 * - injected by the `env.sh` script at runtime in `window`
 * - or from `import.meta.env` when running locally
 */
export function env(name: Env) {
  if ((self as Self).env) {
    const injectedValue = (self as Self).env[name]
    if (injectedValue === 'true' || injectedValue === 'false') {
      return Boolean(injectedValue)
    }

    return injectedValue
  }

  const valueFromProcess = import.meta.env[name]
  if (valueFromProcess === 'true' || valueFromProcess === 'false') {
    return Boolean(valueFromProcess)
  }

  return valueFromProcess
}

/* eslint-enable no-restricted-globals */
