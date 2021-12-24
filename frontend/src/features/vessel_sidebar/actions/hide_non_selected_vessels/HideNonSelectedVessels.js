import React, { useEffect } from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as HidingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_inactif.svg'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useDispatch, useSelector } from 'react-redux'
import { sethideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'

const HideNonSelectedVessels = ({ openBox, rightMenuIsOpen }) => {
  const dispatch = useDispatch()
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { hideNonSelectedVessels } = useSelector(state => state.vessel)

  useEffect(() => {
    if (!openBox) {
      dispatch(sethideNonSelectedVessels(false))
    }
  }, [openBox])

  return (
    <HideNonSelectedVesselsButton
      data-cy={'trigger-hide-other-vessels-from-sidebar'}
      healthcheckTextWarning={healthcheckTextWarning}
      hideNonSelectedVessels={hideNonSelectedVessels}
      openBox={openBox}
      rightMenuIsOpen={rightMenuIsOpen}
      onClick={() => dispatch(sethideNonSelectedVessels(!hideNonSelectedVessels))}
      title={`${hideNonSelectedVessels ? 'Afficher' : 'Cacher'} les autres navires`}
    >
      {
        hideNonSelectedVessels
          ? <HidingOtherTracks />
          : <ShowingOtherTracks/>
      }
    </HideNonSelectedVesselsButton>
  )
}

const HideNonSelectedVesselsButton = styled(MapButtonStyle)`
  top: 188px;
  height: 30px;
  width: 30px;
  background: ${props => props.hideNonSelectedVessels ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  right: 10px;
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  transition: 0.5s all;
  
  animation: ${props => props.rightMenuIsOpen && props.openBox
  ? 'vessel-box-opening-with-right-menu-hover'
  : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  :hover, :focus {
      background: ${props => props.hideNonSelectedVessels ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const HidingOtherTracks = styled(HidingOtherTracksSVG)`
  width: 30px;
`

const ShowingOtherTracks = styled(ShowingOtherTracksSVG)`
  width: 30px;
`

export default HideNonSelectedVessels
