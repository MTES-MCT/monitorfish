import { useCallback } from 'react'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowStatus } from '../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'
import { MapButton } from '../commonStyles/MapButton'
import BeaconMalfunctionsSVG from '../icons/Icone_VMS.svg?react'

export function BeaconMalfunctionsMapButton() {
  const dispatch = useMainAppDispatch()
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD

  const toggleSideWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.BEACON_MALFUNCTION_BOARD }))
  }, [dispatch, isActive])

  return (
    <BeaconMalfunctionsButton
      $isActive={isActive}
      data-cy="beacon-malfunction-button"
      isHidden={!!previewFilteredVesselsMode}
      onClick={toggleSideWindow}
      title="Avaries VMS"
    >
      <BeaconMalfunctionsIcon />
    </BeaconMalfunctionsButton>
  )
}

const BeaconMalfunctionsButton = styled(MapButton)<{
  $isActive: boolean
}>`
  position: absolute;
  display: inline-block;
  background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  padding: 2px 2px 2px 2px;
  top: 204px;
  left: 10px;
  border-radius: 2px;
  height: 40px;
  width: 40px;

  :hover,
  :focus {
    background: ${p => (p.$isActive ? p.theme.color.blueGray : p.theme.color.charcoal)};
  }
`

const BeaconMalfunctionsIcon = styled(BeaconMalfunctionsSVG)`
  margin-top: 5px;
  width: 25px;
  margin-right: 0px;
`
