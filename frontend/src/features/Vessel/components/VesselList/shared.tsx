import styled from 'styled-components'

import VesselListSVG from '../../../icons/Icone_liste_navires.svg?react'

export const VesselIcon = styled(VesselListSVG)<{
  $background: string
  $isRightMenuShrinked: boolean | undefined
  $isTitle: boolean
}>`
  width: 25px;
  height: 25px;
  margin-top: 4px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  vertical-align: ${p => (p.$isTitle ? 'text-bottom' : 'baseline')};
  circle {
    fill: ${p => p.$background};
  }
  transition: all 0.3s;
`
