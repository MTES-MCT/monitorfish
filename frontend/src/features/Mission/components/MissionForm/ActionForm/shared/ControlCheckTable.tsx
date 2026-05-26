import { CONTROL_CHECK_AS_OPTIONS } from '@features/Mission/components/MissionForm/ActionForm/shared/constants'
import { Radio } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled, { css } from 'styled-components'

import type { MissionActionFormValues } from '../../types'

export type ControlCheckRow = Readonly<{
  disabled?: boolean
  hasBorderBottom?: boolean
  isRequired?: boolean
  label: string
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
      {rows.map(({ disabled, hasBorderBottom, isRequired, label, name }, index) => (
        <RowGroup key={name}>
          <RowLabel $disabled={!!disabled} $hasBorderBottom={!!hasBorderBottom} $isFirst={index === 0}>
            {label}
            {isRequired && <Required> *</Required>}
          </RowLabel>
          {CONTROL_CHECK_AS_OPTIONS.map(opt => (
            <RadioCell key={opt.value} $hasBorderBottom={!!hasBorderBottom} $isFirst={index === 0}>
              {/* Zero-width space forces rsuite to render the <label> wrapper that monitor-ui CSS targets */}
              <Radio
                checked={(values as Record<string, unknown>)[name] === opt.value}
                disabled={!!disabled}
                labelPosition="left"
                name={name}
                onChange={() => setFieldValue(name, opt.value)}
              >
                {' '}
              </Radio>
            </RadioCell>
          ))}
        </RowGroup>
      ))}
    </TableGrid>
  )
}

const borderBottom = css`
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px 100px 100px;
  align-items: center;
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
  ${borderBottom}
`

const RowGroup = styled.div`
  display: contents;

  &:hover > * {
    background-color: ${p => p.theme.color.cultured};
  }
`

const RowLabel = styled.div<{ $disabled: boolean; $hasBorderBottom: boolean; $isFirst: boolean }>`
  font-size: 13px;
  color: ${p => (p.$disabled ? p.theme.color.lightGray : p.theme.color.gunMetal)};
  margin-top: ${p => (p.$isFirst ? 8 : 0)}px;
  padding: 4px 0 ${p => (p.$hasBorderBottom ? 12 : 4)}px 8px;
  height: 18px;
  ${p => p.$hasBorderBottom && borderBottom}
`

const RadioCell = styled.div<{ $hasBorderBottom: boolean; $isFirst: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: ${p => (p.$isFirst ? 8 : 0)}px;
  padding: 4px 0 ${p => (p.$hasBorderBottom ? 12 : 4)}px 0;
  height: 18px;
  ${p => p.$hasBorderBottom && borderBottom}

  .Field-Radio {
    margin-top: -18px;
  }

  .rs-radio-label {
    display: none;
  }
`

const Required = styled.span`
  color: ${p => p.theme.color.maximumRed};
  margin-left: 2px;
`
