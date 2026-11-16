import { monitorfishApi } from '@api/api'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'
import { configureStore } from '@reduxjs/toolkit'

import { getReferentialVersion, getVersionedReferentialUrl } from '../referential'

const VERSIONS = { gears: 'g1', infractions: 'i1', ports: 'p1', regulations: 'r1', species: 's1' }

function createStore() {
  return configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(monitorfishApi.middleware),
    reducer: { [monitorfishApi.reducerPath]: monitorfishApi.reducer }
  })
}

describe('api/referential', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('getReferentialVersion() Should return the version of a referential and keep the versions', async () => {
    global.fetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify(VERSIONS), { status: 200 }))) as any

    const version = await getReferentialVersion(createStore().dispatch, 'species')

    expect(version).toBe('s1')
    expect(JSON.parse(window.localStorage.getItem(LocalStorageKey.ReferentialVersions)!)).toEqual(VERSIONS)
  })

  it('getReferentialVersion() Should return the last known version When the versions cannot be fetched', async () => {
    window.localStorage.setItem(LocalStorageKey.ReferentialVersions, JSON.stringify(VERSIONS))
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch'))) as any

    const version = await getReferentialVersion(createStore().dispatch, 'regulations')

    expect(version).toBe('r1')
  })

  it('getReferentialVersion() Should return no version When the versions were never fetched', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch'))) as any

    const version = await getReferentialVersion(createStore().dispatch, 'regulations')

    expect(version).toBeUndefined()
  })

  it('getVersionedReferentialUrl() Should add the version to the URL', () => {
    expect(getVersionedReferentialUrl('species', 's1')).toBe('species?v=s1')
    expect(getVersionedReferentialUrl('species', undefined)).toBe('species')
  })
})
