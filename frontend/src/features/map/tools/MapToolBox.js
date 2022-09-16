import styled from 'styled-components'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import { COLORS } from '../../../constants/constants'

export const MapToolBox = styled(MapComponentStyle)`
  background: ${COLORS.background};
  margin-right: ${props => props.isOpen ? '45px' : '-420px'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
  z-index: 9999;
  box-shadow: 0px 3px 10px rgba(59, 69, 89, 0.5);
`
