import { Ellipsised } from '@components/Ellipsised'
import { type ReactNode } from 'react'

import {
  Kg,
  QuantityWrapper,
  SelectValue,
  SpeciesName,
  SpeciesRow,
  StyledCheckPicker,
  StyledPickerTd,
  StyledSpeciesSelect,
  TdWithoutPaddingWhenActive,
  Weight
} from './speciesTable.styles'
import { StyledWeightInput } from './WeightInput'

import type { RowActivation } from './useRowActivation'
import type { CustomSearch, Option } from '@mtes-mct/monitor-ui'
import type { Specy } from 'domain/types/specy'

type SpeciesTableRowProps = Readonly<{
  activation: RowActivation
  children: ReactNode
  dataCy: string
  index: number
  isHovered: boolean
}>
export function SpeciesTableRow({ activation, children, dataCy, index, isHovered }: SpeciesTableRowProps) {
  return (
    <SpeciesRow
      $isHovered={isHovered}
      data-cy={dataCy}
      onBlurCapture={event => activation.handleRowBlur(index, event)}
      onFocusCapture={event => activation.handleRowFocus(index, event)}
      onMouseDown={() => activation.activateRowNow(index)}
      onMouseEnter={event => activation.handleRowMouseEnter(index, event)}
      onMouseLeave={() => activation.handleRowMouseLeave(index)}
    >
      {children}
    </SpeciesRow>
  )
}

type SpeciesSelectCellProps = Readonly<{
  customSearch: CustomSearch<Option<Specy>>
  isActive: boolean
  isDisabled: boolean
  isHovered: boolean
  isNotLanded?: boolean
  name: string
  onChange: (newSpecy: Specy | undefined) => void
  onPickerClose: () => void
  onPickerOpen: () => void
  options: Array<Option<Specy>>
  popupWidth: number | undefined
  speciesCode: string | undefined
  speciesLabel: string
}>
export function SpeciesSelectCell({
  customSearch,
  isActive,
  isDisabled,
  isHovered,
  isNotLanded,
  name,
  onChange,
  onPickerClose,
  onPickerOpen,
  options,
  popupWidth,
  speciesCode,
  speciesLabel
}: SpeciesSelectCellProps) {
  return (
    <StyledPickerTd $isActive={isActive}>
      {speciesCode && !isActive ? (
        <SpeciesName $isNotLanded={!!isNotLanded}>{speciesLabel}</SpeciesName>
      ) : (
        <StyledSpeciesSelect
          $isHovered={isHovered}
          className="Field-SpeciesSelect"
          cleanable={false}
          customSearch={customSearch}
          disabled={isDisabled}
          isLabelHidden
          isLight
          label="Espèce"
          name={name}
          onChange={onChange}
          onClose={onPickerClose}
          onOpen={onPickerOpen}
          options={options}
          optionValueKey="code"
          popupWidth={popupWidth}
          searchable
          value={options.find(option => option.value.code === speciesCode)?.value}
          virtualized
        />
      )}
    </StyledPickerTd>
  )
}

type WeightCellProps = Readonly<{
  clearFocusRequest?: (() => void) | undefined
  focusRequestId?: string | undefined
  isActive: boolean
  isDisabled: boolean
  isHovered: boolean
  label: string
  name: string
  onNavigateRow?: ((direction: 'up' | 'down') => void) | undefined
  value: number | undefined
}>
export function WeightCell({
  clearFocusRequest,
  focusRequestId,
  isActive,
  isDisabled,
  isHovered,
  label,
  name,
  onNavigateRow,
  value
}: WeightCellProps) {
  return (
    <TdWithoutPaddingWhenActive $isActive={isActive}>
      <QuantityWrapper>
        {isActive ? (
          <StyledWeightInput
            $isHovered={isHovered}
            clearFocusRequest={clearFocusRequest}
            disabled={isDisabled}
            focusRequestId={focusRequestId}
            isLabelHidden
            isLight
            label={label}
            name={name}
            onNavigateRow={onNavigateRow}
          />
        ) : (
          <Weight>{value ?? '-'}</Weight>
        )}
        <Kg>kg</Kg>
      </QuantityWrapper>
    </TdWithoutPaddingWhenActive>
  )
}

type FaoZonesCellProps = Readonly<{
  isActive: boolean
  isDisabled: boolean
  isHovered: boolean
  name: string
  onPickerClose: () => void
  onPickerOpen: () => void
  options: Array<Option<string>>
  value: string[] | undefined
}>
export function FaoZonesCell({
  isActive,
  isDisabled,
  isHovered,
  name,
  onPickerClose,
  onPickerOpen,
  options,
  value
}: FaoZonesCellProps) {
  return (
    <StyledPickerTd $isActive={isActive}>
      {isActive ? (
        <StyledCheckPicker
          $isHovered={isHovered}
          cleanable={false}
          disabled={isDisabled}
          isLabelHidden
          isRequired
          label="Zone de pêche"
          name={name}
          onClose={onPickerClose}
          onOpen={onPickerOpen}
          options={options}
          popupWidth={150}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>{items.map(item => item.label).join(', ')}</SelectValue> : <></>
          }
          searchable
        />
      ) : (
        <Ellipsised>{value?.length ? value.join(', ') : '-'}</Ellipsised>
      )}
    </StyledPickerTd>
  )
}
