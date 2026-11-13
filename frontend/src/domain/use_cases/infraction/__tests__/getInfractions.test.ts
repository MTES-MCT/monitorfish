import { monitorfishPublicApi } from '@api/api'
import { infractionApi } from '@features/Infraction/apis'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

import { infractionReducer } from '../../../shared_slices/Infraction'
import { getInfractions } from '../getInfractions'

import type { MainAppDispatch } from '@store'

const INFRACTIONS = [
  { infraction: 'Pêche sans autorisation', natinfCode: 27689 },
  { infraction: 'Pêche en zone interdite', natinfCode: 2593 }
]

function createStore() {
  const store = configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(monitorfishPublicApi.middleware),
    reducer: {
      [monitorfishPublicApi.reducerPath]: monitorfishPublicApi.reducer,
      infraction: infractionReducer
    }
  })

  return { dispatch: store.dispatch as MainAppDispatch, getState: store.getState }
}

describe('domain/use_cases/infraction/getInfractions()', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn(() => Promise.resolve(new Response(JSON.stringify(INFRACTIONS), { status: 200 })))
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('Should share the infractions request with the components using them', async () => {
    const store = createStore()

    await Promise.all([
      store.dispatch(infractionApi.endpoints.getInfractions.initiate()),
      store.dispatch(getInfractions())
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().infraction.infractions.map(({ natinfCode }) => natinfCode)).toEqual([2593, 27689])
  })
})
