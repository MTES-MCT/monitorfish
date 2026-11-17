import { monitorfishApi } from '@api/api'
import { specyApi } from '@api/specy'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

import { speciesReducer } from '../../../shared_slices/Species'
import { getAllSpecies } from '../getAllSpecies'

import type { MainAppAsyncThunk, MainAppDispatch } from '@store'

const SPECIES_AND_GROUPS = {
  groups: [{ comment: 'Thons', group: 'TUNA' }],
  species: [
    { code: 'BFT', name: 'Thon rouge' },
    { code: 'COD', name: 'Morue' }
  ]
}

function createStore() {
  const store = configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(monitorfishApi.middleware),
    reducer: {
      [monitorfishApi.reducerPath]: monitorfishApi.reducer,
      species: speciesReducer
    }
  })

  return { dispatch: store.dispatch as MainAppDispatch, getState: store.getState }
}

describe('domain/use_cases/species/getAllSpecies()', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn(() => Promise.resolve(new Response(JSON.stringify(SPECIES_AND_GROUPS), { status: 200 })))
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('Should share the species request with the components using them', async () => {
    const store = createStore()

    await Promise.all([
      store.dispatch(specyApi.endpoints.getSpecies.initiate()),
      store.dispatch(getAllSpecies<MainAppAsyncThunk>())
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().species.speciesByCode.COD?.name).toBe('Morue')
  })
})
