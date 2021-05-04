import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { MeasureTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
import Overlay from 'ol/Overlay'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'
import styled from 'styled-components'
import { resetMeasure } from '../domain/reducers/Map'
import VectorLayer from 'ol/layer/Vector'
import { COLORS } from '../constants/constants'
import { ReactComponent as CloseIconSVG } from '../components/icons/Croix_grise.svg'
import Circle from 'ol/geom/Circle'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { METERS_PER_UNIT } from 'ol/proj/Units'

const MeasureLayer = ({ map }) => {
  const measureType = useSelector(state => state.map.measure)
  const circleMeasureToAdd = useSelector(state => state.map.circleMeasureToAdd)
  const dispatch = useDispatch()

  const ref = useRef(null)
  const [measures, setMeasures] = useState([])
  const [overlays, setOverlays] = useState([])
  const [measuresLength, setMeasuresLength] = useState(0)

  const [drawObject, setDrawObject] = useState(null)

  const [vectorSource] = useState(new VectorSource({ wrapX: false, projection: OPENLAYERS_PROJECTION }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({
        color: COLORS.grayDarkerThree,
        lineDash: [4, 4],
        width: 2
      }),
      image: new CircleStyle({
        radius: 2,
        stroke: new Stroke({
          color: COLORS.grayDarkerThree
        }),
        fill: new Fill({
          color: COLORS.grayDarkerThree
        })
      })
    })
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map, vectorLayer])

  useEffect(() => {
    if (measureType && measuresLength) {
      drawOnMap()
    }
  }, [map, measuresLength])

  useEffect(() => {
    addEmptyNextMeasure()
  }, [measureType])

  useEffect(() => {
    removeInteraction()
  }, [measureType])

  useEffect(() => {
    addCustomCircleMeasure()
  }, [circleMeasureToAdd])

  function addLayerToMap () {
    if (map && vectorLayer) {
      map.getLayers().push(vectorLayer)
    }
  }

  function removeInteraction () {
    if (!measureType && drawObject) {
      setTimeout(() => {
        map.removeInteraction(drawObject)
        setDrawObject(null)
      }, 300)
    }
  }

  function addEmptyNextMeasure () {
    if (measureType) {
      setMeasures(measures.concat(0))
      setOverlays(overlays.concat(null))
      setMeasuresLength(measuresLength + 1)
    }
  }

  function addCustomCircleMeasure () {
    const metersForOneNauticalMile = 1852
    const longitude = 1
    const latitude = 0
    const numberOfVertices = 64

    if (circleMeasureToAdd &&
      circleMeasureToAdd.circleCoordinatesToAdd.length &&
      circleMeasureToAdd.circleRadiusToAdd) {
      const radiusInMeters = METERS_PER_UNIT.m * circleMeasureToAdd.circleRadiusToAdd * metersForOneNauticalMile

      const coordinates = [circleMeasureToAdd.circleCoordinatesToAdd[longitude], circleMeasureToAdd.circleCoordinatesToAdd[latitude]]
      const circleFeature = new Feature({
        geometry: circular(coordinates, radiusInMeters, numberOfVertices).transform(WSG84_PROJECTION, OPENLAYERS_PROJECTION),
        style: new Style({
          stroke: new Stroke({
            color: COLORS.grayDarkerThree,
            lineDash: [5, 5],
            width: 2
          }),
          image: new CircleStyle({
            radius: 2,
            stroke: new Stroke({
              color: COLORS.grayDarkerThree
            }),
            fill: new Fill({
              color: COLORS.grayDarkerThree
            })
          })
        })
      })

      circleFeature.setId(measuresLength)
      vectorSource.addFeature(circleFeature)

      const overlay = overlays[overlays.length - 1]
      const tooltipCoordinates = circleFeature.getGeometry().getLastCoordinate()
      overlay.setPosition(tooltipCoordinates)
      overlay.setOffset([0, -7])

      const nextMeasures = [...measures]
      nextMeasures[nextMeasures.length - 1] = `r = ${circleMeasureToAdd.circleRadiusToAdd} nm`
      setMeasures(nextMeasures)

      setTimeout(() => {
        map.removeInteraction(drawObject)
      }, 300)
    }
  }

  function deleteFeature (featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    if (feature) {
      vectorSource.removeFeature(feature)
    }

    const overlayToRemove = overlays[featureId - 1]

    if (overlayToRemove) {
      map.removeOverlay(overlayToRemove)
    }

    const nextOverlays = [...overlays]
    nextOverlays[featureId - 1] = null
    setOverlays(nextOverlays)
  }

  function drawOnMap () {
    if (map && measureType) {
      let type = null
      switch (measureType) {
        case MeasureTypes.MULTILINE:
          type = 'LineString'
          break
        case MeasureTypes.CIRCLE_RANGE:
          type = 'Circle'
          break
      }

      const draw = new Draw({
        source: vectorSource,
        type: type,
        style: new Style({
          stroke: new Stroke({
            color: COLORS.grayDarkerThree,
            lineDash: [5, 5],
            width: 2
          }),
          image: new CircleStyle({
            radius: 2,
            stroke: new Stroke({
              color: COLORS.grayDarkerThree
            }),
            fill: new Fill({
              color: COLORS.grayDarkerThree
            })
          })
        })
      })

      map.addInteraction(draw)
      setDrawObject(draw)

      const overlay = createMeasureTooltip()
      const nextOverlays = overlays
      nextOverlays[nextOverlays.length - 1] = overlay
      setOverlays(nextOverlays)

      let listener
      draw.on('drawstart', event => {
        listener = startDrawing(event, overlay)
      })

      draw.on('drawabort', event => {
        abortDrawing(event, overlay, listener)
      })

      draw.on('drawend', event => {
        endDrawing(event, overlay, listener)
      })
    }
  }

  function abortDrawing (event, overlay, listener) {
    unByKey(listener)
    dispatch(resetMeasure())
    map.removeOverlay(overlay)
  }

  function endDrawing (event, overlay, listener) {
    event.feature.setId(measuresLength)
    overlay.setOffset([0, -7])
    unByKey(listener)
    dispatch(resetMeasure())
  }

  function startDrawing (event, overlay) {
    const sketch = event.feature
    const tooltipCoordinates = event.coordinate

    return sketch.getGeometry().on('change', event => {
      onNewPoint(event, tooltipCoordinates, overlay)
    })
  }

  function createMeasureTooltip () {
    const measureTooltipElement = ref.current.children[ref.current.children.length - 1]

    const overlay = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    })

    map.addOverlay(overlay)

    return overlay
  }

  function onNewPoint (event, tooltipCoordinates, overlay) {
    const geom = event.target
    if (geom instanceof LineString) {
      const nextMeasureOutput = getNauticalMilesOfLine(geom)
      tooltipCoordinates = geom.getLastCoordinate()
      const nextMeasures = [...measures]
      nextMeasures[nextMeasures.length - 1] = nextMeasureOutput
      setMeasures(nextMeasures)
    } else if (geom instanceof Circle) {
      const nextMeasureOutput = getNauticalMilesRadiusOfCircle(geom)
      tooltipCoordinates = geom.getLastCoordinate()
      const nextMeasures = [...measures]
      nextMeasures[nextMeasures.length - 1] = nextMeasureOutput
      setMeasures(nextMeasures)
    }

    overlay.setPosition(tooltipCoordinates)
  }

  function getNauticalMilesRadiusFromPolygon (polygon) {
    const length = getLength(polygon)
    const radius = length / (2 * Math.PI)

    return `r = ${(Math.round((radius / 1000) * 100 * 0.539957) / 100)} nm`
  }

  const getNauticalMilesRadiusOfCircle = circle => {
    const poly = fromCircle(circle)
    return getNauticalMilesRadiusFromPolygon(poly)
  }

  const getNauticalMilesOfLine = line => {
    const length = getLength(line)

    return `${(Math.round((length / 1000) * 100 * 0.539957) / 100)} nm`
  }

  return (
    <>
      <MeasureTooltipElement ref={ref} >
        {
          [...Array(measuresLength).keys()].map((measure, index) => {
            return <div key={index}>
              <ZoneSelected>
              <DeleteZoneText>{measures[index]}</DeleteZoneText>
              <CloseIcon onClick={() => deleteFeature(index + 1)}/>
            </ZoneSelected>
            <TrianglePointer>
              <TriangleShadow/>
            </TrianglePointer>
            </div>
          })
        }
      </MeasureTooltipElement>

    </>
  )
}

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto; 
  width: auto;
`

const TriangleShadow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.grayBackground} transparent transparent transparent;
  text-align: center;
  margin: auto;
  margin-top: -3px;
`

const MeasureTooltipElement = styled.div``

const DeleteZoneText = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const ZoneSelected = styled.span`
  background: ${COLORS.grayBackground};
  border-radius: 2px;
  color: ${COLORS.textGray};
  margin-left: 0;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  display: inline-block;
  user-select: none;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
`

export default MeasureLayer
