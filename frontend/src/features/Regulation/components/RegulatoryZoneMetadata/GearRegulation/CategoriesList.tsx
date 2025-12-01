import { CategoryRow } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/CategoryRow'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useMemo } from 'react'

import { filterRegulatedGearCategories } from './utils'

import type { Gear, GearCategory } from '../../../types'

export type CategoriesListProps = {
  allPassiveGears: boolean
  allTowedGears: boolean
  regulatedGearCategories: Record<string, GearCategory>
  regulatedGears: Record<string, Gear>
}
export function CategoriesList({
  allPassiveGears,
  allTowedGears,
  regulatedGearCategories,
  regulatedGears
}: CategoriesListProps) {
  const categoriesToGears = useMainAppSelector(state => state.gear.categoriesToGears)
  const groupsToCategories = useMainAppSelector(state => state.gear.groupsToCategories)

  const categories = categoriesToGears ? Object.keys(categoriesToGears) : []
  const regulatedGearsList = useMemo(() => Object.values(regulatedGears), [regulatedGears])

  const filteredRegulatedGearCategories = useMemo(
    () => filterRegulatedGearCategories(regulatedGearCategories, allTowedGears, allPassiveGears, groupsToCategories),
    [allPassiveGears, allTowedGears, groupsToCategories, regulatedGearCategories]
  )

  return (
    <>
      {categories.map(category => (
        <CategoryRow
          key={category}
          category={category}
          foundCategory={filteredRegulatedGearCategories[category]}
          regulatedGearsList={regulatedGearsList}
        />
      ))}
    </>
  )
}
