import { CONTROL_CHECK_AS_OPTIONS } from '@features/Mission/components/MissionForm/ActionForm/shared/constants'
import { Radio } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled, { css } from 'styled-components'

import type { MissionActionFormValues } from '../../types'
import type { ReactNode } from 'react'

export type ControlCheckRow = Readonly<{
  disabled?: boolean
  hasBorderBottom?: boolean
  isRequired?: boolean
  // When true, the row is rendered as a subsection title spanning the whole width (no radios).
  isSectionHeader?: boolean
  label: string | ReactNode
  name: string
}>

type ControlCheckTableProps = Readonly<{
  rows: ControlCheckRow[]
}>
export function ControlCheckTable({ rows }: ControlCheckTableProps) {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  return (
    <TableGrid>
      <HeaderSpacer />
      <ColumnHeader>Oui</ColumnHeader>
      <ColumnHeader>Non</ColumnHeader>
      <ColumnHeader>N/A</ColumnHeader>
      {rows.map(({ disabled, hasBorderBottom, isRequired, isSectionHeader, label, name }, index) =>
        isSectionHeader ? (
          <SectionHeader key={name} $isFirst={index === 0}>
            {label}
          </SectionHeader>
        ) : (
          <RowFieldset key={name} className="Element-Fieldset Field-MultiRadio">
            <RowLegend $disabled={!!disabled} $hasBorderBottom={!!hasBorderBottom} $isFirst={index === 0}>
              <LabelText $isRequired={!!isRequired}>{label}</LabelText>
            </RowLegend>
            {CONTROL_CHECK_AS_OPTIONS.map(opt => (
              <RadioCell key={opt.value} $hasBorderBottom={!!hasBorderBottom} $isFirst={index === 0}>
                <Radio
                  checked={(values as Record<string, unknown>)[name] === opt.value}
                  disabled={!!disabled}
                  labelPosition="left"
                  name={name}
                  onChange={() => setFieldValue(name, opt.value)}
                >
                  {opt.label}
                </Radio>
              </RadioCell>
            ))}
          </RowFieldset>
        )
      )}
    </TableGrid>
  )
}

const borderBottom = css`
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.14fr 0.14fr 0.14fr;
  align-items: stretch;
  row-gap: 4px;
`

const HeaderSpacer = styled.div`
  ${borderBottom}
  padding-bottom: 12px;
  height: 18px;
`

const ColumnHeader = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${p => p.theme.color.gunMetal};
  text-align: center;
  padding-bottom: 12px;
  margin-left: -8px;
  ${borderBottom}
`

const SectionHeader = styled.div<{ $isFirst: boolean }>`
  grid-column: 1 / -1;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  padding: ${p => (p.$isFirst ? 4 : 12)}px 0 4px 0px;
  margin-top: ${p => (p.$isFirst ? 8 : 16)}px;
  ${p => !p.$isFirst && `border-top: 1px solid ${p.theme.color.lightGray};`}
`

const RowFieldset = styled.fieldset`
  display: contents;

  &:hover > * {
    background-color: ${p => p.theme.color.cultured};
  }
`

const RowLegend = styled.legend<{
  $disabled: boolean
  $hasBorderBottom: boolean
  $isFirst: boolean
}>`
  display: flex;
  align-items: center;
  float: none;
  font-size: 13px;
  color: ${p => (p.$disabled ? p.theme.color.lightGray : p.theme.color.gunMetal)};
  margin-top: ${p => (p.$isFirst ? 8 : 0)}px;
  padding: 4px 0 ${p => (p.$hasBorderBottom ? 12 : 4)}px 8px;
  ${p => p.$hasBorderBottom && borderBottom}
`

const LabelText = styled.span<{ $isRequired: boolean }>`
  ${p =>
    p.$isRequired &&
    css`
      &::after {
        content: ' *';
        color: ${p.theme.color.maximumRed};
      }
    `}
`

const RadioCell = styled.div<{ $hasBorderBottom: boolean; $isFirst: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: ${p => (p.$isFirst ? 8 : 0)}px;
  padding: 4px 0 ${p => (p.$hasBorderBottom ? 12 : 4)}px 0;
  ${p => p.$hasBorderBottom && borderBottom}

  .Field-Radio {
    margin-top: -18px;
  }

  .rs-radio-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`
