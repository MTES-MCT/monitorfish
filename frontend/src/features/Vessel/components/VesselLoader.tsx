import { FIVE_MINUTES, TWENTY_MINUTES } from '@api/APIWorker'
import { FulfillingBouncingCircleSpinner } from '@components/FulfillingBouncingCircleSpinner'
import { showVesselsLastPosition } from '@features/Vessel/useCases/showVesselsLastPosition'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { setError } from '../../../domain/shared_slices/Global'
import { MapComponent } from '../../commonStyles/MapComponent'
import VesselSVG from '../../icons/Icone_navire.svg?react'
import { useGetVesselsLastPositionsApi } from '../hooks/useGetVesselsLastPositionsApi'

export function VesselLoader() {
  const useGetVesselsLastPositionsQuery = useGetVesselsLastPositionsApi()
  const isInLightMode = useIsInLightMode()
  const dispatch = useMainAppDispatch()

  const blockVesselsUpdate = useMainAppSelector(state => state.global.blockVesselsUpdate)
  const loadingPositions = useMainAppSelector(state => state.vessel.loadingPositions)
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)

  const {
    data: vessels,
    error,
    isError,
    isFetching
  } = useGetVesselsLastPositionsQuery(blockVesselsUpdate ? skipToken : undefined, {
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

    dispatch(showVesselsLastPosition(vessels as Vessel.VesselLastPosition[]))
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
          <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.white} size={100} />
          <BigVessel />
        </FirstLoadWrapper>
      )}
      <UpdateWrapper $isVesselSidebarOpen={vesselSidebarIsOpen}>
        {(isFetching || loadingPositions) && isAppLoaded && (
          <>
            <FulfillingBouncingCircleSpinner className="update-vessels" color={THEME.color.white} size={30} />
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
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
`
