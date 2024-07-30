import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback } from 'react'
import styled from 'styled-components'

import { MapButton } from './MapButton'
import { SideWindowMenuKey, SideWindowStatus } from '../../../../domain/entities/sideWindow/constants'
import AlertsSVG from '../../../icons/Icone_alertes.svg?react'

export function AlertsMapButton() {
  const dispatch = useMainAppDispatch()
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST

  const toggleSideWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.ALERT_LIST_AND_REPORTING_LIST }))
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
  top: 184px;
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
