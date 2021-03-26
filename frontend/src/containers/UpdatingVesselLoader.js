import React from 'react'
import { useSelector } from 'react-redux'
import { COLORS } from '../constants/constants'
import { FulfillingBouncingCircleSpinner } from 'react-epic-spinners'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../components/icons/Icone_navire.svg'

const UpdatingVesselLoader = () => {
  const isUpdatingVessels = useSelector(state => state.global.isUpdatingVessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)

  return (
    <Wrapper selectedVessel={selectedVessel}>
      {
        isUpdatingVessels
          ? <>
            <FulfillingBouncingCircleSpinner
              color={COLORS.background}
              className={'update-vessels'}
              size={30}/>
            <Vessel/>
          </>
          : null
      }
    </Wrapper>
  )
}

const Vessel = styled(VesselSVG)`
  position: absolute;
  top: 2px;
  left: 8px;
  width: 16px;
`

const Wrapper = styled.div`
  position: absolute;
  top: 34px;
  left: ${props => props.selectedVessel ? '72%' : '80%'};
  width: 30px;
  transform: translate(-50%, -50%);
`

export default UpdatingVesselLoader
