import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'

export const MapToolBox = styled(MapComponentStyle)<{
  healthcheckTextWarning: boolean
  isHidden?: boolean
  isOpen: boolean
}>`
  background: ${COLORS.white};
  margin-right: ${p => (p.isOpen ? '45px' : '-420px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
  z-index: 9999;
  box-shadow: 0px 3px 10px rgba(59, 69, 89, 0.5);
`
