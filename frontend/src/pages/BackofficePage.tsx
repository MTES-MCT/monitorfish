import countries from 'i18n-iso-countries'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { BackofficeMode } from '../api/BackofficeMode'
import { Backoffice } from '../features/backoffice/Backoffice'
import ControlObjectives from '../features/backoffice/control_objectives/ControlObjectives'
import { EditRegulation } from '../features/backoffice/edit_regulation/EditRegulation'
import { FleetSegments } from '../features/backoffice/fleet_segments/FleetSegments'
import { Menu } from '../features/backoffice/menu/Menu'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

export function BackofficePage() {
  const location = useLocation()

  return (
    <>
      <BackofficeMode isBackoffice />
      <BackofficeWrapper>
        <Menu />
        <Routes>
          <Route element={<Navigate to="/backoffice/regulation" />} path="/backoffice" />
          <Route path={`${location.pathname}/regulation`}>
            <Backoffice />
          </Route>
          <Route path={`${location.pathname}/regulation/new`}>
            <EditRegulation isEdition={false} title="Saisir une nouvelle réglementation" />
          </Route>
          <Route path={`${location.pathname}/regulation/edit`}>
            <EditRegulation isEdition title="Modifier la réglementation de la zone" />
          </Route>
          <Route path={`${location.pathname}/control_objectives`}>
            <ControlObjectives />
          </Route>
          <Route path={`${location.pathname}/fleet_segments`}>
            <FleetSegments />
          </Route>
        </Routes>
      </BackofficeWrapper>
      <ErrorToastNotification />
    </>
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
