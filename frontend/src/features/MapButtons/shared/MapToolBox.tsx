import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { MapComponent } from '../../commonStyles/MapComponent'

export const MapToolBox = styled(MapComponent)<{
  isHidden?: boolean
  isLeftBox?: boolean
  isOpen: boolean
}>`
  background: ${COLORS.white};
  ${p => {
    if (p.isLeftBox) {
      return `margin-left: ${p.isOpen ? '45px' : '-420px'};`
    }

    return `margin-right: ${p.isOpen ? '45px' : '-420px'};`
  }}
  opacity: ${p => (p.isOpen ? '1' : '0')};
  ${p => {
    if (p.isLeftBox) {
      return 'left: 10px;'
    }

    return 'right: 10px;'
  }}
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
  z-index: 9999;
  box-shadow: 0px 3px 10px rgba(59, 69, 89, 0.5);
`
