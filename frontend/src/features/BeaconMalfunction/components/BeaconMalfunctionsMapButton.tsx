import { BeaconMalfunctionsStage, BeaconMalfunctionVesselStatus } from '@features/BeaconMalfunction/constants'
import { MapIconButton } from '@features/MainWindow/components/MapButtons/MapIconButton'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, Size } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { SideWindowMenuKey, SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { MapButton } from '../../MainWindow/components/MapButtons/MapButton'

export function BeaconMalfunctionsMapButton() {
  const dispatch = useMainAppDispatch()
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const beaconMalfunctions = useMainAppSelector(state => state.beaconMalfunction.beaconMalfunctions)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const badgeNumber =
    beaconMalfunctions?.filter(
      beaconMalfunction =>
        beaconMalfunction.stage === BeaconMalfunctionsStage.INITIAL_ENCOUNTER &&
        beaconMalfunction.vesselStatus === BeaconMalfunctionVesselStatus.AT_SEA
    )?.length || undefined

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD

  const toggleSideWindow = useCallback(() => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.BEACON_MALFUNCTION_BOARD }))
  }, [dispatch, isActive])

  return (
    <Wrapper data-cy="beacon-malfunction-button" isHidden={!!previewFilteredVesselsMode}>
      <MapIconButton
        $isActive={isActive}
        accent={Accent.PRIMARY}
        aria-label="Avaries VMS"
        badgeNumber={badgeNumber}
        Icon={Icon.Vms}
        onClick={toggleSideWindow}
        size={Size.LARGE}
        title="Avaries VMS"
      />
    </Wrapper>
  )
}

const Wrapper = styled(MapButton)`
  position: absolute;
  top: 280px;
  left: 10px;
`
