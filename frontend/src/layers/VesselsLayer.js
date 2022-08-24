import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { COLORS } from '../constants/constants'
import Layers from '../domain/entities/layers'
import { getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { applyFilterToVessels } from '../domain/use_cases/vessel/applyFilterAndSetVessels'
import { booleanToInt, customHexToRGB } from '../utils'
import { getWebGLVesselStyle } from './styles/vessel.style'

export const MIN_ZOOM_VESSEL_LABELS = 8

function VesselsLayer({ map }) {
  const dispatch = useDispatch()

  const { hideNonSelectedVessels, vessels } = useSelector(state => state.vessel)

  const { hideVesselsAtPort, selectedBaseLayer, vesselsLastPositionVisibility } = useSelector(state => state.map)

  const { previewFilteredVesselsMode } = useSelector(state => state.global)

  const {
    /** @type {VesselFilter[]} filters */
    filterColor,
    filters,
    nonFilteredVesselsAreHidden,
    showedFilter,
  } = useSelector(state => {
    const _showedFilter = state.filter?.filters?.find(filter => filter.showed)

    return {
      filterColor: _showedFilter?.color,
      filters: state.filter?.filters,
      nonFilteredVesselsAreHidden: state.filter?.nonFilteredVesselsAreHidden,
      showedFilter: _showedFilter,
    }
  })

  const vesselsVectorSource = useRef(null)
  const vesselWebGLPointsLayerRef = useRef(null)
  const style = useRef(null)

  function getVesselsVectorSource() {
    if (vesselsVectorSource.current === null) {
      vesselsVectorSource.current = new VectorSource({})
    }

    return vesselsVectorSource.current
  }

  useEffect(() => {
    if (map) {
      if (vesselWebGLPointsLayerRef.current) {
        map.removeLayer(vesselWebGLPointsLayerRef.current)
      }

      // styles derived from state
      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const filterColorRGBArray = customHexToRGB(filterColor || isLight ? COLORS.vesselLightColor : COLORS.vesselColor)
      const initStyles = {
        filterColorBlue: filterColorRGBArray[2],
        filterColorRed: filterColorRGBArray[0],
        filterColorGreen: filterColorRGBArray[1],
        hideNonSelectedVessels: false,
        hideVesselsAtPort: false,
        isLight,
        nonFilteredVesselsAreHidden,
        previewFilteredVesselsMode,
        vesselIsHiddenTimeThreshold: vesselIsHidden.getTime(),
        vesselIsOpacityReducedTimeThreshold: vesselIsOpacityReduced.getTime(),
      }
      style.current = getWebGLVesselStyle(initStyles)
      const vesselsVectorLayer = new WebGLPointsLayer({
        className: Layers.VESSELS.code,
        source: getVesselsVectorSource(),
        style: style.current,
        zIndex: Layers.VESSELS.zIndex,
      })
      vesselsVectorLayer.name = Layers.VESSELS.code
      map.getLayers().push(vesselsVectorLayer)
      vesselWebGLPointsLayerRef.current = vesselsVectorLayer
    }

    return () => {
      if (map && vesselWebGLPointsLayerRef.current) {
        map.removeLayer(vesselWebGLPointsLayerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      const features = vessels.map(vessel => {
        const propertiesUsedForStyling = {
          coordinates: vessel.coordinates,
          course: vessel.course,
          filterPreview: vessel.filterPreview,
          hasBeaconMalfunction: vessel.hasBeaconMalfunction,
          isAtPort: vessel.isAtPort,
          isFiltered: vessel.isFiltered,
          lastPositionSentAt: vessel.lastPositionSentAt,
          speed: vessel.speed,
        }

        const feature = new Feature({
          vesselId: vessel.vesselId,
          ...propertiesUsedForStyling,
          geometry: new Point(vessel.coordinates),
        })
        feature.setId(vessel.vesselId)
        feature.vesselProperties = vessel.vesselProperties

        return feature
      })

      getVesselsVectorSource()?.clear(true)
      getVesselsVectorSource()?.addFeatures(features)

      if (filterColor) {
        const rgb = customHexToRGB(filterColor)

        style.current.variables = {
          ...style.current.variables,
          filterColorBlue: rgb[2],
          filterColorGreen: rgb[1],
          filterColorRed: rgb[0],
        }
      }
    }
  }, [map, vessels])

  // styles
  useEffect(() => {
    style.current.variables.hideVesselsAtPort = booleanToInt(hideVesselsAtPort)
  }, [hideVesselsAtPort])

  useEffect(() => {
    style.current.variables.hideNonSelectedVessels = booleanToInt(hideNonSelectedVessels)
  }, [hideNonSelectedVessels])

  useEffect(() => {
    style.current.variables.nonFilteredVesselsAreHidden = booleanToInt(nonFilteredVesselsAreHidden)
  }, [nonFilteredVesselsAreHidden])

  useEffect(() => {
    style.current.variables.previewFilteredVesselsMode = booleanToInt(previewFilteredVesselsMode)
  }, [previewFilteredVesselsMode])

  useEffect(() => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    style.current.variables.isLight = booleanToInt(isLight)
  }, [selectedBaseLayer])

  useEffect(() => {
    dispatch(applyFilterToVessels())
    if (filterColor) {
      const rgb = customHexToRGB(filterColor)
      style.current.variables.filterColorRed = rgb[0]
      style.current.variables.filterColorGreen = rgb[1]
      style.current.variables.filterColorBlue = rgb[2]
    }
  }, [filterColor, filters, showedFilter, dispatch])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } =
      getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    style.current.variables.vesselIsHiddenTimeThreshold = vesselIsHidden.getTime()
    style.current.variables.vesselIsOpacityReducedTimeThreshold = vesselIsOpacityReduced.getTime()
  }, [vesselsLastPositionVisibility])
  // end styles

  return null
}

export default React.memo(VesselsLayer)
