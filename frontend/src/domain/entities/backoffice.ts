import { RegulatorySearchProperty } from './regulation'

export const BACKOFFICE_SEARCH_PROPERTIES = [
  RegulatorySearchProperty.TOPIC,
  RegulatorySearchProperty.ZONE,
  RegulatorySearchProperty.REGION,
  RegulatorySearchProperty.REGULATORY_REFERENCES
]

export enum GEAR_MESH_SIZE {
  greaterThan = 'greaterThan',
  greaterThanOrEqualTo = 'greaterThanOrEqualTo',
  lowerThan = 'lowerThan',
  lowerThanOrEqualTo = 'lowerThanOrEqualTo',
  equal = 'equal',
  between = 'between'
}

export enum REGULATED_GEARS_KEYS {
  AUTHORIZED = 'authorized',
  ALL_GEARS = 'allGears',
  ALL_TOWED_GEARS = 'allTowedGears',
  ALL_PASSIVE_GEARS = 'allPassiveGears',
  REGULATED_GEARS = 'regulatedGears',
  REGULATED_GEAR_CATEGORIES = 'regulatedGearCategories',
  SELECTED_GEARS_AND_CATEGORIES = 'selectedCategoriesAndGears',
  DEROGATION = 'derogation'
}

export enum GEAR_REGULATION_KEYS {
  AUTHORIZED = 'authorized',
  UNAUTHORIZED = 'unauthorized',
  OTHER_INFO = 'otherInfo'
}

export enum SPECIES_REGULATION_KEYS {
  AUTHORIZED = 'authorized',
  UNAUTHORIZED = 'unauthorized',
  OTHER_INFO = 'otherInfo'
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

/**
 *
 * @param {Object.<string, Gear[]>} categoriesToGears
 * @returns
 */
export const prepareCategoriesAndGearsToDisplay = categoriesToGears => {
  return SORTED_CATEGORY_LIST.map(category => {
    if (!CATEGORIES_TO_HIDE.includes(category) && categoriesToGears[category]) {
      const categoryGearList = [...categoriesToGears[category]]
      const gears = categoryGearList
        .sort((gearA, gearB) => {
          if (gearA.code < gearB.code) {
            return -1
          }
          if (gearA.code > gearB.code) {
            return 1
          }
          return 0
        })
        .map(gear => {
          return {
            label: `${gear.code} - ${gear.name}`,
            value: gear.code
          }
        })

      return {
        label: category,
        value: category,
        children: gears
      }
    }
    return null
  }).filter(gears => gears)
}

export const getGroupCategories = (option, groupsToCategories) => {
  switch (option) {
    case REGULATED_GEARS_KEYS.ALL_TOWED_GEARS: {
      return groupsToCategories[REGULATED_GEARS_KEYS.ALL_TOWED_GEARS]
    }
    case REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS: {
      return groupsToCategories[REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS]
    }
    case REGULATED_GEARS_KEYS.ALL_GEARS: {
      return SORTED_CATEGORY_LIST
    }
  }
}
