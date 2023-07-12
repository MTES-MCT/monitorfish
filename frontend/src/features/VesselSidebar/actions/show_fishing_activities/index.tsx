import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import {
  hideFishingActivitiesOnMap,
  showFishingActivitiesOnMap
} from '../../../../domain/shared_slices/FishingActivities'
import { getVesselLogbook } from '../../../../domain/use_cases/vessel/getVesselLogbook'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReactComponent as ShowFishingActivitiesSVG } from '../../../icons/Bouton_afficher_messages_JPE_sur_piste.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

export function ShowFishingActivitiesOnMap({ isSidebarOpen }) {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const { selectedVesselIdentity } = useMainAppSelector(state => state.vessel)
  const { areFishingActivitiesShowedOnMap, fishingActivities, fishingActivitiesShowedOnMap } = useMainAppSelector(
    state => state.fishingActivities
  )
  const areFishingActivitiesReallyShowedOnMap = useMemo(
    () => areFishingActivitiesShowedOnMap || fishingActivitiesShowedOnMap?.length,
    [areFishingActivitiesShowedOnMap, fishingActivitiesShowedOnMap]
  )

  useEffect(() => {
    if (!isSidebarOpen) {
      dispatch(hideFishingActivitiesOnMap())
    }
  }, [dispatch, isSidebarOpen])

  const showOrHideFishingActivities = useCallback(() => {
    ;(async () => {
      if (areFishingActivitiesReallyShowedOnMap) {
        dispatch(hideFishingActivitiesOnMap())

        return
      }

      if (!fishingActivities) {
        await dispatch(getVesselLogbook(selectedVesselIdentity, undefined, true))
      }
      dispatch(showFishingActivitiesOnMap())
    })()
  }, [fishingActivities, selectedVesselIdentity, areFishingActivitiesReallyShowedOnMap, dispatch])

  return (
    <VesselSidebarActionButton
      backgroundColor={areFishingActivitiesReallyShowedOnMap ? THEME.color.blueGray[100] : THEME.color.charcoal}
      data-cy="show-all-fishing-activities-on-map"
      healthcheckTextWarning={!!healthcheckTextWarning}
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
