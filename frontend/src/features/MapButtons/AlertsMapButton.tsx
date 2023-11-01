import { useCallback } from 'react'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { MapButton } from '../commonStyles/MapButton'
import { ReactComponent as AlertsSVG } from '../icons/Icone_alertes.svg'

export function AlertsMapButton() {
  const dispatch = useMainAppDispatch()
  const { previewFilteredVesselsMode } = useMainAppSelector(state => state.global)
  const { sideWindow } = useMainAppSelector(state => state)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST

  const toggleSideWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
  }, [dispatch, isActive])

  return (
    <AlertsButton
      $isActive={isActive}
      data-cy="alerts-button"
      isHidden={Boolean(previewFilteredVesselsMode)}
      onClick={toggleSideWindow}
      title="Alertes"
    >
      <AlertsIcon />
    </AlertsButton>
  )
}

const AlertsButton = styled(MapButton)<{
  $isActive: boolean
}>`
  position: absolute;
  display: inline-block;
  background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 162px;
  left: 10px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`

const AlertsIcon = styled(AlertsSVG)`
  margin-top: 5px;
  width: 20px;
`
