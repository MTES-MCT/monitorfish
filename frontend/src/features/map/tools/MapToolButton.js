import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { MapButtonStyle } from '../../commonStyles/MapButton.style'

export const MapToolButton = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  padding: 3px 0px 0 3px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;

  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`
