import {
  FRANCE,
  getRegulatoryLawTypesFromZones,
  LAWTYPES_TO_TERRITORY,
  mapToRegulatoryZone
} from '@features/Regulation/utils'
import { VesselSize } from '@features/Vessel/components/VesselList/constants'
import { getLastControlledFilterFromLastControlPeriod } from '@features/Vessel/components/VesselList/utils'
import { ActivityType } from '@features/Vessel/schemas/ActiveVesselSchema'
import { VesselEmitsPosition, VesselLocation, vesselSize } from '@features/Vessel/types/vessel'
import { Vessel } from '@features/Vessel/Vessel.types'
import { SEARCH_QUERY_MIN_LENGTH } from '@features/VesselGroup/components/VesselGroupList/hooks/constants'
import { GroupType, Sharing, type VesselGroupWithVessels } from '@features/VesselGroup/types'
import { customDayjs, CustomSearch, logSoftError } from '@mtes-mct/monitor-ui'
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import { isNotNullish } from '@utils/isNotNullish'
import * as Comlink from 'comlink'
import { asArray } from 'ol/color'

import type { VesselGroupDisplayInformation } from './types'
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

  static getActiveVesselsWithPositionAndDisplayedVesselsGroups(
    vessels: Vessel.ActiveVessel[],
    vesselGroupsIdsDisplayed: number[],
    vesselGroupsIdsPinned: number[]
  ): Array<[Vessel.ActiveVesselEmittingPosition, VesselGroupDisplayInformation]> {
    return vessels
      .filter(vessel => vessel.activityType === ActivityType.POSITION_BASED)
      .map(vessel => [vessel, this.getDisplayedVesselGroups(vessel, vesselGroupsIdsDisplayed, vesselGroupsIdsPinned)])
  }

  static getDisplayedVesselGroups(
    vessel: Vessel.ActiveVesselEmittingPosition,
    vesselGroupsIdsDisplayed: number[],
    vesselGroupsIdsPinned: number[]
  ): VesselGroupDisplayInformation {
    const pinnedAndDisplayedVesselGroups = vesselGroupsIdsDisplayed.filter(groupId =>
      vesselGroupsIdsPinned.includes(groupId)
    )
    const unpinnedAndDisplayedVesselGroups = vesselGroupsIdsDisplayed.filter(
      groupId => !vesselGroupsIdsPinned.includes(groupId)
    )
    const orderedDisplayedVesselGroups = pinnedAndDisplayedVesselGroups.concat(unpinnedAndDisplayedVesselGroups)

    const groupsDisplayed = orderedDisplayedVesselGroups
      .map(id => vessel.vesselGroups.find(group => group.id === id))
      .filter((group): group is Vessel.VesselGroupOfActiveVessel => !!group)

    const numberOfGroupsHidden =
      vessel.vesselGroups.length > groupsDisplayed.length ? vessel.vesselGroups.length - groupsDisplayed.length : 0

    const firstGroupDisplayed = groupsDisplayed[0]
    const groupColor = firstGroupDisplayed?.color ? asArray(firstGroupDisplayed.color) : [0, 0, 0]

    return {
      groupColor,
      groupsDisplayed,
      numberOfGroupsHidden
    }
  }

  static getFilteredVesselGroups(
    vesselGroupsWithVessels: VesselGroupWithVessels[],
    vesselGroupsIdsPinned: number[],
    searchQuery: string | undefined,
    filteredGroupTypes: GroupType[],
    filteredGroupSharing: Sharing[],
    filteredExpired: boolean
  ): {
    pinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
    unpinnedVesselGroupsWithVessels: VesselGroupWithVessels[]
  } {
    const filteredVesselGroups =
      vesselGroupsWithVessels
        ?.filter(vesselGroup => filteredGroupTypes.includes(vesselGroup.group.type))
        ?.filter(vesselGroup => filteredGroupSharing.includes(vesselGroup.group.sharing))
        ?.filter(vesselGroup =>
          vesselGroup.group.endOfValidityUtc && !filteredExpired
            ? customDayjs(vesselGroup.group.endOfValidityUtc).isAfter(customDayjs(), 'day')
            : true
        ) ?? []

    const fuse = new CustomSearch<VesselGroupWithVessels>(
      filteredVesselGroups,
      [
        {
          getFn: vesselGroupWithVessels => vesselGroupWithVessels.vessels.map(vessel => vessel.vesselName ?? ''),
          name: 'vessels.vesselName'
        },
        {
          getFn: vesselGroupWithVessels =>
            vesselGroupWithVessels.vessels.map(vessel => vessel.internalReferenceNumber ?? ''),
          name: 'vessels.internalReferenceNumber'
        },
        {
          getFn: vesselGroupWithVessels =>
            vesselGroupWithVessels.vessels.map(vessel => vessel.externalReferenceNumber ?? ''),
          name: 'vessels.externalReferenceNumber'
        },
        {
          getFn: vesselGroupWithVessels => vesselGroupWithVessels.vessels.map(vessel => vessel.ircs ?? ''),
          name: 'vessels.ircs'
        }
      ],
      { isStrict: true, threshold: 0.4 }
    )

    const filteredVesselGroupsWithVesselsBySearchQuery = (function () {
      if (!searchQuery || searchQuery.length <= SEARCH_QUERY_MIN_LENGTH) {
        return filteredVesselGroups ?? []
      }

      return fuse.find(searchQuery)
    })()

    const pinnedVesselGroupsWithVessels = filteredVesselGroupsWithVesselsBySearchQuery.filter(vesselGroup =>
      vesselGroupsIdsPinned.includes(vesselGroup.group.id)
    )
    const unpinnedVesselGroupsWithVessels = filteredVesselGroupsWithVesselsBySearchQuery.filter(
      vesselGroup => !vesselGroupsIdsPinned.includes(vesselGroup.group.id)
    )

    return {
      pinnedVesselGroupsWithVessels,
      unpinnedVesselGroupsWithVessels
    }
  }

  static getFilteredVessels(vessels: Vessel.ActiveVessel[], filters: VesselListFilter): string[] {
    const now = customDayjs()
    const vesselIsHidden = filters.lastPositionHoursAgo
      ? now.set('hour', now.get('hour') - filters.lastPositionHoursAgo)
      : now

    const lastControlAtSeaFilter = filters.lastControlAtSeaPeriod
      ? getLastControlledFilterFromLastControlPeriod(filters.lastControlAtSeaPeriod)
      : undefined
    const lastControlAtQuayFilter = filters.lastControlAtQuayPeriod
      ? getLastControlledFilterFromLastControlPeriod(filters.lastControlAtQuayPeriod)
      : undefined

    const producerOrganizationSet = filters.producerOrganizations?.length
      ? new Set(filters.producerOrganizations)
      : undefined
    const countrySet = filters.countryCodes?.length ? new Set(filters.countryCodes) : undefined
    const districtSet = filters.districtCodes?.length ? new Set(filters.districtCodes) : undefined
    const fleetSegmentsSet = filters.fleetSegments?.length ? new Set(filters.fleetSegments) : undefined
    const gearCodesSet = filters.gearCodes?.length ? new Set(filters.gearCodes) : undefined
    const specyCodesSet = filters.specyCodes?.length ? new Set(filters.specyCodes) : undefined
    const vesselsLocation = filters.vesselsLocation?.length === 1 ? filters.vesselsLocation[0] : undefined
    const emitsPositions = filters.emitsPositions?.length === 1 ? filters.emitsPositions[0] : undefined
    const landingPortLocodesSet = filters.landingPortLocodes?.length ? new Set(filters.landingPortLocodes) : undefined

    const fuse = new CustomSearch<Vessel.ActiveVessel>(
      vessels,
      [
        {
          getFn: vessel => vessel.vesselName ?? '',
          name: 'vessel.vesselName'
        },
        {
          getFn: vessel => vessel.internalReferenceNumber ?? '',
          name: 'vessel.internalReferenceNumber'
        },
        {
          getFn: vessel => vessel.externalReferenceNumber ?? '',
          name: 'vessel.externalReferenceNumber'
        },
        {
          getFn: vessel => vessel.ircs ?? '',
          name: 'vessel.ircs'
        }
      ],
      { isDiacriticSensitive: false, isStrict: true, threshold: 0.4 }
    )

    const searchedVessels = filters.searchQuery ? fuse.find(filters.searchQuery) : vessels

    return searchedVessels
      .filter(vessel => {
        if (countrySet && !countrySet.has(vessel.flagState)) {
          return false
        }

        if (districtSet && (!vessel.districtCode || !districtSet.has(vessel.districtCode))) {
          return false
        }

        if (
          producerOrganizationSet &&
          (!vessel.producerOrganization || !producerOrganizationSet.has(vessel.producerOrganization))
        ) {
          return false
        }

        if (
          landingPortLocodesSet &&
          (!vessel.landingPortLocode || !landingPortLocodesSet.has(vessel.landingPortLocode))
        ) {
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
                return vessel.riskFactor >= 3 && vessel.riskFactor < 4
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
          if (vessel.activityType === ActivityType.LOGBOOK_BASED) {
            return false
          }

          const lastPosition = customDayjs(vessel.dateTime)
          if (lastPosition.isBefore(vesselIsHidden)) {
            return false
          }
        }

        if (lastControlAtSeaFilter?.lastControlledBefore && !!vessel?.lastControlAtSeaDateTime) {
          const vesselDate = customDayjs(vessel?.lastControlAtSeaDateTime)
          const lastControlledBefore = customDayjs(lastControlAtSeaFilter.lastControlledBefore)

          if (!vesselDate.isBefore(lastControlledBefore)) {
            return false
          }
        }

        if (lastControlAtSeaFilter?.lastControlledAfter) {
          if (!vessel?.lastControlAtSeaDateTime) {
            return false
          }

          const vesselDate = customDayjs(vessel?.lastControlAtSeaDateTime)
          const lastControlledAfter = customDayjs(lastControlAtSeaFilter.lastControlledAfter)

          if (!vesselDate.isAfter(lastControlledAfter)) {
            return false
          }
        }

        if (lastControlAtQuayFilter?.lastControlledBefore && !!vessel?.lastControlAtQuayDateTime) {
          const vesselDate = customDayjs(vessel?.lastControlAtQuayDateTime)
          const lastControlledBefore = customDayjs(lastControlAtQuayFilter.lastControlledBefore)

          if (!vesselDate.isBefore(lastControlledBefore)) {
            return false
          }
        }

        if (lastControlAtQuayFilter?.lastControlledAfter) {
          if (!vessel?.lastControlAtQuayDateTime) {
            return false
          }

          const vesselDate = customDayjs(vessel?.lastControlAtQuayDateTime)
          const lastControlledAfter = customDayjs(lastControlAtQuayFilter.lastControlledAfter)

          if (!vesselDate.isAfter(lastControlledAfter)) {
            return false
          }
        }

        if (fleetSegmentsSet && !vessel?.segments?.some(seg => fleetSegmentsSet.has(seg))) {
          return false
        }

        if (gearCodesSet && !vessel?.gearsArray?.some(gear => gearCodesSet.has(gear))) {
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

        if (emitsPositions !== undefined) {
          if (emitsPositions === VesselEmitsPosition.YES && vessel.activityType !== ActivityType.POSITION_BASED) {
            return false
          }

          if (emitsPositions === VesselEmitsPosition.NO && vessel.activityType !== ActivityType.LOGBOOK_BASED) {
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

        if (filters.zones?.length) {
          if (vessel.activityType === ActivityType.LOGBOOK_BASED) {
            return false
          }

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
  static sortTable(
    vessels: Vessel.ActiveVesselEmittingPosition[],
    sorting: SortingState
  ): Vessel.ActiveVesselEmittingPosition[] {
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
