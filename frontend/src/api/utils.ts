import type { Self } from '../domain/types/env'

/**
 * Get the environment variable:
 * - injected by the `env.sh` script at runtime in `window`
 * - or from `process.env` when running locally
 */
export function getEnvironmentVariable(name: string) {
  // eslint-disable-next-line no-restricted-globals
  const injectedValue = (self as Self).env[name]
  if (injectedValue !== `__${name}__`) {
    if (injectedValue === 'true') {
      return true
    }

    if (injectedValue === 'false') {
      return false
    }

    return injectedValue
  }

  const valueFromProcess = process.env[name]
  if (valueFromProcess) {
    if (valueFromProcess === 'true') {
      return true
    }

    if (valueFromProcess === 'false') {
      return false
    }

    return process.env[name]
  }

  return undefined
}
