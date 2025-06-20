import { FIVE_MINUTES, TWENTY_MINUTES } from '@api/APIWorker'
import { saveActiveVesselsAndDisplayLastPositions } from '@features/Vessel/useCases/saveActiveVesselsAndDisplayLastPositions'
import { useGetActiveVesselsQuery } from '@features/Vessel/vesselApi'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FulfillingBouncingCircleLoader } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { setError } from '../../../domain/shared_slices/Global'
import { MapComponent } from '../../commonStyles/MapComponent'
import VesselSVG from '../../icons/Icone_navire.svg?react'

export function VesselLoader() {
  const isInLightMode = useIsInLightMode()
  const dispatch = useMainAppDispatch()

  const loadingPositions = useMainAppSelector(state => state.vessel.loadingPositions)
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)

  const {
    data: vessels,
    error,
    isError,
    isFetching
  } = useGetActiveVesselsQuery(undefined, {
    pollingInterval: isInLightMode ? TWENTY_MINUTES : FIVE_MINUTES
  })

  const [isAppLoaded, setIsAppLoaded] = useState(false)

  useEffect(() => {
    if (isError || !vessels) {
      if (error) {
        dispatch(setError(error))
      }

      return
    }

    dispatch(saveActiveVesselsAndDisplayLastPositions(vessels))
  }, [dispatch, vessels, isError, error])

  useEffect(() => {
    if (vessels && !isAppLoaded) {
      setIsAppLoaded(true)
    }
  }, [vessels, isAppLoaded])

  return (
    <>
      {!isAppLoaded && (
        <FirstLoadWrapper data-cy="first-loader">
          <FulfillingBouncingCircleLoader className="update-vessels" />
          <BigVessel />
        </FirstLoadWrapper>
      )}
      <UpdateWrapper $isVesselSidebarOpen={vesselSidebarIsOpen}>
        {(isFetching || loadingPositions) && isAppLoaded && (
          <>
            <FulfillingBouncingCircleLoader className="update-vessels" size={30} />
            <VesselIcon />
          </>
        )}
      </UpdateWrapper>
    </>
  )
}

const VesselIcon = styled(VesselSVG)`
  position: absolute;
  top: 2px;
  left: 8px;
  width: 16px;
`

const BigVessel = styled(VesselSVG)`
  position: absolute;
  top: 36px;
  left: 41px;
  width: 22px;
  transform: scale(2);
`

const UpdateWrapper = styled(MapComponent)<{
  $isVesselSidebarOpen: boolean
}>`
  position: absolute;
  top: 30px;
  right: ${p => (p.$isVesselSidebarOpen ? '510px' : '370px')};
  width: 30px;
  transform: translate(-50%, -50%);
`

const FirstLoadWrapper = styled(MapComponent)`
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
`
