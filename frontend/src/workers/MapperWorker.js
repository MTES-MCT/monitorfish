import * as Comlink from 'comlink'
import { mapToRegulatoryZone } from '../domain/entities/regulatory'

class MapperWorker {
  convertGeoJSONFeaturesToObject (features) {
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

    const layerNamesArray = uniqueFeaturesWithoutGeometry
      .map(layer => layer.layerName)
      .map(layerName => {
        return uniqueFeaturesWithoutGeometry.filter(layer => layer.layerName === layerName)
      })

    const layersNamesToZones = layerNamesArray.reduce((accumulatedObject, zone) => {
      accumulatedObject[zone[0].layerName] = zone
      return accumulatedObject
    }, {})

    return layersNamesToZones
  }

  getFilteredVessels (vessels, countriesFiltered, lastPositionTimeAgoFilter, fleetSegmentsFiltered, gearsFiltered) {
    if (countriesFiltered && countriesFiltered.length) {
      vessels = vessels.filter(vessel => countriesFiltered.some(country => vessel.flagState === country))
    }

    const vesselIsHidden = new Date()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)
    if (lastPositionTimeAgoFilter) {
      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel.dateTimeTimestamp)

        return vesselDate > vesselIsHidden
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

    return vessels
  }
}

Comlink.expose(MapperWorker)
