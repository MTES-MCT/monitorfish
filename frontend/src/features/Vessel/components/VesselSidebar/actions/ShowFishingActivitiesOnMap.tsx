import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { hideLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/hideLogbookMessageOverlays'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'

import { VesselSidebarActionButton } from './VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const areFishingActivitiesShowedOnMap = useMainAppSelector(
    state => state.fishingActivities.areFishingActivitiesShowedOnMap
  )
  const displayedLogbookOverlays = useMainAppSelector(state => state.fishingActivities.displayedLogbookOverlays)
  const areFishingActivitiesReallyShowedOnMap = areFishingActivitiesShowedOnMap || displayedLogbookOverlays?.length

  const showOrHideFishingActivities = async function () {
    if (areFishingActivitiesReallyShowedOnMap) {
      dispatch(hideLogbookMessageOverlays())

      return
    }

    await dispatch(displayLogbookMessageOverlays())
  }

  return (
    <VesselSidebarActionButton
      $backgroundColor={areFishingActivitiesReallyShowedOnMap ? THEME.color.blueGray : THEME.color.charcoal}
      $isRightMenuOpen={rightMenuIsOpen}
      $isSidebarOpen={isSidebarOpen}
      $top={223}
      data-cy="show-all-fishing-activities-on-map"
      disabled={!selectedVesselPositions?.length}
      isHidden={false}
      /* eslint-disable-next-line react/jsx-no-bind */
      onClick={showOrHideFishingActivities}
      title={`${areFishingActivitiesReallyShowedOnMap ? 'Cacher' : 'Afficher'} les messages du JPE sur la piste`}
    >
      <Icon.ShowErsMessages color={THEME.color.white} style={{ margin: 5 }} />
    </VesselSidebarActionButton>
  )
}
