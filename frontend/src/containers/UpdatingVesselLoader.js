import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { COLORS } from '../constants/constants'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../components/icons/Icone_navire.svg'
import { MapComponentStyle } from '../components/commonStyles/MapComponent.style'

const UpdatingVesselLoader = () => {
  const isUpdatingVessels = useSelector(state => state.global.isUpdatingVessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const [loadingApp, setLoadingApp] = useState(false)
  const [appIsLoaded, setAppIsLoaded] = useState(false)

  useEffect(() => {
    if (isUpdatingVessels && !loadingApp && !appIsLoaded) {
      setLoadingApp(true)
    } else if (!isUpdatingVessels && loadingApp && !appIsLoaded) {
      setLoadingApp(false)
      setAppIsLoaded(true)
    }
  }, [isUpdatingVessels])

  return (
    <>
      {loadingApp
        ? <FirstLoadWrapper healthcheckTextWarning={healthcheckTextWarning}>
          <FulfillingBouncingCircleSpinner
            color={COLORS.background}
            className={'update-vessels'}
            size={100}/>
          <BigVessel/>
          <Text data-cy={'first-loader'}>Chargement...</Text>
        </FirstLoadWrapper>
        : null
      }
      <UpdateWrapper
        healthcheckTextWarning={healthcheckTextWarning}
        selectedVessel={selectedVessel}>
        {
          isUpdatingVessels && !loadingApp
            ? <>
              <FulfillingBouncingCircleSpinner
                color={COLORS.background}
                className={'update-vessels'}
                size={30}/>
              <Vessel/>
            </>
            : null
        }
      </UpdateWrapper>
    </>
  )
}

const Text = styled.span`
  margin-top: 10px;
  font-size: 13px;
  color: ${COLORS.background};
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

const UpdateWrapper = styled(MapComponentStyle)`
  position: absolute;
  top: 30px;
  right: ${props => props.selectedVessel ? '510px' : '370px'};
  width: 30px;
  transform: translate(-50%, -50%);
`

const FirstLoadWrapper = styled(MapComponentStyle)`
  position: fixed;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export default UpdatingVesselLoader
