import { MainMap } from '@features/MainMap/MainMap.types'
import { mainStore, mainStorePersistor } from '@store'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/es/integration/react'

import { NamespaceContext } from '../context/NamespaceContext'

export function HomePage() {
  return (
    <Provider store={mainStore}>
      <PersistGate loading={null} persistor={mainStorePersistor}>
        <NamespaceContext.Provider value={MainMap.LayerSliceNamespace.homepage}>
          <Outlet />
        </NamespaceContext.Provider>
      </PersistGate>
    </Provider>
  )
}
