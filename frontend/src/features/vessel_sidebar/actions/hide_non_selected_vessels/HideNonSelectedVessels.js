import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { setHideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { ReactComponent as HidingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_inactif.svg'

function HideNonSelectedVessels({ sidebarIsOpen }) {
  const dispatch = useDispatch()
  const { healthcheckTextWarning, rightMenuIsOpen } = useSelector(state => state.global)
  const { hideNonSelectedVessels } = useSelector(state => state.vessel)

  return (
    <HideNonSelectedVesselsButton
      data-cy="trigger-hide-other-vessels-from-sidebar"
      healthcheckTextWarning={healthcheckTextWarning}
      hideNonSelectedVessels={hideNonSelectedVessels}
      onClick={() => dispatch(setHideNonSelectedVessels(!hideNonSelectedVessels))}
      rightMenuIsOpen={rightMenuIsOpen}
      sidebarIsOpen={sidebarIsOpen}
      title={`${hideNonSelectedVessels ? 'Afficher' : 'Cacher'} les autres navires`}
    >
      {hideNonSelectedVessels ? <HidingOtherTracks /> : <ShowingOtherTracks />}
    </HideNonSelectedVesselsButton>
  )
}

const HideNonSelectedVesselsButton = styled(MapButtonStyle)`
  top: 223px;
  height: 30px;
  width: 30px;
  background: ${props => (props.hideNonSelectedVessels ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  position: absolute;
  margin-right: ${props => (props.sidebarIsOpen ? 505 : -45)}px;
  opacity: ${props => (props.sidebarIsOpen ? 1 : 0)};
  ${props => (props.isClickable ? 'cursor: pointer;' : null)}
  border-radius: 1px;
  z-index: 999;
  right: ${props => (props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10)}px;
  transition: all 0.5s, right 0.3s;

  :hover,
  :focus {
    background: ${props => (props.hideNonSelectedVessels ? props.theme.color.blueGray[100] : props.theme.color.charcoal)};
  }
`

const HidingOtherTracks = styled(HidingOtherTracksSVG)`
  width: 30px;
`

const ShowingOtherTracks = styled(ShowingOtherTracksSVG)`
  width: 30px;
`

export default HideNonSelectedVessels
