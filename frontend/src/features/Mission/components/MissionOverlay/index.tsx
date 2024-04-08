import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMoveOverlayWhenDragging } from '@hooks/useMoveOverlayWhenDragging'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { margins } from './constants'
import { MissionDetails } from './MissionDetails'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { monitorfishMap } from '../../../map/monitorfishMap'
import { getOverlayPosition, getTopLeftMargin, OverlayPosition } from '../../../map/overlays/Overlay'
import { getMapResolution } from '../../../map/utils'

import type { Mission } from '../../mission.types'

const overlayHeight = 200
const INITIAL_OFFSET_VALUE = [0, 0]

export function MissionOverlay({ feature, isSelected = false }) {
  const selectedMissionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionGeoJSON)
  const currentOffsetRef = useRef(INITIAL_OFFSET_VALUE)
  const [missionProperties, setMissionProperties] = useState<Mission.MissionPointFeatureProperties | undefined>(
    undefined
  )
  const overlayRef = useRef<HTMLDivElement>()
  const overlayObjectRef = useRef<Overlay | undefined>()
  const [overlayTopLeftMargin, setOverlayTopLeftMargin] = useState<[number, number]>([margins.yBottom, margins.xMiddle])
  const [overlayPosition, setOverlayPosition] = useState(OverlayPosition.BOTTOM)

  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON])

  const overlayCallback = useCallback(
    ref => {
      overlayRef.current = ref
      if (!ref) {
        overlayObjectRef.current = undefined

        return
      }

      overlayObjectRef.current = new Overlay({
        autoPan: false,
        className: 'ol-overlay-container ol-selectable',
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
  }, [])

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

    if (!feature?.getId()?.toString()?.includes(MonitorFishLayer.MISSION_PIN_POINT)) {
      overlayRef.current.style.display = 'none'
      setMissionProperties(undefined)

      return
    }

    // Prevent the hovered mission overlay to bo on top of the same selected mission overlay
    if (!isSelected && selectedMission?.getId() === feature.getId()) {
      overlayRef.current.style.display = 'none'
      setMissionProperties(undefined)

      return
    }

    setMissionProperties(feature.getProperties() as Mission.MissionPointFeatureProperties)
    overlayRef.current.style.display = 'block'
    overlayObjectRef.current.setPosition(feature.getGeometry().getCoordinates())

    const nextOverlayPosition = getNextOverlayPosition()
    setOverlayPosition(nextOverlayPosition)
    setOverlayTopLeftMargin(getTopLeftMargin(nextOverlayPosition, margins))
  }, [feature, isSelected, selectedMission, setMissionProperties, overlayRef, overlayObjectRef, getNextOverlayPosition])

  return (
    <Wrapper ref={overlayCallback} overlayTopLeftMargin={overlayTopLeftMargin}>
      {missionProperties && (
        <MissionDetails isSelected={isSelected} mission={missionProperties} overlayPosition={overlayPosition} />
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
