import { AdministrativeAreaType, AdministrativeAreaTypeLabel } from '@features/Alert/constants'
import { getAlpha3Code } from 'i18n-iso-countries'
import { flatMap } from 'lodash-es'

import type { TreeOption } from '@mtes-mct/monitor-ui'

const LABEL_TO_AREA_TYPE = {
  [AdministrativeAreaTypeLabel.EEZ_AREA]: AdministrativeAreaType.EEZ_AREA,
  [AdministrativeAreaTypeLabel.FAO_AREA]: AdministrativeAreaType.FAO_AREA
}

/**
 * Extracts the appropriate zone code based on area type
 */
const getZoneCode = (zoneLabel: string, areaType: AdministrativeAreaType): string => {
  if (areaType === AdministrativeAreaType.EEZ_AREA) {
    // For EEZ areas, convert country name to ISO Alpha3 code
    const alpha3Code = getAlpha3Code(zoneLabel, 'en')

    return alpha3Code ?? zoneLabel
  }

  // For FAO areas, use the label as-is (e.g., "27.1.0")
  return zoneLabel
}

/**
 * Maps zone groups to flat array with metadata (ID, area type, and zone code)
 * @param zoneGroups - Tree options containing zone groups and their children
 * @returns Array of zones with their metadata
 */
export const mapZonesWithMetadata = (zoneGroups: TreeOption[] | undefined) =>
  flatMap(zoneGroups, zoneGroup => {
    const areaType = LABEL_TO_AREA_TYPE[zoneGroup.label]

    return areaType && zoneGroup.children
      ? zoneGroup.children.map(zone => {
          const zoneCode = getZoneCode(zone.label, areaType)

          return {
            areaType,
            code: zoneCode,
            id: zone.value
          }
        })
      : []
  })
