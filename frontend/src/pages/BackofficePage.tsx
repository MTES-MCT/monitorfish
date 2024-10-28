import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled from 'styled-components'
import { LegacyRsuiteComponentsWrapper } from 'ui/LegacyRsuiteComponentsWrapper'

import { LandingPage } from './LandingPage'
import { BackofficeMode } from '../api/BackofficeMode'
import { useGetUserAuthorization } from '../auth/hooks/useGetUserAuthorization'
import { NamespaceContext } from '../context/NamespaceContext'
import { LayerSliceNamespace } from '../domain/entities/layers/types'
import { BackOfficeMenu } from '../features/BackOffice/components/BackofficeMenu'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
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

          <LegacyRsuiteComponentsWrapper>
            <BackofficeWrapper>
              <BackOfficeMenu />

              <Outlet />
            </BackofficeWrapper>
          </LegacyRsuiteComponentsWrapper>

          <ErrorToastNotification />
        </NamespaceContext.Provider>
      </PersistGate>
    </Provider>
  )
}

const BackofficeWrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  font-size: 13px;
  height: 100%;
  overflow: hidden;
  width: 100%;
`
