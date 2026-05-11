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
    <AISButton Icon={areAISVesselsDisplayed ? Icon.Display : Icon.Hide} onClick={toggleDisplayAISVessels}>
      AIS
    </AISButton>
  )
}

const AISButton = styled(Button)`
  flex-shrink: 0;
  height: 40px;

  .Element-IconBox {
    margin-right: 4px;
  }
`
