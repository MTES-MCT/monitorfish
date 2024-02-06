import { FrontendError } from '../libs/FrontendError'

export function assert<T>(value: T | undefined, variableName: string): asserts value is T {
  if (value === undefined) {
    throw new FrontendError(`\`${variableName}\` is undefined.`)
  }
}
