import { FIVE_MINUTES } from '@constants/index'
import { beaconMalfunctionApi } from '@features/BeaconMalfunction/apis'
import { BeaconMalfunctionsStage, BeaconMalfunctionVesselStatus } from '@features/BeaconMalfunction/constants'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { SideWindowMenuKey, SideWindowStatus } from '@features/SideWindow/constants'
import { sideWindowActions } from '@features/SideWindow/slice'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { getAreFirstActiveVesselsDisplayed } from '@features/Vessel/selectors/getAreFirstActiveVesselsDisplayed'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useOnPolledQueryData } from '@hooks/useOnPolledQueryData'
import { Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'

import { setBeaconMalfunctions } from '../../../domain/shared_slices/BeaconMalfunction'

export function BeaconMalfunctionsMapButton() {
  const dispatch = useMainAppDispatch()
  const beaconMalfunctions = useMainAppSelector(state => state.beaconMalfunction.beaconMalfunctions)
  const sideWindow = useMainAppSelector(state => state.sideWindow)

  const areFirstActiveVesselsDisplayed = useMainAppSelector(getAreFirstActiveVesselsDisplayed)

  const beaconMalfunctionsQuery = beaconMalfunctionApi.endpoints.getAllBeaconMalfunctions.useQuery(undefined, {
    pollingInterval: FIVE_MINUTES,
    // On a satellite link, it would share its bandwidth with the vessels, delaying their display
    skip: !areFirstActiveVesselsDisplayed
  })
  useOnPolledQueryData(
    beaconMalfunctionsQuery,
    useCallback(nextBeaconMalfunctions => dispatch(setBeaconMalfunctions(nextBeaconMalfunctions)), [dispatch])
  )

  const badgeNumber =
    beaconMalfunctions?.filter(
      beaconMalfunction =>
        beaconMalfunction.stage === BeaconMalfunctionsStage.INITIAL_ENCOUNTER &&
        beaconMalfunction.vesselStatus === BeaconMalfunctionVesselStatus.AT_SEA
    )?.length || undefined

  const isActive =
    sideWindow.status !== SideWindowStatus.CLOSED &&
    sideWindow.selectedPath.menu === SideWindowMenuKey.BEACON_MALFUNCTION_BOARD

  const toggleSideWindow = () => {
    if (isActive) {
      dispatch(sideWindowActions.close())

      return
    }

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.BEACON_MALFUNCTION_BOARD }))
  }

  return (
    <MapToolButton
      badgeNumber={badgeNumber}
      data-cy="beacon-malfunction-button"
      Icon={Icon.Vms}
      isActive={isActive}
      isShrinkable={false}
      onClick={toggleSideWindow}
      title="Avaries VMS"
    />
  )
}
