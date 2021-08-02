import * as Comlink from 'comlink'
import {
  getMergedRegulatoryLayers,
  lawTypeList,
  mapToRegulatoryZone, orderByAlphabeticalLayer,
  searchByLawType
} from '../domain/entities/regulatory'
import { getDateMonthsBefore } from '../utils'
import { vesselSize } from '../domain/entities/vessel'

class MonitorFishWorker {
  #getLayerNameList = (features) => {
    const featuresWithoutGeometry = features.features.map(feature => {
      return mapToRegulatoryZone(feature.properties)
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

  #getGeometryIdFromFeatureId = (feature) => {
    return feature.split('.')[1]
  }

  getGeometryWithoutRegulationRef (features) {
    const geometryListAsObject = {}
    features.features.forEach(feature => {
      geometryListAsObject[this.#getGeometryIdFromFeatureId(feature.id)] = feature.geometry
    })
    return geometryListAsObject
  }

  convertGeoJSONFeaturesToObject (features) {
    const layerTopicsArray = this.#getLayerNameList(features)
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
   *           seafront: "NAMO",
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
    const regulationBlocList = new Set()
    const zoneThemelist = new Set()
    const seaFrontList = new Set()
    const layerTopicsArray = this.#getLayerNameList(features)
    const layersTopicsByRegTerritory = layerTopicsArray.reduce((accumulatedObject, zone) => {
      const {
        lawType,
        topic,
        seafront
      } = zone[0]
      if (topic && lawType && seafront) {
        zoneThemelist.add(topic)
        const regTerritory = lawTypeList[lawType] ? lawTypeList[lawType] : 'Autres'
        let newLawType = lawType
        if (regTerritory === 'France') {
          newLawType = `${lawType} / ${seafront}`
          seaFrontList.add(seafront)
        }
        regulationBlocList.add(newLawType)
        if (regTerritory && !accumulatedObject[regTerritory]) {
          accumulatedObject[regTerritory] = {}
        }
        if (!accumulatedObject[regTerritory][newLawType]) {
          accumulatedObject[regTerritory][newLawType] = {}
        }
        accumulatedObject[regTerritory][newLawType][topic] = zone
      }
      return accumulatedObject
    }, {})
    return {
      layersTopicsByRegTerritory,
      zoneThemeArray: [...zoneThemelist],
      regulationBlocArray: [...regulationBlocList],
      seaFrontArray: [...seaFrontList]
    }
  }

  getUniqueSpeciesAndDistricts (vessels) {
    const species = vessels
      .map(vessel => vessel.speciesArray)
      .flat()
      .reduce((acc, species) => {
        if (acc.indexOf(species) < 0) {
          acc.push(species)
        }

        return acc
      }, [])

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
      lastControlMonthsAgo
    } = filters

    if (countriesFiltered && countriesFiltered.length) {
      vessels = vessels.filter(vessel => countriesFiltered.some(country => vessel.flagState === country))
    }

    if (lastPositionTimeAgoFilter) {
      const vesselIsHidden = new Date()
      vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel.dateTimeTimestamp)

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

    if (fleetSegmentsFiltered && fleetSegmentsFiltered.length) {
      vessels = vessels.filter(vessel =>
        fleetSegmentsFiltered.some(fleetSegment => {
          return vessel.fleetSegmentsArray.includes(fleetSegment)
        }))
    }

    if (gearsFiltered && gearsFiltered.length) {
      vessels = vessels.filter(vessel =>
        gearsFiltered.some(gear => {
          return vessel.gearsArray.includes(gear)
        }))
    }

    if (speciesFiltered && speciesFiltered.length) {
      vessels = vessels.filter(vessel =>
        speciesFiltered.some(species => {
          return vessel.speciesArray.includes(species)
        }))
    }

    if (districtsFiltered && districtsFiltered.length) {
      vessels = vessels.filter(vessel =>
        districtsFiltered.some(district => {
          return vessel.district === district
        }))
    }

    if (vesselsSizeValuesChecked && vesselsSizeValuesChecked.length) {
      vessels = vessels.filter(vessel => {
        return this.evaluateVesselsSize(vesselsSizeValuesChecked, vessel)
      })
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

    console.log('searchLayers', searchFields, regulatoryLayers, gears)

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

    console.log('searchLayers FINAL', foundRegulatoryLayers)
    orderByAlphabeticalLayer(foundRegulatoryLayers)

    return foundRegulatoryLayers
  }
}

Comlink.expose(MonitorFishWorker)
