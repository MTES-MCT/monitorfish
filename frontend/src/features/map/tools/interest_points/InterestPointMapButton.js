import React, { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../../constants/constants'
import { expandRightMenu, setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { MapButtonStyle } from '../../../commonStyles/MapButton.style'
import { ReactComponent as InterestPointSVG } from '../../../icons/Point_interet.svg'
import EditInterestPoint from './EditInterestPoint'
import {
  deleteInterestPointBeingDrawed,
  drawInterestPoint,
  endInterestPointDraw
} from '../../../../domain/shared_slices/InterestPoint'
import { useEscapeFromKeyboard } from '../../../../hooks/useEscapeFromKeyboard'
import { MapTool } from '../../../../domain/entities/map'
import { MapToolButton } from '../MapToolButton'

const InterestPointMapButton = () => {
  const dispatch = useDispatch()
  const {
    healthcheckTextWarning,
    rightMenuIsOpen,
    previewFilteredVesselsMode,
    mapToolOpened
  } = useSelector(state => state.global)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)

  const isRightMenuIconShrinked = selectedVessel && !rightMenuIsOpen
  const isInterestPointOpen = useMemo(() => mapToolOpened === MapTool.INTEREST_POINT, [mapToolOpened])
  const wrapperRef = useRef(null)
  const escapeFromKeyboard = useEscapeFromKeyboard()

  useEffect(() => {
    if (escapeFromKeyboard) {
      close()
    }
  }, [escapeFromKeyboard])

  function openOrCloseInterestPoint () {
    if (!isInterestPointOpen) {
      dispatch(drawInterestPoint())
      dispatch(setMapToolOpened(MapTool.INTEREST_POINT))
    } else {
      close()
    }
  }

  function close () {
    dispatch(endInterestPointDraw())
    dispatch(setMapToolOpened(undefined))
    dispatch(deleteInterestPointBeingDrawed())
  }

  return (
    <Wrapper ref={wrapperRef}>
      <InterestPointButton
        data-cy={'interest-point'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isInterestPointOpen}
        rightMenuIsShrinked={!rightMenuIsOpen}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Créer un point d\'intérêt'}
        onClick={openOrCloseInterestPoint}
      >
        <InterestPointIcon
          $rightMenuIsShrinked={!rightMenuIsOpen}
        />
      </InterestPointButton>
      <EditInterestPoint
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isInterestPointOpen}
        close={close}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const InterestPointButton = styled(MapToolButton)`
  top: 291px;
`

const InterestPointIcon = styled(InterestPointSVG)`
  width: 40px;
  opacity: ${props => props.$rightMenuIsShrinked ? '0' : '1'};
  transition: all 0.2s;
`

export default InterestPointMapButton
