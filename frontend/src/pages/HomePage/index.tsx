import { Provider as ReduxProvider } from 'react-redux'
import { Outlet } from 'react-router-dom'

import { BackofficeMode } from '../../api/BackofficeMode'
import NamespaceContext from '../../domain/context/NamespaceContext'
import { store } from '../../store'

export function HomePage() {
  return (
    <ReduxProvider store={store}>
      <NamespaceContext.Provider value="homepage">
        <BackofficeMode isAdmin />

        <Outlet />
      </NamespaceContext.Provider>
    </ReduxProvider>
  )
}
