import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditVesselLabels } from './EditVesselLabels'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselLabelsMapButton() {
  const dispatch = useMainAppDispatch()
  const mapToolOpened = useMainAppSelector(state => state.global.mapToolOpened)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_LABELS, [mapToolOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setMapToolOpened(undefined))
  })

  const openOrCloseVesselLabels = useCallback(() => {
    if (!isOpen) {
      dispatch(setMapToolOpened(MapToolType.VESSEL_LABELS))
    } else {
      dispatch(setMapToolOpened(undefined))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-labels"
        isActive={isOpen}
        onClick={openOrCloseVesselLabels}
        style={{ top: 194 }}
        title="Affichage des dernières positions"
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
