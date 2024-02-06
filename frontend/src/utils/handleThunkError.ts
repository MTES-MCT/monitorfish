import { AlreadyHandledError } from '../libs/AlreadyHandledError'
import { FrontendError } from '../libs/FrontendError'

export function handleThunkError(error: any): void {
  if (error instanceof AlreadyHandledError) {
    return
  }

  if (error instanceof FrontendError) {
    throw error
  }

  throw new FrontendError('An unhandled error happened in a Redux Thunk.', error)
}
