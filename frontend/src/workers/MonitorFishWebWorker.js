import * as Comlink from 'comlink'
import {
  FRANCE,
  getRegulatoryLawTypesFromZones,
  LAWTYPES_TO_TERRITORY,
  mapToRegulatoryZone
} from '../features/Regulation/utils'
import { getDateMonthsBefore } from '../utils'
import { VesselLocation, vesselSize } from '../domain/entities/vessel/vessel'

class MonitorFishWebWorker {
  getStructuredRegulationLawTypes = regulatoryZones => getRegulatoryLawTypesFromZones(regulatoryZones)

  #getLayerTopicList = (features, speciesByCode) => {
    const featuresWithoutGeometry = features.features.map(feature => {
      return mapToRegulatoryZone(feature, speciesByCode)
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

    const uniqueFeaturesWithoutGeometryByTopics = uniqueFeaturesWithoutGeometry
      .map(layer => layer.topic)
      .map(topic => {
        return uniqueFeaturesWithoutGeometry.filter(layer => layer.topic === topic)
      })

    return {
      featuresWithoutGeometry,
      uniqueFeaturesWithoutGeometryByTopics
    }
  }

  mapGeoserverToRegulatoryZones = (geoJSON, speciesByCode) =>
    geoJSON.features.map(feature => mapToRegulatoryZone(feature, speciesByCode))

  #getGeometryIdFromFeatureId = feature => {
    return feature.properties?.id || feature.id.split('.')[1]
  }

  getIdToGeometryObject (features) {
    const geometryListAsObject = {}
    features.features.forEach(feature => {
      geometryListAsObject[this.#getGeometryIdFromFeatureId(feature)] = feature.geometry
    })
    return geometryListAsObject
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
   * @param {Object<string, Object>} speciesByCode
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
  convertGeoJSONFeaturesToStructuredRegulatoryObject (features, speciesByCode) {
    const regulatoryTopicList = new Set()
    const {
      featuresWithoutGeometry,
      uniqueFeaturesWithoutGeometryByTopics: layerTopicArray
    } = this.#getLayerTopicList(features, speciesByCode)

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
      if (layersTopicsByRegulatoryTerritory[FRANCE] && layersTopicsByRegulatoryTerritory[FRANCE][lawType]) {
        orderedFrenchLayersTopics[lawType] = layersTopicsByRegulatoryTerritory[FRANCE][lawType]
      }

      return null
    })
    layersTopicsByRegulatoryTerritory[FRANCE] = orderedFrenchLayersTopics

    return {
      layersTopicsByRegulatoryTerritory,
      layersWithoutGeometry: featuresWithoutGeometry
    }
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
      vessels = vessels.filter(vessel => countriesFiltered.some(country => vessel.vesselProperties?.flagState === country))
    }

    if (lastPositionTimeAgoFilter) {
      const vesselIsHidden = new Date()
      vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

      vessels = vessels.filter(vessel => {
        if (vessel.vesselProperties?.beaconMalfunctionId) {
          return true
        }

        const vesselDate = new Date(vessel.lastPositionSentAt)

        return vesselDate > vesselIsHidden
      })
    }

    if (lastControlMonthsAgo) {
      const controlBefore = getDateMonthsBefore(new Date(), lastControlMonthsAgo)

      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel.vesselProperties?.lastControlDateTimeTimestamp)

        return vesselDate < controlBefore
      })
    }

    if (fleetSegmentsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        fleetSegmentsFiltered.some(fleetSegment => {
          return vessel.vesselProperties?.fleetSegmentsArray.includes(fleetSegment)
        }))
    }

    if (gearsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        gearsFiltered.some(gear => {
          return vessel.vesselProperties?.gearsArray.includes(gear)
        }))
    }

    if (speciesFiltered?.length) {
      vessels = vessels.filter(vessel =>
        speciesFiltered.some(species => {
          return vessel.vesselProperties?.speciesArray.includes(species)
        }))
    }

    if (districtsFiltered?.length) {
      vessels = vessels.filter(vessel =>
        districtsFiltered.some(district => {
          return vessel.vesselProperties?.district === district
        }))
    }

    if (vesselsSizeValuesChecked?.length) {
      vessels = vessels.filter(vessel => {
        return this.evaluateVesselsSize(vesselsSizeValuesChecked, vessel.vesselProperties?.length)
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

  evaluateVesselsSize (vesselsSizeValuesChecked, length) {
    if (vesselsSizeValuesChecked.length === 3) {
      return true
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TEN_METERS.evaluate(length) || vesselSize.ABOVE_TWELVE_METERS.evaluate(length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TWELVE_METERS.evaluate(length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return true
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code)) {
      return vesselSize.BELOW_TEN_METERS.evaluate(length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code)) {
      return vesselSize.BELOW_TWELVE_METERS.evaluate(length)
    }

    if (vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)) {
      return vesselSize.ABOVE_TWELVE_METERS.evaluate(length)
    }
  }
}

Comlink.expose(MonitorFishWebWorker)
