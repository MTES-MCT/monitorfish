import { isEmpty } from 'lodash'
import GeoJSON from 'ol/format/GeoJSON'
import { Modify } from 'ol/interaction'
import Draw, { createBox, createRegularPolygon, GeometryFunction } from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { Layer } from '../../../domain/entities/layers/constants'
import {
  InteractionType,
  OLGeometryType,
  OPENLAYERS_PROJECTION,
  WSG84_PROJECTION
} from '../../../domain/entities/map/constants'
import { addFeatureToDrawedFeature } from '../../../domain/use_cases/draw/addFeatureToDrawedFeature'
import { setGeometry } from '../../../domain/use_cases/draw/setGeometry'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { dottedLayerStyle } from './styles/dottedLayer.style'
import { drawStyle, editStyle } from './styles/draw.style'

import type { VectorLayerWithName } from '../../../domain/types/layer'
import type Geometry from 'ol/geom/Geometry'

export function DrawLayer({ map }) {
  const dispatch = useAppDispatch()
  const { geometry, interactionType, listener } = useAppSelector(state => state.draw)

  const feature = useMemo(() => {
    if (!geometry) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(geometry)
  }, [geometry])

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource<Geometry>>
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

  const drawVectorSourceRef = useRef() as MutableRefObject<VectorSource<Geometry>>

  const getDrawVectorSource = useCallback(() => {
    if (drawVectorSourceRef.current === undefined) {
      drawVectorSourceRef.current = new VectorSource()
    }

    return drawVectorSourceRef.current
  }, [])

  const vectorLayerRef = useRef() as MutableRefObject<VectorLayerWithName>

  useEffect(() => {
    function getVectorLayer() {
      if (vectorLayerRef.current === undefined) {
        vectorLayerRef.current = new VectorLayer({
          renderBuffer: 7,
          source: getVectorSource(),
          style: [dottedLayerStyle, editStyle],
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: Layer.DRAW.zIndex
        })
        vectorLayerRef.current.name = Layer.DRAW.code
      }

      return vectorLayerRef.current
    }

    if (map) {
      map.getLayers().push(getVectorLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getVectorLayer())
      }
    }
  }, [map, getVectorSource])

  const setGeometryOnModifyEnd = useCallback(
    event => {
      const nextGeometry = event.features.item(0).getGeometry()
      if (nextGeometry) {
        dispatch(setGeometry(nextGeometry as Geometry))
      }
    },
    [dispatch]
  )

  useEffect(() => {
    if (isEmpty(feature) || !interactionType) {
      return undefined
    }

    resetModifyInteractions(map)
    getVectorSource().clear(true)
    getDrawVectorSource().clear(true)
    getVectorSource().addFeature(feature)
    const modify = new Modify({
      source: getVectorSource()
    })
    map.addInteraction(modify)

    modify.on('modifyend', setGeometryOnModifyEnd)

    return () => {
      if (map) {
        map.removeInteraction(modify)
        modify.un('modifyend', setGeometryOnModifyEnd)
      }
    }
  }, [getVectorSource, getDrawVectorSource, map, feature, interactionType, setGeometryOnModifyEnd])

  useEffect(() => {
    if (!map || !interactionType) {
      return undefined
    }

    resetDrawInteractions(map)
    const { geometryFunction, geometryType } = getOLTypeAndGeometryFunctionFromInteractionType(interactionType)

    const draw = new Draw({
      geometryFunction,
      source: getDrawVectorSource(),
      stopClick: true,
      style: drawStyle,
      type: geometryType
    })

    map.addInteraction(draw)

    draw.on('drawend', event => {
      dispatch(addFeatureToDrawedFeature(event.feature))
      event.stopPropagation()
      getDrawVectorSource().clear(true)
    })

    return () => {
      if (map) {
        map.removeInteraction(draw)
        getVectorSource().clear(true)
        getDrawVectorSource().clear(true)
      }
    }
  }, [map, dispatch, getDrawVectorSource, listener, getVectorSource, interactionType])

  return null
}

function getOLTypeAndGeometryFunctionFromInteractionType(interactionType: InteractionType | null): {
  geometryFunction: GeometryFunction | undefined
  geometryType: OLGeometryType
} {
  switch (interactionType) {
    case InteractionType.SQUARE:
      return {
        geometryFunction: createBox(),
        geometryType: OLGeometryType.CIRCLE
      }
    case InteractionType.CIRCLE:
      return {
        geometryFunction: createRegularPolygon(),
        geometryType: OLGeometryType.CIRCLE
      }
    case InteractionType.POLYGON:
      return {
        geometryFunction: undefined,
        geometryType: OLGeometryType.POLYGON
      }
    case InteractionType.POINT:
      return {
        geometryFunction: undefined,
        geometryType: OLGeometryType.POINT
      }
    default:
      return {
        geometryFunction: undefined,
        geometryType: OLGeometryType.POINT
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
      interaction.setActive(false)
    }
  })
}
