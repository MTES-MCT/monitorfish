import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import {
  getVesselLastPositionVisibilityDates,
  Vessel
} from '../domain/entities/vessel'
import Layers from '../domain/entities/layers'

import { applyFilterToVessels } from '../domain/use_cases/applyFilterAndSetVessels'
import { COLORS } from '../constants/constants'
import { booleanToInt, customHexToRGB } from '../utils'

import { getWebGLVesselStyle } from './styles/vessel.style'

export const MIN_ZOOM_VESSEL_LABELS = 8

const VesselsLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    vessels,
    hideNonSelectedVessels
  } = useSelector(state => state.vessel)

  const {
    selectedBaseLayer,
    vesselsLastPositionVisibility,
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const { previewFilteredVesselsMode } = useSelector(state => state.global)

  const {
    /** @type {VesselFilter[]} filters */
    filters,
    showedFilter,
    filterColor,
    nonFilteredVesselsAreHidden
  } = useSelector((state) => {
    const _showedFilter = state.filter?.filters?.find(filter => filter.showed)
    return {
      filters: state.filter?.filters,
      showedFilter: _showedFilter,
      filterColor: _showedFilter?.color,
      nonFilteredVesselsAreHidden: state.filter?.nonFilteredVesselsAreHidden
    }
  })

  const vesselsVectorSource = useRef(null)
  const vesselWebGLPointsLayerRef = useRef(null)
  const style = useRef(null)

  function getVesselsVectorSource () {
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
      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const filterColorRGBArray = customHexToRGB(filterColor || isLight ? COLORS.vesselLightColor : COLORS.vesselColor)
      const initStyles = {
        hideVesselsAtPort: false,
        hideNonSelectedVessels: false,
        nonFilteredVesselsAreHidden: nonFilteredVesselsAreHidden,
        previewFilteredVesselsMode: previewFilteredVesselsMode,
        isLight: isLight,
        vesselIsHiddenTimeThreshold: vesselIsHidden.getTime(),
        vesselIsOpacityReducedTimeThreshold: vesselIsOpacityReduced.getTime(),
        filterColorRed: filterColorRGBArray[0],
        filterColorGreen: filterColorRGBArray[1],
        filterColorBlue: filterColorRGBArray[2]
      }
      style.current = getWebGLVesselStyle(initStyles)
      const vesselsVectorLayer = new WebGLPointsLayer({
        style: style.current,
        className: Layers.VESSELS.code,
        zIndex: Layers.VESSELS.zIndex,
        source: getVesselsVectorSource()
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
          isAtPort: vessel.isAtPort,
          course: vessel.course,
          speed: vessel.speed,
          lastPositionSentAt: vessel.lastPositionSentAt,
          coordinates: vessel.coordinates,
          isFiltered: vessel.isFiltered,
          filterPreview: vessel.filterPreview,
          hasBeaconStatus: vessel.hasBeaconStatus
        }

        const feature = new Feature({
          vesselId: vessel.vesselId,
          ...propertiesUsedForStyling,
          geometry: new Point(vessel.coordinates)
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
          filterColorRed: rgb[0],
          filterColorGreen: rgb[1],
          filterColorBlue: rgb[2]
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
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    style.current.variables.vesselIsHiddenTimeThreshold = vesselIsHidden.getTime()
    style.current.variables.vesselIsOpacityReducedTimeThreshold = vesselIsOpacityReduced.getTime()
  }, [vesselsLastPositionVisibility])
  // end styles

  return null
}

export default VesselsLayer
