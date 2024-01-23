import { CustomSearch, type Filter, isDefined, pluralize, ControlUnit, type Station } from '@mtes-mct/monitor-ui'
import { isEmpty, uniq } from 'lodash/fp'
import { createEmpty, extend, type Extent } from 'ol/extent'
import { fromLonLat } from 'ol/proj'

import { addBufferToExtent } from '../../../../utils/addBufferToExtent'
import { isNotArchived } from '../../../../utils/isNotArchived'

import type { FiltersState } from './types'

export function getBufferedExtentFromStations(highlightedStations: Station.StationData[], bufferRatio: number): Extent {
  const stationsExtent = createEmpty()
  highlightedStations.forEach(station => {
    const stationCoordinates = fromLonLat([station.longitude, station.latitude])
    const stationExtent = [
      stationCoordinates[0],
      stationCoordinates[1],
      stationCoordinates[0],
      stationCoordinates[1]
    ] as Extent

    extend(stationsExtent, stationExtent)
  })

  const bufferedStationsExtent = addBufferToExtent(stationsExtent, bufferRatio)

  return bufferedStationsExtent
}

export function displayBaseNamesFromControlUnit(controlUnit: ControlUnit.ControlUnit): string {
  const baseNames = controlUnit.controlUnitResources.map(({ station: base }) => base.name).filter(isDefined)

  return baseNames.length > 0 ? uniq(baseNames).sort().join(', ') : 'Aucune base'
}

export function displayControlUnitResourcesFromControlUnit(controlUnit: ControlUnit.ControlUnit): string {
  const controlUnitResourceTypeCounts = controlUnit.controlUnitResources.filter(isNotArchived).reduce(
    (previousControlUnitResourceTypeCounts, controlUnitResource) => {
      const controlUnitResourceTypeCount = previousControlUnitResourceTypeCounts[controlUnitResource.type]
      if (!controlUnitResourceTypeCount) {
        return {
          ...previousControlUnitResourceTypeCounts,
          [controlUnitResource.type]: 1
        }
      }

      return {
        ...previousControlUnitResourceTypeCounts,
        [controlUnitResource.type]: controlUnitResourceTypeCount + 1
      }
    },
    {} as Record<string, number>
  )

  return !isEmpty(controlUnitResourceTypeCounts)
    ? Object.entries(controlUnitResourceTypeCounts)
        .map(([type, count]) => `${count} ${pluralize(ControlUnit.ControlUnitResourceTypeLabel[type], count)}`)
        .join(', ')
    : 'Aucun moyen'
}

export function getFilters(
  data: ControlUnit.ControlUnit[],
  filtersState: FiltersState
): Filter<ControlUnit.ControlUnit>[] {
  const customSearch = new CustomSearch(
    data,
    [
      { name: 'administration.name', weight: 0.1 },
      { name: 'name', weight: 0.9 }
    ],
    {
      cacheKey: 'MAP_CONTROL_UNIT_LIST',
      isStrict: true,
      withCacheInvalidation: true
    }
  )
  const filters: Array<Filter<ControlUnit.ControlUnit>> = []

  // Search query
  // ⚠️ Order matters! Search query should be kept before other filters.
  if (filtersState.query && filtersState.query.trim().length > 0) {
    const filter: Filter<ControlUnit.ControlUnit> = () => customSearch.find(filtersState.query as string)

    filters.push(filter)
  }

  // Administration
  if (filtersState.administrationId) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.filter(controlUnit => controlUnit.administrationId === filtersState.administrationId)

    filters.push(filter)
  }

  // Base
  if (filtersState.stationId) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.reduce<ControlUnit.ControlUnit[]>((previousControlUnits, controlUnit) => {
        const matches = controlUnit.controlUnitResources.filter(
          ({ isArchived, stationId }) => !isArchived && stationId === filtersState.stationId
        )

        return matches.length > 0 ? [...previousControlUnits, controlUnit] : previousControlUnits
      }, [])

    filters.push(filter)
  }

  // Control Unit Resource Type
  if (filtersState.type) {
    const filter: Filter<ControlUnit.ControlUnit> = controlUnits =>
      controlUnits.reduce<ControlUnit.ControlUnit[]>((previousControlUnits, controlUnit) => {
        const matches = controlUnit.controlUnitResources.filter(
          ({ isArchived, type }) => !isArchived && type === filtersState.type
        )

        return matches.length > 0 ? [...previousControlUnits, controlUnit] : previousControlUnits
      }, [])

    filters.push(filter)
  }

  return filters
}
