import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import { EditInterestPoint } from './EditInterestPoint'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'
import { deleteInterestPointBeingDrawed, drawInterestPoint, endInterestPointDraw } from '../../slice'

export function InterestPointMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.INTEREST_POINT)

  const close = () => {
    dispatch(setRightMapBoxOpened(undefined))
  }

  useEscapeFromKeyboardAndExecute(close)

  useEffect(() => {
    if (!isOpened) {
      dispatch(endInterestPointDraw())
      dispatch(deleteInterestPointBeingDrawed())
    }
  }, [dispatch, isOpened])

  const openOrCloseInterestPoint = () => {
    if (!isOpened) {
      dispatch(drawInterestPoint())
      dispatch(setRightMapBoxOpened(MapBox.INTEREST_POINT))
      dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))

      return
    }

    close()
  }

  return (
    <Wrapper>
      <MapToolButton
        data-cy="interest-point"
        Icon={Icon.Report}
        isActive={isOpened}
        onClick={openOrCloseInterestPoint}
        style={{ top: 340 }}
        title="Créer un point d'intérêt"
      />
      {isRendered && <EditInterestPoint close={close} isOpen={isOpened} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
