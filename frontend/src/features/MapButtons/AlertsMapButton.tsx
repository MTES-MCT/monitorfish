import styled from 'styled-components'

import { SideWindowMenuKey } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'

export function AlertsMapButton() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
  const { sideWindow } = useMainAppSelector(state => state)

  return (
    <AlertsButton
      data-cy="alerts-button"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={Boolean(previewFilteredVesselsMode)}
      isVisible={sideWindow.selectedMenuWithSubMenu.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST}
      onClick={() => {
        if (sideWindow.selectedMenuWithSubMenu.menu !== SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST) {
          dispatch(sideWindowDispatchers.openMenuWithSubMenu(SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST))

          return
        }

        if (sideWindow.selectedMenuWithSubMenu.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST) {
          dispatch(sideWindowActions.close())
        }
      }}
      title="Alertes"
    >
      <AlertsIcon />
    </AlertsButton>
  )
}

const AlertsButton = styled(MapButtonStyle)<{
  isVisible: boolean
}>`
  position: absolute;
  display: inline-block;
  background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 162px;
  left: 10px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.isVisible ? p.theme.color.blueGray[100] : p.theme.color.charcoal)};
  }
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 5px;
  width: 20px;
`
