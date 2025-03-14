import { getAdministrativeZoneFromAPI } from '@api/geoserver'
import { setInteractionTypeAndListener } from '@features/Draw/slice'
import { InteractionListener, InteractionType } from '@features/Map/constants'
import { openDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'
import { filterVessels } from '@features/Vessel/useCases/VesselListV2/filterVessels'
import { getSelectedOptionFromOptionValueInTree } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { difference } from 'lodash-es'

import type { ZoneFilter } from '@features/Vessel/components/VesselListV2/types'
import type { TreeOption } from '@mtes-mct/monitor-ui'
import type { MainAppThunk } from '@store'

export const filterVesselsWithZone =
  (filterableZoneAsTreeOptions: TreeOption[], nextZoneValues: string[] | undefined): MainAppThunk =>
  async (dispatch, getState) => {
    if (!nextZoneValues?.length) {
      dispatch(filterVessels({ zones: undefined }))

      return
    }

    const { isBackoffice } = getState().global
    const previousZones: ZoneFilter[] = getState().vessel.listFilterValues.zones ?? []
    const previousZoneCodes = previousZones.map(zone => zone.value)

    const zonesDeleted = difference(previousZoneCodes, nextZoneValues)
    if (zonesDeleted.length === 1) {
      const zoneDeleted = zonesDeleted[0]
      const nextZones = previousZones.filter(zone => zone.value !== zoneDeleted)

      dispatch(filterVessels({ zones: nextZones }))

      return
    }

    const zonesAdded = difference(nextZoneValues, previousZoneCodes)
    if (zonesAdded.length === 1) {
      const zoneAdded = zonesAdded[0]
      assertNotNullish(zoneAdded)

      if (zoneAdded === 'custom') {
        dispatch(openDrawLayerModal)
        dispatch(
          setInteractionTypeAndListener({
            listener: InteractionListener.VESSELS_LIST,
            type: InteractionType.POLYGON
          })
        )

        return
      }

      const administrativeZoneCode = zoneAdded.split('.')?.[0] ?? ''
      const result = await getAdministrativeZoneFromAPI(administrativeZoneCode, undefined, zoneAdded, isBackoffice)
      if (result.numberReturned !== 1) {
        // eslint-disable-next-line no-console
        console.error(
          `Zone returned ${zoneAdded} has ${result.numberReturned} features. It should have only 1 feature.`
        )

        return
      }

      const name = getSelectedOptionFromOptionValueInTree(filterableZoneAsTreeOptions, zoneAdded)?.label
      const feature = result.features[0]
      assertNotNullish(feature)

      const nextZones = previousZones.concat([
        {
          feature: feature.geometry,
          label: `Zone - ${name}`,
          value: zoneAdded
        }
      ])

      dispatch(filterVessels({ zones: nextZones }))
    }
  }
