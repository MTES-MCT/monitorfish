import type { RetryableUseCase } from '../../../libs/DisplayedError'

export const retry = (retryableUseCase: RetryableUseCase | undefined) => async dispatch => {
  if (!retryableUseCase) {
    return
  }

  const parameters = retryableUseCase?.parameters
  if (!parameters) {
    dispatch(retryableUseCase?.func())

    return
  }

  dispatch(retryableUseCase?.func(...parameters))
}
