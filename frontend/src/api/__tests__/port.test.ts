import { monitorfishApi } from '@api/api'
import { portApi } from '@api/port'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

function createStore() {
  return configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(monitorfishApi.middleware),
    reducer: {
      [monitorfishApi.reducerPath]: monitorfishApi.reducer
    }
  })
}

describe('api/port', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] })
    fetchMock = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify([{ locode: 'FRBES', name: 'Brest' }]), { status: 200 }))
    )
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
  })

  it('getPorts Should not download the ports again When they are displayed again days later in the same session', async () => {
    const store = createStore()

    const firstDisplay = store.dispatch(portApi.endpoints.getPorts.initiate())
    await firstDisplay
    firstDisplay.unsubscribe()
    await jest.advanceTimersByTimeAsync(2 * 24 * 60 * 60 * 1000)
    await store.dispatch(portApi.endpoints.getPorts.initiate())

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
