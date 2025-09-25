import { BackofficeMode } from '@api/BackofficeMode'
import { BackOfficeMenu } from '@features/BackOffice/components/BackofficeMenu'
import { BannerStack } from '@features/MainWindow/components/BannerStack'
import countries from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { Provider } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import styled from 'styled-components'

import { backofficeStore, backofficeStorePersistor } from '../store'

countries.registerLocale(COUNTRIES_FR)

export function BackofficePage() {
  return (
    <Provider store={backofficeStore}>
      {/* eslint-disable-next-line no-null/no-null */}
      <PersistGate loading={null} persistor={backofficeStorePersistor}>
        <BackofficeMode isBackoffice />

        <Wrapper>
          <BannerStack />
          <BackOfficeMenu />

          <Outlet />
        </Wrapper>
      </PersistGate>
    </Provider>
  )
}

const Wrapper = styled.div`
  display: flex;
  height: 100%;
`
