import type { Self } from '../domain/types/env'

export const OK = 200
export const CREATED = 201
export const NOT_FOUND = 404
export const ACCEPTED = 202

export function getEnvironmentVariable(string: string) {
  // eslint-disable-next-line no-restricted-globals
  if ((self as Self).env[string] !== `__${string}__`) {
    // eslint-disable-next-line no-restricted-globals
    return (self as Self).env.REACT_APP_GEOSERVER_REMOTE_URL
  }

  if (process.env[string]) {
    return process.env[string]
  }

  return undefined
}
