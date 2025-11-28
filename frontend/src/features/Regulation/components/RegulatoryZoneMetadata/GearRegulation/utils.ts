import { getGroupCategories, REGULATED_GEARS_KEYS } from '../../../../../domain/entities/backoffice'

import type { Gear as GearReferentialType } from '../../../../../domain/types/Gear'
import type { GearCategory } from '../../../types'

export function buildCategoryTooltip(
  categoriesToGears: Record<string, GearReferentialType[]> | undefined,
  category: string
): string | undefined {
  if (!categoriesToGears) {
    return undefined
  }

  const gears = categoriesToGears[category] ?? []

  return gears.map(gear => `${gear.code} - ${gear.name}`).join('\n')
}

export function filterRegulatedGearCategories(
  regulatedGearCategories: Record<string, GearCategory>,
  allTowedGears: boolean,
  allPassiveGears: boolean,
  groupsToCategories: Record<string, string[]> | undefined
): Record<string, GearCategory> {
  const filtered = { ...regulatedGearCategories }

  if (allTowedGears) {
    const towedGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_TOWED_GEARS, groupsToCategories)
    towedGearsCategories.forEach(category => {
      delete filtered[category]
    })
  }

  if (allPassiveGears) {
    const passiveGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS, groupsToCategories)
    passiveGearsCategories.forEach(category => {
      delete filtered[category]
    })
  }

  return filtered
}
