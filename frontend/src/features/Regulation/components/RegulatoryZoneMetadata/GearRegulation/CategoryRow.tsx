import { CategoryLabel } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/constants'
import { GearOrGearCategoryFields } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/GearOrGearCategoryFields'
import { GearRow } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/GearRow'
import { buildCategoryTooltip } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Gear, GearCategory } from '@features/Regulation/types'

type CategoryRowProps = {
  category: string
  foundCategory: GearCategory | undefined
  regulatedGearsList: Gear[]
}
export function CategoryRow({ category, foundCategory, regulatedGearsList }: CategoryRowProps) {
  const categoriesToGears = useMainAppSelector(state => state.gear.categoriesToGears)

  if (foundCategory) {
    const title = buildCategoryTooltip(categoriesToGears, category)

    return (
      <CategoryWrapper key={category}>
        <GearTitle>{category}</GearTitle>
        <Category>
          {CategoryLabel[category]}
          <StyledInfoPoint size={16} title={title} />
        </Category>
        <GearOrGearCategoryFields gearOrCategory={foundCategory} />
      </CategoryWrapper>
    )
  }

  const gearsOfCategory = regulatedGearsList.filter(gear => gear.category === category)
  if (gearsOfCategory.length > 0) {
    return (
      <CategoryWrapper key={category}>
        <GearTitle>{category}</GearTitle>
        {gearsOfCategory.map(gear => (
          <GearRow key={gear.code} gear={gear} />
        ))}
      </CategoryWrapper>
    )
  }

  return null
}

const CategoryWrapper = styled.div``

const StyledInfoPoint = styled(Icon.Info)`
  margin-left: 3px;
  cursor: help;
`

const GearTitle = styled.span`
  font-weight: bold;
  color: ${p => p.theme.color.gunMetal};
`

const Category = styled.div`
  align-items: center;
  display: flex;
`
