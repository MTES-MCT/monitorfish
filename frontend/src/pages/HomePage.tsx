import { mainStore, mainStorePersistor } from '@store'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/es/integration/react'

export function HomePage() {
  return (
    <Provider store={mainStore}>
      <PersistGate loading={null} persistor={mainStorePersistor}>
        <Outlet />
      </PersistGate>
    </Provider>
  )
}
