import { FulfillingBouncingCircleSpinner } from '@components/FulfillingBouncingCircleSpinner'
import { showVesselsLastPosition } from '@features/Vessel/useCases/showVesselsLastPosition'
import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { skipToken } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { FIVE_MINUTES, TWENTY_MINUTES } from '../../../api/APIWorker'
import { COLORS } from '../../../constants/constants'
import { setError } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
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

    dispatch(showVesselsLastPosition(vessels))
  }, [dispatch, vessels, isError, error])

  useEffect(() => {
    if (vessels && !isAppLoaded) {
      setIsAppLoaded(true)
    }
  }, [vessels, isAppLoaded])

  return (
    <>
      {!isAppLoaded && (
        <FirstLoadWrapper>
          <FulfillingBouncingCircleSpinner className="update-vessels" color={COLORS.white} size={100} />
          <BigVessel />
          <Text data-cy="first-loader">Chargement...</Text>
        </FirstLoadWrapper>
      )}
      <UpdateWrapper $isVesselSidebarOpen={vesselSidebarIsOpen}>
        {(isFetching || loadingPositions) && isAppLoaded && (
          <>
            <FulfillingBouncingCircleSpinner className="update-vessels" color={COLORS.white} size={30} />
            <Vessel />
          </>
        )}
      </UpdateWrapper>
    </>
  )
}

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${COLORS.white};
  bottom: -17px;
  position: relative;
`

const Vessel = styled(VesselSVG)`
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
