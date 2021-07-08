import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { setFilteredVesselsFeaturesUids, setVesselsLayerSource } from '../domain/reducers/Vessel'
import { Vessel, vesselAndVesselFeatureAreEquals } from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { Vector } from 'ol/layer'
import { getVesselStyle } from './styles/vessel.style'

export const IS_LIGHT_PROPERTY = 'isLight'
export const NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY = 'nonFilteredVesselsAreHidden'
export const OPACITY_PROPERTY = 'opacity'
export const FILTER_COLOR_PROPERTY = 'filterColor'
export const IS_SELECTED_PROPERTY = 'isSelected'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8

const VesselsLayer = ({ map }) => {
  const {
    vessels,
    selectedVesselFeatureAndIdentity
  } = useSelector(state => state.vessel)
  const {
    selectedBaseLayer,
    vesselsLastPositionVisibility,
    showingVesselsEstimatedPositions
  } = useSelector(state => state.map)
  const {
    /** @type {VesselFilter[]} filters */
    filters,
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const getFilterColor = useCallback(() => {
    const showedFilter = filters.find(filter => filter.showed)
    return showedFilter ? showedFilter.color : null
  }, [filters])

  const dispatch = useDispatch()

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))

  const [layer] = useState(new Vector({
    renderBuffer: 4,
    className: Layers.VESSELS.code,
    source: vectorSource,
    zIndex: Layers.VESSELS.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    useSpatialIndex: false,
    style: feature => getVesselStyle(feature)
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    addVesselsFeaturesToMap()
  }, [vessels, map])

  useEffect(() => {
    vectorSource.on(VESSELS_UPDATE_EVENT, ({ features }) => {
      const isLight = Vessel.iconIsLight(selectedBaseLayer)
      const vesselsColor = getFilterColor()

      features.forEach(feature => {
        const opacity = Vessel.getVesselOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        feature.set(IS_LIGHT_PROPERTY, isLight)
        feature.set(OPACITY_PROPERTY, opacity)
        feature.set(NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY, nonFilteredVesselsAreHidden)
        feature.set(FILTER_COLOR_PROPERTY, vesselsColor)
      })
    })
  }, [vectorSource])

  useEffect(() => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    vectorSource.getFeatures().forEach(feature => {
      feature.set(IS_LIGHT_PROPERTY, isLight)
    })
  }, [selectedBaseLayer])

  useEffect(() => {
    vectorSource.getFeatures().forEach(feature => {
      feature.set(NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY, nonFilteredVesselsAreHidden)
    })
  }, [nonFilteredVesselsAreHidden])

  useEffect(() => {
    vectorSource.getFeatures().forEach(feature => {
      const opacity = Vessel.getVesselOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
      feature.set(OPACITY_PROPERTY, opacity)
    })
  }, [vesselsLastPositionVisibility])

  useEffect(() => {
    const vesselsColor = getFilterColor()
    vectorSource.getFeatures().forEach(feature => {
      feature.set(FILTER_COLOR_PROPERTY, vesselsColor)
    })
  }, [filters])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  const showSelectedVesselSelector = vesselsFeatures => {
    const feature = vesselsFeatures.find(feature =>
      selectedVesselFeatureAndIdentity &&
      vesselAndVesselFeatureAreEquals(selectedVesselFeatureAndIdentity.identity, feature))

    if (feature) {
      feature.set(IS_SELECTED_PROPERTY, true)
    }
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels && vessels.length) {
      const vesselsFeatures = vessels
        .filter(vessel => vessel)
        .filter(vessel => vessel.latitude && vessel.longitude)
        .map((currentVessel, index) => buildLastPositionFeature(currentVessel, index))
        .filter(vessel => vessel)

      applyFilterToVessels(vesselsFeatures, () => showSelectedVesselSelector(vesselsFeatures)).then(features => {
        vectorSource.clear(true)
        vectorSource.addFeatures(features)
        vectorSource.dispatchEvent({
          type: VESSELS_UPDATE_EVENT,
          features: features,
          showingVesselsEstimatedPositions: showingVesselsEstimatedPositions
        })
      })
    }
  }

  const applyFilterToVessels = (vesselsFeatures, noFilterFunction) => new Promise(resolve => {
    if (!filters || !filters.length) {
      noFilterFunction()
      dispatch(setFilteredVesselsFeaturesUids([]))
      return resolve(vesselsFeatures)
    }

    const showedFilter = filters.find(filter => filter.showed)
    if (!showedFilter) {
      noFilterFunction()
      dispatch(setFilteredVesselsFeaturesUids([]))
      return resolve(vesselsFeatures)
    }

    const vesselsObjects = vesselsFeatures.map(feature => {
      const coordinates = [...feature.getGeometry().getCoordinates()]

      return getVesselObjectFromFeature(feature, coordinates)
    })

    dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
      .then(filteredVessels => {
        const filteredVesselsUids = filteredVessels.map(vessel => vessel.uid)
        dispatch(setFilteredVesselsFeaturesUids(filteredVesselsUids))

        vesselsFeatures.forEach(feature => {
          Vessel.applyIsShowedPropertyToVessels(feature, filteredVesselsUids)
        })

        return resolve(vesselsFeatures)
      })
  })

  const buildLastPositionFeature = (vesselFromAPI, id) => {
    const vesselOptions = { id }
    const vessel = new Vessel(vesselFromAPI, vesselOptions)

    return vessel.feature
  }

  return null
}

export default VesselsLayer
