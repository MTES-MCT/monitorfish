import { useGetFaoAreasQuery } from '@api/faoAreas'
import { useGetSpeciesQuery } from '@api/specy'
import { CustomSearch, FormikCheckPicker, Select, SimpleTable, TextInput } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { type FocusEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

/**
 * A Formik-bound `TextInput` that stores its value as a `number` (the weight fields are typed as numbers in
 * their Zod schemas). `FormikTextInput` always writes a string and cannot be intercepted, so we wire
 * `TextInput` to Formik ourselves and coerce on change. A local `draft` keeps the raw text so decimals
 * (e.g. `471.2`) stay typeable while the committed Formik value remains numeric.
 *
 * We use this TextInput to avoid the arrows display in NumberInput
 */
type WeightInputProps = Readonly<{
  className?: string
  disabled?: boolean
  isLabelHidden?: boolean
  isLight?: boolean
  label: string
  name: string
}>
export function WeightInput({ className, disabled, isLabelHidden, isLight, label, name }: WeightInputProps) {
  const [field, , helper] = useField<number | undefined>(name)
  const [draft, setDraft] = useState<string>(field.value == null ? '' : String(field.value))

  // Resync the draft when the committed value changes from the outside (reset, prefill, recompute),
  // but preserve in-progress typing when it already represents the same number (e.g. "471." → 471).
  useEffect(() => {
    const committed = field.value == null ? '' : String(field.value)
    setDraft(prev => (prev.trim() !== '' && Number(prev) === field.value ? prev : committed))
  }, [field.value])

  return (
    <TextInput
      className={className ?? ''}
      disabled={disabled}
      isLabelHidden={isLabelHidden}
      isLight={isLight}
      label={label}
      name={name}
      onChange={nextValue => {
        setDraft(nextValue ?? '')
        const normalized = nextValue?.replace(',', '.').trim()
        const parsed = normalized ? Number(normalized) : undefined
        helper.setValue(parsed === undefined || Number.isNaN(parsed) ? undefined : parsed)
      }}
      value={draft}
    />
  )
}

/**
 * Tracks which row of a species table is "active" — i.e. shows its editors instead of read-only text.
 *
 * A row is active while it is hovered, OR while it holds the keyboard focus, OR while one of its pickers is
 * open. Tracking focus and picker-open separately from hover keeps the row in edit mode once the cursor
 * leaves it — while a TextInput is still focused, or while a CheckPicker's portal-rendered menu is in use.
 *
 * Handlers are wired individually on elements (no JSX spread, which the repo bans).
 */
const HOVER_INTENT_DELAY_MS = 40

export function useRowActivation() {
  const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined)
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(undefined)
  const [openPickerIndex, setOpenPickerIndex] = useState<number | undefined>(undefined)

  // Debounce hover so a cursor merely sweeping across rows doesn't mount each row's (heavy) editors.
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(hoverTimerRef.current), [])

  const isRowActive = (index: number) => index === hoveredIndex || index === focusedIndex || index === openPickerIndex

  // Only hold the row open for its text inputs (CheckPickers are covered by `openPickerIndex` while their
  // dropdown is open). This keeps a focused text input visible even after the cursor has left the row.
  const handleRowFocus = (index: number, event: FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' && !target.closest('.rs-picker')) {
      setFocusedIndex(index)
    }
  }

  // Release the row once focus leaves it entirely (moving between its own inputs keeps it active).
  const handleRowBlur = (index: number, event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusedIndex(prev => (prev === index ? undefined : prev))
    }
  }

  const handleRowMouseEnter = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setHoveredIndex(index), HOVER_INTENT_DELAY_MS)
  }
  const handleRowMouseLeave = (index: number) => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(prev => (prev === index ? undefined : prev))
  }

  const handlePickerOpen = (index: number) => setOpenPickerIndex(index)
  const handlePickerClose = (index: number) => setOpenPickerIndex(prev => (prev === index ? undefined : prev))

  const deactivate = () => {
    clearTimeout(hoverTimerRef.current)
    setHoveredIndex(undefined)
    setFocusedIndex(undefined)
    setOpenPickerIndex(undefined)
  }

  return {
    deactivate,
    handlePickerClose,
    handlePickerOpen,
    handleRowBlur,
    handleRowFocus,
    handleRowMouseEnter,
    handleRowMouseLeave,
    hoveredIndex,
    isRowActive
  }
}

export function useSpeciesAndFaoOptions() {
  const getSpeciesApiQuery = useGetSpeciesQuery()
  const getFaoAreasQuery = useGetFaoAreasQuery()

  const speciesAsOptions: Array<Option<Specy>> = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? getSpeciesApiQuery.data.species.map(specy => ({
            label: `${specy.code} - ${specy.name}`,
            value: specy
          }))
        : [],
    [getSpeciesApiQuery.data]
  )

  const faoAreasAsOptions: Array<Option<string>> = useMemo(
    () => (getFaoAreasQuery.data ? getFaoAreasQuery.data.map(zone => ({ label: zone, value: zone })) : []),
    [getFaoAreasQuery.data]
  )

  const customSearch = useMemo(
    () =>
      getSpeciesApiQuery.data
        ? new CustomSearch(
            structuredClone(speciesAsOptions),
            [
              { name: 'value.code', weight: 0.9 },
              { name: 'value.name', weight: 0.1 }
            ],
            { cacheKey: 'SPECIES_AS_OPTIONS', isStrict: true }
          )
        : undefined,
    [getSpeciesApiQuery.data, speciesAsOptions]
  )

  const getSpecyNameFromSpecyCode = useCallback(
    (specyCode: Specy['code']) => getSpeciesApiQuery.data?.species.find(({ code }) => code === specyCode)?.name ?? '',
    [getSpeciesApiQuery.data]
  )

  return { customSearch, faoAreasAsOptions, getSpecyNameFromSpecyCode, speciesAsOptions }
}

export const SpeciesTableWrapper = styled.div`
  table {
    width: 100%;
    table-layout: fixed;
  }

  th {
    padding-left: 5px;
    padding-right: 5px;
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

  /* The per-row species Select fills its column. */
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

export const SpeciesName = styled.span`
  font-weight: 700;
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const SelectValue = styled.span`
  display: flex;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
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

export const StyledFormikTextInput = styled(WeightInput)<{
  $isHovered: boolean
}>`
  > div > input {
    background-color: ${p => (p.$isHovered ? p.theme.color.blueYonder25 : p.theme.color.white)} !important;
  }
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

export const StyledCheckPicker = styled(FormikCheckPicker)<{
  $isHovered: boolean
}>`
  width: 100%;
  flex: 1;
  min-width: 0;

  .rs-picker-toggle-wrapper > [role='combobox'] {
    background-color: ${p => (p.$isHovered ? p.theme.color.blueYonder25 : p.theme.color.white)} !important;
    border: none !important;
  }

  .rs-picker-toggle-value {
    padding-top: 3px;
  }

  .rs-picker-value-count {
    margin-top: 2px !important;
    min-width: 16px !important;
    min-height: 16px !important;
    height: 16px !important;
    background-color: ${p => p.theme.color.white} !important;
    color: ${p => p.theme.color.gunMetal};
  }
`
