import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { resetVessels, setFilteredVesselsFeaturesUids, setVesselsLayerSource } from '../domain/shared_slices/Vessel'
import {
  getVesselLastPositionVisibilityDates,
  Vessel,
  vesselAndVesselFeatureAreEquals
} from '../domain/entities/vessel'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { Vector } from 'ol/layer'
import { getVesselStyle } from './styles/vessel.style'
import { unByKey } from 'ol/Observable'
import { setError } from '../domain/shared_slices/Global'
import NoVesselsInFilterError from '../errors/NoVesselsInFilterError'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8
const NOT_FOUND = -1

const VesselsLayer = ({ map }) => {
  const dispatch = useDispatch()

  const {
    vessels,
    selectedVesselIdentity,
    vesselsTracksShowed,
    hideOtherVessels,
    previewFilteredVesselsFeaturesUids
  } = useSelector(state => state.vessel)

  const {
    selectedBaseLayer,
    vesselsLastPositionVisibility,
    showingVesselsEstimatedPositions,
    hideVesselsAtPort
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
    style: (feature, resolution) => getVesselStyle(feature, resolution)
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    addVesselsFeaturesToMap()
  }, [vessels, map])

  useEffect(() => {
    const vesselsFeatures = vectorSource.getFeatures()
    applyFilterToVessels(vesselsFeatures, () => showSelectedSelectorToShowedTracks(vesselsFeatures)).then(_ => {
      vectorSource.changed()
    })
  }, [filters])

  useEffect(() => {
    const vesselsFeatures = vectorSource.getFeatures()
    if (previewFilteredVesselsFeaturesUids?.length) {
      vesselsFeatures.forEach(feature => {
        Vessel.applyFilterPreviewPropertyToVessels(feature, previewFilteredVesselsFeaturesUids)
      })
    } else {
      vesselsFeatures.forEach(feature => {
        Vessel.removeFilterPreviewPropertyToVessels(feature)
      })
    }
    vectorSource.changed()
  }, [previewFilteredVesselsFeaturesUids])

  function setProperties () {
    return ({
      features,
      selectedBaseLayer,
      filterColor,
      vesselsLastPositionVisibility,
      nonFilteredVesselsAreHidden,
      hideOtherVessels,
      hideVesselsAtPort
    }) => {
      const isLight = Vessel.iconIsLight(selectedBaseLayer)

      const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      features.forEach(feature => {
        const opacity = Vessel.getVesselOpacity(feature.vessel.dateTime, vesselIsHidden, vesselIsOpacityReduced)
        feature.set(Vessel.isLightProperty, isLight, true)
        feature.set(Vessel.opacityProperty, opacity, true)
        feature.set(Vessel.nonFilteredVesselsAreHiddenProperty, nonFilteredVesselsAreHidden, true)
        feature.set(Vessel.filterColorProperty, filterColor, true)
        feature.set(Vessel.isHiddenProperty, hideOtherVessels, true)
        feature.set(Vessel.hideVesselsAtPortProperty, hideVesselsAtPort, true)
      })
      vectorSource.changed()
    }
  }

  useEffect(() => {
    const eventKey = vectorSource.on(VESSELS_UPDATE_EVENT, setProperties())

    return () => {
      if (eventKey) {
        unByKey(eventKey)
      }
    }
  }, [vectorSource])

  useEffect(() => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    vectorSource.forEachFeature(feature => {
      feature.set(Vessel.isLightProperty, isLight)
    })
  }, [selectedBaseLayer])

  useEffect(() => {
    vectorSource.forEachFeature(feature => {
      feature.set(Vessel.isHiddenProperty, hideOtherVessels)
    })
  }, [hideOtherVessels])

  useEffect(() => {
    vectorSource.forEachFeature(feature => {
      feature.set(Vessel.hideVesselsAtPortProperty, hideVesselsAtPort)
    })
  }, [hideVesselsAtPort])

  useEffect(() => {
    vectorSource.forEachFeature(feature => {
      feature.set(Vessel.nonFilteredVesselsAreHiddenProperty, nonFilteredVesselsAreHidden)
    })
  }, [nonFilteredVesselsAreHidden])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

    vectorSource.forEachFeature(feature => {
      const opacity = Vessel.getVesselOpacity(feature.vessel.dateTime, vesselIsHidden, vesselIsOpacityReduced)
      feature.set(Vessel.opacityProperty, opacity)
    })
  }, [vesselsLastPositionVisibility])

  useEffect(() => {
    const vesselsColor = getFilterColor()
    vectorSource.forEachFeature(feature => {
      feature.set(Vessel.filterColorProperty, vesselsColor)
    })
  }, [filters])

  const getFilterColor = useCallback(() => {
    const showedFilter = filters.find(filter => filter.showed)
    return showedFilter ? showedFilter.color : null
  }, [filters])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      layer.name = Layers.VESSELS.code
      map.getLayers().push(layer)
    }

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
    }
  }

  const showSelectedSelectorToShowedTracks = vesselsFeatures => {
    const feature = vesselsFeatures.find(feature =>
      selectedVesselIdentity && vesselAndVesselFeatureAreEquals(selectedVesselIdentity, feature))

    if (feature) {
      feature.set(Vessel.isSelectedProperty, true)
    }

    const vesselIds = Object.keys(vesselsTracksShowed)
    vesselsFeatures
      .filter(feature => vesselIds?.findIndex(identity => feature?.getId()?.toString()?.includes(identity)) !== NOT_FOUND)
      .forEach(feature => feature.set(Vessel.isSelectedProperty, true))
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels?.length) {
      const vesselsFeatures = vessels
        .filter(vessel => vessel?.latitude && vessel?.longitude)
        .map(currentVessel => Vessel.getFeature(currentVessel))
        .filter(vessel => vessel)

      applyFilterToVessels(vesselsFeatures, () => showSelectedSelectorToShowedTracks(vesselsFeatures)).then(features => {
        if (features) {
          vectorSource.clear(true)
          vectorSource.addFeatures(features)
          showSelectedSelectorToShowedTracks(features)
          vectorSource.dispatchEvent({
            type: VESSELS_UPDATE_EVENT,
            features,
            showingVesselsEstimatedPositions,
            filterColor: getFilterColor(),
            vesselsLastPositionVisibility,
            selectedBaseLayer,
            nonFilteredVesselsAreHidden,
            hideOtherVessels,
            hideVesselsAtPort
          })
          dispatch(resetVessels())
        }
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
      return Vessel.getObjectForFilteringFromFeature(feature)
    })

    if (!vesselsFeatures?.length) {
      return resolve([])
    }

    dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
      .then(filteredVessels => {
        if (!filteredVessels?.length) {
          dispatch(setError(new NoVesselsInFilterError('Il n\'y a pas de navire dans ce filtre')))
        }
        const filteredVesselsUids = filteredVessels.map(vessel => vessel.uid)
        dispatch(setFilteredVesselsFeaturesUids(filteredVesselsUids))

        vesselsFeatures.forEach(feature => {
          Vessel.applyIsShowedPropertyToVessels(feature, filteredVesselsUids)
          Vessel.applyFilterPreviewPropertyToVessels(feature, previewFilteredVesselsFeaturesUids)
        })

        return resolve(vesselsFeatures)
      })
  })

  return null
}

export default VesselsLayer
