import { monitorfishApi } from '@api/api'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'

import { UserAccountContext } from '../../../../context/UserAccountContext'
import { globalSliceReducer, setAreActiveVesselsDisplayed } from '../../../../domain/shared_slices/Global'
import { vesselApi } from '../../../Vessel/vesselApi'
import { loadMainWindowReferentials } from '../../useCases/loadMainWindowReferentials'
import { useMainWindowDataLoading } from '../useMainWindowDataLoading'

import type { ReactNode } from 'react'

jest.mock('../../useCases/loadMainWindowReferentials', () => ({
  loadMainWindowReferentials: jest.fn(() => ({ type: 'TEST/loadMainWindowReferentials' }))
}))
jest.mock('../../../Vessel/useCases/updateVesselTracks', () => ({
  updateVesselTracks: jest.fn(() => ({ type: 'TEST/updateVesselTracks' }))
}))

function renderMainWindowDataLoading(isSuperUser: boolean) {
  const store = configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false })
        .prepend(createListenerMiddleware().middleware)
        .concat(monitorfishApi.middleware),
    reducer: {
      [monitorfishApi.reducerPath]: monitorfishApi.reducer,
      global: globalSliceReducer
    }
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <UserAccountContext.Provider value={{ email: undefined, isAuthenticated: true, isSuperUser }}>
        {children}
      </UserAccountContext.Provider>
    </Provider>
  )
  const { unmount } = renderHook(() => useMainWindowDataLoading(), { wrapper })

  return { store, unmount }
}

describe('features/MainWindow/hooks/useMainWindowDataLoading()', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve(new Response('[]', { status: 200 }))) as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('Should load the referentials once, after the first vessels are displayed', () => {
    const { store } = renderMainWindowDataLoading(true)
    store.dispatch({ type: 'TEST/anotherAction' })
    expect(loadMainWindowReferentials).not.toHaveBeenCalled()

    store.dispatch(setAreActiveVesselsDisplayed())
    store.dispatch(setAreActiveVesselsDisplayed())

    expect(loadMainWindowReferentials).toHaveBeenCalledTimes(1)
    expect(loadMainWindowReferentials).toHaveBeenCalledWith(true)
  })

  it('Should update the vessel tracks with each active vessels response', async () => {
    const { store } = renderMainWindowDataLoading(false)

    await store.dispatch(vesselApi.endpoints.getActiveVessels.initiate(undefined, { forceRefetch: true }))
    await store.dispatch(vesselApi.endpoints.getActiveVessels.initiate(undefined, { forceRefetch: true }))

    const { updateVesselTracks } = jest.requireMock<any>('../../../Vessel/useCases/updateVesselTracks')
    expect(updateVesselTracks).toHaveBeenCalledTimes(2)
  })

  it('Should stop listening When the main window is closed', async () => {
    const { store, unmount } = renderMainWindowDataLoading(false)
    unmount()

    store.dispatch(setAreActiveVesselsDisplayed())
    await store.dispatch(vesselApi.endpoints.getActiveVessels.initiate(undefined, { forceRefetch: true }))

    const { updateVesselTracks } = jest.requireMock<any>('../../../Vessel/useCases/updateVesselTracks')
    expect(loadMainWindowReferentials).not.toHaveBeenCalled()
    expect(updateVesselTracks).not.toHaveBeenCalled()
  })
})
