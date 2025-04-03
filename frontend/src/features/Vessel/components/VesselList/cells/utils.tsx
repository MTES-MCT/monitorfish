import {
  BLUEFIN_TUNA_EXTENDED_SPECY_CODES,
  BLUEFIN_TUNA_NAME_FR,
  BLUEFIN_TUNA_SPECY_CODE
} from '@features/PriorNotification/constants'
import { Vessel } from '@features/Vessel/Vessel.types'
import { update } from 'lodash-es'
import styled from 'styled-components'

import type { Column } from '@tanstack/react-table'
import type { CSSProperties } from 'react'

export function getExpandableRowCellCustomStyle(column: Column<Vessel.VesselLastPosition, any>): CSSProperties {
  const defaultStyle = {
    maxWidth: column.getSize()
  }

  switch (column.id) {
    case 'riskFactor':
    case 'actions':
      return { ...defaultStyle, verticalAlign: 'bottom' }

    case 'state':
      return { ...defaultStyle, padding: '7px 14px', verticalAlign: 'bottom' }

    default:
      return defaultStyle
  }
}

export function displayOnboardFishingSpecies(
  onBoardCatches: (Vessel.DeclaredLogbookSpecies & { name: string | undefined })[]
) {
  const heaviestOnBoardCatches = onBoardCatches
    .reduce<
      Array<{
        specyCode: string
        specyName: string
        weight: number
      }>
    >((aggregatedCatches, currentCatch) => {
      const [normalizedSpecyCode, normalizedSpecyName] = BLUEFIN_TUNA_EXTENDED_SPECY_CODES.includes(
        currentCatch.species
      )
        ? [BLUEFIN_TUNA_SPECY_CODE, BLUEFIN_TUNA_NAME_FR]
        : [currentCatch.species, currentCatch.name]
      const existingCatchSpecyIndex = aggregatedCatches.findIndex(
        aggregatedCatch => aggregatedCatch.specyCode === normalizedSpecyCode
      )
      if (
        existingCatchSpecyIndex > -1 &&
        currentCatch.weight !== undefined &&
        aggregatedCatches[existingCatchSpecyIndex]?.weight !== undefined
      ) {
        return update(aggregatedCatches, `[${existingCatchSpecyIndex}].weight`, weight => weight + currentCatch.weight)
      }

      return [
        ...aggregatedCatches,
        {
          specyCode: normalizedSpecyCode,
          specyName: normalizedSpecyName,
          weight: currentCatch.weight
        }
      ]
    }, [])
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return heaviestOnBoardCatches.map(({ specyCode, specyName, weight }) => (
    <StyledLi key={specyCode} title={`${specyName} (${specyCode}) – ${weight} kg`}>
      {specyName ? `${specyName} (${specyCode}) – ${weight} kg` : `${specyCode} – ${weight} kg`}
    </StyledLi>
  ))
}

const StyledLi = styled.li`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 235px;
`
