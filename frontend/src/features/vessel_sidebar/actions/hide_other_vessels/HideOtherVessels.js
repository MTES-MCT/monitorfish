import React, { useEffect } from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as HidingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_inactif.svg'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useDispatch, useSelector } from 'react-redux'
import { setHideOtherVessels } from '../../../../domain/shared_slices/Vessel'

const HideOtherVessels = ({ openBox, rightMenuIsOpen }) => {
  const dispatch = useDispatch()
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { hideOtherVessels } = useSelector(state => state.vessel)

  useEffect(() => {
    if (!openBox) {
      dispatch(setHideOtherVessels(false))
    }
  }, [openBox])

  return (
    <HideOtherVesselsButton
      data-cy={'trigger-hide-other-vessels-from-sidebar'}
      healthcheckTextWarning={healthcheckTextWarning}
      hideOtherVessels={hideOtherVessels}
      openBox={openBox}
      rightMenuIsOpen={rightMenuIsOpen}
      onClick={() => dispatch(setHideOtherVessels(!hideOtherVessels))}
      title={`${hideOtherVessels ? 'Afficher' : 'Cacher'} les autres navires`}
    >
      {
        hideOtherVessels
          ? <HidingOtherTracks />
          : <ShowingOtherTracks/>
      }
    </HideOtherVesselsButton>
  )
}

const HideOtherVesselsButton = styled(MapButtonStyle)`
  top: 188px;
  height: 30px;
  width: 30px;
  background: ${props => props.hideOtherVessels ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;

  :hover, :focus {
      background: ${props => props.hideOtherVessels ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const HidingOtherTracks = styled(HidingOtherTracksSVG)`
  width: 30px;
`

const ShowingOtherTracks = styled(ShowingOtherTracksSVG)`
  width: 30px;
`

export default HideOtherVessels
