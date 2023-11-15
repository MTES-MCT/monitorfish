import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled from 'styled-components'

import { LandingPage } from './LandingPage'
import { BackofficeMode } from '../api/BackofficeMode'
import { NamespaceContext } from '../context/NamespaceContext'
import { LayerSliceNamespace } from '../domain/entities/layers/types'
import { Menu } from '../features/Backoffice/menu/Menu'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
import { useGetUserAuthorization } from '../hooks/authorization/useGetUserAuthorization'
import { backofficeStore, backofficeStorePersistor } from '../store'

countries.registerLocale(COUNTRIES_FR)

export function BackofficePage() {
  const userAuthorization = useGetUserAuthorization()

  if (!userAuthorization?.isSuperUser) {
    return <LandingPage />
  }

  return (
    <Provider store={backofficeStore}>
      {/* eslint-disable-next-line no-null/no-null */}
      <PersistGate loading={null} persistor={backofficeStorePersistor}>
        <NamespaceContext.Provider value={LayerSliceNamespace.backoffice}>
          <BackofficeMode isBackoffice />

          <BackofficeWrapper>
            <Menu />

            <Outlet />
          </BackofficeWrapper>

          <ErrorToastNotification />
        </NamespaceContext.Provider>
      </PersistGate>
    </Provider>
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
