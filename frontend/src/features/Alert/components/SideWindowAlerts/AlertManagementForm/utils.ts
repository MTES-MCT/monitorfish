import { EU_COUNTRY_CODES } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/constants'
import { AdministrativeAreaType, AdministrativeAreaTypeLabel } from '@features/Alert/constants'
import Countries, { getAlpha3Code, getNames } from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { flatMap, sortBy } from 'lodash-es'

import type { TreeOption } from '@mtes-mct/monitor-ui'
import type { TreeBranchOption, TreeLeafOption } from '@mtes-mct/monitor-ui/types/definitions'

Countries.registerLocale(COUNTRIES_FR)

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

/**
 * Builds TreeOption[] with EU and Non-EU countries using i18n-iso-countries
 * @param locale - Language locale for country names (default: 'fr')
 * @returns TreeOption array with EU and Non-EU country groups
 */
export const buildCountriesAsTreeOptions = (locale: string = 'fr'): TreeOption[] => {
  const allCountries = getNames(locale)
  const euCountries: TreeOption[] = []
  const nonEuCountries: TreeOption[] = []

  Object.entries(allCountries).forEach(([alpha2Code, countryName]) => {
    const countryOption: TreeLeafOption = {
      label: countryName,
      value: alpha2Code
    }

    if (EU_COUNTRY_CODES.includes(alpha2Code)) {
      euCountries.push(countryOption)
    } else {
      nonEuCountries.push(countryOption)
    }
  })

  const sortedEuCountries = sortBy(euCountries, 'label')
  const sortedNonEuCountries = sortBy(nonEuCountries, 'label')

  return [
    {
      children: sortedEuCountries,
      label: 'Navires UE',
      value: 'eu'
    } as TreeBranchOption,
    {
      children: sortedNonEuCountries,
      label: 'Navires tiers',
      value: 'non-eu'
    } as TreeBranchOption
  ]
}
