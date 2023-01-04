import { Provider as ReduxProvider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/es/integration/react'
import styled from 'styled-components'

import { BackofficeMode } from '../api/BackofficeMode'
import NamespaceContext from '../domain/context/NamespaceContext'
import { Menu } from '../features/backoffice/menu/Menu'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
import { persistedStore, persistedStorePersistor } from '../store'

export function BackofficePage() {
  return (
    <ReduxProvider store={persistedStore}>
      {/* eslint-disable-next-line no-null/no-null */}
      <PersistGate loading={null} persistor={persistedStorePersistor}>
        <NamespaceContext.Provider value="backoffice">
          <BackofficeMode isBackoffice />

          <BackofficeWrapper>
            <Menu />

            <Outlet />
          </BackofficeWrapper>

          <ErrorToastNotification />
        </NamespaceContext.Provider>
      </PersistGate>
    </ReduxProvider>
  )
}

const BackofficeWrapper = styled.div`
  font-size: 13px;
  text-align: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
`
