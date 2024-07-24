import { FrontendError } from '../libs/FrontendError'

export function assertNotNullish<T>(value: T | null | undefined, message?: string | undefined): asserts value is T {
  if (value === null) {
    throw new FrontendError(message ?? 'The value is null.')
  }

  if (value === undefined) {
    throw new FrontendError(message ?? 'The value is undefined.')
  }
}
