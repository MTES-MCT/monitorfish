import { INTEREST_POINT_VECTOR_LAYER, INTEREST_POINT_VECTOR_SOURCE } from '@features/InterestPoint/layers/constants'
import { deleteInterestPoint } from '@features/InterestPoint/useCases/deleteInterestPoint'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { parseInt } from 'lodash-es'
import GeoJSON from 'ol/format/GeoJSON'
import LineString from 'ol/geom/LineString'
import Draw from 'ol/interaction/Draw'
import { useEffect, useRef, useState } from 'react'

import { POIStyle } from './interestPoint.style'
import { InterestPointLine } from './interestPointLine'
import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'
import { MapBox, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../Map/constants'
import { monitorfishMap } from '../../Map/monitorfishMap'
import { InterestPointOverlay } from '../components/InterestPointOverlay'
import { interestPointActions, interestPointSelectors } from '../slice'
import { updateInterestPointFeatureFromDraw } from '../useCases/updateInterestPointFeatureFromDraw'

import type { Coordinate } from 'ol/coordinate'
import type Feature from 'ol/Feature'
import type Point from 'ol/geom/Point'

const DRAW_ABORT_EVENT = 'drawabort'
const DRAW_END_EVENT = 'drawend'

export const MIN_ZOOM = 7

export function InterestPointLayer({ mapMovingAndZoomEvent }) {
  const dispatch = useMainAppDispatch()

  const interestPoints = useMainAppSelector(state =>
    interestPointSelectors.selectAll(state.interestPoint.interestPoints)
  )
  const interestPointIdEdited = useMainAppSelector(state => state.interestPoint.interestPointIdEdited)

  const isCreation = useMainAppSelector(state => state.interestPoint.isCreation)

  const drawRef = useRef<Draw | undefined>(undefined)

  const previousMapZoom = useRef<number | undefined>(undefined)
  const [interestPointToCoordinates, setInterestPointToCoordinates] = useState(new Map())

  useEffect(() => {
    monitorfishMap.getLayers().push(INTEREST_POINT_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(INTEREST_POINT_VECTOR_LAYER)
    }
  }, [])

  useEffect(() => {
    function drawExistingFeaturesOnMap() {
      if (interestPoints) {
        const features = interestPoints.map(interestPoint =>
          new GeoJSON({
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION
          }).readFeature(interestPoint)
        )

        const featuresToRemove = INTEREST_POINT_VECTOR_SOURCE.getFeatures().filter(
          feature => !(feature.getId() as string).includes('line')
        )
        INTEREST_POINT_VECTOR_SOURCE.removeFeatures(featuresToRemove)
        INTEREST_POINT_VECTOR_SOURCE.addFeatures(features)
      }
    }

    drawExistingFeaturesOnMap()
  }, [interestPoints])

  useEffect(() => {
    if (!isCreation) {
      if (drawRef.current) {
        monitorfishMap.removeInteraction(drawRef.current as Draw)
        drawRef.current = undefined
        dispatch(interestPointActions.interestPointEditionEnded())
      }

      return
    }

    const draw = new Draw({
      source: INTEREST_POINT_VECTOR_SOURCE,
      style: POIStyle,
      type: 'Point'
    })

    monitorfishMap.addInteraction(draw)
    draw.once(DRAW_ABORT_EVENT, () => {
      monitorfishMap.removeInteraction(drawRef.current as Draw)
      drawRef.current = undefined
      dispatch(interestPointActions.interestPointEditionEnded())
      dispatch(setRightMapBoxDisplayed(undefined))
    })

    draw.once(DRAW_END_EVENT, event => {
      monitorfishMap.removeInteraction(drawRef.current as Draw)
      drawRef.current = undefined
      dispatch(updateInterestPointFeatureFromDraw(event.feature))
    })
    drawRef.current = draw
  }, [dispatch, isCreation])

  useEffect(() => {
    function showOrHideInterestPointsOverlays() {
      const currentZoom = parseInt(monitorfishMap.getView().getZoom()?.toFixed(2) ?? '') ?? undefined
      if (currentZoom === previousMapZoom.current) {
        return
      }

      previousMapZoom.current = currentZoom
      if (currentZoom < MIN_ZOOM) {
        INTEREST_POINT_VECTOR_SOURCE.forEachFeature(feature => {
          feature.set(InterestPointLine.isHiddenByZoomProperty, true)
        })
      } else {
        INTEREST_POINT_VECTOR_SOURCE.forEachFeature(feature => {
          feature.set(InterestPointLine.isHiddenByZoomProperty, false)
        })
      }
    }

    showOrHideInterestPointsOverlays()
  }, [mapMovingAndZoomEvent])

  const onDrag = (id: string, coordinates: [number, number], nextCoordinates: [number, number], offset) => {
    const featureId = InterestPointLine.getFeatureId(id)

    if (interestPointToCoordinates.has(featureId)) {
      const existingLabelLineFeature = INTEREST_POINT_VECTOR_SOURCE.getFeatureById(featureId)
      const interestPointFeature = INTEREST_POINT_VECTOR_SOURCE.getFeatureById(id) as Feature<Point> | undefined

      if (existingLabelLineFeature && interestPointFeature) {
        existingLabelLineFeature.setGeometry(
          new LineString([interestPointFeature.getGeometry()?.getCoordinates() as Coordinate, nextCoordinates])
        )
      }
    } else {
      const interestPointLineFeature = InterestPointLine.getFeature(coordinates, nextCoordinates, featureId)

      INTEREST_POINT_VECTOR_SOURCE.addFeature(interestPointLineFeature)
    }

    const nextVesselToCoordinates = interestPointToCoordinates
    interestPointToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
    setInterestPointToCoordinates(nextVesselToCoordinates)
  }

  const onEdit = (id: string) => {
    const featureId = InterestPointLine.getFeatureId(id)
    const lineFeature = INTEREST_POINT_VECTOR_SOURCE.getFeatureById(featureId) as Feature<LineString> | undefined
    if (lineFeature) {
      INTEREST_POINT_VECTOR_SOURCE.removeFeature(lineFeature)
      INTEREST_POINT_VECTOR_SOURCE.changed()
      interestPointToCoordinates.delete(featureId)
    }

    dispatch(interestPointActions.interestPointEdited(id))
    dispatch(setRightMapBoxDisplayed(MapBox.INTEREST_POINT))
  }

  const onDelete = (id: string) => {
    dispatch(deleteInterestPoint(id))
    if (id === interestPointIdEdited) {
      dispatch(setRightMapBoxDisplayed(undefined))
    }
  }

  return (
    <>
      <div>
        {interestPoints.map(interestPoint => (
          <InterestPointOverlay
            key={interestPoint.id}
            interestPoint={interestPoint}
            onDelete={onDelete}
            onDrag={onDrag}
            onEdit={onEdit}
            zoomHasChanged={previousMapZoom.current}
          />
        ))}
      </div>
    </>
  )
}
