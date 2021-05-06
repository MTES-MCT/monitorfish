import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { MeasureTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw from 'ol/interaction/Draw'
import { Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle'
import { unByKey } from 'ol/Observable'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere'
import { addMeasureDrawed, removeMeasureDrawed, resetMeasureTypeToAdd } from '../domain/reducers/Map'
import VectorLayer from 'ol/layer/Vector'
import { COLORS } from '../constants/constants'
import Circle from 'ol/geom/Circle'
import { circular, fromCircle } from 'ol/geom/Polygon'
import Feature from 'ol/Feature'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import GeoJSON from 'ol/format/GeoJSON'
import MeasureOverlay from './MeasureOverlay'

const MeasureLayer = ({ map }) => {
  const measureType = useSelector(state => state.map.measureTypeToAdd)
  const measuresDrawed = useSelector(state => state.map.measuresDrawed)
  const circleMeasureToAdd = useSelector(state => state.map.circleMeasureToAdd)
  const dispatch = useDispatch()

  const [measures, setMeasures] = useState([])
  const [measureInDrawing, _setMeasureInDrawing] = useState(null)
  const measureInDrawingRef = useRef(measureInDrawing)
  const setMeasureInDrawing = value => {
    measureInDrawingRef.current = value
    _setMeasureInDrawing(value)
  }

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
    if(measuresDrawed && map) {
      measuresDrawed.forEach((measure, index) => {
        let measureDrawed = measuresDrawed[index]

        let feature = new GeoJSON({
          featureProjection: 'EPSG:3857',
        }).readFeature(measureDrawed.feature)

        feature.setId(index + 1)
        vectorSource.addFeature(feature)
      })
    }
  }, [measuresDrawed, map])

  useEffect(() => {
    if(measureType) {
      addEmptyNextMeasure()
      drawOnMap()
    }
  }, [measureType])

  useEffect(() => {
    removeInteraction()
  }, [measureType])

  useEffect(() => {
    addCustomCircleMeasure()
  }, [circleMeasureToAdd])

  useEffect(() => {
    if(drawObject) {
      let listener

      drawObject.on('drawstart', event => {
        listener = startDrawing(event)
      })

      drawObject.on('drawabort', event => {
        abortDrawing(event, listener)
      })

      drawObject.on('drawend', event => {
        endDrawing(event, listener)
      })
    }
  }, [drawObject])

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
      setMeasureInDrawing({
        feature: null,
        measure: null,
        coordinates: null
      })
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

      let id = getNextMeasureId()
      circleFeature.setId(id)

      const tooltipCoordinates = circleFeature.getGeometry().getLastCoordinate()
      dispatch(addMeasureDrawed({
        feature: getGeoJSONFromFeature(circleFeature),
        measure: `r = ${circleMeasureToAdd.circleRadiusToAdd} nm`,
        coordinates: tooltipCoordinates
      }))
    }
  }

  function getGeoJSONFromFeature (feature) {
    let parser = new GeoJSON()
    return parser.writeFeatureObject(feature, { featureProjection: 'EPSG:3857' })
  }

  function saveMeasure (feature, measure) {
    let geoJSONFeature = getGeoJSONFromFeature(feature)

    dispatch(addMeasureDrawed({
      feature: geoJSONFeature,
      measure: measure,
      coordinates: feature.getGeometry().getLastCoordinate()
    }))
  }

  function deleteFeature (featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    if (feature) {
      vectorSource.removeFeature(feature)
    }

    dispatch(removeMeasureDrawed(featureId))
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

      let draw = null
      if(type) {
        draw = new Draw({
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
      }
    }
  }

  function abortDrawing (event, listener) {
    unByKey(listener)
    dispatch(resetMeasureTypeToAdd())
  }

  function getNextMeasureId () {
    let id = 1
    if (measuresDrawed && measuresDrawed.length) {
      id = measuresDrawed[0].feature.id
      for (let i = 1; i < measuresDrawed.length; ++i) {
        if (measuresDrawed[i].feature.id > id) {
          id = measuresDrawed[i].feature.id
        }
      }

      id = id + 1
    }
    return id
  }

  function endDrawing (event, listener) {
    let id = getNextMeasureId()

    event.feature.setId(id)
    if (event.feature.getGeometry() instanceof Circle) {
      event.feature.setGeometry(fromCircle(event.feature.getGeometry()))
    }

    saveMeasure(event.feature, measureInDrawingRef.current.measure)
    setMeasureInDrawing(null)
    unByKey(listener)
    dispatch(resetMeasureTypeToAdd())
  }

  function startDrawing (event) {
    const sketch = event.feature
    const tooltipCoordinates = event.coordinate

    setMeasureInDrawing({
      measure: 0,
      coordinates: event.feature.getGeometry().getLastCoordinate()
    })

    return sketch.getGeometry().on('change', changeEvent => {
      onNewPoint(changeEvent, tooltipCoordinates)
    })
  }

  function onNewPoint (event, tooltipCoordinates) {
    const geom = event.target

    if (geom instanceof LineString) {
      const nextMeasureOutput = getNauticalMilesOfLine(geom)
      tooltipCoordinates = geom.getLastCoordinate()

      setMeasureInDrawing({
        measure: nextMeasureOutput,
        coordinates: tooltipCoordinates
      })
    } else if (geom instanceof Circle) {
      const nextMeasureOutput = getNauticalMilesRadiusOfCircle(geom)
      tooltipCoordinates = geom.getLastCoordinate()

      setMeasureInDrawing({
        measure: nextMeasureOutput,
        coordinates: tooltipCoordinates
      })
    }
  }

  function getNauticalMilesRadiusFromPolygon (polygon) {
    const length = getLength(polygon)
    const radius = length / (2 * Math.PI)

    return `r = ${Math.round((radius / 1000) * 100 * 0.539957) / 100} nm`
  }

  const getNauticalMilesRadiusOfCircle = circle => {
    const poly = fromCircle(circle)
    return getNauticalMilesRadiusFromPolygon(poly)
  }

  const getNauticalMilesOfLine = line => {
    const length = getLength(line)

    return `${Math.round((length / 1000) * 100 * 0.539957) / 100} nm`
  }

  return (
    <>
      {
        measuresDrawed.map((measure, index) => {
          return <MeasureOverlay
            id={measure.feature.id}
            key={measure.feature.id}
            map={map}
            measure={measure.measure}
            coordinates={measure.coordinates}
            deleteFeature={deleteFeature}
          />
        })
      }

      <div>
        {
          measureInDrawing
            ? <MeasureOverlay
              map={map}
              measure={measureInDrawing.measure}
              coordinates={measureInDrawing.coordinates}
            />
            : null
        }
      </div>
    </>
  )
}

export default MeasureLayer
