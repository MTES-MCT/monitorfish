import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  hideFishingActivitiesOnMap,
  showFishingActivitiesOnMap
} from '../../../../domain/shared_slices/FishingActivities'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReactComponent as ShowFishingActivitiesSVG } from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const { fishingActivities } = useMainAppSelector(state => state)
  const areFishingActivitiesShowedOnMap = useMemo(
    () => fishingActivities.areFishingActivitiesShowedOnMap || fishingActivities.fishingActivitiesShowedOnMap?.length,
    [fishingActivities.areFishingActivitiesShowedOnMap, fishingActivities.fishingActivitiesShowedOnMap]
  )

  useEffect(() => {
    if (!isSidebarOpen) {
      dispatch(hideFishingActivitiesOnMap())
    }
  }, [dispatch, isSidebarOpen])

  const showOrHideFishingActivities = useCallback(() => {
    if (areFishingActivitiesShowedOnMap || fishingActivities.fishingActivitiesShowedOnMap?.length) {
      dispatch(hideFishingActivitiesOnMap())
    } else {
      dispatch(showFishingActivitiesOnMap())
    }
  }, [areFishingActivitiesShowedOnMap, dispatch, fishingActivities.fishingActivitiesShowedOnMap])

  return (
    <VesselSidebarActionButton
      backgroundColor={areFishingActivitiesShowedOnMap ? THEME.color.blueGray[100] : THEME.color.charcoal}
      data-cy="show-all-fishing-activities-on-map"
      healthcheckTextWarning={!!healthcheckTextWarning}
      isHidden={false}
      isRightMenuOpen={rightMenuIsOpen}
      isSidebarOpen={isSidebarOpen}
      onClick={showOrHideFishingActivities}
      title={`${areFishingActivitiesShowedOnMap ? 'Cacher' : 'Afficher'} les messages du JPE sur la piste`}
      top={223}
    >
      <ShowFishingActivities />
    </VesselSidebarActionButton>
  )
}

const ShowFishingActivities = styled(ShowFishingActivitiesSVG)`
  width: 30px;
`
