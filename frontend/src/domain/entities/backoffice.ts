import { isNotNullish } from '@utils/isNotNullish'

import { RegulatorySearchProperty } from '../../features/Regulation/utils'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Gear } from 'domain/types/Gear'
import type { TreeBranchOptionWithValue } from 'types'

export const BACKOFFICE_SEARCH_PROPERTIES = [
  RegulatorySearchProperty.TOPIC,
  RegulatorySearchProperty.ZONE,
  RegulatorySearchProperty.REGION,
  RegulatorySearchProperty.REGULATORY_REFERENCES
]

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum GearMeshSizeEqualityComparator {
  between = 'between',
  equal = 'equal',
  greaterThan = 'greaterThan',
  greaterThanOrEqualTo = 'greaterThanOrEqualTo',
  lowerThan = 'lowerThan',
  lowerThanOrEqualTo = 'lowerThanOrEqualTo'
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum REGULATED_GEARS_KEYS {
  ALL_GEARS = 'allGears',
  ALL_PASSIVE_GEARS = 'allPassiveGears',
  ALL_TOWED_GEARS = 'allTowedGears',
  AUTHORIZED = 'authorized',
  DEROGATION = 'derogation',
  REGULATED_GEARS = 'regulatedGears',
  REGULATED_GEAR_CATEGORIES = 'regulatedGearCategories',
  SELECTED_GEARS_AND_CATEGORIES = 'selectedCategoriesAndGears'
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum GEAR_REGULATION_KEYS {
  AUTHORIZED = 'authorized',
  OTHER_INFO = 'otherInfo',
  UNAUTHORIZED = 'unauthorized'
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum SPECIES_REGULATION_KEYS {
  AUTHORIZED = 'authorized',
  OTHER_INFO = 'otherInfo',
  UNAUTHORIZED = 'unauthorized'
}

export const SORTED_CATEGORY_LIST = [
  'Chaluts',
  'Sennes traînantes',
  'Dragues',
  'Sennes tournantes coulissantes',
  'Filets tournants',
  'Filets maillants et filets emmêlants',
  'Filets soulevés',
  'Lignes et hameçons',
  'Pièges et casiers',
  'Palangres',
  'Gangui',
  'Engins de récolte',
  'Engins divers'
]

const CATEGORIES_TO_HIDE = ['engins inconnus', "pas d'engin", 'engins de pêche récréative']

export const prepareCategoriesAndGearsToDisplay = (
  categoriesToGears: Record<string, Gear[]>
): TreeBranchOptionWithValue[] =>
  SORTED_CATEGORY_LIST.map(category => {
    if (!CATEGORIES_TO_HIDE.includes(category) && categoriesToGears[category]) {
      const categoryGearList = [...categoriesToGears[category]]
      const gears: Option[] = categoryGearList
        .sort((gearA, gearB) => {
          if (gearA.code < gearB.code) {
            return -1
          }
          if (gearA.code > gearB.code) {
            return 1
          }

          return 0
        })
        .map(gear => ({
          label: `${gear.code} - ${gear.name}`,
          value: gear.code
        }))

      return {
        children: gears,
        label: category,
        value: category
      }
    }

    return null
  }).filter(isNotNullish)

export const getGroupCategories = (
  option: REGULATED_GEARS_KEYS,
  groupsToCategories: Partial<Record<REGULATED_GEARS_KEYS, string[]>> | undefined
): string[] => {
  if (!groupsToCategories) {
    return []
  }

  switch (option) {
    case REGULATED_GEARS_KEYS.ALL_TOWED_GEARS:
      return groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS] ?? []

    case REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS:
      return groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS] ?? []

    case REGULATED_GEARS_KEYS.ALL_GEARS:
      return SORTED_CATEGORY_LIST

    default:
      return []
  }
}
