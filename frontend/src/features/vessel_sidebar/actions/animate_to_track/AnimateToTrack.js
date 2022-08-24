import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { animateToExtent } from '../../../../domain/shared_slices/Map'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { ReactComponent as ShowTrackSVG } from '../../../icons/Bouton_afficher_toute_la_piste.svg'

function AnimateToTrack({ sidebarIsOpen }) {
  const { healthcheckTextWarning, rightMenuIsOpen } = useSelector(state => state.global)
  const dispatch = useDispatch()

  return (
    <AnimateToTrackButton
      data-cy="animate-to-track"
      healthcheckTextWarning={healthcheckTextWarning}
      onClick={() => dispatch(animateToExtent())}
      rightMenuIsOpen={rightMenuIsOpen}
      sidebarIsOpen={sidebarIsOpen}
      title="Centrer sur la piste"
    >
      <ShowTrackIcon />
    </AnimateToTrackButton>
  )
}

const AnimateToTrackButton = styled(MapButtonStyle)`
  top: 188px;
  height: 30px;
  width: 30px;
  background: ${COLORS.charcoal};
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
    background: ${COLORS.charcoal};
  }
`

const ShowTrackIcon = styled(ShowTrackSVG)`
  width: 30px;
`

export default AnimateToTrack
