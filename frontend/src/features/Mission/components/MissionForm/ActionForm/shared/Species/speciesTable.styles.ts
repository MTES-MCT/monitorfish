import { Select, SimpleTable } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

import type { Specy } from 'domain/types/specy'

export const SpeciesTableWrapper = styled.div`
  table {
    width: 100%;
    table-layout: fixed;
  }

  th {
    padding-left: 5px;
    padding-right: 5px;
    text-align: left;
  }

  /* Keep a stable row height whether a cell shows plain text or its editor, to avoid jitter. */
  td {
    height: 41px;
    overflow: visible;
    vertical-align: middle;
    padding: 0 8px;
  }

  /* Zero flex-basis so the input's large intrinsic width doesn't expand its fixed-width column. */
  .Field-TextInput {
    flex: 1;
    min-width: 0;
    height: 40px;
    width: 100%;
  }

  .Field-TextInput > div > input {
    padding-left: 7px;
    padding-top: 7px;
    height: 40px;
    padding-right: 0;
  }

  .Field-Select {
    width: 100%;
  }
`

export const SpeciesRow = styled(SimpleTable.BodyTr)<{
  $isHovered: boolean
}>`
  /* Drive the row background from React state so it lands in the same commit as the editors. monitor-ui's
     built-in \`tr:hover > td\` paints instantly (before the editors mount) → the flicker we are fixing.
     Overriding both selectors with the same React-driven value removes the instant CSS-hover path. */
  > td,
  &:hover > td {
    background-color: ${p => (p.$isHovered ? p.theme.color.blueYonder25 : 'transparent')};
  }
`

export const DeleteCell = styled(SimpleTable.Td)`
  padding-left: 0;
  display: flex;
  align-items: center;
  gap: 6px;

  .Element-IconButton {
    padding-left: 0;
  }
`

export const AddSpeciesButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  font-weight: 500;

  &:disabled {
    color: ${p => p.theme.color.lightGray};
    cursor: not-allowed;
  }
`

export const RequiredAsterisk = styled.span`
  color: ${p => p.theme.color.maximumRed};
`

export const QuantityWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  color: ${p => p.theme.color.slateGray};
`

export const Weight = styled.div`
  flex: 1;
  min-width: 0;
  color: ${p => p.theme.color.charcoal};
`

export const Kg = styled.span`
  flex: 0 0 auto;
  margin-left: auto;
  padding-left: 4px;
`

export const SpeciesName = styled.span<{
  $isNotLanded?: boolean
}>`
  font-weight: 700;
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  ${p =>
    p.$isNotLanded &&
    css`
      color: ${p.theme.color.slateGray};
      font-style: italic;
    `}
`

export const TdWithoutPaddingWhenActive = styled(SimpleTable.Td)<{
  $isActive: boolean
}>`
  padding: 0 8px 0 ${p => (!p.$isActive ? 8 : 0)}px !important;

  .Field-Checkbox {
    margin-left: 37%;
    margin-bottom: 25%;
  }
`

export const StyledPickerTd = styled(SimpleTable.Td)<{
  $isActive: boolean
}>`
  padding: 0 ${p => (!p.$isActive ? 8 : 0)}px 0 ${p => (!p.$isActive ? 8 : 0)}px !important;
`

/** Shared look for the single-value Selects (species, discard reason): transparent toggle, blue on hover. */
export const selectFieldCss = css<{ $isHovered: boolean }>`
  .rs-picker-toggle-wrapper > [role='combobox'] {
    background-color: ${p => (p.$isHovered ? p.theme.color.blueYonder25 : p.theme.color.white)} !important;
    border: none !important;
  }

  .rs-picker-toggle > [role='combobox'] {
    border: none !important;
  }

  .rs-picker-toggle-value {
    padding-top: 3px;
  }
`

export const StyledSpeciesSelect = styled(Select<Specy>)<{
  $isHovered: boolean
}>`
  ${selectFieldCss}

  .rs-picker-toggle-value {
    font-weight: 700 !important;
  }
`

export const StyledCellSelect = styled(Select<string>)<{
  $isHovered: boolean
}>`
  ${selectFieldCss}
`
