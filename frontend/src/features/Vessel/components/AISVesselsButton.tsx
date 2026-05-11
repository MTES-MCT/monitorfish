import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Button, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { displayedComponentActions } from '../../../domain/shared_slices/DisplayedComponent'

export function AISVesselsButton() {
  const dispatch = useMainAppDispatch()

  const areAISVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areAISVesselsDisplayed)

  const toggleDisplayAISVessels = () => {
    dispatch(displayedComponentActions.setDisplayedComponents({ areAISVesselsDisplayed: !areAISVesselsDisplayed }))
  }

  return (
    <AISButton
      $isActive={areAISVesselsDisplayed}
      Icon={areAISVesselsDisplayed ? Icon.Display : Icon.Hide}
      onClick={toggleDisplayAISVessels}
    >
      AIS
    </AISButton>
  )
}

const AISButton = styled(Button)<{
  $isActive: boolean
}>`
  flex-shrink: 0;
  height: 40px;

  ${p => {
    const activeProperties = p.$isActive
      ? `
      background: ${p.theme.color.blueGray};
      border-color: ${p.theme.color.blueGray};
    `
      : ''

    return activeProperties
  }}

  .Element-IconBox {
    margin-right: 4px;
  }
`
