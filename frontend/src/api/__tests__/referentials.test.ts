import { monitorfishApi, monitorfishPublicApi } from '@api/api'
import { gearApi } from '@api/gear'
import { portApi } from '@api/port'
import { specyApi } from '@api/specy'
import { infractionApi } from '@features/Infraction/apis'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

function createStore() {
  return configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(
        monitorfishApi.middleware,
        monitorfishPublicApi.middleware
      ),
    reducer: {
      [monitorfishApi.reducerPath]: monitorfishApi.reducer,
      [monitorfishPublicApi.reducerPath]: monitorfishPublicApi.reducer
    }
  })
}

type Store = ReturnType<typeof createStore>

describe('api/referentials', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask', 'setImmediate'] })
    fetchMock = jest.fn(() => Promise.resolve(new Response(JSON.stringify([]), { status: 200 })))
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
  })

  it.each([
    ['getPorts', (store: Store) => store.dispatch(portApi.endpoints.getPorts.initiate())],
    ['getGears', (store: Store) => store.dispatch(gearApi.endpoints.getGears.initiate())],
    ['getSpecies', (store: Store) => store.dispatch(specyApi.endpoints.getSpecies.initiate())],
    ['getInfractions', (store: Store) => store.dispatch(infractionApi.endpoints.getInfractions.initiate())]
  ])(
    '%s Should not download the referential again When it is displayed again days later in the same session',
    async (_, display) => {
      const store = createStore()

      const firstDisplay = display(store)
      await firstDisplay
      firstDisplay.unsubscribe()
      await jest.advanceTimersByTimeAsync(2 * 24 * 60 * 60 * 1000)
      await display(store)

      expect(fetchMock).toHaveBeenCalledTimes(1)
    }
  )
})
