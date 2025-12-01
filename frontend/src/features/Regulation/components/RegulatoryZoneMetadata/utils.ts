import type { RegulatedGears, RegulatedSpecies } from '../../types'

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

/**
 * Checks if a RegulatedGears object has any content
 * Returns true if the object contains any authorized/unauthorized gears or categories
 */
export const regulatedGearsIsNotEmpty = (regulatedGearsObject: RegulatedGears | null | undefined): boolean =>
  !!(
    regulatedGearsObject?.allGears ||
    regulatedGearsObject?.allTowedGears ||
    regulatedGearsObject?.allPassiveGears ||
    Object.keys(regulatedGearsObject?.regulatedGears || {})?.length ||
    Object.keys(regulatedGearsObject?.regulatedGearCategories || {})?.length ||
    regulatedGearsObject?.selectedCategoriesAndGears?.length ||
    regulatedGearsObject?.derogation
  )

/**
 * Checks if a RegulatedSpecies object has any content
 * Returns true if the object contains any species or species groups
 */
export const regulatedSpeciesIsNotEmpty = (regulatedSpecies: RegulatedSpecies | null | undefined): boolean =>
  !!(regulatedSpecies?.allSpecies || regulatedSpecies?.speciesGroups?.length || regulatedSpecies?.species?.length)

/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

