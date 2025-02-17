import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import ShowFishingActivitiesSVG from '../../../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg?react'
import { useGetLogbookUseCase } from '../../../../../Logbook/hooks/useGetLogbookUseCase'
import { logbookActions } from '../../../../../Logbook/slice'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const { selectedVesselIdentity, selectedVesselPositions } = useMainAppSelector(state => state.vessel)
  const { areFishingActivitiesShowedOnMap, fishingActivities, fishingActivitiesShowedOnMap } = useMainAppSelector(
    state => state.fishingActivities
  )
  const getVesselLogbook = useGetLogbookUseCase()
  const areFishingActivitiesReallyShowedOnMap = areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length

  useEffect(() => {
    if (!isSidebarOpen) {
      dispatch(logbookActions.hideAllOnMap())
    }
  }, [dispatch, isSidebarOpen])

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
      <ShowFishingActivities />
    </VesselSidebarActionButton>
  )
}

const ShowFishingActivities = styled(ShowFishingActivitiesSVG)`
  width: 30px;
`
