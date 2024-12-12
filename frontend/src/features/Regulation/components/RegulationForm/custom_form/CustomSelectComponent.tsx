import { THEME } from '@mtes-mct/monitor-ui'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import type { CSSProperties, ReactNode } from 'react'
import type { TypeAttributes } from 'rsuite/esm/@types/common'

type CustomSelectComponentProps = Readonly<{
  cleanable?: boolean
  data: any[]
  dataCy?: string
  disabled?: boolean
  emptyMessage?: string
  groupBy?: string
  menuClassName?: string
  menuStyle?: CSSProperties
  onChange: (value: any) => void
  padding?: string
  placeholder?: string
  placement?: TypeAttributes.Placement
  renderMenuItem?: (label: ReactNode, item: any) => JSX.Element
  searchable: boolean
  style?: CSSProperties
  value: any
  valueIsMissing?: boolean
  width?: number
}>
export function CustomSelectComponent({
  cleanable,
  data,
  dataCy,
  disabled = false,
  emptyMessage,
  groupBy,
  menuClassName,
  menuStyle,
  onChange,
  padding,
  placeholder,
  placement,
  renderMenuItem,
  searchable,
  style,
  value,
  valueIsMissing,
  width
}: CustomSelectComponentProps) {
  const DEFAULT_SELECT_PICKER_STYLE: CSSProperties = {
    borderColor: THEME.color.lightGray,
    boxSizing: 'border-box',
    margin: '0',
    textOverflow: 'ellipsis',
    width: width ?? 200
  }

  return (
    <SelectWrapper $padding={padding}>
      <CustomSelectPicker
        $valueIsMissing={valueIsMissing}
        cleanable={cleanable as any}
        data={data}
        data-cy={dataCy}
        disabled={disabled}
        groupBy={groupBy as any}
        locale={
          {
            emptyMessage,
            noResultsText: emptyMessage
          } as any
        }
        menuClassName={menuClassName as any}
        menuStyle={menuStyle as any}
        onChange={onChange}
        placeholder={placeholder}
        placement={placement ?? 'auto'}
        renderMenuItem={renderMenuItem as any}
        searchable={searchable}
        style={style ?? DEFAULT_SELECT_PICKER_STYLE}
        value={value}
        virtualized
      />
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div<{
  $padding: string | undefined
}>`
  display: inline-block;
  margin: ${p => (p.$padding ? p.$padding : '0px 10px 0px 0px')};
  vertical-align: sub;
`

const CustomSelectPicker = styled(SelectPicker)<{
  $valueIsMissing: boolean | undefined
  $width?: number
}>`
  a {
    box-sizing: border-box;
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${p => (p.$valueIsMissing ? p.theme.color.maximumRed : p.theme.color.lightGray)}!important;
  }

  .grouped.rs-picker-select-menu-item {
    padding-left: 0px;
  }

  .rs-picker-toggle {
    width: ${p => (p.$width ? p.$width - 40 : 160)}px;
  }
`
