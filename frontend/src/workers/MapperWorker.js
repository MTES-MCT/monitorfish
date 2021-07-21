import * as Comlink from 'comlink'
import { lawTypeList, mapToRegulatoryZone } from '../domain/entities/regulatory'
import { vesselSize } from '../domain/entities/vessel'
import { getDateMonthsBefore } from '../utils'

class MapperWorker {
  #getLayerNameList = (features) => {
    const featuresWithoutGeometry = features.features.map(feature => {
      return mapToRegulatoryZone(feature.properties)
    })

    const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce((acc, current) => {
      const found = acc.find(item =>
        item.layerName === current.layerName &&
        item.zone === current.zone)
      if (!found) {
        return acc.concat([current])
      } else {
        return acc
      }
    }, [])

    return uniqueFeaturesWithoutGeometry
      .map(layer => layer.layerName)
      .map(layerName => {
        return uniqueFeaturesWithoutGeometry.filter(layer => layer.layerName === layerName)
      })
  }

  convertGeoJSONFeaturesToObject (features) {
    const layerNamesArray = this.#getLayerNameList(features)
    const layersNamesToZones = layerNamesArray.reduce((accumulatedObject, zone) => {
      accumulatedObject[zone[0].layerName] = zone
      return accumulatedObject
    }, {})

    return layersNamesToZones
  }

  convertGeoJSONFeaturesToObjectByRegTerritory (features) {
    const regulationBlocList = new Set()
    const zoneThemelist = new Set()
    const seaFrontList = new Set()
    const layerNamesArray = this.#getLayerNameList(features)
    const layersNamesByRegTerritory = layerNamesArray.reduce((accumulatedObject, zone) => {
      let lawType = zone[0].lawType
      const layerName = zone[0].layerName
      zoneThemelist.add(layerName)
      const regTerritory = lawTypeList[lawType] ? lawTypeList[lawType] : 'Autres'
      if (regTerritory === 'France') {
        lawType = `${lawType} / ${zone[0].seafront}`
        seaFrontList.add(zone[0].seafront)
      }
      regulationBlocList.add(lawType)
      if (!accumulatedObject[regTerritory]) {
        accumulatedObject[regTerritory] = {}
      }
      if (!accumulatedObject[regTerritory][lawType]) {
        accumulatedObject[regTerritory][lawType] = {}
      }
      accumulatedObject[regTerritory][lawType][layerName] = zone
      return accumulatedObject
    }, {})
    return {
      layersNamesByRegTerritory,
      zoneThemeArray: [...zoneThemelist],
      regulationBlocArray: [...regulationBlocList],
      seaFrontArray: [...seaFrontList]
    }
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
}

Comlink.expose(MapperWorker)
