import { MapBox } from '@features/Map/constants'
import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { EditInterestPoint } from './EditInterestPoint'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'
import { deleteInterestPointBeingDrawed, drawInterestPoint, endInterestPointDraw } from '../../slice'

export function InterestPointMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isOpen = rightMapBoxOpened === MapBox.INTEREST_POINT
  const wrapperRef = useRef(null)

  const close = () => {
    dispatch(setRightMapBoxOpened(undefined))
  }

  useEscapeFromKeyboardAndExecute(close)

  useEffect(() => {
    if (!isOpen) {
      dispatch(endInterestPointDraw())
      dispatch(deleteInterestPointBeingDrawed())
    }
  }, [dispatch, isOpen])

  const openOrCloseInterestPoint = () => {
    if (!isOpen) {
      dispatch(drawInterestPoint())
      dispatch(setRightMapBoxOpened(MapBox.INTEREST_POINT))

      return
    }

    close()
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="interest-point"
        Icon={Icon.Report}
        isActive={isOpen}
        onClick={openOrCloseInterestPoint}
        style={{ top: 364 }}
        title="Créer un point d'intérêt"
      />
      <EditInterestPoint close={close} isOpen={isOpen} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
