import { VesselLocation, vesselSize } from '@features/Vessel/types/vessel'
import { logSoftError } from '@mtes-mct/monitor-ui'
import * as Comlink from 'comlink'

import {
  FRANCE,
  getRegulatoryLawTypesFromZones,
  LAWTYPES_TO_TERRITORY,
  mapToRegulatoryZone
} from '../features/Regulation/utils'
import { getDateMonthsBefore } from '../utils'
import { isNotNullish } from '../utils/isNotNullish'

import type { GeoJSON } from '../domain/types/GeoJSON'
import type { Regulation } from '../features/Regulation/Regulation.types'
import type { RegulatoryZone } from '../features/Regulation/types'
import type { Specy } from 'domain/types/specy'

/**
 * /!\ Do not shorten imports in the Web worker.
 * It will fail the Vite build : `Rollup failed to resolve import [...]`
 */

export class MonitorFishWebWorker {
  static getStructuredRegulationLawTypes(regulatoryZones) {
    return getRegulatoryLawTypesFromZones(regulatoryZones)
  }

  static getLayerTopicList = (
    features: Regulation.RegulatoryZoneGeoJsonFeatureCollection,
    speciesByCode: Record<string, Specy>
  ) => {
    const featuresWithoutGeometry: RegulatoryZone[] = features.features
      .map(feature => mapToRegulatoryZone(feature, speciesByCode))
      .filter(isNotNullish)

    const uniqueFeaturesWithoutGeometry = featuresWithoutGeometry.reduce<RegulatoryZone[]>((acc, current) => {
      const found = acc.find(item => item.topic === current.topic && item.zone === current.zone)
      if (!found) {
        return acc.concat([current])
      }

      return acc
    }, [])

    const uniqueFeaturesWithoutGeometryByTopics = uniqueFeaturesWithoutGeometry
      .map(layer => layer.topic)
      .map(topic => uniqueFeaturesWithoutGeometry.filter(layer => layer.topic === topic))

    return {
      featuresWithoutGeometry,
      uniqueFeaturesWithoutGeometryByTopics
    }
  }

  static mapGeoserverToRegulatoryZones = (
    geoJSON: Regulation.RegulatoryZoneGeoJsonFeatureCollection,
    speciesByCode: Record<string, Specy>
  ): RegulatoryZone[] =>
    geoJSON.features.map(feature => mapToRegulatoryZone(feature, speciesByCode)).filter(isNotNullish)

  static getGeometryIdFromFeatureId = (feature: GeoJSON.Feature): number | string => {
    const idFromProperties = feature.properties?.id as number | undefined
    if (idFromProperties) {
      return idFromProperties
    }

    const idFromFeature = feature.id?.toString()
    if (idFromFeature) {
      return idFromFeature.split('.')[1] ?? ''
    }

    return ''
  }

  static getIdToGeometryObject(features: GeoJSON.FeatureCollection): Record<string, GeoJSON.Geometry> {
    const geometryListAsObject = {}

    features.features.forEach(feature => {
      geometryListAsObject[MonitorFishWebWorker.getGeometryIdFromFeatureId(feature)] = feature.geometry
    })

    return geometryListAsObject
  }

  // TODO Find a better name.
  static convertGeoJSONFeaturesToStructuredRegulatoryObject(
    features: Regulation.RegulatoryZoneGeoJsonFeatureCollection,
    speciesByCode: Record<string, Specy>
  ): Regulation.StructuredRegulatoryObject {
    const regulatoryTopicList = new Set()
    const { featuresWithoutGeometry, uniqueFeaturesWithoutGeometryByTopics: layerTopicArray } =
      MonitorFishWebWorker.getLayerTopicList(features, speciesByCode)

    const layersTopicsByRegulatoryTerritory = layerTopicArray.reduce<
      Record<string, Record<string, Record<string, RegulatoryZone[]>>>
    >((accumulatedObject, zone) => {
      const firstRegulatoryZone = zone[0]
      if (!firstRegulatoryZone) {
        logSoftError({ message: '`regulatoryZone[0]` is undefined.' })

        return accumulatedObject
      }

      const { lawType, topic } = firstRegulatoryZone

      if (topic && lawType) {
        regulatoryTopicList.add(topic)
        const regulatoryTerritory: string | undefined = LAWTYPES_TO_TERRITORY[lawType]
        if (regulatoryTerritory) {
          if (!accumulatedObject[regulatoryTerritory]) {
            // For performance reason
            // eslint-disable-next-line no-param-reassign
            accumulatedObject[regulatoryTerritory] = {}
          }
          if (!accumulatedObject[regulatoryTerritory][lawType]) {
            // For performance reason
            // eslint-disable-next-line no-param-reassign
            accumulatedObject[regulatoryTerritory][lawType] = {}
          }
          let orderZoneList = zone
          if (zone.length > 1) {
            orderZoneList = zone.sort((a, b) => {
              if (a.zone > b.zone) {
                return 1
              }

              return a.zone === b.zone ? 0 : -1
            })
          }

          // For performance reason
          // eslint-disable-next-line no-param-reassign
          accumulatedObject[regulatoryTerritory][lawType][topic] = orderZoneList
        }
      }

      return accumulatedObject
    }, {})

    const orderedFrenchLayersTopics: Record<string, Record<string, RegulatoryZone[]>> = {}
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

  static getUniqueSpeciesAndDistricts(vessels) {
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
      .map(vessel => ({
        district: vessel.district,
        districtCode: vessel.districtCode
      }))
      .reduce((acc, district) => {
        const found = acc.find(item => item.district === district.district)

        if (!found) {
          return acc.concat([district])
        }

        return acc
      }, [])

    return { districts, species }
  }

  static getFilteredVessels(vessels, filters) {
    const {
      countriesFiltered,
      districtsFiltered,
      fleetSegmentsFiltered,
      gearsFiltered,
      lastControlMonthsAgo,
      lastPositionTimeAgoFilter,
      speciesFiltered,
      vesselsLocationFilter,
      vesselsSizeValuesChecked
    } = filters

    if (countriesFiltered?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => countriesFiltered.some(country => vessel?.flagState === country))
    }

    if (lastPositionTimeAgoFilter) {
      const vesselIsHidden = new Date()
      vesselIsHidden.setHours(vesselIsHidden.getHours() - lastPositionTimeAgoFilter)

      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => {
        if (vessel?.beaconMalfunctionId) {
          return true
        }

        const vesselDate = new Date(vessel.lastPositionSentAt)

        return vesselDate > vesselIsHidden
      })
    }

    if (lastControlMonthsAgo) {
      const controlBefore = getDateMonthsBefore(new Date(), lastControlMonthsAgo)

      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => {
        const vesselDate = new Date(vessel?.lastControlDateTimeTimestamp)

        return vesselDate < controlBefore
      })
    }

    if (fleetSegmentsFiltered?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel =>
        fleetSegmentsFiltered.some(fleetSegment => vessel?.segments.includes(fleetSegment))
      )
    }

    if (gearsFiltered?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => gearsFiltered.some(gear => vessel?.gearsArray.includes(gear)))
    }

    if (speciesFiltered?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => speciesFiltered.some(species => vessel?.speciesArray.includes(species)))
    }

    if (districtsFiltered?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel => districtsFiltered.some(district => vessel?.district === district))
    }

    if (vesselsSizeValuesChecked?.length) {
      // For performance reason
      // eslint-disable-next-line no-param-reassign
      vessels = vessels.filter(vessel =>
        MonitorFishWebWorker.evaluateVesselsSize(vesselsSizeValuesChecked, vessel?.length)
      )
    }

    if (vesselsLocationFilter?.length === 1) {
      if (vesselsLocationFilter.includes(VesselLocation.PORT)) {
        // For performance reason
        // eslint-disable-next-line no-param-reassign
        vessels = vessels.filter(vessel => vessel.isAtPort)
      }

      if (vesselsLocationFilter.includes(VesselLocation.SEA)) {
        // For performance reason
        // eslint-disable-next-line no-param-reassign
        vessels = vessels.filter(vessel => !vessel.isAtPort)
      }
    }

    return vessels
  }

  static evaluateVesselsSize(vesselsSizeValuesChecked, length) {
    if (vesselsSizeValuesChecked.length === 3) {
      return true
    }

    if (
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)
    ) {
      return vesselSize.BELOW_TEN_METERS.evaluate(length) || vesselSize.ABOVE_TWELVE_METERS.evaluate(length)
    }

    if (
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TEN_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code)
    ) {
      return vesselSize.BELOW_TWELVE_METERS.evaluate(length)
    }

    if (
      vesselsSizeValuesChecked.includes(vesselSize.BELOW_TWELVE_METERS.code) &&
      vesselsSizeValuesChecked.includes(vesselSize.ABOVE_TWELVE_METERS.code)
    ) {
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

    return false
  }
}

Comlink.expose(MonitorFishWebWorker)
