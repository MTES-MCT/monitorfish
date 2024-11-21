import type { BackofficeAppDispatch, BackofficeAppThunk, MainAppDispatch, MainAppThunk } from '@store'

type AppDispatch = BackofficeAppDispatch | MainAppDispatch

type AppThunk<T extends AppDispatch, R = void> = T extends BackofficeAppDispatch
  ? BackofficeAppThunk<R>
  : MainAppThunk<R>

// This function is now fully generic
export function dispatcherA<T extends AppDispatch>(): AppThunk<T, string[]> {
  // @ts-ignore
  return dispatch => {
    const resultA = dispatch(dispatcherB<T>())

    return resultA
  }
}

export function dispatcherB<T extends AppDispatch>(): AppThunk<T, string[]> {
  // @ts-ignore
  return (_dispatch, getState) => {
    const resultB = getState().regulation.regulatoryTopics

    return resultB
  }
}
