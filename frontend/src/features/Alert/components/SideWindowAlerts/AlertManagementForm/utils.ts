import { Criteria, EU_COUNTRY_CODES } from '@features/Alert/components/SideWindowAlerts/AlertManagementForm/constants'
import { AdministrativeAreaType, AdministrativeAreaTypeLabel } from '@features/Alert/constants'
import Countries, { getAlpha3Code, getNames } from 'i18n-iso-countries'
import COUNTRIES_FR from 'i18n-iso-countries/langs/fr.json'
import { flatMap, groupBy, sortBy } from 'lodash-es'

import type { AlertSpecification, RegulatoryAreaSpecification } from '@features/Alert/types'
import type { RegulatoryLawTypes } from '@features/Regulation/types'
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

export const convertRegulatoryAreasArrayToTreeOptions = (
  regulatoryAreas: RegulatoryAreaSpecification[] | undefined
): TreeOption[] | undefined => {
  if (!regulatoryAreas) {
    return undefined
  }

  const grouped = groupBy(regulatoryAreas, 'lawType')

  return Object.entries(grouped).map(([lawType, lawTypeAreas]): TreeBranchOption => {
    const topicGroups = groupBy(lawTypeAreas, 'topic')

    return {
      children: Object.entries(topicGroups).map(
        ([topic, topicAreas]): TreeBranchOption =>
          ({
            children: topicAreas.map(
              (area): TreeLeafOption => ({
                label: area.zone!,
                value: area.zone!
              })
            ),
            label: topic,
            value: topic
          }) as TreeBranchOption
      ),
      label: lawType,
      value: lawType
    } as TreeBranchOption
  })
}

export const convertTreeOptionsToRegulatoryAreasArray = (
  nextRegulationValues: TreeOption[]
): RegulatoryAreaSpecification[] =>
  Object.entries(nextRegulationValues)
    .map(([_lawTypeKey, lawType]) =>
      Object.entries(lawType.children as TreeBranchOption[]).map(([_topicKey, topic]) =>
        Object.entries(topic.children).map(([_zoneKey, zone]) => ({
          lawType: lawType.value,
          topic: topic.value,
          zone: zone.value
        }))
      )
    )
    .flat()
    .flat()

export const convertRegulatoryLayerLawTypesToTreeOptions = (
  regulatoryLayerLawTypes: RegulatoryLawTypes | undefined
): TreeOption[] => {
  if (!regulatoryLayerLawTypes) {
    return []
  }

  return Object.entries(regulatoryLayerLawTypes).map(
    ([lawType, topics]): TreeBranchOption =>
      ({
        children: Object.entries(topics).map(
          ([topic, zones]): TreeBranchOption =>
            ({
              children: zones.map(
                (zone): TreeLeafOption => ({
                  label: zone.zone,
                  value: zone.zone
                })
              ),
              label: topic,
              value: topic
            }) as TreeBranchOption
        ),
        label: lawType,
        value: lawType
      }) as TreeBranchOption
  )
}

export function hasCriterias(values: AlertSpecification, selectedCriterias: Criteria[] = []) {
  const hasZoneCriteria =
    !!values.regulatoryAreas.length || !!values.administrativeAreas.length || selectedCriterias.includes(Criteria.ZONE)
  const hasNationalityCriteria = !!values.flagStatesIso2.length || selectedCriterias.includes(Criteria.NATIONALITY)
  const hasVesselCriteria = !!values.vesselIds.length || selectedCriterias.includes(Criteria.VESSEL)
  const hasProducerOrganizationCriteria =
    !!values.producerOrganizations.length || selectedCriterias.includes(Criteria.PRODUCER_ORGANIZATION)
  const hasDistrictCriteria = !!values.districtCodes.length || selectedCriterias.includes(Criteria.DISTRICT)
  const hasGearOnBoardCriteria = !!values.gears.length || selectedCriterias.includes(Criteria.GEAR_ON_BOARD)
  const hasSpeciesOnBoardCriteria =
    !!values.species.length ||
    !!values.speciesCatchAreas.length ||
    selectedCriterias.includes(Criteria.SPECIES_ON_BOARD)
  const hasNoCriteria =
    !hasGearOnBoardCriteria &&
    !hasSpeciesOnBoardCriteria &&
    !hasVesselCriteria &&
    !hasZoneCriteria &&
    !hasNationalityCriteria &&
    !hasProducerOrganizationCriteria &&
    !hasDistrictCriteria

  return {
    hasDistrictCriteria,
    hasGearOnBoardCriteria,
    hasNationalityCriteria,
    hasNoCriteria,
    hasProducerOrganizationCriteria,
    hasSpeciesOnBoardCriteria,
    hasVesselCriteria,
    hasZoneCriteria
  }
}
