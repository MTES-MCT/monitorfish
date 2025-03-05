import { logbookActions } from '@features/Logbook/slice'
import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { toggleAndHideLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/toggleAndHideLogbookMessageOverlays'
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

  const showOrHideFishingActivities = async function () {
    if (areFishingActivitiesShowedOnMap) {
      dispatch(toggleAndHideLogbookMessageOverlays())

      return
    }

    await dispatch(logbookActions.setAreFishingActivitiesShowedOnMap(true))
    await dispatch(displayLogbookMessageOverlays())
  }

  return (
    <VesselSidebarActionButton
      $backgroundColor={areFishingActivitiesShowedOnMap ? THEME.color.blueGray : THEME.color.charcoal}
      $isRightMenuOpen={rightMenuIsOpen}
      $isSidebarOpen={isSidebarOpen}
      $top={223}
      data-cy="show-all-fishing-activities-on-map"
      disabled={!selectedVesselPositions?.length}
      isHidden={false}
      /* eslint-disable-next-line react/jsx-no-bind */
      onClick={showOrHideFishingActivities}
      title={`${areFishingActivitiesShowedOnMap ? 'Cacher' : 'Afficher'} les messages du JPE sur la piste`}
    >
      <Icon.ShowErsMessages color={THEME.color.white} style={{ margin: 5 }} />
    </VesselSidebarActionButton>
  )
}
