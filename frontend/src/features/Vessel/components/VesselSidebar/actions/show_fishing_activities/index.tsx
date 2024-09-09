import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useMainAppDispatch } from '../../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { useGetLogbookUseCase } from '../../../../../Logbook/hooks/useGetLogbookUseCase'
import { logbookActions } from '../../../../../Logbook/slice'
import ShowFishingActivitiesSVG from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const { selectedVesselIdentity, selectedVesselPositions } = useMainAppSelector(state => state.vessel)
  const { areFishingActivitiesShowedOnMap, fishingActivities, fishingActivitiesShowedOnMap } = useMainAppSelector(
    state => state.fishingActivities
  )
  const getVesselLogbook = useGetLogbookUseCase()
  const areFishingActivitiesReallyShowedOnMap = useMemo(
    () => areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length,
    [areFishingActivitiesShowedOnMap, fishingActivitiesShowedOnMap]
  )

  useEffect(() => {
    if (!isSidebarOpen) {
      dispatch(logbookActions.hideAllOnMap())
    }
  }, [dispatch, isSidebarOpen])

  const showOrHideFishingActivities = useCallback(() => {
    ;(async () => {
      if (areFishingActivitiesReallyShowedOnMap) {
        dispatch(logbookActions.hideAllOnMap())

        return
      }

      if (!fishingActivities) {
        await dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))
      }
      dispatch(logbookActions.showAllOnMap())
    })()
  }, [fishingActivities, getVesselLogbook, selectedVesselIdentity, areFishingActivitiesReallyShowedOnMap, dispatch])

  return (
    <VesselSidebarActionButton
      backgroundColor={areFishingActivitiesReallyShowedOnMap ? THEME.color.blueGray : THEME.color.charcoal}
      data-cy="show-all-fishing-activities-on-map"
      disabled={!selectedVesselPositions?.length}
      isHidden={false}
      isRightMenuOpen={rightMenuIsOpen}
      isSidebarOpen={isSidebarOpen}
      onClick={showOrHideFishingActivities}
      title={`${areFishingActivitiesReallyShowedOnMap ? 'Cacher' : 'Afficher'} les messages du JPE sur la piste`}
      top={223}
    >
      <ShowFishingActivities />
    </VesselSidebarActionButton>
  )
}

const ShowFishingActivities = styled(ShowFishingActivitiesSVG)`
  width: 30px;
`
