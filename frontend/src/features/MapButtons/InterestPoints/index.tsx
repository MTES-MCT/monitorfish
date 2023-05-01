import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditInterestPoint } from './EditInterestPoint'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../../domain/shared_slices/InterestPoint'
import { useEscapeFromKeyboardAndExecute } from '../../../hooks/useEscapeFromKeyboardAndExecute'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { ReactComponent as InterestPointSVG } from '../../icons/standardized/Landmark.svg'
import { MapToolButton } from '../shared/MapToolButton'

export function InterestPointMapButton() {
  const dispatch = useMainAppDispatch()
  const { healthcheckTextWarning, mapToolOpened, rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.INTEREST_POINT, [mapToolOpened])
  const wrapperRef = useRef(null)

  const close = useCallback(() => {
    dispatch(setMapToolOpened(undefined))
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
      dispatch(setMapToolOpened(MapToolType.INTEREST_POINT))
    } else {
      close()
    }
  }, [dispatch, isOpen, close])

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointButton
        dataCy="interest-point"
        isOpen={isOpen}
        onClick={openOrCloseInterestPoint}
        style={{ top: 291 }}
        title={"Créer un point d'intérêt"}
      >
        <InterestPointIcon $isRightMenuShrinked={isRightMenuShrinked} />
      </InterestPointButton>
      <EditInterestPoint close={close} healthcheckTextWarning={healthcheckTextWarning} isOpen={isOpen} />
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
