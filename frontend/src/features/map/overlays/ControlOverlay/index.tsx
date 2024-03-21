import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { margins } from './constants'
import { ControlDetails } from './ControlDetails'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { useMoveOverlayWhenDragging } from '../../../../hooks/useMoveOverlayWhenDragging'
import { monitorfishMap } from '../../monitorfishMap'
import { getMapResolution } from '../../utils'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from '../Overlay'

import type { Mission } from '../../../Mission/mission.types'

const overlayHeight = 130
const INITIAL_OFFSET_VALUE = [0, 0]

export function ControlOverlay({ feature, isSelected = false }) {
  const selectedMissionActionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionActionGeoJSON)
  const currentOffsetRef = useRef(INITIAL_OFFSET_VALUE)
  const [controlProperties, setControlProperties] = useState<Mission.MissionActionFeatureProperties | undefined>(
    undefined
  )
  const overlayRef = useRef<HTMLDivElement>()
  const overlayObjectRef = useRef<Overlay | undefined>()
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState<[number, number]>([margins.yBottom, margins.xMiddle])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

  const selectedControl = useMemo(() => {
    if (!selectedMissionActionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionActionGeoJSON)
  }, [selectedMissionActionGeoJSON])

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (!ref) {
        overlayObjectRef.current = undefined

        return
      }

      overlayObjectRef.current = new Overlay({
        autoPan: false,
        className: 'ol-overlay-container ol-selectable mission-control-overlay',
        element: ref,
        offset: currentOffsetRef.current
      })
    },
    [overlayRef, overlayObjectRef]
  )

  useEffect(() => {
    if (overlayObjectRef.current) {
      currentOffsetRef.current = INITIAL_OFFSET_VALUE
      overlayObjectRef.current.setOffset(INITIAL_OFFSET_VALUE)
    }
  }, [feature])

  useMoveOverlayWhenDragging(
    overlayObjectRef.current,
    currentOffsetRef,
    () => {},
    true,
    () => {}
  )

  useEffect(() => {
    if (overlayObjectRef.current) {
      monitorfishMap.addOverlay(overlayObjectRef.current)
    }
  }, [overlayObjectRef])

  const getNextOverlayPosition = useCallback(() => {
    const [x, y] = feature.getGeometry().getCoordinates()
    const extent = monitorfishMap.getView().calculateExtent()
    const boxSize = getMapResolution() * overlayHeight

    return getOverlayPosition(boxSize, x, y, extent)
  }, [feature])

  useEffect(() => {
    if (!overlayRef.current || !overlayObjectRef.current) {
      return
    }

    if (!feature?.getId()?.toString()?.includes(MonitorFishLayer.MISSION_ACTION_SELECTED)) {
      overlayRef.current.style.display = 'none'
      setControlProperties(undefined)

      return
    }

    // Prevent the hovered control overlay to bo on top of the same selected control overlay
    if (!isSelected && selectedControl?.getId() === feature.getId()) {
      overlayRef.current.style.display = 'none'
      setControlProperties(undefined)

      return
    }

    setControlProperties(feature.getProperties() as Mission.MissionActionFeatureProperties)
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

    const nextOverlayPosition = getNextOverlayPosition()
    setOverlayPosition(nextOverlayPosition)
    setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
  }, [feature, isSelected, selectedControl, setControlProperties, overlayRef, overlayObjectRef, getNextOverlayPosition])

  return (
    <Wrapper ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {controlProperties && (
        <ControlDetails control={controlProperties} isSelected={isSelected} overlayPosition={overlayPosition} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  overlayTopLeftMargin: [number, number]
}>`
  position: absolute;
  top: ${p => p.overlayTopLeftMargin[0]}px;
  left: ${p => p.overlayTopLeftMargin[1]}px;
  border-radius: 2px;
  z-index: 1000;
  cursor: grabbing;
`
