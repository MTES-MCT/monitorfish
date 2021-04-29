import React, { useEffect, useRef, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { MeasureTypes } from '../domain/entities/map'
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

const MeasureLayer = ({ map }) => {
  const measureType = useSelector(state => state.map.measure)
  const dispatch = useDispatch()

  const ref = useRef(null)
  const [measures, setMeasures] = useState([])
  const [overlays, setOverlays] = useState([])
  const [measuresLength, setMeasuresLength] = useState(0)

  const [vectorSource] = useState(new VectorSource({ wrapX: false }))
  const [vectorLayer] = useState(new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: COLORS.grayDarkerThree
      }),
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
    if (map && vectorLayer) {
      map.getLayers().push(vectorLayer)
    }
  }, [map, vectorLayer])

  useEffect(() => {
    if (measureType && measuresLength) {
      drawOnMap()
    }
  }, [map, measuresLength])

  useEffect(() => {
    if (measureType) {
      setMeasures(measures.concat(0))
      setMeasuresLength(measuresLength + 1)
    }
  }, [measureType])

  function deleteFeature (featureId) {
    const feature = vectorSource.getFeatureById(featureId)
    vectorSource.removeFeature(feature)

    const overlayToRemove = overlays[featureId - 1]
    map.removeOverlay(overlayToRemove)

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
        default:
          console.error('No interaction type specified')
          return
      }

      const draw = new Draw({
        source: vectorSource,
        type: type,
        style: new Style({
          fill: new Fill({
            color: COLORS.grayDarkerThree
          }),
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

      const overlay = createMeasureTooltip()
      let listener

      draw.on('drawstart', event => {
        listener = startDrawing(event, listener, overlay)
      })

      draw.on('drawend', event => {
        endDrawing(event, overlay, listener, draw)
      })
    }
  }

  function endDrawing (event, overlay, listener, draw) {
    event.feature.setId(measuresLength)
    overlay.setOffset([0, -7])
    setOverlays(overlays.concat(overlay))
    unByKey(listener)
    dispatch(resetMeasure())

    setTimeout(() => {
      map.removeInteraction(draw)
    }, 300)
  }

  function startDrawing (event, listener, overlay) {
    const sketch = event.feature
    const tooltipCoordinates = event.coordinate

    listener = sketch.getGeometry().on('change', event => {
      onNewPoint(event, tooltipCoordinates, overlay)
    })
    return listener
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
      const nextMeasureOutput = getNauticalMiles(geom)
      tooltipCoordinates = geom.getLastCoordinate()
      const nextMeasures = [...measures]
      nextMeasures[nextMeasures.length - 1] = nextMeasureOutput
      setMeasures(nextMeasures)
    }
    overlay.setPosition(tooltipCoordinates)
  }

  const getNauticalMiles = line => {
    const length = getLength(line)
    return Math.round((length / 1000) * 100 * 0.621371) / 100 + ' ' + 'nm'
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
