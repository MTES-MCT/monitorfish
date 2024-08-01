import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditVesselLabels } from './EditVesselLabels'
import { MapBox } from '../../../../../domain/entities/map/constants'
import { setRightMapBoxOpened } from '../../../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselLabelsMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => rightMapBoxOpened === MapBox.VESSEL_LABELS, [rightMapBoxOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselLabels = useCallback(() => {
    if (!isOpen) {
      dispatch(setRightMapBoxOpened(MapBox.VESSEL_LABELS))
    } else {
      dispatch(setRightMapBoxOpened(undefined))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-labels"
        isActive={isOpen}
        onClick={openOrCloseVesselLabels}
        style={{ top: 220 }}
        title="Affichage des labels"
      >
        <Icon.Tag color={isRightMenuShrinked ? THEME.color.charcoal : THEME.color.gainsboro} size={26} />
      </MapToolButton>
      <EditVesselLabels />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
