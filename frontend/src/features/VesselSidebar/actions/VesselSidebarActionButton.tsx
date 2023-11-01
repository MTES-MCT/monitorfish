import styled from 'styled-components'

import { MapButton } from '../../commonStyles/MapButton'

export const VesselSidebarActionButton = styled(MapButton)<{
  backgroundColor?: string
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
  top: number
}>`
  top: ${p => p.top}px;
  height: 30px;
  width: 30px;
  background: ${p => p.backgroundColor || p.theme.color.charcoal};
  position: absolute;
  margin-right: ${p => (p.isSidebarOpen ? 505 : -45)}px;
  opacity: ${p => (p.isSidebarOpen ? 1 : 0)};
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  transition:
    all 0.5s,
    right 0.3s;

  :hover,
  :focus {
    background: ${p => p.backgroundColor || p.theme.color.charcoal};
  }
`
