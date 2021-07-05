import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import {
  setFilteredVesselsFeaturesUids,
  setVesselsLayerSource,
  updateSelectedVesselFeature
} from '../domain/reducers/Vessel'
import { Vessel, vesselAndVesselFeatureAreEquals } from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { Vector } from 'ol/layer'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8

const VesselsLayer = ({ map }) => {
  const {
    vessels,
    selectedVessel,
    selectedVesselFeatureAndIdentity,
    temporaryVesselsToHighLightOnMap
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
    renderBuffer: 7,
    className: Layers.VESSELS.code,
    source: vectorSource,
    zIndex: Layers.VESSELS.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    addVesselsFeaturesToMap()
  }, [vessels, map])

  /*
  useEffect(() => {
    highLightVesselsOnMap()
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    showBackVesselsIconsWhenClosingVesselsHighLight()
  }, [vesselsLastPositionVisibility, temporaryVesselsToHighLightOnMap])
  */

  useEffect(() => {
    const vesselsFeatures = vectorSource.getFeatures()
    applyFilterToVessels(vesselsFeatures, redrawVesselsIfNoFilter(vesselsFeatures)).then(_ => {
      vectorSource.changed()
    })
  }, [filters, nonFilteredVesselsAreHidden, selectedBaseLayer])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  function redrawVesselsIfNoFilter (vesselsFeatures) {
    return () => {
      rewriteVesselsStylesIfNoFilter(vesselsFeatures)
      showSelectedVesselSelector(vesselsFeatures)
    }
  }

  const showSelectedVesselSelector = vesselsFeatures => {
    const feature = vesselsFeatures.find(feature =>
      selectedVesselFeatureAndIdentity &&
      vesselAndVesselFeatureAreEquals(selectedVesselFeatureAndIdentity.identity, feature))

    if (feature) {
      Vessel.setVesselAsSelected(feature)
      dispatch(updateSelectedVesselFeature(feature))
    }
  }

  const rewriteVesselsStylesIfNoFilter = vesselsFeatures => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)

    vesselsFeatures.forEach(feature => {
      Vessel.setVesselFeatureImages(
        feature,
        {
          isLight,
          vesselsLastPositionVisibility
        })
    })
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
          Vessel.applyVesselFeatureFilterStyle(
            feature,
            {
              filteredVesselsUids,
              color: getFilterColor(),
              isLight: Vessel.iconIsLight(selectedBaseLayer),
              nonFilteredVesselsAreHidden,
              vesselsLastPositionVisibility
            })

          if (selectedVesselFeatureAndIdentity &&
            vesselAndVesselFeatureAreEquals(selectedVesselFeatureAndIdentity.identity, feature)) {
            dispatch(updateSelectedVesselFeature(feature))
          }
        })
        return resolve(vesselsFeatures)
      })
  })

  const buildLastPositionFeature = (vesselFromAPI, id) => {
    const vesselOptions = {
      selectedVesselFeatureAndIdentity,
      selectedVessel,
      id,
      vesselsLastPositionVisibility,
      isLight: Vessel.iconIsLight(selectedBaseLayer),
      temporaryVesselsToHighLightOnMap
    }
    const vessel = new Vessel(vesselFromAPI, vesselOptions)

    if (selectedVesselFeatureAndIdentity &&
      vesselAndVesselFeatureAreEquals(selectedVesselFeatureAndIdentity.identity, vessel.feature)) {
      Vessel.setVesselAsSelected(vessel.feature)
      dispatch(updateSelectedVesselFeature(vessel.feature))
    }

    return vessel.feature
  }

  /*
  function highLightVesselsOnMap () {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      const temporaryVesselsToHighLightOnMapUids = temporaryVesselsToHighLightOnMap.map(vessel => vessel.uid)

      vectorSource.getFeatures().filter(feature => {
        const featureIndex = temporaryVesselsToHighLightOnMapUids.indexOf(feature.ol_uid)

        return featureIndex === NOT_FOUND
      }).forEach(featureToHide => {
        Vessel.hideVesselFeature(featureToHide)
      })

      vectorSource.changed()
    }
  }

  function showBackVesselsIconsWhenClosingVesselsHighLight () {
    if (vesselsLastPositionVisibility && (!temporaryVesselsToHighLightOnMap || !temporaryVesselsToHighLightOnMap.length) && map) {
      const features = vectorSource.getFeatures()

      applyFilterToVessels(features, redrawVesselsIfNoFilter(features)).then(_ => {
        vectorSource.changed()
      })
    }
  }

   */

  return null
}

export default VesselsLayer
