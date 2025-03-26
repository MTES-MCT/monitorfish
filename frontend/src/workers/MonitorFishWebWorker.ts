import {
  FRANCE,
  getRegulatoryLawTypesFromZones,
  LAWTYPES_TO_TERRITORY,
  mapToRegulatoryZone
} from '@features/Regulation/utils'
import { VesselSize } from '@features/Vessel/components/VesselList/constants'
import { getLastControlledFilterFromLastControlPeriod } from '@features/Vessel/components/VesselList/utils'
import { VesselLocation, vesselSize } from '@features/Vessel/types/vessel'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs, logSoftError } from '@mtes-mct/monitor-ui'
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import { isNotNullish } from '@utils/isNotNullish'
import * as Comlink from 'comlink'

import { getDateMonthsBefore } from '../utils'

import type { Regulation } from '@features/Regulation/Regulation.types'
import type { RegulatoryZone } from '@features/Regulation/types'
import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { SortingState } from '@tanstack/react-table'
import type { Specy } from 'domain/types/specy'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

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

  static getGeometryIdFromFeatureId = (feature: Feature): number | string => {
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

  static getIdToGeometryObject(features: FeatureCollection): Record<string, Polygon> {
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

  /** @deprecated see getFilteredVesselsV2() * */
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

  static getFilteredVesselsV2(vessels: Vessel.VesselLastPosition[], filters: VesselListFilter): string[] {
    const now = customDayjs()
    const vesselIsHidden = filters.lastPositionHoursAgo
      ? now.set('hour', now.get('hour') - filters.lastPositionHoursAgo)
      : now

    const lastControlledFilter = filters.lastControlPeriod
      ? getLastControlledFilterFromLastControlPeriod(filters.lastControlPeriod)
      : undefined

    const countrySet = filters.countryCodes?.length ? new Set(filters.countryCodes) : undefined
    const fleetSegmentsSet = filters.fleetSegments?.length ? new Set(filters.fleetSegments) : undefined
    const gearCodesSet = filters.gearCodes?.length ? new Set(filters.gearCodes) : undefined
    const specyCodesSet = filters.specyCodes?.length ? new Set(filters.specyCodes) : undefined
    const vesselsLocation = filters.vesselsLocation?.length === 1 ? filters.vesselsLocation[0] : undefined

    /* TODO Implement these filters
    lastLandingPortLocodes: string[]
    producerOrganizations: string[]
     */

    return vessels
      .filter(vessel => {
        if (countrySet && !countrySet.has(vessel?.flagState)) {
          return false
        }

        if (filters.hasLogbook !== undefined) {
          switch (filters.hasLogbook) {
            case true: {
              const hasLogbook = !!vessel.lastLogbookMessageDateTime
              if (!hasLogbook) {
                return false
              }
              break
            }
            case false: {
              const hasLogbook = !!vessel.lastLogbookMessageDateTime
              if (hasLogbook) {
                return false
              }
              break
            }
            default:
              break
          }
        }

        if (filters.riskFactors?.length) {
          const isBetween = filters.riskFactors?.some(riskFactor => {
            switch (riskFactor) {
              case 1: {
                return vessel.riskFactor >= 1 && vessel.riskFactor < 2
              }
              case 2: {
                return vessel.riskFactor >= 2 && vessel.riskFactor < 3
              }
              case 3: {
                return vessel.riskFactor >= 3 && vessel.riskFactor <= 4
              }
              default: {
                return true
              }
            }
          })
          if (!isBetween) {
            return false
          }
        }

        if (filters.lastPositionHoursAgo) {
          const lastPosition = customDayjs(vessel.dateTime)
          if (lastPosition.isBefore(vesselIsHidden)) {
            return false
          }
        }

        if (lastControlledFilter?.lastControlledBefore) {
          const vesselDate = customDayjs(vessel?.lastControlDateTime)
          const lastControlledBefore = customDayjs(lastControlledFilter.lastControlledBefore)

          if (!vesselDate.isBefore(lastControlledBefore)) {
            return false
          }
        }

        if (lastControlledFilter?.lastControlledAfter) {
          const vesselDate = customDayjs(vessel?.lastControlDateTime)
          const lastControlledAfter = customDayjs(lastControlledFilter.lastControlledAfter)

          if (!vesselDate.isAfter(lastControlledAfter)) {
            return false
          }
        }

        if (fleetSegmentsSet && !vessel?.segments.some(seg => fleetSegmentsSet.has(seg))) {
          return false
        }

        if (gearCodesSet && !vessel?.gearsArray.some(gear => gearCodesSet.has(gear))) {
          return false
        }

        if (specyCodesSet && !vessel?.speciesArray.some(species => specyCodesSet.has(species))) {
          return false
        }

        if (vesselsLocation !== undefined) {
          if (vesselsLocation === VesselLocation.PORT && !vessel.isAtPort) {
            return false
          }

          if (vesselsLocation === VesselLocation.SEA && vessel.isAtPort) {
            return false
          }
        }

        if (filters.vesselSize) {
          switch (filters.vesselSize) {
            case VesselSize.ABOVE_TWELVE_METERS: {
              const evaluation = vesselSize.ABOVE_TWELVE_METERS.evaluate(vessel.length)
              if (!evaluation) {
                return false
              }
              break
            }
            case VesselSize.BELOW_TEN_METERS: {
              const evaluation = vesselSize.BELOW_TEN_METERS.evaluate(vessel.length)
              if (!evaluation) {
                return false
              }
              break
            }
            case VesselSize.BELOW_TWELVE_METERS: {
              const evaluation = vesselSize.BELOW_TWELVE_METERS.evaluate(vessel.length)
              if (!evaluation) {
                return false
              }
              break
            }
            default:
              break
          }
        }

        if (!!filters.zones?.length && !!vessel.latitude && !!vessel.longitude) {
          const vesselPoint = point([vessel.longitude, vessel.latitude])

          const features = filters.zones.map(zone => zone.feature)
          if (!features.some(polygon => booleanPointInPolygon(vesselPoint, polygon as Polygon | MultiPolygon))) {
            return false
          }
        }

        return true
      })
      .map(vessel => vessel.vesselFeatureId)
  }

  // TODO Use to improve vessel list performance on sort
  static sortTable(vessels: Vessel.VesselLastPosition[], sorting: SortingState): Vessel.VesselLastPosition[] {
    return [...vessels].sort((a, b) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const sort of sorting) {
        const { desc, id } = sort

        if (a[id] < b[id]) {
          return desc ? 1 : -1
        }
        if (a[id] > b[id]) {
          return desc ? -1 : 1
        }
      }

      return 0
    })
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
