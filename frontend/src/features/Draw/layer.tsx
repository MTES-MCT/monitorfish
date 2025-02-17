import {
  LayerProperties,
  InteractionType,
  OPENLAYERS_PROJECTION,
  OpenLayersGeometryType,
  WSG84_PROJECTION
} from '@features/Map/constants'
import { dottedLayerStyle } from '@features/Map/layers/styles/dottedLayer.style'
import { drawStyle, editStyle } from '@features/Map/layers/styles/draw.style'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isEmpty } from 'lodash-es'
import { Feature } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import { Modify } from 'ol/interaction'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { addFeatureToDrawedFeature } from './useCases/addFeatureToDrawedFeature'
import { setDrawedGeometry } from './useCases/setDrawedGeometry'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type Geometry from 'ol/geom/Geometry'
import type { GeometryFunction } from 'ol/interaction/Draw'
import type { ModifyEvent } from 'ol/interaction/Modify'
import type { MutableRefObject } from 'react'

function UnmemoizedDrawLayer() {
  const dispatch = useMainAppDispatch()
  const drawedGeometry = useMainAppSelector(state => state.draw.drawedGeometry)
  const initialGeometry = useMainAppSelector(state => state.draw.initialGeometry)
  const interactionType = useMainAppSelector(state => state.draw.interactionType)
  const listener = useMainAppSelector(state => state.draw.listener)

  const feature = useMemo(() => {
    const currentGeometry = drawedGeometry ?? initialGeometry
    if (!currentGeometry) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(currentGeometry)
  }, [drawedGeometry, initialGeometry])

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource<Feature<Geometry>>>
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
        format: new GeoJSON({
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        })
      })
    }

    return vectorSourceRef.current
  }, [])

  const drawVectorSourceRef = useRef() as MutableRefObject<VectorSource<Feature<Geometry>>>

  const getDrawVectorSource = useCallback(() => {
    if (drawVectorSourceRef.current === undefined) {
      drawVectorSourceRef.current = new VectorSource()
    }

    return drawVectorSourceRef.current
  }, [])

  const vectorLayerRef = useRef() as MutableRefObject<MonitorFishMap.VectorLayerWithName>

  useEffect(() => {
    function getVectorLayer() {
      if (vectorLayerRef.current === undefined) {
        vectorLayerRef.current = new VectorLayer({
          renderBuffer: 7,
          source: getVectorSource(),
          style: [dottedLayerStyle, editStyle],
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: LayerProperties.DRAW.zIndex
        })
        vectorLayerRef.current.name = LayerProperties.DRAW.code
      }

      return vectorLayerRef.current
    }

    monitorfishMap.getLayers().push(getVectorLayer())

    return () => {
      monitorfishMap.removeLayer(getVectorLayer())
    }
  }, [getVectorSource])

  const setGeometryOnModifyEnd = useCallback(
    (event: ModifyEvent) => {
      const nextGeometry = event.features.item(0).getGeometry()
      if (nextGeometry) {
        dispatch(setDrawedGeometry(nextGeometry))
      }
    },
    [dispatch]
  )

  useEffect(() => {
    if (isEmpty(feature) || !interactionType) {
      return undefined
    }

    resetModifyInteractions(monitorfishMap)
    getVectorSource().clear(true)
    getDrawVectorSource().clear(true)
    getVectorSource().addFeature(feature)
    const modify = new Modify({
      source: getVectorSource()
    })
    monitorfishMap.addInteraction(modify)

    modify.on('modifyend', setGeometryOnModifyEnd)

    return () => {
      monitorfishMap.removeInteraction(modify)
      modify.un('modifyend', setGeometryOnModifyEnd)
    }
  }, [getVectorSource, getDrawVectorSource, feature, interactionType, setGeometryOnModifyEnd])

  useEffect(() => {
    if (!interactionType) {
      return undefined
    }

    resetDrawInteractions(monitorfishMap)
    const { geometryFunction, geometryType } = getOLTypeAndGeometryFunctionFromInteractionType(interactionType)

    const draw = new Draw({
      geometryFunction,
      source: getDrawVectorSource(),
      stopClick: true,
      style: drawStyle,
      type: geometryType
    })

    monitorfishMap.addInteraction(draw)

    draw.on('drawend', event => {
      dispatch(addFeatureToDrawedFeature(event.feature))
      event.stopPropagation()
      getDrawVectorSource().clear(true)
    })

    return () => {
      monitorfishMap.removeInteraction(draw)
      getVectorSource().clear(true)
      getDrawVectorSource().clear(true)
    }
  }, [dispatch, getDrawVectorSource, listener, getVectorSource, interactionType])

  return null
}

function getOLTypeAndGeometryFunctionFromInteractionType(interactionType: InteractionType | null): {
  geometryFunction: GeometryFunction | undefined
  geometryType: OpenLayersGeometryType
} {
  switch (interactionType) {
    case InteractionType.SQUARE:
      return {
        geometryFunction: createBox(),
        geometryType: OpenLayersGeometryType.CIRCLE
      }
    case InteractionType.CIRCLE:
      return {
        geometryFunction: createRegularPolygon(),
        geometryType: OpenLayersGeometryType.CIRCLE
      }
    case InteractionType.POLYGON:
      return {
        geometryFunction: undefined,
        geometryType: OpenLayersGeometryType.POLYGON
      }
    case InteractionType.POINT:
      return {
        geometryFunction: undefined,
        geometryType: OpenLayersGeometryType.POINT
      }
    default:
      return {
        geometryFunction: undefined,
        geometryType: OpenLayersGeometryType.POINT
      }
  }
}

function resetModifyInteractions(map) {
  map.getInteractions().forEach(interaction => {
    if (interaction instanceof Modify) {
      interaction.setActive(false)
    }
  })
}

function resetDrawInteractions(map) {
  map.getInteractions().forEach(interaction => {
    if (interaction instanceof Draw) {
      interaction.abortDrawing()
      interaction.setActive(false)
    }
  })
}

export const DrawLayer = memo(UnmemoizedDrawLayer)
