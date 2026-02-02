import { geoserverApi } from '@api/geoserverApi'
import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getLastControlDateTime } from '@features/Vessel/utils'
import { Vessel } from '@features/Vessel/Vessel.types'
import { customDayjs, type TreeOption, type Undefine } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash-es'

import { DEFAULT_VESSEL_LIST_FILTER_VALUES, LastControlPeriod } from './constants'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { MainAppDispatch } from '@store'

export function getLastControlledFilterFromLastControlPeriod(period: LastControlPeriod | undefined): Partial<{
  lastControlledAfter: string | undefined
  lastControlledBefore: string | undefined
}> {
  switch (period) {
    case LastControlPeriod.AFTER_ONE_MONTH_AGO:
      return {
        lastControlledAfter: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_MONTH_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_THREE_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(3, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_SIX_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(6, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_YEAR_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'year').toISOString()
      }

    case LastControlPeriod.BEFORE_TWO_YEARS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(2, 'year').toISOString()
      }

    default:
      return {}
  }
}

export async function getFilterableZonesAsTreeOptions(dispatch: MainAppDispatch): Promise<TreeOption[]> {
  const filterableLayers = Object.keys(LayerProperties)
    .map<MonitorFishMap.ShowableLayer>(layerKey => LayerProperties[layerKey])
    .filter(layer => !!layer.isIntersectable)

  return Promise.all(
    filterableLayers.map(async zone => {
      if (!zone.hasSearchableZones) {
        return {
          children: [
            {
              label: zone.name,
              value: zone.code
            }
          ],
          label: zone.name ?? 'Aucun nom'
        }
      }

      const fao = LayerProperties[MonitorFishMap.MonitorFishLayer.FAO]
      const result = await dispatch(
        geoserverApi.endpoints.getAdministrativeSubZones.initiate({
          fromBackoffice: false,
          sortBy: zone.code === fao.code ? fao.zoneNamePropertyKey : undefined,
          type: zone.code
        })
      ).unwrap()
      const features = result.features.map((subZone: any) => ({
        label:
          zone.zoneNamePropertyKey && subZone.properties[zone.zoneNamePropertyKey]
            ? subZone.properties[zone.zoneNamePropertyKey].toString()
            : 'Aucun nom',
        value: subZone.id
      }))

      return {
        children: features,
        label: zone.name ?? 'Aucun nom'
      }
    })
  )
}

export function countVesselListFilter(listFilterValues: VesselListFilter) {
  const areListFilterValuesEqualToDefaultOnes = isEqual(listFilterValues, DEFAULT_VESSEL_LIST_FILTER_VALUES)
  if (areListFilterValuesEqualToDefaultOnes) {
    return 0
  }

  return (
    (listFilterValues.countryCodes?.length ?? 0) +
    (listFilterValues.fleetSegments?.length ?? 0) +
    (listFilterValues.gearCodes?.length ?? 0) +
    (listFilterValues.hasLogbook ? 1 : 0) +
    (listFilterValues.lastControlAtSeaPeriod ? 1 : 0) +
    (listFilterValues.lastControlAtQuayPeriod ? 1 : 0) +
    (listFilterValues.landingPortLocodes?.length ?? 0) +
    (listFilterValues.lastPositionHoursAgo ? 1 : 0) +
    (listFilterValues.producerOrganizations?.length ?? 0) +
    (listFilterValues.riskFactors?.length ?? 0) +
    (listFilterValues.specyCodes?.length ?? 0) +
    (!!listFilterValues.searchQuery && listFilterValues.searchQuery.length > 0 ? 1 : 0) +
    (listFilterValues.vesselSize ? 1 : 0) +
    (listFilterValues.vesselsLocation?.length ?? 0) +
    (listFilterValues.emitsPositions?.length ?? 0) +
    (listFilterValues.zones?.length ?? 0)
  )
}

export function getLastControlDateTimeAndControlType(
  hasLastControlAtSeaFilter: boolean,
  hasLastControlAtQuayFilter: boolean,
  vessel: Undefine<Vessel.ActiveVessel> | undefined
) {
  if (!vessel) {
    return { controlType: undefined, lastControlDateTime: undefined }
  }

  const hasNoLastControlFilter = !hasLastControlAtSeaFilter && !hasLastControlAtQuayFilter
  const hasTwoLastControlFilters = hasLastControlAtSeaFilter && hasLastControlAtQuayFilter

  let lastControlDateTime: string | undefined
  let controlType = ''

  if (hasLastControlAtSeaFilter && !hasLastControlAtQuayFilter) {
    controlType = '(mer)'
    lastControlDateTime = vessel.lastControlAtSeaDateTime
  }

  if (hasLastControlAtQuayFilter && !hasLastControlAtSeaFilter) {
    controlType = '(quai)'
    lastControlDateTime = vessel.lastControlAtQuayDateTime
  }

  if (hasNoLastControlFilter || hasTwoLastControlFilters) {
    lastControlDateTime = getLastControlDateTime(vessel.lastControlAtSeaDateTime, vessel.lastControlAtQuayDateTime)
    controlType = lastControlDateTime === vessel.lastControlAtSeaDateTime ? '(mer)' : '(quai)'
  }

  return { controlType, lastControlDateTime }
}
