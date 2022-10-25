import styled from 'styled-components'

import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'

export const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 9px;
  transform: ${props => (!props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.5s
  cursor: pointer;
`
