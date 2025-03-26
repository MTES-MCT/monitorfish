import { getAdministrativeZoneFromAPI } from '@api/geoserver'
import { setInteractionTypeAndListener } from '@features/Draw/slice'
import { InteractionListener, InteractionType } from '@features/Map/constants'
import { openDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'
import { getSelectedOptionFromOptionValueInTree } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { difference } from 'lodash-es'

import type { ZoneFilter } from '@features/Vessel/components/VesselList/types'
import type { TreeOption } from '@mtes-mct/monitor-ui'
import type { MainAppThunk } from '@store'

export const filterVesselsWithZone =
  (
    filterableZoneAsTreeOptions: TreeOption[],
    listener: InteractionListener,
    nextZoneValues: string[] | undefined,
    previousZones?: ZoneFilter[] | undefined
  ): MainAppThunk<Promise<ZoneFilter[] | undefined>> =>
  async (dispatch, getState): Promise<ZoneFilter[] | undefined> => {
    if (!nextZoneValues?.length) {
      return []
    }

    const { isBackoffice } = getState().global
    const previousZonesFilter: ZoneFilter[] = previousZones ?? getState().vessel.listFilterValues.zones ?? []
    const previousZoneCodes = previousZonesFilter.map(zone => zone.value)

    const zonesDeleted = difference(previousZoneCodes, nextZoneValues)
    if (zonesDeleted.length === 1) {
      const zoneDeleted = zonesDeleted[0]

      return previousZonesFilter.filter(zone => zone.value !== zoneDeleted)
    }

    const zonesAdded = difference(nextZoneValues, previousZoneCodes)
    if (zonesAdded.length === 1) {
      const zoneAdded = zonesAdded[0]
      assertNotNullish(zoneAdded)

      if (zoneAdded === 'custom') {
        dispatch(openDrawLayerModal)
        dispatch(
          setInteractionTypeAndListener({
            listener,
            type: InteractionType.POLYGON
          })
        )

        return undefined
      }

      const administrativeZoneCode = zoneAdded.split('.')?.[0] ?? ''
      const result = await getAdministrativeZoneFromAPI(administrativeZoneCode, undefined, zoneAdded, isBackoffice)
      if (result.numberReturned !== 1) {
        // eslint-disable-next-line no-console
        console.error(
          `Zone returned ${zoneAdded} has ${result.numberReturned} features. It should have only 1 feature.`
        )

        return undefined
      }

      const name = getSelectedOptionFromOptionValueInTree(filterableZoneAsTreeOptions, zoneAdded)?.label
      const feature = result.features[0]
      assertNotNullish(feature)

      return previousZonesFilter.concat([
        {
          feature: feature.geometry,
          label: `Zone - ${name}`,
          value: zoneAdded
        }
      ])
    }

    return undefined
  }
