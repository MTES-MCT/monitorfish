import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import { setError } from '../domain/shared_slices/Global'
import { setFilteredVesselsFeatures } from '../domain/shared_slices/Vessel'
import {
  getVesselLastPositionVisibilityDates,
  Vessel
} from '../domain/entities/vessel'
import Layers from '../domain/entities/layers'

import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import NoVesselsInFilterError from '../errors/NoVesselsInFilterError'
import { COLORS } from '../constants/constants'
import { booleanToInt, customHexToRGB } from '../utils'

import { getWebGLVesselStyle } from './styles/vessel.style'

export const MIN_ZOOM_VESSEL_LABELS = 8

const VesselsLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    vesselsgeojson,
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
      filterColor: _showedFilter ? _showedFilter.color : null,
      nonFilteredVesselsAreHidden: state.filter?.nonFilteredVesselsAreHidden
    }
  })

  const GeoJsonVectorSource = useRef(new VectorSource({
  }))
  const currentWebGLLayerRef = useRef(null)

  const style = useRef(null)

  useEffect(() => {
    if (map) {
      if (currentWebGLLayerRef.current) {
        map.removeLayer(currentWebGLLayerRef.current)
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
      const GeoJsonVectorLayer = new WebGLPointsLayer({
        style: style.current,
        renderBuffer: 4,
        className: Layers.VESSELS.code,
        zIndex: Layers.VESSELS.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        useSpatialIndex: false,
        source: GeoJsonVectorSource.current
      })
      GeoJsonVectorLayer.name = Layers.VESSELS.code
      map.getLayers().push(GeoJsonVectorLayer)
      currentWebGLLayerRef.current = GeoJsonVectorLayer
    }

    return () => {
      if (map && currentWebGLLayerRef.current) {
        map.removeLayer(currentWebGLLayerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      const features = vesselsgeojson.map(({ coordinates, vesselId, ...properties }) => {
        const f = new Feature({
          ...properties,
          vesselId,
          geometry: new Point(coordinates)
        })
        f.setId(vesselId)
        return f
      })
      GeoJsonVectorSource.current?.clear(true)
      GeoJsonVectorSource.current?.addFeatures(features)
      console.log('vessels update webgl')
      if (filterColor) {
        const rgb = customHexToRGB(filterColor)

        style.current.variables = {
          ...style.current.variables,
          filterColorRed: rgb[0],
          filterColorGreen: rgb[1],
          filterColorBlue: rgb[2]
        }
      }
      // map.render()
    }
  }, [map, vesselsgeojson])

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
    if (filterColor) {
      const rgb = customHexToRGB(filterColor)
      style.current.variables.filterColorRed = rgb[0]
      style.current.variables.filterColorGreen = rgb[1]
      style.current.variables.filterColorBlue = rgb[2]
    }
  }, [filterColor])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    style.current.variables.vesselIsHiddenTimeThreshold = vesselIsHidden.getTime()
    style.current.variables.vesselIsOpacityReducedTimeThreshold = vesselIsOpacityReduced.getTime()
  }, [vesselsLastPositionVisibility])
  // end styles

  useEffect(() => {
    const applyFilterToVessels = (vesselsFeatures) => {
      if (!filters || !filters.length || !showedFilter) {
        dispatch(setFilteredVesselsFeatures([]))
        return
      }

      if (!vesselsFeatures?.length) {
        return
      }

      const vesselsObjects = vesselsFeatures.map(feature => {
        return Vessel.getObjectForFilteringFromFeature(feature)
      })

      dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
        .then(filteredVessels => {
          if (!filteredVessels?.length) {
            dispatch(setError(new NoVesselsInFilterError('Il n\'y a pas de navire dans ce filtre')))
          }
          const filteredVesselsUids = filteredVessels.map(vessel => vessel.vesselId)
          dispatch(setFilteredVesselsFeatures(filteredVesselsUids))
        })
    }

    const vesselsFeatures = GeoJsonVectorSource?.current?.getFeatures()
    applyFilterToVessels(vesselsFeatures)
  }, [filters, showedFilter, dispatch])

  return null
}

export default VesselsLayer
