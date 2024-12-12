import { jest } from '@jest/globals'

/**
 * To be used to capture all dispatched actions.
 *
 * we could have more middleware functions being called within the
 * use-case middleware, and we should be able to capture all of these events.
 */
export const mockedDispatch = (action, initialState) => {
  const store = {
    dispatch: jest.fn(fn => {
      if (typeof fn === 'function') {
        fn(store.dispatch, store.getState)
      }
    }),
    getState: jest.fn(() => initialState)
  }

  action(store.dispatch, store.getState)

  return store
}
