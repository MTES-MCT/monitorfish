import { BackofficeMode } from '@api/BackofficeMode'
import { BackOfficeMenu } from '@features/BackOffice/components/BackofficeMenu'
import { MainMap } from '@features/MainMap/MainMap.types'
import { Notifier } from '@components/Notifier'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled from 'styled-components'

import { NamespaceContext } from '../context/NamespaceContext'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'
import { backofficeStore, backofficeStorePersistor } from '../store'

countries.registerLocale(COUNTRIES_FR)

export function BackofficePage() {
  return (
    <Provider store={backofficeStore}>
      {/* eslint-disable-next-line no-null/no-null */}
      <PersistGate loading={null} persistor={backofficeStorePersistor}>
        <NamespaceContext.Provider value={MainMap.LayerSliceNamespace.backoffice}>
          <BackofficeMode isBackoffice />

          <Wrapper>
            <BackOfficeMenu />

            <Outlet />
          </Wrapper>

          <ErrorToastNotification />
          <Notifier />
        </NamespaceContext.Provider>
      </PersistGate>
    </Provider>
  )
}

const Wrapper = styled.div`
  display: flex;
  height: 100%;
`
