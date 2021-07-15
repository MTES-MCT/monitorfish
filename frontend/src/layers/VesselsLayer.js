import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { setFilteredVesselsFeaturesUids, setVesselsLayerSource } from '../domain/reducers/Vessel'
import {
  FILTER_COLOR_PROPERTY,
  IS_LIGHT_PROPERTY,
  IS_SELECTED_PROPERTY,
  NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY,
  OPACITY_PROPERTY,
  Vessel,
  vesselAndVesselFeatureAreEquals
} from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { Vector } from 'ol/layer'
import { getVesselStyle } from './styles/vessel.style'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8

const VesselsLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    vessels,
    selectedVesselIdentity
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
    const vesselsFeatures = vectorSource.getFeatures()
    applyFilterToVessels(vesselsFeatures, () => showSelectedVesselSelector(vesselsFeatures)).then(_ => {
      vectorSource.changed()
    })
  }, [filters])

  useEffect(() => {
    vectorSource.on(VESSELS_UPDATE_EVENT, ({
      features,
      selectedBaseLayer,
      filterColor,
      vesselsLastPositionVisibility,
      nonFilteredVesselsAreHidden
    }) => {
      const isLight = Vessel.iconIsLight(selectedBaseLayer)

      features.forEach(feature => {
        const opacity = Vessel.getVesselOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        feature.set(IS_LIGHT_PROPERTY, isLight)
        feature.set(OPACITY_PROPERTY, opacity)
        feature.set(NON_FILTERED_VESSELS_ARE_HIDDEN_PROPERTY, nonFilteredVesselsAreHidden)
        feature.set(FILTER_COLOR_PROPERTY, filterColor)
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

  const getFilterColor = useCallback(() => {
    const showedFilter = filters.find(filter => filter.showed)
    return showedFilter ? showedFilter.color : null
  }, [filters])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  const showSelectedVesselSelector = vesselsFeatures => {
    const feature = vesselsFeatures.find(feature =>
      selectedVesselIdentity && vesselAndVesselFeatureAreEquals(selectedVesselIdentity, feature))

    if (feature) {
      feature.set(IS_SELECTED_PROPERTY, true)
    }
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels && vessels.length) {
      const vesselsFeatures = vessels
        .filter(vessel => vessel)
        .filter(vessel => vessel.latitude && vessel.longitude)
        .map(currentVessel => buildLastPositionFeature(currentVessel))
        .filter(vessel => vessel)

      applyFilterToVessels(vesselsFeatures, () => showSelectedVesselSelector(vesselsFeatures)).then(features => {
        vectorSource.clear(true)
        vectorSource.addFeatures(features)
        vectorSource.dispatchEvent({
          type: VESSELS_UPDATE_EVENT,
          features,
          showingVesselsEstimatedPositions,
          filterColor: getFilterColor(),
          vesselsLastPositionVisibility,
          selectedBaseLayer
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

  const buildLastPositionFeature = (vesselFromAPI) => {
    const vessel = new Vessel(vesselFromAPI)

    return vessel.feature
  }

  return null
}

export default VesselsLayer
