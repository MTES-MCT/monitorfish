import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/es/integration/react'

import { NamespaceContext } from '../context/NamespaceContext'
import { LayerSliceNamespace } from '../domain/entities/layers/types'
import { mainStore, mainStorePersistor } from '../store'

export function HomePage() {
  return (
    <Provider store={mainStore}>
      <PersistGate loading={null} persistor={mainStorePersistor}>
        <NamespaceContext.Provider value={LayerSliceNamespace.homepage}>
          <Outlet />
        </NamespaceContext.Provider>
      </PersistGate>
    </Provider>
  )
}
