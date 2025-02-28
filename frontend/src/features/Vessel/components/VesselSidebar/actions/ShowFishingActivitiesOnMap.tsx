import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME, Icon } from '@mtes-mct/monitor-ui'

import { VesselSidebarActionButton } from './VesselSidebarActionButton'
import { useGetLogbookUseCase } from '../../../../Logbook/hooks/useGetLogbookUseCase'
import { logbookActions } from '../../../../Logbook/slice'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const areFishingActivitiesShowedOnMap = useMainAppSelector(
    state => state.fishingActivities.areFishingActivitiesShowedOnMap
  )
  const fishingActivities = useMainAppSelector(state => state.fishingActivities.fishingActivities)
  const fishingActivitiesShowedOnMap = useMainAppSelector(state => state.fishingActivities.fishingActivitiesShowedOnMap)
  const getVesselLogbook = useGetLogbookUseCase()
  const areFishingActivitiesReallyShowedOnMap = areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length

  const showOrHideFishingActivities = async function () {
    if (areFishingActivitiesReallyShowedOnMap) {
      dispatch(logbookActions.hideAllOnMap())

      return
    }

    if (!fishingActivities) {
      await dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))
    }
    dispatch(logbookActions.showAllOnMap())
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
