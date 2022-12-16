import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  hideFishingActivitiesOnMap,
  showFishingActivitiesOnMap
} from '../../../../domain/shared_slices/FishingActivities'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { ReactComponent as ShowFishingActivitiesSVG } from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useAppDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useAppSelector(state => state.global)
  const { areFishingActivitiesShowedOnMap: _areFishingActivitiesShowedOnMap, fishingActivitiesShowedOnMap } =
    useAppSelector(state => state.fishingActivities)
  const areFishingActivitiesShowedOnMap = useMemo(
    () => _areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length,
    [_areFishingActivitiesShowedOnMap, fishingActivitiesShowedOnMap]
  )

  useEffect(() => {
    if (!isSidebarOpen) {
      dispatch(hideFishingActivitiesOnMap())
    }
  }, [dispatch, isSidebarOpen])

  const showOrHideFishingActivities = useCallback(() => {
    if (areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length) {
      dispatch(hideFishingActivitiesOnMap())
    } else {
      dispatch(showFishingActivitiesOnMap())
    }
  }, [dispatch, areFishingActivitiesShowedOnMap, fishingActivitiesShowedOnMap])

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
