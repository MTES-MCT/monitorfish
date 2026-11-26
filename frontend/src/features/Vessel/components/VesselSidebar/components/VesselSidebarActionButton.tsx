import styled from 'styled-components'

import { VESSEL_SIDEBAR_ACTION_BUTTON_SIZE } from '../constants'

/** Placed in the action buttons column of `VesselSidebar`. */
export const VesselSidebarActionButton = styled.button<{
  $backgroundColor?: string
}>`
  background: ${p => p.$backgroundColor ?? p.theme.color.charcoal};
  border-radius: 1px;
  cursor: pointer;
  height: ${VESSEL_SIDEBAR_ACTION_BUTTON_SIZE}px;
  padding: 0;
  width: ${VESSEL_SIDEBAR_ACTION_BUTTON_SIZE}px;

  &:hover,
  &:focus {
    background: ${p => p.$backgroundColor ?? p.theme.color.charcoal};
  }
`
