import * as Comlink from 'comlink'
import {
  getMergedRegulatoryLayers,
  LAWTYPES_TO_TERRITORY,
  mapToRegulatoryZone, orderByAlphabeticalLayer,
  searchByLawType,
  FRANCE
} from '../domain/entities/regulatory'
import { getDateMonthsBefore } from '../utils'
import { VesselLocation, vesselSize } from '../domain/entities/vessel'

class MonitorFishWorker {
  #getLayerTopicList = features => {
    const featuresWithoutGeometry = features.features.map(feature => {
      return mapToRegulatoryZone(feature)
    })

    const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce((acc, current) => {
      const found = acc.find(item =>
        item.topic === current.topic &&
        item.zone === current.zone)
      if (!found) {
        return acc.concat([current])
      } else {
        return acc
      }
    }, [])

    return uniqueFeaturesWithoutGeometry
      .map(layer => layer.topic)
      .map(topic => {
        return uniqueFeaturesWithoutGeometry.filter(layer => layer.topic === topic)
      })
  }

  #getGeometryIdFromFeatureId = feature => {
    return feature.properties.id || feature.id.split('.')[1]
  }

  getGeometryWithoutRegulationRef (features) {
    const geometryListAsObject = {}
    features.features.forEach(feature => {
      geometryListAsObject[this.#getGeometryIdFromFeatureId(feature)] = feature.geometry
    })
    return geometryListAsObject
  }

  convertGeoJSONFeaturesToObject (features) {
    const layerTopicsArray = this.#getLayerTopicList(features)
    const layersTopicsToZones = layerTopicsArray.reduce((accumulatedObject, zone) => {
      accumulatedObject[zone[0].topic] = zone
      return accumulatedObject
    }, {})

    return layersTopicsToZones
  }

  /**
   * Get all regulatory data structured as
   * Territory: {
   *  LawType: {
   *    Topic: Zone[]
   *  }
   * }
   * (see example)
   * @param {GeoJSON} features
   * @returns {Object} The structured regulatory data
   * @example
   * "France": {
   *    "Reg locale / NAMO": {
   *       "Armor_CSJ_Dragues": [
   *         {
   *           bycatch: undefined,
   *           closingDate: undefined,
   *           deposit: undefined,
   *           gears: "DRB",
   *           lawType: "Reg locale",
   *           mandatoryDocuments: undefined,
   *           obligations: undefined,
   *           openingDate: undefined,
   *           period: undefined,
   *           permissions: undefined,
   *           prohibitedGears: null,
   *           prohibitedSpecies: null,
   *           prohibitions: undefined,
   *           quantity: undefined,
   *           region: "Bretagne",
   *           regulatoryReferences: "[
   *             {\"url\": \"http://legipeche.metier.i2/arrete-prefectoral-r53-2020-04-24-002-delib-2020-a9873.html?id_rub=1637\",
   *             \"reference\": \"ArrÃªtÃ© PrÃ©fectoral R53-2020-04-24-002 - dÃ©lib 2020-004 / NAMO\"}, {\"url\": \"\", \"reference\": \"126-2020\"}]",
   *           rejections: undefined,
   *           size: undefined,
   *           species: "SCE",
   *           state: undefined,
   *           technicalMeasurements: undefined,
   *           topic: "Armor_CSJ_Dragues",
   *           zone: "Secteur 3"
   *         }
   *       ]
   *       "GlÃ©nan_CSJ_Dragues": (1) […],
   *       "Bretagne_Laminaria_Hyperborea_Scoubidous - 2019": (1) […],
   *    },
   *     "Reg locale / Sud-Atlantique, SA": {
   *       "Embouchure_Gironde": (1) […],
   *       "Pertuis_CSJ_Dragues": (6) […],
   *       "SA_Chaluts_Pelagiques": (5) […]
   *     }
   * }
   */
  convertGeoJSONFeaturesToStructuredRegulatoryObject (features) {
    const regulatoryTopicList = new Set()
    const layerTopicArray = this.#getLayerTopicList(features)
    const layersTopicsByRegulatoryTerritory = layerTopicArray.reduce((accumulatedObject, zone) => {
      const {
        lawType,
        topic
      } = zone[0]

      if (topic && lawType) {
        regulatoryTopicList.add(topic)
        const regulatoryTerritory = LAWTYPES_TO_TERRITORY[lawType]
        if (regulatoryTerritory) {
          if (!accumulatedObject[regulatoryTerritory]) {
            accumulatedObject[regulatoryTerritory] = {}
          }
          if (!accumulatedObject[regulatoryTerritory][lawType]) {
            accumulatedObject[regulatoryTerritory][lawType] = {}
          }
          let orderZoneList = zone
          if (zone.length > 1) {
            orderZoneList = zone.sort((a, b) => a.zone > b.zone ? 1 : a.zone === b.zone ? 0 : -1)
          }
          accumulatedObject[regulatoryTerritory][lawType][topic] = orderZoneList
        }
      }
      return accumulatedObject
    }, {})

    const orderedFrenchLayersTopics = {}
    Object.keys(LAWTYPES_TO_TERRITORY).forEach(lawType => {
      const lawTypeObject = layersTopicsByRegulatoryTerritory[FRANCE][lawType]
      if (lawTypeObject) {
        orderedFrenchLayersTopics[lawType] = lawTypeObject
      }
      return null
    })
    layersTopicsByRegulatoryTerritory[FRANCE] = orderedFrenchLayersTopics

    return layersTopicsByRegulatoryTerritory
  }

  getUniqueSpeciesAndDistricts (vessels) {
    const species = vessels
      .map(vessel => vessel.speciesOnboard)
      .flat()
      .reduce((acc, _species) => {
        if (acc.indexOf(_species?.species) < 0) {
          acc.push(_species?.species)
        }

        return acc
      }, [])
      .filter(_species => _species)

    const districts = vessels
      .map(vessel => {
        return {
          district: vessel.district,
          districtCode: vessel.districtCode
        }
      })
      .reduce((acc, district) => {
        const found = acc.find(item => item.district === district.district)

        if (!found) {
          return acc.concat([district])
        } else {
          return acc
        }
      }, [])

    return { species, districts }
  }

  getFilteredVessels (vessels, filters) {
    const {
      countriesFiltered,
      lastPositionTimeAgoFilter,
      fleetSegmentsFiltered,
      gearsFiltered,
      districtsFiltered,
      speciesFiltered,
      vesselsSizeValuesChecked,
      lastControlMonthsAgo,
      vesselsLocationFilter
    } = filters

    if (countriesFiltered?.length) {
      vessels = vessels.filter(vessel => countriesFiltered.some(country => vessel.flagState === country))
    }

    if (lastPositionTimeAgoFilter) {
      const vesselIsHidden = new Date()
      vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel.lastPositionSentAt)

        return vesselDate > vesselIsHidden
      })
    }

    if (lastControlMonthsAgo) {
      const controlBefore = getDateMonthsBefore(new Date(), lastControlMonthsAgo)

      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel.lastControlDateTimeTimestamp)

        return vesselDate < controlBefore
      })
    }

    if (fleetSegmentsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        fleetSegmentsFiltered.some(fleetSegment => {
          return vessel.fleetSegmentsArray.includes(fleetSegment)
        }))
    }

    if (gearsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        gearsFiltered.some(gear => {
          return vessel.gearsArray.includes(gear)
        }))
    }

    if (speciesFiltered?.length) {
      vessels = vessels.filter(vessel =>
        speciesFiltered.some(species => {
          return vessel.speciesArray.includes(species)
        }))
    }

    if (districtsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        districtsFiltered.some(district => {
          return vessel.district === district
        }))
    }

    if (vesselsSizeValuesChecked?.length) {
      vessels = vessels.filter(vessel => {
        return this.evaluateVesselsSize(vesselsSizeValuesChecked, vessel)
      })
    }

    if (vesselsLocationFilter?.length === 1) {
      if (vesselsLocationFilter.includes(VesselLocation.PORT)) {
        vessels = vessels.filter(vessel => vessel.isAtPort)
      }

      if (vesselsLocationFilter.includes(VesselLocation.SEA)) {
        vessels = vessels.filter(vessel => !vessel.isAtPort)
      }
    }

    return vessels
  }

  evaluateVesselsSize (vesselsSizeValuesChecked, vessel) {
    if (vesselsSizeValuesChecked.length === 3) {
      return true
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TEN_METERS.evaluate(vessel.length) || vesselSize.ABOVE_TWELVE_METERS.evaluate(vessel.length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TWELVE_METERS.evaluate(vessel.length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return true
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code)) {
      return vesselSize.BELOW_TEN_METERS.evaluate(vessel.length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TWELVE_METERS.evaluate(vessel.length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return vesselSize.ABOVE_TWELVE_METERS.evaluate(vessel.length)
    }
  }

  searchLayers (searchFields, regulatoryLayers, gears) {
    let foundRegulatoryLayers = {}

    Object.keys(searchFields).forEach(searchProperty => {
      if (searchFields[searchProperty].searchText.length > 0) {
        const searchResultByLawType = searchByLawType(
          regulatoryLayers,
          searchFields[searchProperty].properties,
          searchFields[searchProperty].searchText,
          gears)

        if (foundRegulatoryLayers && Object.keys(foundRegulatoryLayers).length === 0) {
          foundRegulatoryLayers = searchResultByLawType
        } else if (foundRegulatoryLayers) {
          foundRegulatoryLayers = getMergedRegulatoryLayers(foundRegulatoryLayers, searchResultByLawType)
        }
      }
    })

    orderByAlphabeticalLayer(foundRegulatoryLayers)

    return foundRegulatoryLayers
  }
}

Comlink.expose(MonitorFishWorker)
