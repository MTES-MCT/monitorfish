import { FrontendError } from '../libs/FrontendError'

export function assertNotNullish<T>(value: T | null | undefined): asserts value is T {
  if (value === null) {
    throw new FrontendError('The value is null.')
  }

  if (value === undefined) {
    throw new FrontendError('The value is undefined.')
  }
}
