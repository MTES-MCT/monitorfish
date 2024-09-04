import { useEscapeFromKeyboardAndExecute } from '@hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditInterestPoint } from './EditInterestPoint'
import { MapBox } from '../../../../domain/entities/map/constants'
import { setRightMapBoxOpened } from '../../../../domain/shared_slices/Global'
import InterestPointSVG from '../../../icons/standardized/Landmark.svg?react'
import { MapToolButton } from '../../../MainWindow/components/MapButtons/shared/MapToolButton'
import { deleteInterestPointBeingDrawed, drawInterestPoint, endInterestPointDraw } from '../../slice'

export function InterestPointMapButton() {
  const dispatch = useMainAppDispatch()
  const { rightMapBoxOpened, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => rightMapBoxOpened === MapBox.INTEREST_POINT, [rightMapBoxOpened])
  const wrapperRef = useRef(null)

  const close = useCallback(() => {
    dispatch(setRightMapBoxOpened(undefined))
  }, [dispatch])

  useEscapeFromKeyboardAndExecute(close)

  useEffect(() => {
    if (!isOpen) {
      dispatch(endInterestPointDraw())
      dispatch(deleteInterestPointBeingDrawed())
    }
  }, [dispatch, isOpen])

  const openOrCloseInterestPoint = useCallback(() => {
    if (!isOpen) {
      dispatch(drawInterestPoint())
      dispatch(setRightMapBoxOpened(MapBox.INTEREST_POINT))
    } else {
      close()
    }
  }, [dispatch, isOpen, close])

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointButton
        data-cy="interest-point"
        isActive={isOpen}
        onClick={openOrCloseInterestPoint}
        style={{ top: 364 }}
        title="Créer un point d'intérêt"
      >
        <InterestPointIcon $isRightMenuShrinked={isRightMenuShrinked} />
      </InterestPointButton>
      <EditInterestPoint close={close} isOpen={isOpen} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const InterestPointButton = styled(MapToolButton)``

const InterestPointIcon = styled(InterestPointSVG)<{
  $isRightMenuShrinked: boolean
}>`
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  width: 25px;

  rect:first-of-type {
    fill: ${p => p.theme.color.gainsboro};
  }

  path:first-of-type {
    fill: ${p => p.theme.color.gainsboro};
  }
`
