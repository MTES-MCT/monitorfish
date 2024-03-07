import { MapInteraction } from '@features/Draw/components/MapInteraction'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { CoordinatesInput, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Point } from 'ol/geom'
import { transform } from 'ol/proj'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import {
  InteractionListener,
  InteractionType,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '../../../domain/entities/map/constants'
import { SideWindowStatus } from '../../../domain/entities/sideWindow/constants'
import { fitToExtent } from '../../../domain/shared_slices/Map'
import { setInteractionType } from '../slice'
import { addFeatureToDrawedFeature } from '../useCases/addFeatureToDrawedFeature'
import { closeDraw } from '../useCases/closeDraw'
import { eraseDrawedGeometries } from '../useCases/eraseDrawedGeometries'

import type { Coordinates } from '@mtes-mct/monitor-ui'
import type { MultiPolygon } from 'ol/geom'

const INTERACTION_LISTENER_TITLE_PLACEHOLDER: Partial<Record<InteractionListener, string>> = {
  [InteractionListener.CONTROL_POINT]: 'un point de contrôle',
  [InteractionListener.MISSION_ZONE]: 'une zone de mission',
  [InteractionListener.SURVEILLANCE_ZONE]: 'une zone de surveillance'
}
const INTERACTION_LISTENER_BUTTON_LABEL: Partial<Record<InteractionListener, string>> = {
  [InteractionListener.CONTROL_POINT]: 'le point de contrôle',
  [InteractionListener.MISSION_ZONE]: 'la zone de mission',
  [InteractionListener.SURVEILLANCE_ZONE]: 'la zone de surveillance'
}

export function DrawLayerModal() {
  const dispatch = useMainAppDispatch()
  const { drawedGeometry, initialGeometry, interactionType, listener } = useMainAppSelector(state => state.draw)
  const sideWindowStatus = useMainAppSelector(state => state.sideWindow.status)
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)
  const initialFeatureNumberRef = useRef<number | undefined>(undefined)

  const feature = useMemo(() => {
    const currentGeometry = drawedGeometry ?? initialGeometry
    if (!currentGeometry) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(currentGeometry)
  }, [initialGeometry, drawedGeometry])

  useEffect(() => {
    if (initialFeatureNumberRef.current !== undefined) {
      return
    }

    if (!feature) {
      initialFeatureNumberRef.current = 0

      return
    }

    if (feature.getGeometry()?.getType() === OpenLayersGeometryType.MULTIPOLYGON) {
      initialFeatureNumberRef.current = (feature.getGeometry() as MultiPolygon).getPolygons().length

      return
    }

    initialFeatureNumberRef.current = 0
  }, [feature])

  useEffect(() => {
    if (sideWindowStatus === SideWindowStatus.CLOSED) {
      dispatch(closeDraw())
    }
  }, [dispatch, sideWindowStatus])

  const handleSelectInteraction = (nextInteractionType: InteractionType) => () => {
    dispatch(setInteractionType(nextInteractionType))
  }

  const handleReset = () => {
    dispatch(eraseDrawedGeometries(initialFeatureNumberRef.current))
  }

  const handleValidate = () => {
    dispatch(closeDraw())
  }

  const handleWriteCoordinates = useCallback(
    (nextCoordinates: Coordinates | undefined) => {
      if (!nextCoordinates) {
        return
      }

      const [latitude, longitude] = nextCoordinates
      if (!latitude || !longitude) {
        return
      }

      const nextTransformedCoordinates = transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      const nextFeature = new Feature({
        geometry: new Point(nextTransformedCoordinates)
      })

      dispatch(addFeatureToDrawedFeature(nextFeature))
      const extent = nextFeature.getGeometry()?.getExtent()
      if (!extent) {
        return
      }

      dispatch(fitToExtent(extent))
    },
    [dispatch]
  )

  return (
    <MapInteraction
      customTools={
        listener === InteractionListener.MISSION_ZONE && (
          <IconGroup>
            <IconButton
              className={interactionType === InteractionType.POLYGON ? '_active' : undefined}
              Icon={Icon.SelectPolygon}
              onClick={handleSelectInteraction(InteractionType.POLYGON)}
            />
            <IconButton
              className={interactionType === InteractionType.SQUARE ? '_active' : undefined}
              Icon={Icon.SelectRectangle}
              onClick={handleSelectInteraction(InteractionType.SQUARE)}
            />
            <IconButton
              className={interactionType === InteractionType.CIRCLE ? '_active' : undefined}
              Icon={Icon.SelectCircle}
              onClick={handleSelectInteraction(InteractionType.CIRCLE)}
            />
          </IconGroup>
        )
      }
      onReset={handleReset}
      onValidate={handleValidate}
      title={`Vous êtes en train d'ajouter ${listener && INTERACTION_LISTENER_TITLE_PLACEHOLDER[listener]}`}
      validateButtonText={`Valider ${listener && INTERACTION_LISTENER_BUTTON_LABEL[listener]}`}
    >
      {listener === InteractionListener.CONTROL_POINT && (
        <CoordinatesInputWrapper>
          <CoordinatesInput
            coordinatesFormat={coordinatesFormat}
            defaultValue={undefined}
            isLabelHidden
            label="Coordonnées"
            name="coordinates"
            onChange={handleWriteCoordinates}
          />
        </CoordinatesInputWrapper>
      )}
    </MapInteraction>
  )
}

const CoordinatesInputWrapper = styled.div`
  margin-bottom: 12px;
  margin-left: auto;
  margin-right: auto !important;
  width: 260px;
`

const IconGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
`
