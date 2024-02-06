import { FrontendError } from '../libs/FrontendError'

export function ensure<T>(value: T | undefined, variableName: string): T {
  if (value === undefined) {
    throw new FrontendError(`\`${variableName}\` is undefined.`)
  }

  return value
}
