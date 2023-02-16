import countries from 'i18n-iso-countries'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'

import { BackofficeMode } from '../api/BackofficeMode'
import { Backoffice } from '../features/backoffice/Backoffice'
import { ControlObjectives } from '../features/backoffice/control_objectives/ControlObjectives'
import EditRegulation from '../features/backoffice/edit_regulation/EditRegulation'
import { FleetSegments } from '../features/backoffice/fleet_segments/FleetSegments'
import Menu from '../features/backoffice/menu/Menu'
import { ErrorToastNotification } from '../features/commonComponents/ErrorToastNotification'

countries.registerLocale(require('i18n-iso-countries/langs/fr.json'))

export function BackofficePage() {
  const match = useRouteMatch()

  return (
    <>
      <BackofficeMode isBackoffice />
      <BackofficeWrapper>
        <Menu />
        <Switch>
          <Route exact path="/backoffice" render={() => <Redirect to="/backoffice/regulation" />} />
          <Route exact path={`${match.path}/regulation`}>
            <Backoffice />
          </Route>
          <Route exact path={`${match.path}/regulation/new`}>
            <EditRegulation isEdition={false} title="Saisir une nouvelle réglementation" />
          </Route>
          <Route exact path={`${match.path}/regulation/edit`}>
            <EditRegulation isEdition title="Modifier la réglementation de la zone" />
          </Route>
          <Route exact path={`${match.path}/control_objectives`}>
            <ControlObjectives />
          </Route>
          <Route exact path={`${match.path}/fleet_segments`}>
            <FleetSegments />
          </Route>
        </Switch>
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
