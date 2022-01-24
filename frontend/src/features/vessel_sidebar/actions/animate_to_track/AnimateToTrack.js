import React from 'react'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as ShowTrackSVG } from '../../../icons/Bouton_afficher_toute_la_piste.svg'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { useDispatch, useSelector } from 'react-redux'
import { animateToExtent } from '../../../../domain/shared_slices/Map'

const AnimateToTrack = ({ openBox, rightMenuIsOpen }) => {
  const { healthcheckTextWarning } = useSelector(state => state.global)
  const dispatch = useDispatch()

  return (
    <AnimateToTrackButton
      data-cy={'animate-to-track'}
      title={'Centrer sur la piste'}
      healthcheckTextWarning={healthcheckTextWarning}
      openBox={openBox}
      rightMenuIsOpen={rightMenuIsOpen}
      onClick={() => dispatch(animateToExtent())}
    >
      <ShowTrackIcon/>
    </AnimateToTrackButton>
  )
}

const AnimateToTrackButton = styled(MapButtonStyle)`
  top: 153px;
  height: 30px;
  width: 30px;
  background: ${COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  ${props => props.isClickable ? 'cursor: pointer;' : null}
  border-radius: 1px;
  z-index: 999;
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;

  :hover, :focus {
      background: ${COLORS.charcoal};
  }
`

const ShowTrackIcon = styled(ShowTrackSVG)`
  width: 30px;
`

export default AnimateToTrack
