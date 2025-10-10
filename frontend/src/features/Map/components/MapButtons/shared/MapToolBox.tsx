import { MapComponent } from '@features/commonStyles/MapComponent'
import styled from 'styled-components'

export const MapToolBox = styled(MapComponent)<{
  $hideBoxShadow?: boolean
  $isLeftBox?: boolean
  $isOpen: boolean
  $isTransparent?: boolean
  isHidden?: boolean
}>`
  background: ${p => (p.$isTransparent ? 'unset' : p.theme.color.white)};
  ${p => {
    if (p.$isLeftBox) {
      return `margin-left: ${p.$isOpen ? '45px' : '-420px'};`
    }

    return `margin-right: ${p.$isOpen ? '45px' : '-420px'};`
  }}
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  ${p => {
    if (p.$isLeftBox) {
      return 'left: 12px;'
    }

    return 'right: 12px;'
  }}
  border-radius: 2px;
  position: absolute;
  transition: all 0.3s;
  box-shadow: ${p => (p.$hideBoxShadow ? 'unset' : '0px 3px 10px rgba(59, 69, 89, 0.5)')};
`
