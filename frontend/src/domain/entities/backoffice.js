import { REGULATORY_SEARCH_PROPERTIES } from './regulatory'

export const BACKOFFICE_SEARCH_PROPERTIES = [
  REGULATORY_SEARCH_PROPERTIES.TOPIC,
  REGULATORY_SEARCH_PROPERTIES.ZONE,
  REGULATORY_SEARCH_PROPERTIES.REGION,
  REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES,
]

export const GEAR_MESH_SIZE = {
  between: 'between',
  equal: 'equal',
  greaterThan: 'greaterThan',
  greaterThanOrEqualTo: 'greaterThanOrEqualTo',
  lowerThan: 'lowerThan',
  lowerThanOrEqualTo: 'lowerThanOrEqualTo',
}

export const REGULATED_GEARS_KEYS = {
  ALL_GEARS: 'allGears',
  ALL_PASSIVE_GEARS: 'allPassiveGears',
  ALL_TOWED_GEARS: 'allTowedGears',
  AUTHORIZED: 'authorized',
  DEROGATION: 'derogation',
  REGULATED_GEAR_CATEGORIES: 'regulatedGearCategories',
  REGULATED_GEARS: 'regulatedGears',
  SELECTED_GEARS_AND_CATEGORIES: 'selectedCategoriesAndGears',
}

export const GEAR_REGULATION_KEYS = {
  AUTHORIZED: 'authorized',
  OTHER_INFO: 'otherInfo',
  UNAUTHORIZED: 'unauthorized',
}

export const SPECIES_REGULATION_KEYS = {
  AUTHORIZED: 'authorized',
  OTHER_INFO: 'otherInfo',
  UNAUTHORIZED: 'unauthorized',
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
  'Engins divers',
]

const CATEGORIES_TO_HIDE = ['engins inconnus', "pas d'engin", 'engins de pêche récréative']

/**
 *
 * @param {Object.<string, Gear[]>} categoriesToGears
 * @returns
 */
export const prepareCategoriesAndGearsToDisplay = categoriesToGears =>
  SORTED_CATEGORY_LIST.map(category => {
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
        .map(gear => ({
          label: `${gear.code} - ${gear.name}`,
          value: gear.code,
        }))

      return {
        children: gears,
        label: category,
        value: category,
      }
    }

    return null
  }).filter(gears => gears)

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
